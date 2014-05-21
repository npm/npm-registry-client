
module.exports = tag

function tag (project, version, tagName, cb) {
  var fixed = this.request.toRegistryURL(
    this.conf.get('registry'),
    project + "/" + tagName
  )
  this.request("PUT", fixed, { body : JSON.stringify(version) }, cb)
}
