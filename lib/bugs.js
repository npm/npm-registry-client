
module.exports = bugs

function bugs (name, cb) {
  this.get(name + "/latest", 3600, function (er, d) {
    if (er) return cb(er)
    var bugs = d.bugs
      , repo = d.repository || d.repositories
      , url
    if (bugs) {
      url = (typeof bugs === "string") ? bugs : bugs.url
    } else if (repo) {
      if (Array.isArray(repo)) repo = repo.shift()
      if (repo.hasOwnProperty("url")) repo = repo.url
      if (repo && repo.match(/^(https?:\/\/|git(:\/\/|@))github.com/)) {
        url = repo.replace(/^git(@|:\/\/)/, "https://")
                  .replace(/^https?:\/\/github.com:/, "https://github.com/")
                  .replace(/\.git$/, '')+"/issues"
      }
    }
    if (!url) {
      url = "https://npmjs.org/package/" + d.name
    }
    cb(null, url)
  })
}
