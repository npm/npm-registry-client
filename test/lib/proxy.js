var http = require('http')
var request = require('request')
var proxy = http.createServer(handler)
proxy.listen(8080)

module.exports = proxy

function handler (req, res) {
  req.connection.setTimeout(1000)
  res.statusCode = 200

  this.log.info('proxy', 'Received request for: ' + req.url)

  var serverPort = process.env.PORT || 1337
  var url = 'http://localhost:' + serverPort + '/proxy-package-gzip/1.2.3'
  var x = request(url)
  req.pipe(x)
  x.pipe(res)

  proxy.close();
}

// this log is meanto to be overridden
proxy.log = require("npmlog")

