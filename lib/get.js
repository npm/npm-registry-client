module.exports = get

var fs = require("graceful-fs")
  , assert = require("assert")
  , path = require("path")
  , mkdir = require("mkdirp")
  , chownr = require("chownr")
  , url = require("url")

/**
 * parameters:
 *
 * timeout: request timeouts
 * follow:  follow redirects
 * staleOk: stale results are OK
 * stat:    results of checking for cached metadata
 * data:    the cached metadata
 * auth:    credentials for private registries
 */
function get (uri, params, cb) {
  assert(typeof uri === "string", "must pass registry URI to get")
  assert(params && typeof params === "object", "must pass params to get")
  assert(typeof cb === "function", "must pass callback to get")

  var parsed = url.parse(uri)
  assert(
    parsed.protocol === "http:" || parsed.protocol === "https:",
    "must have a URL that starts with http: or https:"
  )

  var cacheBase = this.cacheFile(uri)
  var cache = path.join(cacheBase, ".cache.json")
  var client = this

  // If the GET is part of a write operation (PUT or DELETE), then
  // skip past the cache entirely, but still save the results.
  if (uri.match(/\?write=true$/)) return get_.call(this, uri, cache, params, cb)

  fs.stat(cache, function (er, stat) {
    if (!er) fs.readFile(cache, function (er, data) {
      try {
        data = JSON.parse(data)
      }
      catch (ex) {
        data = null
      }

      params.stat = stat
      params.data = data

      get_.call(client, uri, cache, params, cb)
    })
    else {
      get_.call(client, uri, cache, params, cb)
    }
  })
}

function get_ (uri, cache, params, cb) {
  var staleOk = params.staleOk === undefined ? false : params.staleOk
    , timeout = params.timeout === undefined ? -1 : params.timeout
    , data    = params.data
    , stat    = params.stat
    , etag

  timeout = Math.min(timeout, this.conf.get("cache-max") || 0)
  timeout = Math.max(timeout, this.conf.get("cache-min") || -Infinity)
  if (process.env.COMP_CWORD !== undefined &&
      process.env.COMP_LINE  !== undefined &&
      process.env.COMP_POINT !== undefined) {
    timeout = Math.max(timeout, 60000)
  }

  if (data) {
    if (data._etag) etag = data._etag

    if (stat && timeout && timeout > 0) {
      if ((Date.now() - stat.mtime.getTime())/1000 < timeout) {
        this.log.verbose("registry.get", uri, "not expired, no request")
        delete data._etag
        return cb(null, data, JSON.stringify(data), { statusCode : 304 })
      }

      if (staleOk) {
        this.log.verbose("registry.get", uri, "staleOk, background update")
        delete data._etag
        process.nextTick(
          cb.bind(null, null, data, JSON.stringify(data), { statusCode : 304 } )
        )
        cb = function () {}
      }
    }
  }

  var options = {
    etag   : etag,
    follow : params.follow,
    auth   : params.auth
  }
  var client = this
  this.request(uri, options, function (er, remoteData, raw, response) {
    // if we get an error talking to the registry, but we have it
    // from the cache, then just pretend we got it.
    if (er && cache && data && !data.error) {
      er = null
      response = { statusCode: 304 }
    }

    if (response) {
      client.log.silly("registry.get", "cb", [ response.statusCode, response.headers ])
      if (response.statusCode === 304 && etag) {
        remoteData = data
        client.log.verbose("etag", uri+" from cache")
      }
    }

    data = remoteData
    if (!data) {
      er = er || new Error("failed to fetch from registry: " + uri)
    }

    if (er) return cb(er, data, raw, response)

    // just give the write the old college try.  if it fails, whatever.
    function saved () {
      delete data._etag
      cb(er, data, raw, response)
    }

    saveToCache.call(client, cache, data, saved)
  })
}

function saveToCache (cache, data, saved) {
  var client = this
  if (this._cacheStat) {
    var cs = this._cacheStat
    return mkdir(path.dirname(cache), function (er, made) {
      if (er) return saved()

      fs.writeFile(cache, JSON.stringify(data), function (er) {
        if (er || cs.uid === null || cs.gid === null) return saved()

        chownr(made || cache, cs.uid, cs.gid, saved)
      })
    })
  }

  fs.stat(this.conf.get("cache"), function (er, st) {
    if (er) {
      return fs.stat(process.env.HOME || "", function (er, st) {
        // if this fails, oh well.
        if (er) return saved()
        client._cacheStat = st
        return saveToCache.call(client, cache, data, saved)
      })
    }

    client._cacheStat = st || { uid: null, gid: null }

    return saveToCache.call(client, cache, data, saved)
  })
}
