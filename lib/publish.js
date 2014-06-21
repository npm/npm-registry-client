
module.exports = publish

var url = require("url")
  , semver = require("semver")
  , crypto = require("crypto")
  , fs = require("fs")
  , fixNameField = require("normalize-package-data/lib/fixer.js").fixNameField

function escaped(name) {
  return name.replace("/", "%2f")
}

function publish (uri, data, tarball, cb) {
  var c = this.conf.getCredentialsByURI(uri)
  if (!(c.token || (c.auth && c.username && c.email))) {
    var er = new Error("auth and email required for publishing")
    er.code = 'ENEEDAUTH'
    return cb(er)
  }

  try {
    fixNameField(data, true)
  }
  catch (er) {
    return cb(er)
  }

  var ver = semver.clean(data.version)
  if (!ver)
    return cb(new Error('invalid semver: ' + data.version))
  data.version = ver

  var self = this
  fs.stat(tarball, function(er, s) {
    if (er) return cb(er)
    fs.readFile(tarball, function(er, tarbuffer) {
      if (er) return cb(er)
      putFirst.call(self, uri, data, tarbuffer, s, c, cb)
    })
  })
}

function putFirst (registry, data, tarbuffer, stat, creds, cb) {
  // optimistically try to PUT all in one single atomic thing.
  // If 409, then GET and merge, try again.
  // If other error, then fail.

  var root =
    { _id : data.name
    , name : data.name
    , description : data.description
    , "dist-tags" : {}
    , versions : {}
    , readme: data.readme || ""
    }

  if (!creds.token) {
    root.maintainers = [{name : creds.username, email : creds.email}]
    data.maintainers = JSON.parse(JSON.stringify(root.maintainers))
  }

  root.versions[ data.version ] = data
  var tag = data.tag || this.conf.get('tag') || "latest"
  root["dist-tags"][tag] = data.version

  var tbName = data.name + "-" + data.version + ".tgz"
    , tbURI = data.name + "/-/" + tbName

  data._id = data.name+"@"+data.version
  data.dist = data.dist || {}
  data.dist.shasum = crypto.createHash("sha1").update(tarbuffer).digest("hex")
  data.dist.tarball = url.resolve(registry, tbURI)
                         .replace(/^https:\/\//, "http://")

  root._attachments = {}
  root._attachments[ tbName ] = {
    content_type: 'application/octet-stream',
    data: tarbuffer.toString('base64'),
    length: stat.size
  }

  var fixed = url.resolve(registry, escaped(data.name))
  this.request("PUT", fixed, { body : root }, function (er, parsed, json, res) {
    var r409 = "must supply latest _rev to update existing package"
    var r409b = "Document update conflict."
    var conflict = res && res.statusCode === 409
    if (parsed && (parsed.reason === r409 || parsed.reason === r409b))
      conflict = true

    // a 409 is typical here.  GET the data and merge in.
    if (er && !conflict) {
      this.log.error("publish", "Failed PUT "
                    +(res && res.statusCode))
      return cb(er)
    }

    if (!er && !conflict)
      return cb(er, parsed, json, res)

    // let's see what versions are already published.
    var getUrl = url.resolve(registry, data.name + "?write=true")
    this.request("GET", getUrl, null, function (er, current) {
      if (er) return cb(er)

      putNext.call(this, registry, data.version, root, current, cb)
    }.bind(this))
  }.bind(this))
}

function putNext(registry, newVersion, root, current, cb) {
  // already have the tardata on the root object
  // just merge in existing stuff
  var curVers = Object.keys(current.versions || {}).map(function (v) {
    return semver.clean(v, true)
  }).concat(Object.keys(current.time || {}).map(function(v) {
    if (semver.valid(v, true))
      return semver.clean(v, true)
  }).filter(function(v) {
    return v
  }))

  if (curVers.indexOf(newVersion) !== -1) {
    return cb(conflictError(root.name, newVersion))
  }

  current.versions[newVersion] = root.versions[newVersion]
  current._attachments = current._attachments || {}
  for (var i in root) {
    switch (i) {
      // objects that copy over the new stuffs
      case 'dist-tags':
      case 'versions':
      case '_attachments':
        for (var j in root[i])
          current[i][j] = root[i][j]
        break

      // ignore these
      case 'maintainers':
        break

      // copy
      default:
        current[i] = root[i]
    }
  }
  var maint = JSON.parse(JSON.stringify(root.maintainers))
  root.versions[newVersion].maintainers = maint

  var uri = url.resolve(registry, escaped(root.name))
  this.request("PUT", uri, { body : current }, cb)
}

function conflictError (pkgid, version) {
  var e = new Error("cannot modify pre-existing version")
  e.code = "EPUBLISHCONFLICT"
  e.pkgid = pkgid
  e.version = version
  return e
}
