var tap = require("tap")

var server = require("./lib/server.js")
var common = require("./lib/common.js")

var credentials = { token : "not-bad-meaning-bad-but-bad-meaning-wombat" }

var client = common.freshClient()

var WHOIAM = "wombat"

tap.test("whoami", function (t) {
  server.expect("GET", "/whoami", function (req, res) {
    t.equal(req.method, "GET")
    // only available for token-based auth for now
    t.equal(req.headers.authorization, "Bearer not-bad-meaning-bad-but-bad-meaning-wombat")

    res.json({username : WHOIAM})
  })

  client.whoami(common.registry, credentials, function (error, wombat) {
    t.ifError(error, "no errors")
    t.equal(wombat, WHOIAM, "im a wombat")

    t.end()
  })
})
