def('min.sset', [ 'min.utils', 'min.deps.events' ], function(require, exports, module) {
  
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
  **           Set             **
  ******************************/
  min.sadd = function(key, members) {
    var self = this;
    var promise = new Promise(function(len) {
      self.emit('sadd', key, len);
    });

    members = Array.isArray(members) ? members : [].slice.call(arguments, 1);
    var added = 0;

    if (!(members[members.length - 1] instanceof Function)) {
      var callback = utils.noop;
    } else {
      var callback = members.splice(members.length - 1, 1)[0];
    }

    self.exists(key)
      .then(function(exists) {
        if (exists) {
          return self.get(key);
        } else {
          var data = utils.arrayUnique(members);

          return self.set(key, data);
        }
      })
      .then(function() {
        if (Array.isArray(arguments[0])) {
          var data = arguments[0];

          for (var i = 0; i < members.length; i++) {
            (function(index) {
              var curr = members[index];

              if (data.indexOf(curr) >= 0) {
                return;
              } else {
                data.push(curr);
                added++;
              }
            })(i);
          }

          return self.set(key, data);
        } else if (typeof arguments[0] === 'string') {
          added += members.length;

          self._keys[key] = 3;

          promise.resolve(added);
          callback(null, added);
        }
      })
      .then(function() {

        self._keys[key] = 3;

        promise.resolve(added);
        callback(null, added);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  min.srem = function(key, members, callback) {
    var self = this;
    var promise = new Promise(function(len) {
      self.emit('srem', key, len);
    });

    members = [].slice.call(arguments, 1);
    var removeds = 0;

    if (!(members[members.length - 1] instanceof Function)) {
      callback = utils.noop;
    }

    self.exists(key)
      .then(function(exists) {
        if (exists) {
          return self.get(key);
        } else {
          return new Error('no such key');
        }
      })
      .then(function(data) {
        for (var i = 0; i < members.length; i++) {
          (function(index) {
            var curr = members[index];

            var i = data.indexOf(curr);
            if (i >= 0) {
              data.splice(i, 1);
              removeds++;
            }
          })(i);
        }

        return self.set(key, data);
      })
      .then(function() {

        self._keys[key] = 3;

        promise.resolve(removeds);
        callback(null, removeds);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  min.smembers = function(key, callback) {
    var promise = new Promise();
    var self = this;
    callback = callback || utils.noop;

    self.exists(key)
      .then(function(exists) {
        if (exists) {
          return self.get(key);
        } else {
          return new Error('no such key');
        }
      })
      .then(function(members) {
        promise.resolve(members);
        callback(null, members);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  min.sismember = function(key, value, callback) {
    var self = this;
    var promise = new Promise();

    self.exists(key)
      .then(function(exists) {
        if (exists) {
          return self.get(key);
        } else {
          return new Error('no such key');
        }
      })
      .then(function(members) {
        var res = members.indexOf(value) >= 0 ? 1 : 0;

        promise.resolve(res);
        callback(null, res);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  min.scard = function(key, callback) {
    var promise = new Promise();
    callback = callback || utils.noop;
    var self = this;

    self.exists(key)
      .then(function(exists) {
        if (exists) {
          return self.get(key);
        } else {
          return new Error('no such key');
        }
      })
      .then(function(data) {
        var length = data.length;

        promise.resolve(length);
        callback(null, length);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  min.smove = function(src, dest, member, callback) {
    var self = this;
    var promise = new Promise(function(ok) {
      self.emit('smove', src, dest, member, ok);
    });

    members = [].slice.call(arguments, 1);

    if (!(members[members.length - 1] instanceof Function)) {
      callback = utils.noop;
    }

    self.exists(key)
      .then(function(exists) {
        if (exists) {
          return self.sismember(src, member);
        } else {
          return new Error('no such key');
        }
      })
      .then(function(isMember) {
        if (isMember) {
          return self.srem(src, member);
        } else {
          return new Error('no such member');
        }
      })
      .then(function() {
        return self.sismember(dest, member);
      })
      .then(function(isMember) {
        if (!isMember) {
          return self.sadd(dest, member);
        } else {

          self._keys[key] = 3;

          promise.resolve(0);
          callback(null, 0);
        }
      })
      .then(function() {
        self._keys[key] = 3;
        promise.resolve(1);
        callback(null, 1);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  min.srandmember = function(key, callback) {
    var promise = new Promise();
    var self = this;
    callback = callback || utils.noop;

    self.exists(key)
      .then(function(exists) {
        if (exists) {
          return self.get(key);
        } else {
          promise.resolve(null);
          callback(null, null);
        }
      })
      .then(function(members) {
        var index = Math.random() * members.length | 0;

        var member = members[index];

        promise.resolve(member);
        callback(null, member);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  min.spop = function(key, callback) {
    var self = this;
    var promise = new Promise(function(value) {
      self.emit('spop', key, value);
    });
    callback = callback || utils.noop;

    var member = null;

    self.exists(key)
      .then(function(exists) {
        if (exists) {
          return self.srandmember(key);
        } else {
          promise.resolve(null);
          callback(null, null);
        }
      })
      .then(function(_member) {
        member = _member;

        return self.srem(key, member);
      })
      .then(function() {
        promise.resolve(member);
        callback(null, member);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  min.sunion = function(keys, callback) {
    var promise = new Promise();
    var self = this;

    keys = [].slice.call(arguments);

    if (!(keys[keys.length - 1] instanceof Function)) {
      callback = utils.noop;
    }

    var members = [];

    (function loop(index) {
      var curr = keys[index];

      if (curr) {
        self.exists(curr)
          .then(function(exists) {
            if (exists) {
              return self.get(curr);
            } else {
              loop(++index);
            }
          })
          .then(function(data) {
            if (Array.isArray(data)) {
              members = members.concat(data);
            }

            loop(++index);
          })
          .fail(function(err) {
            promise.reject(err);
            return callback(err);
          });
      } else {
        members = utils.arrayUnique(members);
        promise.resolve(members);
        callback(null, members);
      }
    })(0);

    return promise;
  };

  min.sunionstore = function(dest, keys, callback) {
    var promise = new Promise();
    var self = this;

    keys = [].slice.call(arguments, 2);

    if (!(keys[keys.length - 1] instanceof Function)) {
      callback = utils.noop;
    }

    var members = null;

    self.sunion(keys)
      .then(function(_members) {
        members = _members;

        return self.exists(dest);
      })
      .then(function(exists) {
        if (exists) {
          return self.del(dest);
        } else {
          return self.sadd(dest, members);
        }
      })
      .then(function(length) {
        if (typeof length == 'number') {
          promise.resolve(length, members);
          callback(null, length, members);
        } else {
          return self.sadd(dest, members);
        }
      })
      .then(function(length) {
        promise.resolve(length, members);
        callback(null, length, members);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  min.sinter = function(keys, callback) {
    var promise = new Promise();
    var self = this;

    keys = [].slice.call(arguments);

    if (!(keys[keys.length - 1] instanceof Function)) {
      callback = utils.noop;
    }

    var memberRows = [];

    (function loop(index) {
      var curr = keys[index];

      if (curr) {
        self.exists(curr)
          .then(function(exists) {
            if (exists) {
              return self.get(curr);
            } else {
              loop(++index);
            }
          })
          .then(function(data) {
            if (Array.isArray(data)) {
              memberRows.push(data);
            }

            loop(++index);
          })
          .fail(function(err) {
            promise.reject(err);
            return callback(err);
          });
      } else {
        var members = utils.arrayInter.apply(utils, memberRows);

        promise.resolve(members);
        callback(null, members);
      }
    })(0);

    return promise;
  };

  min.sinterstore = function(dest, keys, callback) {
    var promise = new Promise();
    var self = this;

    keys = [].slice.call(arguments, 1);

    if (!(keys[keys.length - 1] instanceof Function)) {
      callback = utils.noop;
    }

    var members = null;

    self.sinter.apply(self, keys)
      .then(function(_members) {
        members = _members;

        return self.exists(dest);
      })
      .then(function(exists) {
        if (exists) {
          return self.del(dest);
        } else {
          members.unshift(dest);
          return self.sadd.apply(self, members);
        }
      })
      .then(function(key) {
        if (typeof key == 'string') {
          promise.resolve(members.length, members);
          callback(null, members.length, members);
        } else {
          return self.sadd(dest, members);
        }
      })
      .then(function() {
        promise.resolve(members.length, members);
        callback(null, members.length, members);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  min.sdiff = function(keys, callback) {
    var promise = new Promise();
    var self = this;

    keys = [].slice.call(arguments, 1);

    if (!(keys[keys.length - 1] instanceof Function)) {
      callback = utils.noop;
    }

    var memberRows = [];

    (function loop(index) {
      var curr = keys[index];

      if (curr) {
        self.exists(curr)
          .then(function(exists) {
            if (exists) {
              return self.get(curr);
            } else {
              loop(++index);
            }
          })
          .then(function(data) {
            if (Array.isArray(data)) {
              memberRows.push(data);
            }

            loop(++index);
          })
          .fail(function(err) {
            promise.reject(err);
            return callback(err);
          });
      } else {
        var members = utils.arrayDiff.apply(utils, memberRows);

        promise.resolve(members);
        callback(null, members);
      }
    })(0);

    return promise;
  };

  min.sdiffstore = function(dest, keys, callback) {
    var promise = new Promise();
    var self = this;

    keys = [].slice.call(arguments, 2);

    if (!(keys[keys.length - 1] instanceof Function)) {
      callback = utils.noop;
    }

    var members = null;

    self.sdiff(keys)
      .then(function(_members) {
        members = _members;

        return self.exists(dest);
      })
      .then(function(exists) {
        if (exists) {
          return self.del(dest);
        } else {
          return self.sadd(dest, members);
        }
      })
      .then(function(length) {
        if (typeof length == 'number') {
          promise.resolve(length, members);
          callback(null, length, members);
        } else {
          return self.sadd(dest, members);
        }
      })
      .then(function(length) {
        promise.resolve(length, members);
        callback(null, length, members);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };
  

  return min;
});