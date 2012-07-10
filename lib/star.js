
module.exports = star

function star (package, starred, cb) {
  if (!this.token) return cb(new Error(
    "Must be logged in to star/unstar packages"))

  var users = {}

  this.request("GET", package, function (er, fullData) {
    if (er) return cb(er)

    fullData = { _id: fullData._id
               , _rev: fullData._rev
               , users: fullData.users || {} }

    if (starred) {
      this.log.info("starring", fullData._id)
      fullData.users[this.username] = true
      this.log.verbose("starring", fullData)
    } else {
      delete fullData.users[this.username]
      this.log.info("unstarring", fullData._id)
      this.log.verbose("unstarring", fullData)
    }

    return this.request("PUT", package, fullData, cb)
  }.bind(this))
}
