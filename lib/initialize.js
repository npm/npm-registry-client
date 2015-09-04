var assign = require('lodash.assign')
var crypto = require('crypto')
var HttpAgent = require('http').Agent
var HttpsAgent = require('https').Agent

var pkg = require('../package.json')

var httpAgent
var httpsAgents = {}

module.exports = initialize

function initialize (uri, method, accept, headers, params) {
  params = assign({}, this.config, params)

  if (!params.sessionToken) {
    params.sessionToken = crypto.randomBytes(8).toString('hex')
    this.log.verbose('request id', params.sessionToken)
  }

  var opts = {
    url: uri,
    method: method,
    headers: headers,
    localAddress: params.proxy.localAddress,
    strictSSL: params.ssl.strict,
    cert: params.ssl.certificate,
    key: params.ssl.key,
    ca: params.ssl.ca,
    agent: getAgent(uri.protocol, params)
  }

  // allow explicit disabling of proxy in environment via CLI
  //
  // how false gets here is the CLI's problem (it's gross)
  if (params.proxy.http === false) {
    opts.proxy = null
  } else {
    // request will not pay attention to the NOPROXY environment variable if a
    // config value named proxy is passed in, even if it's set to null.
    var proxy
    if (uri.protocol === 'https:') {
      proxy = params.proxy.https
    } else {
      proxy = params.proxy.http
    }
    if (typeof proxy === 'string') opts.proxy = proxy
  }

  headers.version = this.version || pkg.version
  headers.accept = accept

  if (this.refer) headers.referer = this.refer

  headers['npm-session'] = params.sessionToken
  headers['user-agent'] = params.userAgent

  return opts
}

function getAgent (protocol, params) {
  if (protocol === 'https:') {
    var key = JSON.stringify(params.ssl)
    var httpsAgent = httpsAgents[key]

    if (!httpsAgent) {
      httpsAgent = httpsAgents[key] = new HttpsAgent({
        keepAlive: true,
        localAddress: params.proxy.localAddress,
        rejectUnauthorized: params.ssl.strict,
        ca: params.ssl.ca,
        cert: params.ssl.certificate,
        key: params.ssl.key
      })
    }

    return httpsAgent
  } else {
    if (!httpAgent) {
      httpAgent = new HttpAgent({
        keepAlive: true,
        localAddress: params.proxy.localAddress
      })
    }

    return httpAgent
  }
}
