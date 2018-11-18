'use strict';

const Task = require('./task');

class GeeTestTask extends Task {
  constructor(data = {/*url, gt, challenge*/}, proxy) {
    super(['GeeTestTaskProxyless', 'GeeTestTask'], {
      url      : data.url,
      gt       : data.gt,
      challenge: data.challenge
    }, proxy);
  }

  toJSON() {
    let data = this.data;
    return super.toJSON({
      websiteURL: data.url,
      gt        : data.gt,
      challenge : data.challenge
    });
  }

}

module.exports = GeeTestTask;
