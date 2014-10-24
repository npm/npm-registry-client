module.exports = adduser

var url = require("url")
var assert = require("assert")

function adduser (registry, auth, cb) {
  assert(registry, "Required registry URI not supplied.")
  assert(auth, "Must include auth credentials to adduser.")
  assert(cb, "Must include callback for adduser.")

  // normalize registry URL
  if (registry.slice(-1) !== "/") registry += "/"

  var username = ("" + (auth.username || "")).trim()
  if (!username) return cb(new Error("No username supplied."))

  var password = ("" + (auth.password || "")).trim()
  if (!password) return cb(new Error("No password supplied."))

  var email = ("" + (auth.email || "")).trim()
  if (!email) return cb(new Error("No email address supplied."))
  if (!email.match(/^[^@]+@[^\.]+\.[^\.]+/)) {
    return cb(new Error("Please use a real email address."))
  }

  var userobj =
      { name : username
      , password : password
      , email : email
      , _id : "org.couchdb.user:"+username
      , type : "user"
      , roles : []
      , date: new Date().toISOString()
      }

  var token = this.conf.get("_token")
  if (this.couchLogin) this.couchLogin.token = null

  cb = done.call(this, token, cb)

  var logObj = Object.keys(userobj).map(function (k) {
    if (k === "password") return [k, "XXXXX"]
    return [k, userobj[k]]
  }).reduce(function (s, kv) {
    s[kv[0]] = kv[1]
    return s
  }, {})

  this.log.verbose("adduser", "before first PUT", logObj)

  var uri = url.resolve(registry, "-/user/org.couchdb.user:" + encodeURIComponent(username))
  var options = { body : userobj, auth : auth }
  this.request("PUT"
    , uri
    , options
    , function (error, data, json, response) {
        if (!error || !response || response.statusCode !== 409) {
          return cb(error, data, json, response)
        }

        this.log.verbose("adduser", "update existing user")
        return this.request("GET"
          , uri + "?write=true"
          , options
          , function (er, data, json, response) {
              if (er || data.error) {
                return cb(er, data, json, response)
              }
              Object.keys(data).forEach(function (k) {
                if (!userobj[k] || k === "roles") {
                  userobj[k] = data[k]
                }
              })
              this.log.verbose("adduser", "userobj", logObj)
              this.request("PUT", uri+"/-rev/"+userobj._rev, options, cb)
            }.bind(this))
      }.bind(this))

  function done (token, cb) {
    return function (error, data, json, response) {
      if (!error && (!response || response.statusCode === 201)) {
        return cb(error, data, json, response)
      }

      // there was some kind of error, re-instate previous auth/token/etc.
      if (this.couchLogin) {
        this.couchLogin.token = token
        if (this.couchLogin.tokenSet) {
          this.couchLogin.tokenSet(token)
        }
      }

      this.log.verbose("adduser", "back", [error, data, json])
      if (!error) {
        error = new Error(
          (response && response.statusCode || "") + " " +
          "Could not create user\n" + JSON.stringify(data)
        )
      }

      if (response && (response.statusCode === 401 || response.statusCode === 403)) {
        this.log.warn("adduser", "Incorrect username or password\n" +
                                 "You can reset your account by visiting:\n" +
                                 "\n" +
                                 "    https://npmjs.org/forgot\n")
      }

      return cb(error)
    }.bind(this)
  }
}
