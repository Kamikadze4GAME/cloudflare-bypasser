'use strict';

const URL      = require('url');
const Promise  = require('bluebird');
const rp       = require('request-promise');
const request  = require('request');
const extend   = require('extend');
const helpers  = require('../lib/helpers');

const CloudflareBypasser = require('../lib/bypasser2');

/*

  [USER] ==== REQUEST ====> [SERVER]




 */


let a = new CloudflareBypasser();
let jar = rp.jar();

// rp('http://google.com', {
rp('https://www.boards.ie/b/', {
// rp('https://market.csgo.com', {
  followRedirect: function() {
    // console.dir(this, {depth:0});
    this.FUCK = 'FUCK';
    return false;
  },
  gzip: true,
  jar: jar,
  headers: {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,uk;q=0.6,la;q=0.5',
    'cache-control': 'max-age=0',
    'referer': 'https://www.boards.ie/b/',
    'upgrade-insecure-requests': 1,
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
  },
  // timeout: 1,
  callback: function() {
    // console.dir(arguments, {depth:0});
    // console.dir(this, {depth:0});
    console.log('callback2');
  },
  simple: false,
  resolveWithFullResponse: true,
  transform: function(body, response, resolveWithFullResponse) {
    // console.log(body);
    // console.dir(response.toJSON(), {depth:2});
    // console.log(jar.getSetCookieStrings('https://www.boards.ie/b/'));


    // jar.getCookieString('https://www.boards.ie/b/').forEach(_ => {
    //   console.log(_);
    // })
    // console.log(jar.getCookies('https://www.boards.ie/b/'));
    console.log(CloudflareBypasser.parse(response));


    console.log ('transform');
    // console.log(response.toJSON());
    // console.log(body);
    // console.dir(response, {depth:0});
    // [].forEach.call(arguments, (_, i) => {
    //   console.log('#', i);
    //   console.log(require('util').inspect(_, { depth: -1 }).slice(0, 100));
    //   // console.dir(_, {depth:-1});
    //   console.log();
    // });

  }
})
  .then(_ => {
    console.log('then');
    console.log(_);
  })
  .catch(err => {
    console.log(`${err}`);
    console.log(err);
  })
