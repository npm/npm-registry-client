var qs = require('querystring')

module.exports = login

function login (username, password, cb) {
  if (!username || !password) 
    return cb(new Error("Username and Password must be provided"))

  var auth = JSON.stringify({ name: username, password: password})

  this.request("POST", "/_session", auth, 
    function (er, parsed, data, response) {
      if (er) return cb.call(this, er)
      
      var cookies = response.headers["set-cookie"]
      if (!cookies || !cookies[0]) 
        throw new Error("No token sent by the server!")

      var tok = cookies[0]
      this.token = qs.parse(tok, "; ")
      cb.call(this, null, qs.parse(tok, "; "))
      
    }.bind(this))
}
