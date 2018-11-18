'use strict';

const Task = require('./task');

class FunCaptchaTask extends Task {
  constructor(opts = {/*url, publickey*/}, proxy) {
    super('FunCaptchaTask', {
      url      : opts.url,
      publickey: opts.publickey
    }, proxy);
  }

  getData() {
    let data = this.data;

    return {
      websiteURL      : data.url,
      websitePublicKey: data.publickey
    };
  }

  get proxy() {
    return super.proxy;
  }

  set proxy(proxy) {
    super.proxy = proxy;
    this.type = this.proxy ? 'FunCaptchaTask' : 'FunCaptchaTaskProxyless';
  }
}

module.exports = FunCaptchaTask;
