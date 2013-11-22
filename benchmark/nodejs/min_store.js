function Store() {
  this.data = {};
  this.async = true;
  this.ready = true;
  process.stdin.resume();
}
Store.prototype.get = function(key, callback) {
  setImmediate(function(self, key, callback) {
    callback(null, self.data[key]);
  }, this, key, callback);
};
Store.prototype.set = function(key, value, callback) {
  setImmediate(function(self, key, value, callback) {
    callback(null, self.data[key] = value);
  }, this, key, value, callback);
};
Store.prototype.remove = function(key, callback) {
  setImmediate(function(self, key, callback) {
    delete self.data[key];
    callback(null);
  }, this, key, callback);
};

module.exports = Store;