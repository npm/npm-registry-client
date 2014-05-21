var common = require("./lib/common.js")
var tap = require('tap')
var server = require('./fixtures/server.js')
var client = common.freshClient()
var us = require('./fixtures/underscore/1.3.3/cache.json')
var usroot = require("./fixtures/underscore/cache.json")
client.log.level = "verbose"

tap.test("basic request", function (t) {
  server.expect("/underscore/1.3.3", function (req, res) {
    console.error('got a request')
    res.json(us)
  })

  server.expect("/underscore", function (req, res) {
    console.error('got a request')
    res.json(usroot)
  })

  t.plan(2)
  client.get("/underscore/1.3.3", function (er, data) {
    console.error("got response")
    t.deepEqual(data, us)
  })

  client.get("/underscore", function (er, data) {
    console.error("got response")
    t.deepEqual(data, usroot)
  })
})
