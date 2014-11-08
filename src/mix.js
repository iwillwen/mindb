def('min.mix', [ 'min.utils', 'min.deps.events' ], function(require, exports, module) {
  
  if ('undefined' !== typeof define && define.amd) {
    var utils = arguments[0];
    var events = arguments[1];
  } else {
    var utils = require('min.utils');
    var events = require('min.deps.events');
  }

  var Promise = events.Promise;

  var min = {};

  var _keysTimer = null;

  /******************************
  ** Mix(String/Number/Object) **
  ******************************/

  /**
   * Set the value of a key
   * @param  {String}   key      Key
   * @param  {Mix}      value    Value
   * @param  {Function} callback Callback
   * @return {Promise}           Promise Object
   */
  min.set = function(key, value, callback) {
    var self = this;

    // Promise Object
    var promise = new Promise(function() {
      if (_keysTimer) {
        clearTimeout(_keysTimer);
      }

      _keysTimer = setTimeout(self.save.bind(self), 1000);
    });

    // Store
    var store = this.store;

    // Callback and Promise's shim
    callback = callback || utils.noop;

    // Key prefix
    var $key = 'min-' + key;

    if (store.async) {
      // Async Store Operating
      var load = function() {
        // Value processing
        var $value = JSON.stringify(value);
        store.set($key, $value, function(err) {
          if (err) {
            // Error!
            promise.reject(err);
            return callback(err);
          }

          self._keys[key] = 0;

          // Done
          promise.resolve(key, value);
          callback(null, key, value);
        });
      };
      if (store.ready) {
        load();
      } else {
        store.on('ready', load);
      }
    } else {
      try {
        // Value processing
        var $value = JSON.stringify(value);
        store.set($key, $value);
        self._keys[key] = 0;

        // Done
        promise.resolve(key, value);
        callback(null, key, value);
      } catch(err) {
        // Error!
        promise.reject(err);
        callback(err);
      }
    }

    // Event emitting
    this.emit('set', key, value);

    return promise;
  };

  /**
   * Set the value of a key, only if the key does not exist
   * @param  {String}   key      the key
   * @param  {Mix}      value    Value
   * @param  {Function} callback Callback
   * @return {Promise}           Promise Object
   */
  min.setnx = function(key, value, callback) {

    // Promise Object
    var promise = new Promise();

    var self = this;

    // Callback and Promise's shim
    callback = callback || utils.noop;

    self.exists(key, function(err, exists) {
      if (err) {
        callback(err);
        promise.reject(err);
      }

      if (exists) {
        // The key is exists
        return promise.reject(new Error('The key is exists.'));
      } else {
        self.set(key, value, callback)
          .then(function(key, value) {
            // Done
            callback(null, key, value);
            promise.resolve(key, value);
          })
          .fail(function(err) {
            callback(err);
            promise.reject(err);
          });          
      }
    });

    return promise;
  };

  /**
   * Set the value and expiration of a key
   * @param  {String}   key      key
   * @param  {Number}   seconds  TTL
   * @param  {Mix}      value    value
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  min.setex = function(key, seconds, value, callback) {

    // Promise Object
    var promise = new Promise();

    var self = this;

    // TTL
    function timeout() {
      self.del(key, utils.noop);
    }

    // Callback and Promise's shim
    callback = callback || utils.noop;

    // Set
    self.set(key, value, function(err, result) {
      // Done
      setTimeout(timeout, seconds * 1000);
      callback(err, result);
    })
      .then(function(key, value) {
        // Done
        setTimeout(timeout, seconds * 1000);
        promise.resolve(key, value);
        callback(null, key, value);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  /**
   * Set the value and expiration in milliseconds of a key
   * @param  {String}   key      key
   * @param  {Number}   millionseconds  TTL
   * @param  {Mix}      value    value
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  min.psetex = function(key, milliseconds, value, callback) {

    // Promise Object
    var promise = new Promise();

    var self = this;

    // TTL
    function timeout() {
      self.del(key, utils.noop);
    }

    // Callback and Promise's shim
    callback = callback || utils.noop;

    // Set
    self.set(key, value, function(err, result) {
      // Done
      setTimeout(timeout, milliseconds);
      callback(err, result);
    })
      .then(function() {
      // Done
        setTimeout(timeout, milliseconds);
        promise.resolve.apply(promise, arguments);
      })
      .fail(promise.reject.bind(promise));

    return promise;
  };

  /**
   * Set multiple keys to multiple values
   * @param  {Object}   plainObject      Object to set
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  min.mset = function(plainObject, callback) {
    var promise = new Promise();

    var self = this;

    // keys
    var keys = Object.keys(plainObject);
    // counter
    var i = 0;

    // the results and errors to return
    var results = [];
    var errors = [];

    // Callback and Promise's shim
    callback = callback || utils.noop;

    // Loop
    function next(key, index) {
      // remove the current element of the plainObject
      delete keys[index];

      self.set(key, plainObject[key])
        .then(function() {
          results.push(arguments);

          i++;
          if (keys[i]) {
            next(keys[i], i);
          } else {
            out();
          }
        })
        .fail(function(err) {
          errors.push(err);

          i++;
          if (keys[i]) {
            return next(keys[i], i);
          } else {
            return out();
          }
        });
    }

    function out() {
      if (errors.length) {
        callback(errors);
        promise.reject(errors);
      } else {
        callback(null, results);
        promise.resolve(results);
      }
    }

    next(keys[i], i);

    return promise;
  };

  /**
   * Set multiple keys to multiple values, only if none of the keys exist
   * @param  {Object}   plainObject      Object to set
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  min.msetnx = function(plainObject, callback) {
    var promise = new Promise();

    var self = this;

    var keys = Object.keys(plainObject);
    var i = 0;

    var results = [];
    var errors = [];

    // Callback and Promise's shim
    callback = callback || utils.noop;

    function next(key, index) {
      delete keys[index];

      self.setnx(key, plainObject[key])
        .then(function() {
          results.push(arguments);

          i++;
          if (keys[i]) {
            next(keys[i], i);
          } else {
            out();
          }
        })
        .fail(function(err) {
          errors.push(err);
          out();
        });
    }

    function out() {
      if (errors.length) {
        callback(errors);
        return promise.reject(errors);
      } else {
        callback(null, results);
        promise.resolve(results);
      }
    }

    next(keys[i], i);

    return promise;
  };

  /**
   * Append a value to a key
   * @param  {String}   key      key
   * @param  {String}   value    value
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.append = function(key, value, callback) {
    var self = this;
    var promise = new Promise();
    callback = callback || utils.noop;

    self.exists(key)
      .then(function(exists) {
        if (exists) {
          return self.get(key);
        } else {
          var p = new Promise();

          p.resolve('');

          return p;
        }
      })
      .then(function(currVal) {
        return self.set(key, currVal + value);
      })
      .then(function(key, value) {
        return self.strlen(key);
      })
      .then(function(len) {
        promise.resolve(len);
        callback(null, len);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  /**
   * Get the value of a key
   * @param  {String}   key      Key
   * @param  {Function} callback Callback
   * @return {Promise}           Promise Object
   */
  min.get = function(key, callback) {
    var self = this;

    // Promise Object
    var promise = new Promise(function(value) {
      self.emit('get', key, value);
    });

    // Store
    var store = this.store;

    // Callback and Promise's shim
    callback = callback || utils.noop;
    // Key prefix
    var $key = 'min-' + key;

    if (store.async) {
      // Async Store Operating
      var load = function() {
        // Value processing
        store.get($key, function(err, value) {
          if (err) {
            var _err = new Error('no such key');
            // Error!
            promise.reject(_err);
            return callback(_err);
          }

          if (value) {
            // Done
            var ret = JSON.parse(value);
            promise.resolve(ret);
            callback(null, ret);
          } else {
            var err = new Error('no such key');

            promise.resolve(err);
            callback(err);
          }

        });
      };
      if (store.ready) {
        load();
      } else {
        store.on('ready', load);
      }
    } else {
      try {
        // Value processing
        var _value = this.store.get($key);

        if (_value) {
          var value = JSON.parse(_value);
          // Done
          promise.resolve(value);
          callback(null, value);
        } else {
          var err = new Error('no such key');

          promise.reject(err);
          callback(err);
        }
      } catch(err) {
        // Error!
        promise.reject(err);
        callback(err);
      }
    }

    return promise;
  };

  min.getrange = function(key, start, end, callback) {
    var self = this;
    var promise = new Promise(function(value) {
      self.emit('getrange', key, start, end, value);
    });
    callback = callback || utils.noop;

    var len = end - start + 1;

    self.get(key)
      .then(function(value) {
        var val = value.substr(start, len);

        promise.resolve(val);
        callback(null, val);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  /**
   * Get the values of a set of keys
   * @param  {Array}   keys      the keys
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  min.mget = function(keys, callback) {

    // Promise Object
    var promise = new Promise();

    var self = this;

    var i = 0;
    var results = [];
    var errors = [];

    // Callback and Promise's shim
    callback = callback || utils.noop;

    function next(key, index) {
      delete keys[index];
      
      if (!key) {
        i++;
        return next(keys[i], i);
      }
      self.get(key, function(err, value) {
        if (err) {
          errors.push(err);
          results.push(null);

          i++;
          if (keys[i]) {
            return next(keys[i], i);
          } else {
            return out();
          }
        }

        results.push(value);

        i++;
        if (keys[i]) {
          next(keys[i], i);
        } else {
          out();
        }
      });
    }

    function out() {
      if (errors.length) {
        callback(errors);
        promise.reject(errors);
      } else {
        callback(null, results);
        promise.resolve(results);
      }
    }

    next(keys[i], i);

    return promise;
  };

  /**
   * Set the value of a key and return its old value
   * @param  {String}   key      key
   * @param  {Mix}   value       value
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  min.getset = function(key, value, callback) {
    var self = this;
    var promise = new Promise(function(old) {
      self.emit('getset', key, value, old);
    });

    // Callback and Promise's shim
    if ('undefined' == typeof callback) {
      callback = utils.noop;
    }

    var _value = null;

    self.get(key)
      .then(function($value) {
        _value = $value;

        return self.set(key, value);
      })
      .then(function() {
        promise.resolve(_value);
        callback(null, _value);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  /**
   * Get the length of a key
   * @param  {String}   key      Key
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.strlen = function(key, callback) {
    var self = this;
    var promise = new Promise();
    callback = callback || utils.noop;

    self.get(key)
      .then(function(value) {
        if ('string' === typeof value) {
          var len = value.length;

          promise.resolve(len);
          callback(null, len);
        } else {
          var err = new TypeError();

          promise.reject(err);
          callback(err);
        }
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  /**
   * Increment the integer value of a key by one
   * @param  {String}   key      key
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.incr = function(key, callback) {
    var self = this;

    var promise = new Promise(function(value) {
      self.emit('incr', key, value);
    });
    callback = callback || utils.noop;

    self.exists(key)
      .then(function(exists) {
        if (exists) {
          return self.get(key);
        } else {
          var p = new Promise();

          p.resolve(0);

          return p;
        }
      })
      .then(function(curr) {
        if (isNaN(parseInt(curr))) {
          promise.reject('value wrong');
          return callback('value wrong');
        }

        curr = parseInt(curr);

        return self.set(key, ++curr);
      })
      .then(function(key, value) {
        promise.resolve(value);
        callback(null, value);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  /**
   * Increment the integer value of a key by the given amount
   * @param  {String}   key      key
   * @param  {Number}   increment increment
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.incrby = function(key, increment, callback) {
    var self = this;
    var promise = new Promise(function(value) {
      self.emit('incrby', key, value);
    });
    callback = callback || utils.noop;

    self.exists(key)
      .then(function(exists) {
        if (exists) {
          return self.get(key);
        } else {
          var p = new Promise();

          p.resolve(0);

          return p;
        }
      })
      .then(function(curr) {
        if (isNaN(parseFloat(curr))) {
          promise.reject('value wrong');
          return callback('value wrong');
        }

        curr = parseFloat(curr);

        return self.set(key, curr + increment);
      })
      .then(function(key, value) {
        promise.resolve(value);
        callback(null, value);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  min.incrbyfloat = min.incrby;

  min.decr = function(key, callback) {
    var self = this;
    var promise = new Promise(function(curr) {
      self.emit('decr', key, curr);
    });
    callback = callback || utils.noop;

    self.exists(key)
      .then(function(exists) {
        if (exists) {
          return self.get(key);
        } else {
          var p = new Promise();

          p.resolve(0);

          return p;
        }
      })
      .then(function(curr) {
        if (isNaN(parseInt(curr))) {
          promise.reject('value wrong');
          return callback('value wrong');
        }

        curr = parseInt(curr);

        return self.set(key, --curr);
      })
      .then(function(key, value) {
        promise.resolve(value);
        callback(null, value);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  min.decrby = function(key, decrement, callback) {
    var self = this;
    var promise = new Promise(function(curr) {
      self.emit('decrby', key, decrement, curr);
    });
    callback = callback || utils.noop;

    self.exists(key)
      .then(function(exists) {
        if (exists) {
          return self.get(key);
        } else {
          var p = new Promise();

          p.resolve(0);

          return p;
        }
      })
      .then(function(curr) {
        if (isNaN(parseInt(curr))) {
          promise.reject('value wrong');
          return callback('value wrong');
        }

        curr = parseInt(curr);

        return self.set(key, curr - decrement);
      })
      .then(function(key, value) {
        promise.resolve(value);
        callback(null, value);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  return min;
});