var assert = require("assert")
var zlib = require("zlib")
var tap = require("tap")

//Should not need to start a proxy.
var server = require("./lib/server.js")
var common = require("./lib/common.js")
var config = {
  proxy: 'http://localhost:8080',
  noproxy: 'localhost, .npmjs.org'
}
var client = common.freshClient(config)

var TEST_URL = "http://localhost:1337/test-package-gzip/1.2.3"

var pkg = {
  _id: "test-package-gzip@1.2.3",
  name: "test-package-gzip",
  version: "1.2.3"
}

zlib.gzip(JSON.stringify(pkg), function (err, pkgGzip) {
  tap.test("request gzip package content through proxy", function (t) {
    t.ifError(err, "example package compressed")

    t.deepEqual('http://localhost:8080', client.conf.get('proxy'))
    t.deepEqual('localhost, .npmjs.org', client.conf.get('noproxy'))

    server.expect("GET", "/test-package-gzip/1.2.3", function (req, res) {
      res.statusCode = 200
      res.setHeader("Content-Encoding", "gzip")
      res.setHeader("Content-Type", "application/json")
      res.end(pkgGzip)
    })

    client.get(TEST_URL, null, function (er, data) {
      if (er) throw er
      t.deepEqual(data, pkg)
      t.end()
    })
  })

})

