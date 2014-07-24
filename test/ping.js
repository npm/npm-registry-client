var tap = require("tap")

var server = require("./lib/server.js")
var common = require("./lib/common.js")

var DEP_USER = "username"
var HOST = "localhost"

var nerfed = "//" + HOST + ":" + server.port + "/:"

var configuration = {}
configuration[nerfed + "username"]  = DEP_USER
configuration[nerfed + "_password"] = new Buffer("%1234@asdf%").toString("base64")
configuration[nerfed + "email"]     = "i@izs.me"

var client = common.freshClient(configuration)

tap.test("ping registry", function (t) {
  t.plan(3)
  server.expect("GET", "/-/ping?write=true", function (req, res) {
    t.equal(req.method, "GET")
    res.statusCode = 200
    res.json({
      ok: true
    , host: HOST
    , peer: HOST
    , username: DEP_USER
    })
  })

  client.ping(common.registry, function (er, found) {
    t.ifError(er, "no errors")
    var wanted = {
      ok: true
    , host: HOST
    , peer: HOST
    , username: DEP_USER
    }
    t.same(found, wanted)
    t.end()
  })
})
