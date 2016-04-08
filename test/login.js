var test = require('tap').test

var server = require('./lib/server.js')
var common = require('./lib/common.js')
var client = common.freshClient()

function nop () {}

var URI = 'https://npm.registry:8043/rewrite'
var USERNAME = 'username'
var PASSWORD = 'password'
var AUTH = {
  auth: {
    username: USERNAME,
    password: PASSWORD
  }
}

test('login call contract', function (t) {
  t.throws(function () {
    client.login(undefined, AUTH, nop)
  }, 'requires a URI')

  t.throws(function () {
    client.login([], AUTH, nop)
  }, 'requires URI to be a string')

  t.throws(function () {
    client.login(URI, undefined, nop)
  }, 'requires params object')

  t.throws(function () {
    client.login(URI, '', nop)
  }, 'params must be object')

  t.throws(function () {
    client.login(URI, AUTH, undefined)
  }, 'requires callback')

  t.throws(function () {
    client.login(URI, AUTH, 'callback')
  }, 'callback must be function')

  t.throws(
    function () {
      var params = {
        auth: {
          password: PASSWORD
        }
      }
      client.login(URI, params, nop)
    },
    { name: 'AssertionError', message: 'must include username in auth' },
    'auth must include username'
  )

  t.throws(
    function () {
      var params = {
        auth: {
          username: USERNAME
        }
      }
      client.login(URI, params, nop)
    },
    { name: 'AssertionError', message: 'must include password in auth' },
    'auth must include password'
  )

  t.test('username missing', function (t) {
    var params = {
      auth: {
        username: '',
        password: PASSWORD
      }
    }
    client.login(URI, params, function (err) {
      t.equal(err && err.message, 'No username supplied.', 'username must not be empty')
      t.end()
    })
  })

  t.test('password missing', function (t) {
    var params = {
      auth: {
        username: USERNAME,
        password: ''
      }
    }
    client.login(URI, params, function (err) {
      t.equal(
        err && err.message,
        'No password supplied.',
        'password must not be empty'
      )
      t.end()
    })
  })

  t.end()
})

test('cleanup', function (t) {
  server.close()
  t.end()
})
