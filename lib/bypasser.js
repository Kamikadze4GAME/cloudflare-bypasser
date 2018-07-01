'use strict';

const URL      = require('url');
const Promise  = require('bluebird');
const rp       = require('request-promise');
const extend   = require('extend');
const helpers  = require('./helpers');

const DELAY = 5*1000;

const REGEXP = {
  jschl_vc : /name="jschl_vc" value="(\w+)"/,
  pass     : /name="pass" value="(.+?)"/,
  challenge: /setTimeout\(function\(\){\s+(var s,t,o,p,b,r,e,a,k,i,n,g,f.+?\r?\n[\s\S]+?a\.value =.+?)\r?\n/i,
  delay    : /setTimeout[\s\S]+f.submit\(\);\s*},\s*(\d+)\);/i
};

const DEFAULT_USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/65.0.3325.181 Chrome/65.0.3325.181 Safari/537.36',
  'Mozilla/5.0 (Linux; Android 7.0; Moto G (5) Build/NPPS25.137-93-8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.137 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0_4 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11B554a Safari/9537.53',
  'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:60.0) Gecko/20100101 Firefox/60.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:59.0) Gecko/20100101 Firefox/59.0',
  'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:57.0) Gecko/20100101 Firefox/57.0'
];


function loLowerCaseObject(obj) {
  let res = obj;

  Object.keys(res).forEach(oldKey => {
    let newKey = oldKey.toLowerCase();
    // If newKey eql to oldKey so oldKey was lowercased
    if(newKey !== oldKey) {
      res[newKey] = res[oldKey];
      delete res[oldKey];
    } else {}
  });

  return res;
}

class CloudflareBypasser {
  constructor(opts = {}) {
    this._delay     = opts.delay     || DELAY;
    this._headers   = loLowerCaseObject(opts.headers || {});
    this._userAgent = opts.userAgent || DEFAULT_USER_AGENTS[Math.floor(Math.random() * DEFAULT_USER_AGENTS.length)];
    this._jar       = opts.jar       || rp.jar();

    this._rp = rp.defaults({jar: this._jar});
  }

  get userAgent() {
    return this._userAgent;
  }

  get jar() {
    return this._jar;
  }

  request(uri, options) {
    let params = {
      headers: {},
      // TODO: delete this?
      // removeRefererHeader: false,
      // Set max redirects like at request
      maxRedirects       : 10,
      // Our redrects counter
      _redirectsCounter  : 0
    };

    if(typeof options === 'object') {
      extend(params, options, {uri: uri})
    }
    else if(typeof uri === 'string') {
      extend(params, {uri: uri});
    }
    else {
      extend(params, uri);
    }

    extend(params, {
      resolveWithFullResponse : true,
      simple                  : false,
      //We must do the redirects ourselves. Referrer is lost in the process
      followRedirect          : false,
    });

    // Headers to lowercase
    params.headers = extend({}, this._headers, loLowerCaseObject(params.headers));

    // Request node feature
    if(!params.uri && params.url) {
      params.uri = params.url;
      delete params.url;
    }

    // WHY? I dont know
    params.uri = URL.parse(params.uri);

    // User-Agent the most important header
    params.headers['user-agent'] = params.headers['user-agent'] || this._userAgent;

    // Show that we are moving from this site
    let referer = `${params.uri.protocol}//${params.uri.host}/`;
    params.headers['referer'] = params.headers['referer'] || referer;

    // Add param gzip if encoding include gzip
    if(typeof params.headers['accept-encoding'] === 'string' && params.headers['accept-encoding'].indexOf('gzip') !== -1) {
      params.gzip = true;
    }

    // Set cookies to jar and delete after
    if(typeof params.headers['cookie'] === 'string') {
      let cookies = params.headers['cookie'].split(';');
      cookies.forEach(cookie => {
        this.jar.setCookie(cookie, params.uri);
      });
      delete params.headers['cookie'];
    }

    return this._rp(params)
      .then(res => {
        // console.log(helpers.pretty(helpers.convertResponse(res)));
        let result = CloudflareBypasser.parse(res);
        // console.log(helpers.pretty({parsed:result}));
        // console.log('\n\n\n\n\n\n\n\n\n\n\n\n');

        // Redirect
        if(result.redirect) {
          params._redirectsCounter++;
          let maxRedirects = parseInt(params.maxRedirects);
          if(
            !Number.isNaN(params._redirectsCounter) &&
            !Number.isNaN(maxRedirects) &&
            maxRedirects > 0 &&
            params._redirectsCounter >= maxRedirects
          ) {
            return Promise.reject(new Error('TOO_MUCH_REDIRECTS'));
          }

          params.uri = result.redirect;
          delete params.qs;
          delete params.url;
          return this.request(params);
        }

        // Error
        if(result.error) {
          throw new Eror('ERROR:' + result.error);
        }

        // Captcha
        // TODO: add captcha solver
        if(result.captcha) {
          throw new Error('CAPTCHA');
        }

        // Challenge
        if(result.challenge) {
          let url = `${res.request.uri.protocol}//${res.request.uri.host}/cdn-cgi/l/chk_jschl`;

          let qs = {
            jschl_vc: result.challenge.jschl_vc,
            pass: result.challenge.pass,
            jschl_answer: result.challenge.resolved
          };

          params.headers['referer'] = res.request.uri.href;
          params.uri = URL.parse(url);
          params.qs = qs;

          return Promise.delay(this._delay).then(_ => {
            return this.request(params);
          });
        }

        return res;
      })
      ;
  }

