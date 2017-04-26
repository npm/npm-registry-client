'use strict'

var test = require('tap').test

var server = require('./lib/server.js')
var common = require('./lib/common.js')
var client = common.freshClient()

var URI = 'http://localhost:1337'
var PARAMS = {
  auth: {
    token: 'foo'
  },
  org: 'myorg',
  user: 'myuser'
}

test('org: add user', function (t) {
  server.expect('PUT', '/-/org/myorg/user', function (req, res) {
    t.equal(req.method, 'PUT')
    onJsonReq(req, function (json) {
      t.same(json, {user: 'myuser'})
      res.statusCode = 200
      res.json({result: 'anything'})
    })
  })

  client.org('add', URI, PARAMS, function (err, data) {
    t.same(err, null)
    t.same(data, {result: 'anything'})
    t.done()
  })
})

test('org: rm user', function (t) {
  server.expect('DELETE', '/-/org/myorg/user', function (req, res) {
    t.equal(req.method, 'DELETE')
    onJsonReq(req, function (json) {
      t.same(json, {user: 'myuser'})
      res.statusCode = 200
      res.json({result: 'anything'})
    })
  })

  client.org('rm', URI, PARAMS, function (err, data) {
    t.same(err, null)
    t.same(data, {result: 'anything'})
    t.done()
  })
})

test('org: rm user (400)', function (t) {
  server.expect('DELETE', '/-/org/myorg/user', function (req, res) {
    t.equal(req.method, 'DELETE')
    onJsonReq(req, function (json) {
      t.same(json, {user: 'myuser'})
      res.statusCode = 400
      res.json({result: 'anything'})
    })
  })

  client.org('rm', URI, PARAMS, function (err, data) {
    t.ok(err)
    t.same(data, {result: 'anything'})
    t.done()
  })
})

test('org: ls', function (t) {
  server.expect('GET', '/-/org/myorg/user', function (req, res) {
    t.equal(req.method, 'GET')
    onJsonReq(req, function () {
      res.statusCode = 200
      res.json({username: 'role', username2: 'admin'})
    })
  })

  client.org('ls', URI, PARAMS, function (err, data) {
    t.same(err, null)
    t.same(data, {username: 'role', username2: 'admin'})
    t.done()
  })
})

test('cleanup', function (t) {
  server.close()
  t.end()
})

function onJsonReq (req, cb) {
  var buffer = ''
  req.setEncoding('utf8')
  req.on('data', function (data) { buffer += data })
  req.on('end', function () { cb(buffer ? JSON.parse(buffer) : undefined) })
}
