// utilities for working with the js-registry site.

module.exports = RegClient

var join = require("path").join
  , fs = require("graceful-fs")

var npmlog
try {
  npmlog = require("npmlog")
}
catch (er) {
  npmlog = { error: noop, warn: noop, info: noop,
             verbose: noop, silly: noop, http: noop,
             pause: noop, resume: noop }
}

function noop () {}

function RegClient (config) {
  // accept either a plain-jane object, or a npmconf object
  // with a "get" method.
  if (typeof config.get !== "function") {
    var data = config
    config = {
      get: function (k) { return data[k] },
      set: function (k, v) { data[k] = v },
      del: function (k) { delete data[k] }
    }
  }
  this.conf = config

  this.log = this.conf.log || this.conf.get("log") || npmlog
}

fs.readdirSync(join(__dirname, "lib")).forEach(function (f) {
  if (!f.match(/\.js$/)) return
  var name = f.replace(/\.js$/, "")
              .replace(/-([a-z])/, function (_, l) { return l.toUpperCase() })
  RegClient.prototype[name] = require(join(__dirname, "lib", f))
})
