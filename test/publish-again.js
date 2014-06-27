var tap = require("tap")
var fs = require("fs")

var server = require("./lib/server.js")
var common = require("./lib/common.js")

var nerfed = "//localhost:" + server.port + "/:"

var configuration = {}
configuration[nerfed + "username"]  = "username"
configuration[nerfed + "_password"] = new Buffer("password").toString("base64")
configuration[nerfed + "email"]     = "i@izs.me"

var client = common.freshClient(configuration)

tap.test("publish again", function (t) {
  // not really a tarball, but doesn't matter
  var tarball = require.resolve("../package.json")
  var pd = fs.readFileSync(tarball, "base64")
  var pkg = require("../package.json")
  var lastTime = null

  server.expect("/npm-registry-client", function (req, res) {
    t.equal(req.method, "PUT")
    var b = ""
    req.setEncoding("utf8")
    req.on("data", function (d) {
      b += d
    })

    req.on("end", function () {
      var o = lastTime = JSON.parse(b)
      t.equal(o._id, "npm-registry-client")
      t.equal(o["dist-tags"].latest, pkg.version)
      t.has(o.versions[pkg.version], pkg)
      t.same(o.maintainers, [ { name: "username", email: "i@izs.me" } ])
      var att = o._attachments[ pkg.name + "-" + pkg.version + ".tgz" ]
      t.same(att.data, pd)
      res.statusCode = 409
      res.json({reason: "must supply latest _rev to update existing package"})
    })
  })

  server.expect("/npm-registry-client?write=true", function (req, res) {
    t.equal(req.method, "GET")
    t.ok(lastTime)
    for (var i in lastTime.versions) {
      var v = lastTime.versions[i]
      delete lastTime.versions[i]
      lastTime.versions["0.0.2"] = v
      lastTime["dist-tags"] = { latest: "0.0.2" }
    }
    lastTime._rev = "asdf"
    res.json(lastTime)
  })

  server.expect("/npm-registry-client", function (req, res) {
    t.equal(req.method, "PUT")
    t.ok(lastTime)

    var b = ""
    req.setEncoding("utf8")
    req.on("data", function (d) {
      b += d
    })

    req.on("end", function() {
      var o = JSON.parse(b)
      t.equal(o._rev, "asdf")
      t.deepEqual(o.versions["0.0.2"], o.versions[pkg.version])
      res.statusCode = 201
      res.json({created: true})
    })
  })

  client.publish("http://localhost:1337/", pkg, tarball, function (er, data) {
    if (er) throw er
    t.deepEqual(data, { created: true })
    t.end()
  })
})
