'use strict';

const Task = require('./task');

class SquareNetTextTask extends Task {
  // TODO: rows+columns to size
  constructor(data = {/*body, name, size:[rowsCount, columnsCount]*/}) {
    return super('SquareNetTextTask', {
      body: data.body,
      name: data.objectName,
      size: Array.isArray(data.size) ? data.size.slice() : []
    });
  }

  toJSON() {
    let data = this.data;
    return super.toJSON({
      body        : data.body,
      objectName  : data.name,
      rowsCount   : data.size[0],
      columnsCount: data.size[1]
    });
  }
}

module.exports = SquareNetTextTask;
