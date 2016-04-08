// NOTE: This is not identical to `npm login` yet. `npm login` uses adduser.js

module.exports = login

var url = require('url')
var assert = require('assert')

function login (uri, params, cb) {
  assert(typeof uri === 'string', 'must pass registry URI to login')
  assert(
    params && typeof params === 'object',
    'must pass params to login'
  )
  assert(typeof cb === 'function', 'must pass callback to login')

  assert(params.auth && typeof params.auth, 'must pass auth to login')
  var auth = params.auth
  assert(typeof auth.username === 'string', 'must include username in auth')
  assert(typeof auth.password === 'string', 'must include password in auth')

  // normalize registry URL
  if (uri.slice(-1) !== '/') uri += '/'

  var username = auth.username.trim()
  var password = auth.password.trim()

  // validation
  if (!username) return cb(new Error('No username supplied.'))
  if (!password) return cb(new Error('No password supplied.'))

  var userobj = {
    _id: 'org.couchdb.user:' + username,
    name: username,
    password: password,
    type: 'user',
    roles: [],
    date: new Date().toISOString()
  }

  var token = this.config.couchToken
  if (this.couchLogin) this.couchLogin.token = null

  cb = done.call(this, token, cb)

  var logObj = Object.keys(userobj).map(function (k) {
    if (k === 'password') return [k, 'XXXXX']
    return [k, userobj[k]]
  }).reduce(function (s, kv) {
    s[kv[0]] = kv[1]
    return s
  }, {})

  this.log.verbose('login', 'before first PUT', logObj)

  var client = this

  uri = url.resolve(uri, '-/user/org.couchdb.user:' + encodeURIComponent(username))
  var options = {
    method: 'PUT',
    body: userobj
  }
  this.request(
    uri,
    options,
    cb
  )

  function done (token, cb) {
    return function (error, data, json, response) {
      if (!error && (!response || response.statusCode === 201)) {
        return cb(error, data, json, response)
      }

      // there was some kind of error, reinstate previous auth/token/etc.
      if (client.couchLogin) {
        client.couchLogin.token = token
        if (client.couchLogin.tokenSet) {
          client.couchLogin.tokenSet(token)
        }
      }

      client.log.verbose('login', 'back', [error, data, json])
      if (!error) {
        error = new Error(
          (response && response.statusCode || '') + ' Unable to login'
        )
      }
      var badLogin = response && response.statusCode === 400 || response.statusCode === 401 || response.statusCode === 403

      if (badLogin) {
        client.log.warn('login', 'Incorrect username or password\n' +
                                   'You can reset your account by visiting:\n' +
                                   '\n' +
                                   '    https://npmjs.org/forgot\n')
      }

      return cb(error)
    }
  }
}
