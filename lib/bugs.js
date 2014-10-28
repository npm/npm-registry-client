module.exports = bugs

var assert = require("assert")

function bugs (uri, params, cb) {
  assert(typeof uri === "string", "must pass registry URI to bugs")
  assert(params && typeof params === "object", "must pass params to bugs")
  assert(typeof cb === "function", "must pass callback to bugs")

  params.timeout = 3600
  this.get(uri + "/latest", params, function (er, d) {
    if (er) return cb(er)
    cb(null, d.bugs)
  })
}
