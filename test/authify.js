var test = require('tap').test
var url = require('url')

require('./lib/server.js').close()
var common = require('./lib/common.js')

test('authify uses token if supplied', function (t) {
  var client = common.freshClient({})
  var parsed = url.parse('http://localhost/npm/test')
  var headers = {}
  var auth = { token: 'mytoken' }
  var result = client.authify(true, parsed, headers, auth)
  t.equals(result, null)
  t.equals(headers.authorization, 'Bearer mytoken')
  t.end()
})

test('authify uses username and password if supplied in credentials', function (t) {
  var client = common.freshClient({})
  var parsed = url.parse('http://localhost/npm/test')
  var headers = {}
  var auth = { username: 'username', password: 'password' }
  var result = client.authify(true, parsed, headers, auth)
  t.equals(result, undefined)
  t.same(headers, {})
  t.equals(parsed.auth, 'username:password')
  t.end()
})

test('authify uses username and password in uri if not supplied in credentials', function (t) {
  var client = common.freshClient({})
  var parsed = url.parse('http://uri:uripassword@localhost/npm/test')
  var headers = {}
  var auth = { }
  var result = client.authify(true, parsed, headers, auth)
  t.equals(result, undefined)
  t.same(headers, {})
  t.equals(parsed.auth, 'uri:uripassword')
  t.end()
})

test('authify returns error if neither uri or credentials have username / password', function (t) {
  var client = common.freshClient({})
  var parsed = url.parse('http://localhost/npm/test')
  var headers = {}
  var auth = {}
  var result = client.authify(true, parsed, headers, auth)
  t.type(result, 'Error')
  t.end()
})
