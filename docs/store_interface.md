# Store Interface for MinDB

**Store Interface** is AWESOME idea of MinDB which makes MinDB can run and store the data in *any* JavaScript platforms.

MinDB provides two store interface by default including `min.localStore` and `min.memStore`.  
`min.localStore` means `localStorage` in [Web Storage](http://www.w3.org/TR/webstorage/)
and `min.memStore` stands for `sessionStorage`.

Store Interface makes MinDB can store the data in wherever like File System, IndexedDB, LevelDB, etc.

## Standard

### Sync Store

    interface Store {
      getter String get(String key);
      setter creator void set(String key, Any value);
      deleter void remove(String key);
    }

This is the sync store interface.  
For example, the `min.localStore` in MinDB:

    function localStore() {}
    localStore.prototype.get = function(key) {
      return localStorage.getItem(key);
    };
    localStore.prototype.set = function(key, value) {
      return localStorage.setItem(key, value);
    };
    localStore.prototype.remove = function(key) {
      return localStorage.removeItem(key);
    };

Sync store does not have to call any callback functions.

### Async Store

    interface AsyncStore extends EventEmitter {
      getter void get(String key, Function callback);
      setter creator void set(String key, Any value, Function callback);
      deletor void remove(String key, Function callback);

      attribute Boolean async;
      attribute Boolean ready;

      event ready;
    }

If you wanna to store the data in the place that needs async callback, you can build an async store for MinDB.

For Example ([LevelDB](https://github.com/rvagg/node-levelup) in Node.js):

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

The `callback` argument is a standard callback in Node.js likes:

    function(err, value) {
      // ...
    }

Error is the first argument and the others arugments are the methods return.

Got it? There are some [store interface examples](https://github.com/iwillwen/mindb/tree/master/examples/stores) in the code.

Hoping for your contribution about some stores on others platforms. :P

> Being Lucky.
