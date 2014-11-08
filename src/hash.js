def('min.hash', [ 'min.utils', 'min.deps.events' ], function(require, exports, module) {
  
  if ('undefined' !== typeof define && define.amd) {
    var utils = arguments[0];
    var events = arguments[1];
  } else {
    var utils = require('min.utils');
    var events = require('min.deps.events');
  }

  var Promise = events.Promise;

  var min = {};

  /**
   * Set the field in the hash on the key with the value
   * @param  {String}   key      Hash key
   * @param  {String}   field    field to set
   * @param  {Mix}   value       value
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  min.hset = function(key, field, value, callback) {
    var self = this;
    var promise = new Promise(function() {
      self.emit('hset', key, field, value);
    });

    callback = callback || utils.noop;

    // check the key status
    self.exists(key, function(err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        // fetch the value
        self.get(key, function(err, body) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          // update the hash
          body[field] = value;

          self.set(key, body, function(err, _key, _value) {
            if (err) {
              promise.reject(err);
              return callback(err);
            }

            promise.resolve(key, field, value);
            callback(null, key, field, value);
          });
        });
      } else {
        // create a hash
        var body = {};

        body[field] = value;

        self.set(key, body, function(err, _key, _value) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          self._keys[key] = 1;

          promise.resolve(key, field, value);
          callback(null, key, field, value);
        });
      }

    });

    return promise;
  };

  /**
   * Set the value of a hash field, only if the field does not exist
   * @param  {String}   key      key
   * @param  {String}   field    hash field
   * @param  {Mix}   value       value
   * @param  {Function} callback Callback
   * @return {Promise}            promise
   */
  min.hsetnx = function(key, field, value, callback) {
    var promise = new Promise();
    var self = this;
    callback = callback || utils.noop;

    self.hexists(key, field, function(err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (!exists) {
        self.hset(key, field, value, function(err) {
          if (err) {
            promise.reject(err);
            callback(err);
          }

          promise.resolve('OK');
          callback(null, 'OK');
        });
      } else {
        var err = new Error('The field of the hash is exists');

        promise.reject(err);
        return callback(err);
      }
    });

    return promise;
  };

  /**
   * Set multiple hash fields to multiple values
   * @param  {String}   key      key
   * @param  {Object}   docs     values
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.hmset = function(key, docs, callback) {
    var promise = new Promise();
    var self = this;
    callback = callback || utils.noop;

    var keys = Object.keys(docs);
    var replies = [];

    var multi = self.multi();

    keys.forEach(function(field) {
      multi.hset(key, field, docs[field]);
    });

    multi.exec(function(err, replies) {
      callback(null, replies);
      promise.resolve(replies);
    });

    return promise;
  };

  /**
   * Get the value of a hash field
   * @param  {String}   key      key
   * @param  {String}   field    hash field
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.hget = function(key, field, callback) {
    var promise = new Promise();
    var self = this;
    callback = callback || utils.noop;

    self.hexists(key, field, function(err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        self.get(key)
          .then(function(value) {
            var data = value[field];
            promise.resolve(data);
            callback(null, data);
          })
          .fail(function(err) {
            promise.reject(err);
            callback(err);
          });
      } else {
        var err = new Error('no such field');

        promise.reject(err);
        callback(err);
      }
    });

    return promise;
  };

  /**
   * Get the values of all the given hash fields
   * @param  {String}   key      key
   * @param  {Array}   fields    hash fields
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.hmget = function(key, fields, callback) {
    var promise = new Promise();
    var self = this;
    callback = callback || utils.noop;

    var values = [];

    var multi = self.multi();

    fields.forEach(function(field) {
      multi.hget(key, field);
    });

    multi.exec(function(err, replies) {
      if (err) {
        callback(err);
        return promise.reject(err);
      }

      values = replies.map(function(row) {
        return row[0];
      });

      promise.resolve(values);
      callback(null, values);
    });

    return promise;
  };

  /**
   * Get all the fields and values in a hash
   * @param  {String}   key      key
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.hgetall = function(key, callback) {
    var promise = new Promise();
    var self = this;
    callback = callback || utils.noop;

    self.exists(key, function(err, exists) {
      if (err) {
        callback(err);
        return promise.reject(err);
      }

      if (exists) {
        self.get(key)
          .then(function(data) {
            promise.resolve(data);
            callback(null, data);
          })
          .fail(function(err) {
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
   * Delete one hash field
   * @param  {String}   key      key
   * @param  {String}   field    hash field
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.hdel = function(key, field, callback) {
    var self = this;
    var promise = new Promise(function(key, field, value) {
      self.emit('hdel', key, field, value);
    });
    callback = callback || utils.noop;

    self.hexists(key. field, function(err, exists) {
      if (err) {
        callback(err);
        return promise.reject(err);
      }

      if (exists) {
        self.get(key)
          .then(function(data) {
            var removed = data[field];
            delete data[field];

            self.set(key, data)
              .then(function() {
                promise.resolve(key, field, removed);
                callback(null, key, field, removed);
              })
              .fail(function(err) {
                promise.reject(err);
                callback(err);
              });
          })
          .fail(function(err) {
            callback(err);
          })
      } else {
        var err = new Error('no such key');

        callback(err);
        return promise.reject(err);
      }
    });

    return promise;
  };

  /**
   * Get the number of fields in a hash
   * @param  {String}   key      key
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.hlen = function(key, callback) {
    var promise = new Promise();
    var self = this;
    callback = callback || utils.noop;

    self.exists(key, function(err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        self.get(key)
          .then(function(data) {
            var length = Object.keys(data).length;

            promise.resolve(length);
            callback(null, length);
          })
          .fail(function(err) {
            promise.reject(err);
            callback(err);
          });
      } else {
        promise.resolve(0);
        callback(null, 0);
      }
    });

    return promise;
  };

  /**
   * Get all the fields in a hash
   * @param  {String}   key      key
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.hkeys = function(key, callback) {
    var promise = new Promise();
    var self = this;
    callback = callback || utils.noop;

    self.exists(key, function(err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        self.get(key)
          .then(function(data) {
            var keys = Object.keys(data);

            promise.resolve(keys);
            callback(null, keys);
          })
          .fail(function(err) {
            promise.reject(err);
            callback(err);
          });
      } else {
        promise.resolve(0);
        callback(null, 0);
      }
    });

    return promise;
  };

  /**
   * Determine if a hash field exists
   * @param  {String}   key      key of the hash
   * @param  {String}   field    the field
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  min.hexists = function(key, field, callback) {
    var promise = new Promise();
    var self = this;

    // Callback and Promise's shim
    callback = callback || utils.noop;

    self.exists(key)
      .then(function(exists) {
        if (exists) {
          return self.get(key);
        } else {
          promise.resolve(false);
          callback(null, false);
        }
      })
      .then(function(value) {
        if (value.hasOwnProperty(field)) {
          promise.resolve(true);
          callback(null, true);
        } else {
          promise.resolve(false);
          callback(null, false);
        }
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  min.hincr = function(key, field, callback) {
    var self = this;
    var promise = new Promise(function(curr) {
      self.emit('hincr', key, field, curr);
    });
    callback = callback || utils.noop;

    self.hexists(key, field)
      .then(function(exists) {
        if (exists) {
          return self.hget(exists);
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

        return self.hset(key, field, ++curr);
      })
      .then(function(key, field, value) {
        promise.resolve(value);
        callback(null, value);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(null, err);
      });

    return promise;
  };

  min.hincrby = function(key, field, increment, callback) {
    var self = this;
    var promise = new Promise(function(curr) {
      self.emit('hincr', key, field, curr);
    });
    callback = callback || utils.noop;

    self.hexists(key, field)
      .then(function(exists) {
        if (exists) {
          return self.hget(exists);
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

        return self.hset(key, field, curr + increment);
      })
      .then(function(key, field, value) {
        promise.resolve(value);
        callback(null, value);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(null, err);
      });

    return promise;
  };

  min.hincrbyfloat = min.hincrby;

  min.hdecr = function(key, field, callback) {
    var self = this;
    var promise = new Promise(function(curr) {
      self.emit('hdecr', key, field, curr);
    });
    callback = callback || utils.noop;

    self.hexists(key, field)
      .then(function(exists) {
        if (exists) {
          return self.hget(key, field);
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

        return self.hset(key, field, --curr);
      })
      .then(function(key, field, value) {
        promise.resolve(value);
        callback(null, value);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  min.hdecrby = function(key, field, decrement, callback) {
    var self = this;
    var promise = new Promise(function(curr) {
      self.emit('hincr', key, field, curr);
    });
    callback = callback || utils.noop;

    self.hexists(key, field)
      .then(function(exists) {
        if (exists) {
          return self.hget(exists);
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

        return self.hset(key, field, curr - decrement);
      })
      .then(function(key, field, value) {
        promise.resolve(value);
        callback(null, value);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(null, err);
      });

    return promise;
  };

  return min;
});