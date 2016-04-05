module.exports = authify

function authify (authed, parsed, headers, credentials) {
  if (credentials && credentials.token) {
    this.log.verbose('request', 'using bearer token for auth')
    headers.authorization = 'Bearer ' + credentials.token

    return null
  }

  if (authed) {
    if (credentials && credentials.username && credentials.password) {
      var username = encodeURIComponent(credentials.username)
      var password = encodeURIComponent(credentials.password)
      parsed.auth = username + ':' + password
    } else if (parsed.auth) {
      this.log.info('request', 'using auth from uri')
    } else {
      return new Error(
        'This request requires auth credentials. Run `npm login` and repeat the request.'
      )
    }
  }
}
