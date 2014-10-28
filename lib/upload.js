module.exports = upload

var Stream = require("stream").Stream
  , assert = require("assert")

function upload (uri, params, cb) {
  assert(typeof uri === "string", "must pass registry URI to upload")
  assert(params && typeof params === "object", "must pass params to upload")
  assert(typeof cb === "function", "must pass callback to upload")

  assert(
    params.auth && typeof params.auth === "object",
    "must pass auth to upload"
  )

  assert(params.body, "must pass package body to upload")
  assert(
    params.body instanceof Stream,
    "package body passed to upload must be a stream"
  )

  var options = {
    method : "PUT",
    etag : params.etag,
    follow : params.follow,
    auth : params.auth,
    body : params.body
  }

  this.request(uri, options, cb)
}
