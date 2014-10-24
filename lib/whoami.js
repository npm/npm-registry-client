module.exports = whoami

var url = require("url")

function whoami (uri, credentials, cb) {
  if (!credentials && credentials.username) {
    return cb(new Error("Must be logged in to see who you are"))
  }

  var options = { auth : credentials }
  this.request("GET", url.resolve(uri, "whoami"), options, function (er, userdata) {
    if (er) return cb(er)

    cb(null, userdata.username)
  })
}
