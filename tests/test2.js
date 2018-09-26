// #!/usr/bin/env node

'use strict';

const CloudflareBypasser = require('../');
const helpers = require('../lib/helpers');

const URL = 'https://market.csgo.com/';

let cloudflare = new CloudflareBypasser({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
  headers: {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    // 'accept-encoding': 'gzip, deflate, br',
    // 'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,uk;q=0.6,la;q=0.5',
    // 'cache-control': 'max-age=0',
    // 'referer': 'https://market.csgo.com/',
    // 'upgrade-insecure-requests': 1,
    // 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
  }
});

console.time('end');
cloudflare.request({
  maxRedirects: 2,
  url: URL
})
  .then(_ => {
    console.timeEnd('end');
    console.log(helpers.pretty(helpers.convertResponse(_)));
  })
  .catch(err => {
    console.log(err);
  });
