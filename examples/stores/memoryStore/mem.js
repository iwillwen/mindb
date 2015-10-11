function MemStore() {
  this.data = {}
  this.ready = true
}

MemStore.prototype.set = function(key, value) {
  this.data[key] = value
}

MemStore.prototype.get = function(key) {
  return this.data[key]
}

MemStore.prototype.remove = function(key) {
  delete this.data[key]
}

module.exports = MemStore