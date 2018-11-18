'use strict';

const Task = require('./task');

class CustomCaptchaTask extends Task {
  constructor(opts = {/*url, assignment, forms*/}) {
    super('SquareNetTextTask', {
      url       : opts.url,
      assignment: opts.assignment,
      forms     : opts.forms
    });
  }

  // Unnecessary
  // toJSON() {
  //   let data = this.data;
  //   return super.toJSON({
  //     url       : opts.url,
  //     assignment: opts.assignment,
  //     forms     : opts.forms
  //   });
  // }
}

module.exports = CustomCaptchaTask;
