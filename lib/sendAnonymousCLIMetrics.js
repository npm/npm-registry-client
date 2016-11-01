module.exports = send

var assert = require('assert')
var url = require('url')

function send (uri, params, cb) {
  assert(typeof uri === 'string', 'must pass registry URI')
  assert(params && typeof params === 'object', 'must pass params')
  assert(typeof cb === 'function', 'must pass callback')

  var parsed = url.parse(uri)
  assert(
    parsed.protocol === 'http:' || parsed.protocol === 'https:',
    'must have a URL that starts with http: or https:'
  )

  params.method = 'PUT'
  this.request(uri, params, cb)
}
