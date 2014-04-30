window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

// IndexedDB Store Interface for NanoDB
function IndexedStore(name) {
  var self = this;
  self.async = true;
  self.storeName = name;

  // Open a database
  var req = indexedDB.open(name, 1);
  req.onerror = function(event) {
    console.error(new Error("Why didn't you allow my web app to use IndexedDB?!"));
  };
  req.onsuccess = function(event) {
    // Database
    self.db = event.target.result;
  };
  req.onupgradeneeded =  function(event) {
    // ObjectStore
    self.store = self.db.createObjectStore('nano-' + name, { keyPath: "key" });
    // Ready
    self.ready = true;
    self.emit('ready');
  };
}
EventEmitter.inherits(IndexedStore);
IndexedStore.prototype.get = function(key, callback) {
  // Fetch the objectstore
  var store = this.db
    .transaction('nano-' + this.storeName, 'readonly')
    .objectStore('nano-' + this.storeName);

  var req = store.get(key);

  req.onerror = function() {
    console.error(new Error("Something went wrong!"));
  };
  req.onsuccess = function(event) {
    var value = event.target.result.value;

    callback(null, value);
  };
};
IndexedStore.prototype.set = function(key, value, callback) {
  var store = this.db
    .transaction('nano-' + this.storeName, 'readwrite')
    .objectStore('nano-' + this.storeName);

  var req = store.put({
    key: key,
    value: value
  });

  req.onerror = function() {
    console.error(new Error("Something went wrong!"));
  };
  req.onsuccess = function(arguments) {
    callback(null, key, value);
  };
};
IndexedStore.prototype.remove = function(key, callback) {
  var store = this.db
    .transaction('nano-' + this.storeName, 'readwrite')
    .objectStore('nano-' + this.storeName);

  var req = store.delete(key);

  req.onerror = function() {
    console.error(new Error("Something went wrong!"));
  };
  req.onsuccess = function() {
    callback(null, key);
  };
};