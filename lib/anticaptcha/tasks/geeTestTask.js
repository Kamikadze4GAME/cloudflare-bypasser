'use strict';

const Task = require('./task');

class GeeTestTask extends Task {
  constructor(opts = {/*url, gt, challenge*/}, proxy) {
    super('GeeTestTask', {
      url      : opts.url,
      gt       : opts.gt,
      challenge: opts.challenge
    }, proxy);
  }

  getData() {
    let data = this.data;

    return {
      websiteURL: data.url,
      gt: data.gt,
      challenge: data.challenge
    };
  }

  get proxy() {
    return super.proxy;
  }

  set proxy(proxy) {
    super.proxy = proxy;
    this.type = this.proxy ? 'GeeTestTask' : 'GeeTestTaskProxyless';
  }
}

module.exports = GeeTestTask;
