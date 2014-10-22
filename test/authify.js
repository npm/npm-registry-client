// Close the auto-created server since this is an offline unit-test
require("./lib/server.js").close();

var url = require("url")
var tap = require("tap")

var common = require("./lib/common.js")
var REGISTRY = "https://registry.npmjs.org"

function noAuthifyError (message, options) {
  options = options || {}
  var path = options.path || ""
  var uri = options.uri || REGISTRY
  var headers = options.headers || { 'accept-encoding': 'gzip' }
  var config = options.config || common.nerfedObject(uri, {
    "username"  : "npmjs",
    "_password" : "sup3rs3cr3tz",
    "email"     : "support@npmjs.org"
  })

  config.registry = uri
  var client = common.freshClient(config)

  tap.test(message, function (t) {
    var er = client.authify(true, url.parse(uri + path), headers)

    function defaultPlan() {
      t.plan(1)
      t.equal(er, undefined)
    }

    var ok = options.plan ? options.plan(t, er, headers) : defaultPlan()
    t.end()
  })
}

noAuthifyError('authify true with simple URL')

noAuthifyError('authify true with bearer token', {
  config : common.nerfedObject(REGISTRY, { "_authToken": 'TOKENSAREFORARCADES' }),
  plan   : function (t, val, headers) {
    t.plan(2)
    t.equal(val, null)
    t.equal(headers.authorization, 'Bearer TOKENSAREFORARCADES')
  }
})

noAuthifyError('authify true with path in URL', {
  path: '/somepkg1042'
})

noAuthifyError('authify true with querystring in URL', {
  path: '/somepkg1042?write=true'
})