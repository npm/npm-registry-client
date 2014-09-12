var tap = require("tap")

var server = require("./lib/server.js")
var common = require("./lib/common.js")

tap.test("fetch encounters 404", function (t) {
  server.expect("/underscore/-/underscore-1.3.3.tgz", function (req, res) {
    t.equal(req.method, "GET", "got expected method")

    res.writeHead(404)
    res.end()
  })

  var client = common.freshClient()
  client.fetch(
    "http://localhost:1337/underscore/-/underscore-1.3.3.tgz",
    null,
    function (er, res) {
      t.ok(er, "got an error")
      t.equal(er.message, "fetch failed with status code 404", "got expected message")

      t.notOk(res, "didn't get a response")

      t.end()
    }
  )
})
