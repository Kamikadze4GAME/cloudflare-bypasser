'use strict';

const Task = require('./task');

class ImageToTextTask extends Task {
  constructor(data = {/*body, ?phrase, ?case, ?numeric, ?math, length, ?comment*/}) {
    super('ImageToTextTask', {
      body     : data.body,
      phrase   : data.phrase,
      case     : data.case,
      numeric  : data.numeric,
      math     : data.math,
      length   : Array.isArray(data.length) ? data.length.slice() : [],
      comment  : data.comment
    });
  }

  toJSON() {
    let data = this.data;
    return super.toJSON({
      body     : data.body,
      phrase   : data.phrase,
      case     : data.case,
      numeric  : data.numeric,
      math     : data.math,
      minLength: data.length[0],
      maxLength: data.length[1],
      comment  : data.comment
    });
  }
}

module.exports = ImageToTextTask;