  static parse(response = {}) {
    let body = response.body;
    let uri = response.request.uri;

    let result = {
      status   : response.statusCode,
      redirect : null,
      error    : null,
      captcha  : null,
      challenge: null
    }

    result.redirect = this.findRedirect(response);
    if(result.redirect) return result;

    result.error = this.findError(body);
    if(result.error) return result;

    result.captcha = this.findCaptcha(body);
    if(result.captcha) return result;

    result.challenge = this.findChallenge(body, uri.host);
    if(result.challenge) {
      result.challenge.resolved = this.solveChallenge(result.challenge.challenge);
    }

    return result;
  }

  static findRedirect(response = {}) {
    let uri = response.request.uri;

    if(response.headers && typeof response.headers.location === 'string') {
      // If server return redirect to abs link with host 'site.com/asdasd'
      let url = URL.parse(response.headers.location);
      if(url.host) {
        return response.headers.location;
      }
      // If server return redirect to abs link without host '/asdasd'
      // so we have to fill necessary parts
      return `${uri.protocol}://${uri.host}${response.headers.location}`
    }
    return false;
  }

  static findError(text = '') {
    // Trying to find '<span class="cf-error-code">1006</span>'
    let match = text.match(/<\w+\s+class="cf-error-code">(.*)<\/\w+>/i);
    if(match) {
      return parseInt(match[1]);
    }
    return false;
  }

  static findCaptcha(text = '') {
    return (text.indexOf('why_captcha') !== -1 || text.indexOf('g-recaptcha') !== -1);
  }

  // TODO:
  static solveCaptcha(data = {}) {
    return null;
  }

  static findChallenge(text = '', domain = '') {
    // jschl_vc
    let jschl_vc = text.match(REGEXP.jschl_vc);
    jschl_vc = jschl_vc ? jschl_vc[1] : null;

    // pass
    let pass = text.match(REGEXP.pass);
    pass = pass ? pass[1] : null;

    // delay
    let delay = text.match(REGEXP.delay);
    delay = delay ? delay[1] : null;

    // challange
    let challenge = text.match(REGEXP.challenge);
    if(challenge) {
      challenge = challenge[1].replace(/a\.value = (.+ \+ t\.length).+/i, '$1') // delete `a.value = .`
                              .replace(/\s{3,}[a-z](?: = |\.).+/g, '') // delete all `t = document.createElement...`
                              .replace('t.length', '' + domain.length) // replace t.length with domain length
                              .replace(/'; \d+'/g, '')
                              .replace(/[\n\\']/g, '')
      ;

      if(challenge.indexOf('toFixed') === -1) {
        throw new Error('ERROR:parsing challenge');
      }
    }
    else {
      challenge = null;
    }

    if(jschl_vc && pass && challenge) {
      return {
        jschl_vc : jschl_vc,
        pass     : pass,
        challenge: challenge,
        delay    : parseFloat(delay)
      };
    } else {
      return null;
    }
  }

  static solveChallenge(code = '') {
    return eval(code);
  }

}

module.exports = CloudflareBypasser;
