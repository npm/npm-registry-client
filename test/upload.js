var tap = require("tap")
var Readable = require("stream").Readable
var inherits = require("util").inherits

var common = require("./lib/common.js")
var server = require("./lib/server.js")

var cache = require("./fixtures/underscore/cache.json")

var credentials = { token : "of-glad-tidings" }

var client = common.freshClient()

function OneA() {
  Readable.call(this)
  this.push("A")
  this.push(null)
}
inherits(OneA, Readable)

tap.test("uploading a tarball", function (t) {
  server.expect("PUT", "/underscore", function (req, res) {
    t.equal(req.method, "PUT")

    res.json(cache)
  })

  client.upload(
    "http://localhost:1337/underscore",
    new OneA(),
    "daedabeefa",
    true,
    credentials,
    function (error) {
      t.ifError(error, "no errors")

      t.end()
    }
  )
})
