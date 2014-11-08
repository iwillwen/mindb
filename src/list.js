def('min.list', [ 'min.utils', 'min.deps.events' ], function(require, exports, module) {
  
  if ('undefined' !== typeof define && define.amd) {
    var utils = arguments[0];
    var events = arguments[1];
  } else {
    var utils = require('min.utils');
    var events = require('min.deps.events');
  }

  var Promise = events.Promise;

  var min = {};


  /******************************
  **           List            **
  ******************************/

  /**
   * Prepend one or multiple values to a list
   * @param  {String}   key      key
   * @param  {Mix}   value       value
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.lpush = function(key, value, callback) {
    var self = this;
    var promise = new Promise(function(len) {
      self.emit('lpush', key, len);
    });
    callback = callback || utils.noop;

    self.exists(key, function(err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        self.get(key, function(err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          data.unshift(value);

          self.set(key, data, function(err) {
            if (err) {
              promise.reject(err);
              return callback(err);
            }

            var length = data.length;

            promise.resolve(length);
            callback(null, length);
          });
        });
      } else {
        var data = [ value ];

        self.set(key, data, function(err) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          self._keys[key] = 2;

          promise.resolve(1);
          callback(null, 1);
        });
      }
    });

    return promise;
  };

  /**
   * Prepend a value to a list, only if the list exists
   * @param  {String}   key      key
   * @param  {Mix}   value       value
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.lpushx = function(key, value, callback) {
    var promise = new Promise();
    callback = callback || utils.noop;
    var self = this;

    self.exists(key, function(err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        self.get(key, function(err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          if (!data.length) {
            var err = new Error('The list is empty.');

            callback(err);
            return promise.reject(err);
          }

          data.unshift(value);

          self.set(key, data, function(err) {
            if (err) {
              promise.reject(err);
              return callback(err);
            }

            var length = data.length;

            promise.resolve(length);
            callback(null, length);
          });
        });
      } else {
        var err = new Error('no such key');

        callback(err);
        return promise.reject(err);
      }
    });

    return promise;
  };

  /**
   * Append one or multiple values to a list
   * @param  {String}   key      key
   * @param  {Mix}   value       value
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.rpush = function(key, value, callback) {
    var self = this;
    var promise = new Promise(function(len) {
      self.emit('rpush', key, len);
    });
    callback = callback || utils.noop;

    self.exists(key, function(err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        self.get(key, function(err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          data.push(value);

          self.set(key, data, function(err) {
            if (err) {
              promise.reject(err);
              return callback(err);
            }

            var length = data.length;

            promise.resolve(length);
            callback(null, length);
          });
        });
      } else {
        var data = [ value ];

        self.set(key, data, function(err) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          promise.resolve(1);
          callback(null, 1);
        });
      }
    });

    return promise;
  };

  /**
   * Prepend a value to a list, only if the list exists
   * @param  {String}   key      key
   * @param  {Mix}   value       value
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.lpushx = function(key, value, callback) {
    var promise = new Promise();
    callback = callback || utils.noop;
    var self = this;

    self.exists(key, function(err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        self.get(key, function(err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          if (!data.length) {
            var err = new Error('The list is empty.');

            callback(err);
            return promise.reject(err);
          }

          data.push(value);

          self.set(key, data, function(err) {
            if (err) {
              promise.reject(err);
              return callback(err);
            }

            var length = data.length;

            promise.resolve(length);
            callback(null, length);
          });
        });
      } else {
        var err = new Error('no such key');

        callback(err);
        return promise.reject(err);
      }
    });

    return promise;
  };

  /**
   * Remove and get the first element in a list
   * @param  {String}   key      key
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.lpop = function(key, callback) {
    var self = this;
    var promise = new Promise(function(value) {
      self.emit('lpop', key, value);
    });
    callback = callback || utils.noop;
    var val = null;

    self.exists(key)
      .then(function(exists) {
        if (exists) {
          return self.get(key);
        } else {
          promise.resolve(null);
          callback(null, null);
        }
      })
      .then(function(data) {
        val = data.shift();

        return self.set(key,data);
      })
      .then(function() {
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
   * Remove and get the last element in a list
   * @param  {String}   key      key
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.rpop = function(key, callback) {
    var self = this;
    var promise = new Promise(function(value) {
      self.emit('rpop', key, value);
    });
    callback = callback || utils.noop;

    var value = null;

    self.exists(key)
      .then(function(exists) {
        if (exists) {
          return self.get(key);
        } else {
          promise.resolve(null);
          callback(null, null);
        }
      })
      .then(function(data) {
        value = data.pop();

        return self.set(key, data);
      })
      .then(function() {
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
   * Get the length of a list
   * @param  {String}   key      key
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.llen = function(key, callback) {
    var promise = new Promise();
    callback = callback || utils.noop;
    var self = this;

    self.exists(key, function(err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        self.get(key, function(err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          var length = data.length;

          promise.resolve(length);
          callback(null, length);
        });
      } else {
        promise.resolve(0);
        callback(null, 0);
      }
    });

    return promise;
  };

  /**
   * Get a range of elements from a list
   * @param  {String}   key      key
   * @param  {Number}   start    min score
   * @param  {Number}   stop     max score
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.lrange = function(key, start, stop, callback) {
    var promise = new Promise();
    callback = callback || utils.noop;
    var self = this;

    self.exists(key, function(err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        self.get(key, function(err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          var values = data.slice(start, stop + 1);

          promise.resolve(values);
          callback(null, values);
        });
      } else {
        promise.resolve(null);
        callback(null, null);
      }
    });

    return promise;
  };

  /**
   * Remove elements from a list
   * @param  {String}   key      key
   * @param  {Number}   count    count to remove
   * @param  {Mix}      value    value
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.lrem = function(key, count, value, callback) {
    var self = this;
    var promise = new Promise(function(removeds) {
      self.emit('lrem', key, removeds);
    });
    callback = callback || utils.noop;

    self.exists(key, function(err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        self.get(key, function(err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          var removeds = 0;

          switch (true) {
            case count > 0:
              for (var i = 0; i < data.length && removeds < count; i++) {
                if (data[i] === value) {
                  var removed = data.splice(i, 1)[0];

                  removeds++;
                }
              }
              break;
            case count < 0:
              for (var i = data.length - 1; i >= 0 && removeds < count; i--) {
                if (data[i] === value) {
                  var removed = data.splice(i, 1)[0];

                  removeds++;
                }
              }
              break;
            case count = 0:
              for (var i = data.length - 1; i >= 0; i--) {
                if (data[i] === value) {
                  var removed = data.splice(i, 1)[0];

                  removeds++;
                }
              }
              break;
          }

          promise.resolve(removeds);
          callback(null, removeds);
        });
      } else {
        promise.resolve(null);
        callback(null, null);
      }
    });

    return promise;
  };

  /**
   * Remove elements from a list
   * @param  {String}   key      key
   * @param  {Number}   index    position to set
   * @param  {Mix}      value    value
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.lset = function(key, index, value, callback) {
    var self = this;
    var promise = new Promise(function(len) {
      self.emit('lset', key, len);
    });
    callback = callback || utils.noop;

    self.exists(key, function(err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        self.get(key, function(err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          if (!data[index] || !data.length) {
            var err = new Error('no such key');

            promise.reject(err);
            return callback(err);
          }

          data[index] = value;

          self.set(key, data, function(err) {
            if (err) {
              promise.reject(err);
              return callback(err);
            }

            var length = data.length;

            promise.resolve(length);
            callback(null, length);
          });
        });
      } else {
        var err = new Error('no such key');

        promise.reject(err);
        return callback(err);
      }
    });

    return promise;
  };

  /**
   * Trim a list to the specified range
   * @param  {String}   key      key
   * @param  {Number}   start    start
   * @param  {Number}   stop     stop
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.ltrim = function(key, start, stop, callback) {
    var promise = new Promise();
    var self = this;
    callback = callback || utils.noop;

    self.exists(key, function(err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        self.get(key, function(err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          var values = data.splice(start, stop + 1);

          promise.resolve(values);
          callback(null, values);
        });
      } else {
        promise.resolve(null);
        callback(null, null);
      }
    });

    return promise;
  };

  /**
   * Get an element from a list by its index
   * @param  {String}   key      key
   * @param  {Number}   index    index
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.lindex = function(key, index, callback) {
    var promise = new Promise();
    var self = this;
    callback = callback || utils.noop;

    self.exists(key, function(err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        self.get(key, function(err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          var value = data[index];

          promise.resolve(value);
          callback(null, value);
        });
      } else {
        promise.resolve(null);
        callback(null, null);
      }
    });

    return promise;
  };

  /**
   * Insert an element before another element in a list
   * @param  {String}   key      key
   * @param  {Mix}   pivot       pivot
   * @param  {Mix}   value       value
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.linsertBefore = function(key, pivot, value, callback) {
    var promise = new Promise();
    var self = this;
    callback = callback || utils.noop;

    self.exists(key, function(err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        self.get(key, function(err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          var index = data.indexOf(pivot);

          if (index < 0) {
            promise.resolve(null);
            return callback(null, null);
          }

          data.splice(index, 1, value, pivot);

          self.set(key, data, function(err) {
            if (err) {
              promise.reject(err);
              return callback(err);
            }

            var length = data.length;

            promise.resolve(length);
            callback(null, length);
          });
        });
      } else {
        promise.resolve(null);
        callback(null, null);
      }
    });

    return promise;
  };

  /**
   * Insert an element after another element in a list
   * @param  {String}   key      key
   * @param  {Mix}   pivot       pivot
   * @param  {Mix}   value       value
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.linsertAfter = function(key, pivot, value, callback) {
    var promise = new Promise();
    var self = this;
    callback = callback || utils.noop;

    self.exists(key, function(err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        self.get(key, function(err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          var index = data.indexOf(pivot);

          if (index < 0) {
            promise.resolve(null);
            return callback(null, null);
          }

          data.splice(index, 0, value);

          self.set(key, data, function(err) {
            if (err) {
              promise.reject(err);
              return callback(err);
            }

            var length = data.length;

            promise.resolve(length);
            callback(null, length);
          });
        });
      } else {
        promise.resolve(null);
        callback(null, null);
      }
    });

    return promise;
  };

  /**
   * Remove the last element in a list, append it to another list and return it
   * @param  {String}   src      source
   * @param  {String}   dest     destination
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.rpoplpush = function(src, dest, callback) {
    var promise = new Promise();
    var self = this;
    callback = callback || utils.noop;

    self.rpop(src)
      .then(function(value) {
        return self.lpush(dest, value)
      })
      .then(function(length) {
        promise.resolve(value, length);
        callback(null, value, length);
      })
      .fail(function(err) {
        callback(err);
        promise.reject(err);
      });

    return promise;
  };

  return min;
});