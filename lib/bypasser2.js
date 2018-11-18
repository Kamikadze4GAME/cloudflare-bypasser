'use strict';

const Promise = require('bluebird');
const URL     = require('url');


const DEFAULT_USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/65.0.3325.181 Chrome/65.0.3325.181 Safari/537.36',
  'Mozilla/5.0 (Linux; Android 7.0; Moto G (5) Build/NPPS25.137-93-8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.137 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0_4 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11B554a Safari/9537.53',
  'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:60.0) Gecko/20100101 Firefox/60.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:59.0) Gecko/20100101 Firefox/59.0',
  'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:57.0) Gecko/20100101 Firefox/57.0'
];

const REGEXP = {
  error    : /<\w+\s+class="cf-error-code">(.*)<\/\w+>/i,
  jschl_vc : /name="jschl_vc" value="(\w+)"/,
  pass     : /name="pass" value="(.+?)"/,
  challenge: /setTimeout\(function\(\){\s+(var s,t,o,p,b,r,e,a,k,i,n,g,f.+?\r?\n[\s\S]+?a\.value =.+?)\r?\n/i,
  delay    : /setTimeout[\s\S]+f.submit\(\);\s*},\s*(\d+)\);/i,
  sitekey  : /data-sitekey="(.+?)"/i,
  action   : /(?:(?:<\s*form[^>]*\s+(?:id="challenge-form"\s+)action=["'](.*?)["'])|(?:<\s*form[^>]*\s+action=["'](.*?)["']\s+(?:id="challenge-form")))/i
};


class CloudflareBypasser {
  constructor() {

  }

  static parse(response = {}) {
    let body = response.body;
    let uri = response.request.uri;

    if(typeof body === 'string') {
      // Delete f*cking long data base64 strings
      body = body.replace(/[\(|\"|\']data:.*[\)|\"|\']/gi, '');
    }

    let result = {
      status   : response.statusCode,
      redirect : null,
      error    : null,
      captcha  : null,
      challenge: null
    }

    result.redirect = this.findRedirect(response);
    // if(result.redirect) return result;

    result.error = this.findError(body);
    // if(result.error) return result;

    result.captcha = this.findCaptcha(body);
    // if(result.captcha) return result;

    result.challenge = this.findChallenge(body, uri.host);
    if(result.challenge) {
      result.challenge.resolved = this.solveChallenge(result.challenge.challenge);
    }

    return result;
  }

  static findRedirect(response) {
    let uri = response.request.uri;

    if(response.headers && typeof response.headers.location === 'string') {
      // If server return redirect to abs link with host 'site.com/asdasd'
      let url = URL.parse(response.headers.location);
      if(url.host) {
        return response.headers.location;
      }
      // If server return redirect to rel link without host '/asdasd'
      // so we have to fill necessary parts
      return `${uri.protocol}://${uri.host}${response.headers.location}`
    }

    return false;
  }

  static findError(text = '') {
    // Trying to find '<span class="cf-error-code">1006</span>'
    let match = text.match(REGEXP.error);
    if(match) {
      return parseInt(match[1]);
    }
    return false;
  }

  static findCaptcha(text = '') {
    let action, sitekey;
    if(text.indexOf('why_captcha') === -1 && text.indexOf('g-recaptcha') === -1) {
      return null;
    }

    // TODO: action default to '/cdn-cgi/l/chk_captcha'. Is needed to detect action
    action = text.match(REGEXP.action);
    action = action ? action[1] : null;

    sitekey = text.match(REGEXP.sitekey);
    sitekey = sitekey ? sitekey[1] : null;

    return {
      action,
      sitekey
    };
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
    delay = delay ? parseFloat(delay[1]) : null;

    // challange
    let challenge = text.match(REGEXP.challenge);
    if(challenge) {
      challenge = challenge[1]
        // delete `a.value = .`
        .replace(/a\.value = (.+ \+ t\.length).+/i, '$1')
        // delete all `t = document.createElement...`
        .replace(/\s{3,}[a-z](?: = |\.).+/g, '')
        // replace t.length with domain length
        .replace('t.length', '' + domain.length)
        // delete '; 121'
        .replace(/'; \d+'/g, '')
        // make in single line
        .replace(/[\n\\']/g, '')
      ;

      // TODO: ??
      if(challenge.indexOf('toFixed') === -1) {
        throw new Error('ERROR:parsing challenge');
      }
    }
    else {
      challenge = null;
    }

    return {
      jschl_vc,
      pass,
      challenge,
      delay
    };
  }

  static solveChallenge(code = '') {
    return eval(code);
  }
}

module.exports = CloudflareBypasser;
