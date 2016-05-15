var test = require('tap').test

var common = require('./lib/common.js')
var client = common.freshClient()
var server = require('./lib/server.js')

function nop () {}

var URI = 'https://npm.registry:8043/-/npm/anon-metrics/v1/:metricId'
var from = new Date()
var to = new Date()
var PARAMS = {
  metricId: 'this-is-a-uuid',
  metrics: [{
    from: from,
    to: to,
    successfulInstalls: 0,
    failedInstalls: 1
  }]
}

test('sendAnonymousCLIMetrics call contract', function (t) {
  t.throws(function () {
    client.sendAnonymousCLIMetrics(undefined, PARAMS, nop)
  }, 'requires a URI')

  t.throws(function () {
    client.sendAnonymousCLIMetrics([], PARAMS, nop)
  }, 'requires URI to be a string')

  t.throws(function () {
    client.sendAnonymousCLIMetrics(URI, undefined, nop)
  }, 'requires params object')

  t.throws(function () {
    client.sendAnonymousCLIMetrics(URI, '', nop)
  }, 'params must be object')

  t.throws(function () {
    client.sendAnonymousCLIMetrics(URI, PARAMS, undefined)
  }, 'requires callback')

  t.throws(function () {
    client.sendAnonymousCLIMetrics(URI, PARAMS, 'callback')
  }, 'callback must be function')

  t.end()
})

test('sendAnonymousCLIMetrics', function (t) {

  server.expect('PUT', '/-/npm/anon-metrics/v1/:metricId', function (req, res) {
    res.end("200")
  })

  var uri = common.registry + '/-/npm/anon-metrics/v1/:metricId'
  client.sendAnonymousCLIMetrics(uri, PARAMS, function (error, res) {
    t.ifError(error, 'no errors')
    server.close()
    t.end()
  })

})

test('cleanup', function (t) {
  server.close()
  t.end()
})
