module.exports = tag

function tag (uri, version, tagName, credentials, cb) {
  var options = {
    body : JSON.stringify(version),
    auth : credentials
  }
  this.request("PUT", uri+"/"+tagName, options, cb)
}
