module.exports = upload

var fs = require('fs')
, Stream = require("stream").Stream

function upload (uri, file, etag, nofollow, credentials, cb) {
  if (typeof nofollow === "function") cb = nofollow, nofollow = false
  if (typeof etag === "function") cb = etag, etag = null

  var options = {
    etag : etag,
    follow : !nofollow,
    auth : credentials
  }
  if (file instanceof Stream) {
    options.body = file
    return this.request("PUT", uri, options, cb)
  }

  fs.stat(file, function (er, stat) {
    if (er) return cb(er)
    var s = fs.createReadStream(file)
    s.size = stat.size
    s.on("error", cb)
    options.body = s

    this.request("PUT", uri, options, cb)
  }.bind(this))
}
