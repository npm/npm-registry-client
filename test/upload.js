var test = require("tap").test
var Readable = require("stream").Readable
var inherits = require("util").inherits

var server = require("./lib/server.js")
var common = require("./lib/common.js")
var client = common.freshClient()
var cache = require("./fixtures/underscore/cache.json")

function OneA() {
  Readable.call(this)
  this.push("A")
  this.push(null)
}
inherits(OneA, Readable)

function nop () {}

var URI       = "http://localhost:1337/underscore"
var TOKEN     = "of-glad-tidings"
var BODY      = new OneA()
var ETAG      = "daedabeefa"
var FOLLOW    = true
var AUTH      = {
  token : TOKEN
}
var PARAMS    = {
  body     : BODY,
  etag     : ETAG,
  follow   : FOLLOW,
  auth     : AUTH
}

test("upload call contract", function (t) {
  t.throws(function () {
    client.upload(undefined, PARAMS, nop)
  }, "requires a URI")

  t.throws(function () {
    client.upload([], PARAMS, nop)
  }, "requires URI to be a string")

  t.throws(function () {
    client.upload(URI, undefined, nop)
  }, "requires params object")

  t.throws(function () {
    client.upload(URI, "", nop)
  }, "params must be object")

  t.throws(function () {
    client.upload(URI, PARAMS, undefined)
  }, "requires callback")

  t.throws(function () {
    client.upload(URI, PARAMS, "callback")
  }, "callback must be function")

  t.throws(
    function () {
      var params = {
        auth : AUTH
      }
      client.upload(URI, params, nop)
    },
    { name : "AssertionError", message : "must pass package body to upload" },
    "params must include body of package to upload"
  )

  t.throws(
    function () {
      var params = {
        body : BODY
      }
      client.upload(URI, params, nop)
    },
    { name : "AssertionError", message : "must pass auth to upload" },
    "params must include auth"
  )

  t.throws(
    function () {
      var params = {
        body : -1,
        auth : AUTH
      }
      client.upload(URI, params, nop)
    },
    {
      name    : "AssertionError",
      message : "package body passed to upload must be a stream"
    },
    "body must be a Stream"
  )

  t.end()
})

test("uploading a tarball", function (t) {
  server.expect("PUT", "/underscore", function (req, res) {
    t.equal(req.method, "PUT")

    res.json(cache)
  })

  client.upload(URI, PARAMS, function (error) {
    t.ifError(error, "no errors")

    t.end()
  })
})
