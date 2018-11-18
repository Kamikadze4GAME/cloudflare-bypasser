'use strict';


const Promise = require('bluebird');
const rp = require('request-promise');
const Errors = require('./errors');
const Task = require('./tasks/task');

const API_URL = 'http://api.anti-captcha.com';
const WAIT_TIME = [5000, 2000]; // 5s, 2s


class Anticaptcha {
  constructor(key, proxy) {
    this._key   = key;
    this._proxy = proxy;
    this._rp    = rp.defaults({ json: true });
  }

  get key() { return this._key; }

  get proxy() {
    return this._proxy;
  }

  set proxy(proxy) {
    if (proxy) {
      this._proxy = {
        type    : proxy.type     || 'http',
        address : proxy.address  || null,
        port    : proxy.port     || null,
        login   : proxy.login    || null,
        password: proxy.password || null,
        // TODO: smth
        userAgent: proxy.userAgent || '',
        cookies  : proxy.cookies   || null
      };
    }
    else {
      this._proxy = null;
    }
  }

  method(method, data = {}, isPrivate) {
    if (isPrivate) {
      data.clientKey = this.key;
    }

    return this._rp({
      method: 'POST',
      url: API_URL + method,
      body: data,
      resolveWithFullResponse: true
    })
    .then(res => {
      console.dir(res.req,{depth:1});
      let err;

      if (!res) return res;

      if (typeof res.errorId !== 'undefined' && res.errorId !== 0) {
        err = Errors[res.errorId];
        // No such error
        if(!err) {
          err = new Errors.ApiError(res.errorId, res.errorCode, res.errorDescription);
        }
        throw err;
      }

      delete res.errorId;
      return res;
    })
  }

  // +
  getBalance() {
    return this.method('/getBalance', {}, true)
      .then(res => {
        return res.balance;
      });
  }

  // +
  getQueueStats(queueId) {
    return this.method('/getQueueStats', {queueId}, false);
  }

  createTask(opts = {/*task:{}, ?softId, ?languagePool, ?callbackUrl*/}) {
    let data = {};

    // TODO: needs?
    // data.task = opts.task;
    //
    // if(typeof opts.softId !== 'undefined') {
    //   data.softId = opts.softId;
    // }
    //
    // if(typeof opts.languagePool !== 'undefined') {
    //   data.languagePool = opts.languagePool;
    // }
    //
    // if(typeof opts.callbackUrl !== 'undefined') {
    //   data.callbackUrl = opts.callbackUrl;
    // }

    return this.method('/createTask', opts/*data*/, true);
  }

  // +
  getTaskResult(taskId) {
    return this.method('/getTaskResult', {taskId}, true);
  }

  // +
  reportIncorrectImageCaptcha(taskId) {
    return this.method('/reportIncorrectImageCaptcha', {taskId}, true);
  }

  // +
  test(data) {
    return this.method('/test', data, false);
  }

  getTaskResult2(taskId, step = 0) {
    return this.getTaskResult(taskId)
      .then(res => {
        if(!res) return res;

        if(res.status === 'processing') {
          return Promise.delay(WAIT_TIME[(step === 0 ? 0 : 1)])
            .then(_ => {
              return this.getTaskResult2(taskId, 1);
            })
          ;
        }
        // status === 'ready' or else
        return res;
      })
    ;
  }

  solve(task, opts = {/*?softId, ?languagePool, ?callbackUrl*/}) {
    let data = { task: null };
    let proxy = this.proxy;

    if(!(task instanceof Task)) {
      throw new TypeError('Task must be instance of Task class.');
    }

    data.task = task.toJSON();

    if(data.task.proxy === true) {
      data.task.proxy = proxy;
    }

    // TODO: decompile proxy
    if(data.task.proxy) {
      data.task.proxyType = proxy.type;
      data.task.proxyAddress = proxy.address;
      data.task.proxyPort = proxy.port;

      // TODO:
      data.task.userAgent = proxy.userAgent || '';

      if(typeof proxy.cookies !== 'undefined') {
        data.task.cookies = proxy.cookies;
      }

      if(typeof proxy.login !== 'undefined') {
        data.task.proxyLogin = proxy.login;
      }

      if(typeof proxy.password !== 'undefined') {
        data.task.proxyPassword = proxy.password;
      }
    }

    // Extra params
    if(typeof opts.softId !== 'undefined') {
      data.softId = opts.softId;
    }
    // TODO: rename to language?
    if(typeof opts.languagePool !== 'undefined') {
      data.languagePool = opts.languagePool;
    }
    if(typeof opts.callbackUrl !== 'undefined') {
      data.callbackUrl = opts.callbackUrl;
    }

  }

}

module.exports = Anticaptcha;


let a = new Anticaptcha('391f4604622d8fd1745c363fb82fe184');

a.getBalance({taskId:7511931})
// a.getTaskResult({taskId:7511931})
// a.getQueueStats({queueId:20})
// let taskId = 0;
// a.createTask({
//   task: {
//     type: 'NoCaptchaTaskProxyless',
//     websiteURL: 'https://www.boards.ie/b/',
//     websiteKey: '6LfBixYUAAAAABhdHynFUIMA_sa4s-XsJvnjtgB0',
//     // 7511931
//   }
// })
// .then(res => {
//   console.log(res);
//   taskId = res.taskId;
//   console.log('taskId', taskId);
//   return a.getTaskResult2(taskId);
// })
.then(_ => {
  console.log(_);
})
.catch(err => {
  console.log(err);
})
