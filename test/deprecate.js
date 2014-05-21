var common = require("./lib/common.js")
var tap = require("tap")

var server = require("./fixtures/server.js")
var cache = require('./fixtures/underscore/cache.json')

var client = common.freshClient({
  username      : "username",
  password      : "password",
  email         : "ogd@aoaioxxysz.net",
  _auth         : new Buffer("username  : password").toString('base64'),
  "always-auth" : true
})

var DEP_VERSION = "1.3.2"
var DEP_MESSAGE = "uhhh"

tap.test("deprecate a package", function (t) {
  server.expect("GET", "/underscore?write=true", function (req, res) {
    t.equal(req.method, "GET")

    res.json(cache)
  })

  server.expect("PUT", "/underscore", function (req, res) {
    t.equal(req.method, "PUT")

    var b = ""
    req.setEncoding('utf8')
    req.on("data", function (d) {
      b += d
    })

    req.on("end", function () {
      var updated = JSON.parse(b)

      var undeprecated  = [
        "1.0.3", "1.0.4", "1.1.0", "1.1.1", "1.1.2", "1.1.3", "1.1.4", "1.1.5", "1.1.6",
        "1.1.7", "1.2.0", "1.2.1", "1.2.2", "1.2.3", "1.2.4", "1.3.0", "1.3.1", "1.3.3"
      ]
      for (var i = 0; i < undeprecated.length; i++) {
        var current = undeprecated[i]
        t.notEqual(
          updated.versions[current].deprecated,
          DEP_MESSAGE,
          current + " not deprecated"
        )
      }

      t.equal(
        updated.versions[DEP_VERSION].deprecated,
        DEP_MESSAGE,
        DEP_VERSION + " deprecated"
      )
      res.statusCode = 201
      res.json({deprecated:true})
    })
  })

  client.deprecate("underscore", DEP_VERSION, DEP_MESSAGE, function (error, data) {
    t.notOk(error, "no errors")
    t.ok(data.deprecated, "was deprecated")

    t.end()
  })
})
