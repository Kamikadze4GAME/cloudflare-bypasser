'use strict';

const Task = require('./task');

class NoCaptchaTask extends Task {
  constructor(opts = {/*url, sitekey, ?stoken, ?isVisible*/}, proxy) {
    super('NoCaptchaTask', {
      url      : opts.url,
      sitekey  : opts.sitekey,
      stoken   : opts.stoken,
      isVisible: opts.isVisible
    }, proxy);
  }

  getData() {
    let data = this.data;

    return {
      websiteURL: data.url,
      websiteKey: data.sitekey,
      websiteSToken: data.stoken,
      isInvisible: data.isVisible
    };
  }

  get proxy() {
    return super.proxy;
  }

  set proxy(proxy) {
    super.proxy = proxy;
    this.type = this.proxy ? 'NoCaptchaTask' : 'NoCaptchaTaskProxyless';
  }
}

module.exports = NoCaptchaTask;
