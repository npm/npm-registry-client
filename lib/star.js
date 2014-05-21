
module.exports = star

function star (package, starred, cb) {
  if (!this.conf.get('username')) return cb(new Error(
    "Must be logged in to star/unstar packages"))

  var fixed = this.request.toRegistryURL(
    this.conf.get('registry'),
    package + '?write=true'
  )
  this.request("GET", fixed, null, function (er, fullData) {
    if (er) return cb(er)

    fullData = { _id: fullData._id
               , _rev: fullData._rev
               , users: fullData.users || {} }

    if (starred) {
      this.log.info("starring", fullData._id)
      fullData.users[this.conf.get('username')] = true
      this.log.verbose("starring", fullData)
    } else {
      delete fullData.users[this.conf.get('username')]
      this.log.info("unstarring", fullData._id)
      this.log.verbose("unstarring", fullData)
    }

    var fixed = this.request.toRegistryURL(
      this.conf.get('registry'),
      package
    )
    return this.request("PUT", fixed, { body : fullData }, cb)
  }.bind(this))
}
