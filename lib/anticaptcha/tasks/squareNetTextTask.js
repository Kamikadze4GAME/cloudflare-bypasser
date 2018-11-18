'use strict';

const Task = require('./task');

class SquareNetTextTask extends Task {
  // TODO: rows+columns to size
  constructor(opts = {/*body, name, size:[rowsCount, columnsCount]*/}) {
    return super('SquareNetTextTask', {
      body      : opts.body,
      name: opts.objectName,
      size      : Array.isArray(opts.size) ? opts.size.slice() : []
    });
  }

  getDate() {
    let data = this.data;

    return {
      body: data.body,
      objectName: data.name,
      rowsCount: 
    };
  }
}

module.exports = SquareNetTextTask;
