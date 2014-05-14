
module.exports = tag

function tag (project, version, tagName, cb) {
  this.request("PUT", this.conf.get("registry"), project+"/"+tagName, JSON.stringify(version), cb)
}
