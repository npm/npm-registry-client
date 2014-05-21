var resolve = require("path").resolve
var server = require('../fixtures/server.js')
var RC = require('../../')

module.exports = {
  freshClient : function freshClient(config) {
    config = config || {}
    config.cache = resolve(__dirname, '..', '/fixtures/cache')
    config.registry = 'http://localhost:' + server.port

    var client = new RC(config)
    client.log.level = 'error'

    return client
  }
}
