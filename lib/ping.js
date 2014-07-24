
module.exports = ping

var url = require("url")

function ping (uri, cb) {
  var c = this.conf.getCredentialsByURI(uri)
  if (!c || !c.auth) {
    var er = new Error("Must be logged in to ping the registry")
    er.code = "ENEEDAUTH"
    return cb(er)
  }
  var parsed = url.parse(uri)
  parsed.auth = c.username + ":" + escape(c.password)
  uri = url.resolve(parsed, "/-/ping?write=true")
  this.get(uri, null, function (er, fullData) {
    if (er) {
      cb(er)
    } else if (fullData) {
      console.log(fullData)
      cb(null, fullData)
    } else {
      cb(new Error("No data received"))
    }
  })
}
