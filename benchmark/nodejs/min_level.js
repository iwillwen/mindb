var level = require('level');
var events = require('events');
var util = require('util');

function LevelStore(filename, options) {
  LevelStore.super_.call(this);

  options = options || {};

  this.db = level(filename, options);
  this.filename = filename;
  this.ready = true;
  this.async = true;
}
util.inherits(LevelStore, events.EventEmitter);
LevelStore.prototype.get = function(key, callback) {
  this.db.get(key, callback);
};
LevelStore.prototype.set = function(key, value, callback) {
  this.db.put(key, value, callback);
};
LevelStore.prototype.remove = function(key, callback) {
  this.db.del(key, callback);
};

module.exports = LevelStore;