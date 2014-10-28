var test = require("tap").test

var server = require("./lib/server.js")
var common = require("./lib/common.js")
var client = common.freshClient()

function nop () {}

var URI        = "https://npm.registry:8043/rewrite"
var USERNAME   = "username"
var PASSWORD   = "password"
var EMAIL      = "n@p.m"
var AUTH_TRAD  = {
  auth : {
    username : USERNAME,
    password : PASSWORD,
    email    : EMAIL
  }
}
var AUTH_TOKEN = {
  auth : {
    token : "what?"
  }
}

test("bugs call contract", function (t) {
  t.throws(function () {
    client.bugs(undefined, {}, nop)
  }, "requires a URI")

  t.throws(function () {
    client.bugs([], {}, nop)
  }, "URI must be a string")

  t.throws(function () {
    client.bugs(URI, undefined, nop)
  }, "requires parameters")

  t.throws(function () {
    client.bugs(URI, "whoops", nop)
  }, "parameters must be an object")

  t.throws(function () {
    client.bugs(URI, AUTH_TRAD, undefined)
  }, "requires a callback")

  t.throws(function () {
    client.bugs(URI, AUTH_TRAD, {})
  }, "callback must be a function")

  t.end()
})

test("get the URL for the bugs page on a package", function (t) {
  server.expect("GET", "/sample/latest", function (req, res) {
    t.equal(req.method, "GET")

    res.json({
      bugs : {
        url : "http://github.com/example/sample/issues",
        email : "sample@example.com"
      }
    })
  })

  client.bugs("http://localhost:1337/sample", AUTH_TOKEN, function (error, info) {
    t.ifError(error)

    t.ok(info.url, "got the URL")
    t.ok(info.email, "got the email address")

    t.end()
  })
})
