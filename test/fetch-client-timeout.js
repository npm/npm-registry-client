var tap = require('tap')

var server = require('./lib/server.js')
var common = require('./lib/common.js')

tap.test('fetch with a 404 response', function (t) {
  server.expect('/anything', function (req, res) {
    t.equal(req.method, 'GET', 'got expected method')
  })
  server.expect('/anything', function (req, res) {
    t.equal(req.method, 'GET', 'got expected method')
  })

  var client = common.freshClient({
    timeout: 100,
    retry: {
      retries: 1,
      minTimeout: 10,
      maxTimeout: 100
    }
  })
  var defaulted = {}
  client.fetch(
    'http://localhost:1337/anything',
    defaulted,
    function (err, res) {
      t.equal(
        err.message,
        'ETIMEDOUT',
        'got expected error message'
      )
      server.close()
      t.end()
    }
  )
})
