var fs = require('fs')
var events = require('events')
var util = require('util')

function FileStore(filename) {
  var self = this

  this.filename = filename
  this.buffer   = {}
  
  this.async    = true
  this.ready    = false

  fs.exists(filename, function(exists) {
    if (!exists) {
      fs.writeFile(filename, "{}", function(err) {
        if (err) return console.error(err)

        self.ready = true
        self.emit('ready')
      })
    } else {
      fs.readFile(filename, function(err, data) {
        if (err) return console.error(err)

        self.buffer = JSON.parse(data.toString())

        self.ready = true
        self.emit('ready')
      })
    }
  })
}
util.inherits(FileStore, events.EventEmitter)
FileStore.prototype.set = function(key, value, callback) {
  var self = this

  self.buffer[key] = value

  fs.writeFile(self.filename, JSON.stringify(self.buffer), function(err) {
    if (err)
      return callback(err)

    callback()
  })
}
FileStore.prototype.get = function(key, callback) {
  var self = this

  if (self.buffer[key]) {
    return callback(null, self.buffer[key])
  } else {
    return callback(new Error('This key is not exists.'))
  }
}
FileStore.prototype.remove = function(key, callback) {
  var self = this

  delete self.buffer[key]

  fs.writeFile(self.filename, JSON.stringify(self.buffer), callback)
}

module.exports = FileStore