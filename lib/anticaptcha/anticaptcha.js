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
        password: proxy.password || null
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

    data.task = opts.task;

    if(typeof opts.softId !== 'undefined') {
      data.softId = opts.softId;
    }

    if(typeof opts.languagePool !== 'undefined') {
      data.languagePool = opts.languagePool;
    }

    if(typeof opts.callbackUrl !== 'undefined') {
      data.callbackUrl = opts.callbackUrl;
    }

    return this.method('/createTask', data, true);
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

  getTaskResult2(taskId, _step = 0) {
    return this.getTaskResult(taskId)
      .then(res => {
        if(!res) return res;

        if(res.status === 'processing') {
          return Promise.delay(WAIT_TIME[(_step === 0 ? 0 : 1)])
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
    let data = { task: {} };
    let proxy, taskData;

    if(!(task instanceof Task)) {
      throw new TypeError('Task must be instance of Task class.');
    }

    // Type
    data.task.type = task.type;

    // Data
    taskData = task.getData();
    Object.keys(taskData || {}).forEach(key => {
      data.task[key] = taskData[key];
    });

    // Proxy
    proxy = task.proxy;

    if(proxy === true) {
      proxy = this.proxy;
    }

    if(proxy) {
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


  }

}

module.exports = Anticaptcha;


let a = new Anticaptcha('');

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
