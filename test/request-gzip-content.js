var common = require("./lib/common.js")
var zlib = require('zlib')
var tap = require('tap')
var server = require('./fixtures/server.js')

var pkg = {
  _id: 'some-package-gzip@1.2.3',
  name: 'some-package-gzip',
  version: '1.2.3'
}

zlib.gzip(JSON.stringify(pkg), function (err, pkgGzip) {
  var client = common.freshClient({
      'fetch-retries': 1
    , 'fetch-retry-mintimeout': 10
    , 'fetch-retry-maxtimeout': 100 })

  tap.test('request gzip package content', function (t) {
    server.expect('GET', '/some-package-gzip/1.2.3', function (req, res) {
      res.statusCode = 200
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Content-Type', 'application/json');
      res.end(pkgGzip)
    })

    client.get('/some-package-gzip/1.2.3', function (er, data, raw, res) {
      if (er) throw er
      t.deepEqual(data, pkg)
      t.end()
    })
  })

  tap.test('request wrong gzip package content', function (t) {
    server.expect('GET', '/some-package-gzip-error/1.2.3', function (req, res) {
      res.statusCode = 200
      res.setHeader('Content-Encoding', 'gzip')
      res.setHeader('Content-Type', 'application/json')
      res.end(new Buffer('wrong gzip content'))
    })

    client.get('/some-package-gzip-error/1.2.3', function (er, data, raw, res) {
      t.ok(er)
      t.end()
    })
  })
});
