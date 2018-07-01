
const path       = require('path');
const fs         = require('fs');
const url        = require('url');
const prettyjson = require('prettyjson');

const PAGES_DIR = 'pages';

module.exports = {
  pretty: (obj, opts) => prettyjson.render(obj, opts),

  convertResponse: (response) => {
    let temp = response.toJSON();
    let res = {
      statusCode: temp.statusCode,
      request   : temp.request,
      headers   : temp.headers,
      body      : temp.body.replace(/[\t|\n|\r]/g, ''),
    };

    res.body = res.body.slice(0, 100);

    res.request.uri = res.request.uri.format();

    return res;
  },

  fakeResponse: (status, headers, uri, body) => {
    return {
      statusCode: status,
      headers: headers,
      request: {
        uri: typeof uri === 'string' ? url.parse(uri) : url,
      },
      body: body
    };
  },

  openPage: (title) => {
    return fs.readFileSync(path.join(__dirname, `${PAGES_DIR}/${title}.html`)).toString()
  }
};
