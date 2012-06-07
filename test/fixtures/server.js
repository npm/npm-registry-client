// a fake registry server.

var http = require('http')
var server = http.createServer(handler)
var port = server.port = process.env.PORT || 1337
server.listen(port)

module.exports = server

server._expect = {}

var expect = {}
function handler (req, res) {
  if (!expect[req.url]) throw Error("unexpected request", req.url)
  expect[req.url] --

  if (Object.keys(expect).reduce(function (s, k) {
    return s + expect[k]
  }, 0) === 0) server.close()

  res.json = json
  server._expect[req.url](req, res)
}

function json (o) {
  this.setHeader('content-type', 'application/json')
  this.end(JSON.stringify(o))
}

server.expect = function (u, fn) {
  server._expect[u] = fn
  expect[u] = expect[u] || 0
  expect[u] ++
}
