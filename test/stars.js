var tap = require("tap")

var server = require("./lib/server.js")
var common = require("./lib/common.js")
var client = common.freshClient()

var users = [
  "benjamincoe",
  "seldo",
  "ceejbot"
]

tap.test("get the URL for the bugs page on a package", function (t) {
  server.expect("GET", "/-/_view/starredByUser?key=%22sample%22", function (req, res) {
    t.equal(req.method, "GET")

    res.json(users)
  })

  client.stars("http://localhost:1337/", "sample", function (error, info) {
    t.ifError(error, "no errors")
    t.deepEqual(info, users, "got the list of users")

    t.end()
  })
})
