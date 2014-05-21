module.exports = upload

var fs = require('fs')
, Stream = require("stream").Stream

function upload (where, file, etag, nofollow, cb) {
  if (typeof nofollow === "function") cb = nofollow, nofollow = false
  if (typeof etag === "function") cb = etag, etag = null

  var fixed = this.request.toRegistryURL(
    this.conf.get('registry'),
    where
  )

  if (file instanceof Stream) {
    return this.request("PUT", fixed, { body : file, etag : etag, follow : !nofollow }, cb)
  }

  fs.stat(file, function (er, stat) {
    if (er) return cb(er)
    var s = fs.createReadStream(file)
    s.size = stat.size
    s.on("error", cb)

    this.request("PUT", fixed, { body : s, etag : etag, follow : !nofollow }, cb)
  }.bind(this))
}
