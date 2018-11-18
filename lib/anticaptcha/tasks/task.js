'use strict';

class Task {
  constructor(type, data, proxy) {
    this.type  = type  || null;;
    this.data  = data  || null;
    this.proxy = proxy || null;
  }

  get type() {
    return this._type;
  }

  set type(type) {
    this._type = type;
  }

  get data() {
    return this._data;
  }

  set data(data = {}) {
    if(typeof data === 'object') {
      this._data = {};
      Object.keys(data).forEach(key => {
        this._data[key] = data[key];
      });
    }
    if(!data) {
      this._data = null;
    }
  }

  get proxy() {
    return this._proxy;
  }

  set proxy(proxy) {
    if (proxy) {
      this._proxy = {
        type     : proxy.type      || 'http',
        address  : proxy.address   || null,
        port     : proxy.port      || null,
        login    : proxy.login     || null,
        password : proxy.password  || null,
        // TODO:
        userAgent: proxy.userAgent || '',
        cookies  : proxy.cookies   || null
      };
    }
    else {
      this._proxy = null;
    }
  }

  serialize() {
    let res = {};

    res.type = this.type;

    Object.keys(this.data || {}).forEach(key => {
      res[key] = this.data[key];
    });

    if(this.proxy) {
      if(this.proxy === true) {
        res.proxy = true;
      }
      else {
        Object.keys(this.proxy || {}).forEach(key => {
          res[key] = this.proxy[key];
        });
      }
    }

    return res;
  }
}

module.exports = Task;
