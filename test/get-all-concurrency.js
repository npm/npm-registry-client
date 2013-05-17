var tap = require("tap")
  , server = require("./fixtures/server.js")
  , RC = require("../")
  , client = new RC({
      cache: __dirname + "/fixtures/cache"
    // The default lock settings should allow us adequete retries and waits to 
    // allow us to complete the tests without a lock failure
    , "cache-lock-stale": 60000
    , "cache-lock-retries": 10
    , "cache-lock-wait": 10000
    , registry: "http://localhost:" + server.port })
  , fs = require("fs")
  , mkdir = require("mkdirp")

tap.test("get all doesn't purge cache during update", function (t) {
  
  var updated = 1268740860000
    , totalRequests = 100
  
  t.plan(totalRequests)
  
  // Ensure the cache file exists, last updated at the specified time
  mkdir(__dirname + "/fixtures/cache/-/all", function (er) {
    fs.writeFile(__dirname + "/fixtures/cache/-/all/.cache.json", JSON.stringify(createTestCacheData(updated)), function (er) {
      
      // Expect totalRequests requests to be sent
      // We should NEVER see a request for "/-/all" as this only happens when the cache doesn't exist (which we have
      // ensured it does) or if an error occurs reading/parsing the cache file
      for(var i = 0; i < totalRequests; ++i) {
        server.expect("/-/all/since?stale=update_after&startkey="+updated, function (req, res) {
          res.json(createTestCacheData(updated))
        })
      }
      
      var delay = 0
      
      // Rapidly send totalRequests requests to the server
      for(var j = 0; j < totalRequests; ++j) {
        
        setTimeout(function() {
          client.get("/-/all", function (er, data) {
            t.ok(data, "Failed to retrieve updated cache data")
          })
        }, delay)
        
        delay++
      }
    })
  })
})

function createTestCacheData (updated) {
  var data = {}
  for(var i = 0; i < 10000; ++i) {
    data["data"+i] = "Test data " + i
  }
  data._updated = updated
  return data
}