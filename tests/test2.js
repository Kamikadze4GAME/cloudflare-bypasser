// #!/usr/bin/env node

'use strict';

const CloudflareBypasser = require('../');
const helpers = require('../lib/helpers');

const URL = 'https://market.csgo.com/';

let cloudflare = new CloudflareBypasser({
  // userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
  headers: {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  }
});

console.time('end');
cloudflare.request({
  url: URL
})
  .then(_ => {
    console.timeEnd('end');
    console.log(helpers.pretty(helpers.convertResponse(_)));
  })
  .catch(err => {
    console.log(err);
  });
