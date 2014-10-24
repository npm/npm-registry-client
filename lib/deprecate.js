module.exports = deprecate

var url = require("url")
var semver = require("semver")

function deprecate (uri, ver, message, credentials, cb) {
  if (!(credentials.token || credentials.auth)) {
    return cb(new Error("Must be logged in to deprecate a package"))
  }

  if (semver.validRange(ver) === null) {
    return cb(new Error("invalid version range: "+ver))
  }

  this.get(uri + "?write=true", null, function (er, data) {
    if (er) return cb(er)
    // filter all the versions that match
    Object.keys(data.versions).filter(function (v) {
      return semver.satisfies(v, ver)
    }).forEach(function (v) {
      data.versions[v].deprecated = message
    })
    // now update the doc on the registry
    var options = {
      body : data,
      auth : credentials
    }
    this.request("PUT", url.resolve(uri, data._id), options, cb)
  }.bind(this))
}
