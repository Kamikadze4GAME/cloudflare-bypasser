'use strict';

const Task = require('./task');

class ImageToTextTask extends Task {
  constructor(opts = {/*body, ?phrase, ?case, ?numeric, ?math, ?minLength, ?maxLength, ?comment*/}) {
    super('ImageToTextTask', {
      body     : opts.body,
      phrase   : opts.phrase,
      case     : opts.case,
      numeric  : opts.numeric,
      math     : opts.math,
      minLength: opts.minLength,
      maxLength: opts.maxLength,
      comment  : opts.comment
    });
  }
}

module.exports = ImageToTextTask;
