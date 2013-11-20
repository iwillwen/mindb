var level = require('level');
var multilevel = require('multilevel');
var net = require('net');

function MultiLevelStore(host, port) {
  var stream = net.connect(port, host);

  var db = multilevel.client();

  stream.pipe(db.createRpcStream()).pipe(stream);
  this.db = db;
  this.async = true;
}
MultiLevelStore.prototype.get = function(key, callback) {
  this.db.get(key, callback);
};
MultiLevelStore.prototype.set = function(key, value, callback) {
  this.db.put(key, value, callback);
};
MultiLevelStore.prototype.remove = function(key, callback) {
  this.db.del(key, callback);
};

module.exports = MultiLevelStore;