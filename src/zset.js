def('min.zset', [ 'min.utils', 'min.deps.events' ], function(require, exports, module) {
  
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
  **         Sorted Set        **
  ******************************/
  min.zadd = function(key, score, member, callback) {
    var self = this;
    var promise = new Promise(function(len) {
      self.emit('zadd', len);
    });
    callback = callback || utils.noop;

    self.exists(key)
      .then(function(exists) {
        if (exists) {
          return self.get(key);
        } else {
          var score2HashsMap = {};
          score2HashsMap[score] = [ 0 ];

          return self.set(key, {
            // members
            ms: [ member ],
            // mapping hash to score
            hsm: { 0: score },
            // mapping score to hash
            shm: score2HashsMap
          });
        }
      })
      .then(function(_key) {
        if ('string' === typeof _key) {
          self._keys[key] = 4;

          promise.resolve(1, 1);
          callback(null, 1, 1);
        } else if ('object' === typeof _key) {
          var data = _key;

          if (data.ms.indexOf(member) >= 0) {
            var len = data.ms.length;

            promise.resolve(0, len);
            return callback(null, 0, len);
          }

          // new hash
          var hash = data.ms.length;
          // append the new member
          data.ms.push(member);

          // mapping hash to score
          data.hsm[hash] = score;

          // mapping score to hash
          if (Array.isArray(data.shm[score])) {
            data.shm[score].push(hash);
          } else {
            data.shm[score] = [ hash ];
          }

          return self.set(key, data);
        }
      })
      .then(function(key, data) {
        self._keys[key] = 4;

        var len = data.ms.length;

        promise.resolve(1, len);
        callback(null, 1, len);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  min.zcard = function(key, callback) {
    var self = this;
    var promise = new Promise();
    callback = callback || utils.noop;

    self.exists(key)
      .then(function(exists) {
        if (exists) {
          return self.get(key);
        } else {
          var err = new Error('no such key');

          promise.reject(err);
          callback(err);
        }
      })
      .then(function(data) {
        var len = data.ms.filter(Boolean).length;

        promise.resolve(len);
        callback(null, len);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  min.zcount = function(key, min, max, callback) {
    var self = this;
    var promise = new Promise(function(len) {
      self.emit(len);
    });
    callback = callback || utils.noop;

    self.exists(key)
      .then(function(exists) {
        if (exists) {
          return self.get(key);
        } else {
          var err = new Error('no such key');

          promise.reject(err);
          callback(err);
        }
      })
      .then(function(data) {
        var hashs = Object
          .keys(data.shm)
          .filter(function(score) {
            return (min <= score && score <= max);
          })
          .map(function(score) {
            return data.shm[score];
          });

        var len = 0;

        hashs.forEach(function(hash) {
          len += hash.length;
        });

        promise.resolve(len);
        callback(null, len);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  min.zrem = function(key) {
    var self = this;
    var promise = new Promise(function(len) {
      self.emit('zrem', len);
    });
    var callback = arguments[arguments.length - 1];

    var members = [].slice.call(arguments, 1);

    if ('function' !== typeof callback) {
      callback = utils.noop;
    } else {
      members.pop();
    }

    var removeds = 0;

    self.exists(key)
      .then(function(exists) {
        if (exists) {
          return self.get(key);
        } else {
          var err = new Error('no such key');

          promise.reject(err);
          callback(err);
        }
      })
      .then(function(data) {
        var n = members.length;

        var p = new Promise();

        for (var i = 0; i < members.length; i++) {
          (function(index) {
            var hash = data.ms.indexOf(members[index]);

            if (hash >= 0) {
              data.ms[hash] = 0;
              var score = data.hsm[hash]
              delete data.hsm[hash];

              var ii = data.shm[score].indexOf(hash);
              if (ii >= 0) {
                data.shm[score].splice(ii, 1);
              }

              removeds++;

              --n || p.resolve(data);
            } else {
              n--;
            }
          })(i);
        }

        return p;
      })
      .then(function(data) {
        return self.set(key, data);
      })
      .then(function() {
        promise.resolve(removeds);
        callback(null, removeds);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(null, err);
      });

    return promise;
  };

  min.zscore = function(key, member, callback) {
    var self = this;
    var promise = new Promise();
    callback = callback || utils.noop;

    self.exists(key)
      .then(function(exists) {
        if (exists) {
          return self.get(key);
        } else {
          var err = new Error('no such key');

          promise.reject(err);
          callback(err);
        }
      })
      .then(function(data) {
        var hash = data.ms.indexOf(member);

        if (hash >= 0) {
          var score = data.hsm[hash];

          promise.resolve(score);
          callback(null, score);
        } else {
          var err = new Error('This member does not be in the set');

          promise.reject(err);
          callback(err);
        }
      })

    return promise;
  };

  min.zrange = function(key, min, max, callback) {
    var self = this;
    var promise = new Promise(function(len) {
      self.emit(len);
    });
    callback = callback || utils.noop;

    self.exists(key)
      .then(function(exists) {
        if (exists) {
          return self.get(key);
        } else {
          var err = new Error('no such key');

          promise.reject(err);
          callback(err);
        }
      })
      .then(function(data) {
        var hashs = Object
          .keys(data.shm)
          .filter(function(score) {
            return (min <= score && score <= max);
          })
          .map(function(score) {
            return data.shm[score];
          });

        var members = [];

        hashs.forEach(function(hash) {
          members = members.concat(hash.map(function(row) {
            return data.ms[row];
          }));;
        });

        promise.resolve(members);
        callback(null, members);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    promise.withScore = function(callback) {
      var p = new Promise();
      callback = callback || utils.noop;

      promise
        .then(function(members) {
          var multi = self.multi();

          members.forEach(function(member) {
            multi.zscore(key, member);
          });

          multi.exec(function(err, replies) {
            if (err) {
              callback(err);
              return p.reject(err);
            }

            var rtn = [];

            replies.forEach(function(reply, ii) {
              rtn.push({
                member: members[ii],
                score: reply[0]
              });
            });

            p.resolve(rtn);
            callback(null, rtn);
          });
        })

      return p;
    };

    return promise;
  };

  min.zrevrange = function(key, min, max, callback) {
    var self = this;
    var promise = new Promise(function(len) {
      self.emit(len);
    });
    callback = callback || utils.noop;

    self.exists(key)
      .then(function(exists) {
        if (exists) {
          return self.get(key);
        } else {
          var err = new Error('no such key');

          promise.reject(err);
          callback(err);
        }
      })
      .then(function(data) {
        var hashs = Object
          .keys(data.shm)
          .reverse()
          .filter(function(score) {
            return (min <= score && score <= max);
          })
          .map(function(score) {
            return data.shm[score];
          });

        var members = [];

        hashs.forEach(function(hash) {
          members = members.concat(hash.map(function(row) {
            return data.ms[row];
          }));;
        });

        promise.resolve(members);
        callback(null, members);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    promise.withScore = function(callback) {
      var p = new Promise();
      callback = callback || utils.noop;

      promise
        .then(function(members) {
          var multi = self.multi();

          members.forEach(function(member) {
            multi.zscore(key, member);
          });

          multi.exec(function(err, replies) {
            if (err) {
              callback(err);
              return p.reject(err);
            }

            var rtn = [];

            replies.forEach(function(reply, ii) {
              rtn.push({
                member: members[ii],
                score: reply[0]
              });
            });

            p.resolve(rtn);
            callback(null, rtn);
          });
        })

      return p;
    };

    return promise;
  };

  min.zincrby = function(key, increment, member, callback) {
    var self = this;
    var promise = new Promise(function(score) {
      self.emit('zincrby', key, increment, member, score);
    });
    callback = callback || utils.noop;

    var newScore = null;

    self.exists(key)

      .then(function(exists) {
        if (exists) {
          return self.zscore(key, member);
        } else {
          self.zadd(key, increment, member, callback)
            .then(promise.resolve.bind(promise))
            .fail(promise.reject.bind(promise));
        }
      })
      .then(function(score) {
        return self.get(key);
      })
      .then(function(data) {
        var hash = data.ms.indexOf(member);
        var score = data.hsm[hash];

        newScore = score + increment;

        var ii = data.shm[score].indexOf(hash);
        data.shm[score].splice(ii, 1);

        data.hsm[hash] = newScore;
        if (data.shm[newScore]) {
          data.shm[newScore].push(hash);
        } else {
          data.shm[newScore] = [ hash ];
        }

        return self.set(key, data);
      })
      .then(function() {
        promise.resolve(newScore);
        callback(null, newScore);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  min.zdecrby = function(key, decrement, member, callback) {
    var self = this;
    var promise = new Promise(function(score) {
      self.emit('zdecrby', key, decrement, member, score);
    });
    callback = callback || utils.noop;

    var newScore = null;

    self.exists(key)

      .then(function(exists) {
        if (exists) {
          return self.zscore(key, member);
        } else {
          var err = new Error('no such key');

          promise.reject(err);
          return callback(err);
        }
      })
      .then(function(score) {
        return self.get(key);
      })
      .then(function(data) {
        var hash = data.ms.indexOf(member);
        var score = data.hsm[hash];

        newScore = score - decrement;

        var ii = data.shm[score].indexOf(hash);
        data.shm[score].splice(ii, 1);

        data.hsm[hash] = newScore;
        if (data.shm[newScore]) {
          data.shm[newScore].push(hash);
        } else {
          data.shm[newScore] = [ hash ];
        }

        return self.set(key, data);
      })
      .then(function() {
        promise.resolve(newScore);
        callback(null, newScore);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  min.zrank = function(key, member, callback) {
    var self = this;
    var promise = new Promise();
    callback = callback || utils.noop;

    self.exists(key)
      .then(function(exists) {
        if (exists) {
          return self.get(key);
        } else {
          var err = new Error('no such key');

          promise.reject(err);
          return callback(err);
        }
      })
      .then(function(data) {
        var scores = Object.keys(data.shm);
        var score = data.hsm[data.ms.indexOf(member)];

        var rank = scores.indexOf(score);

        promise.resolve(rank);
        callback(null, rank);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  min.zrevrank = function(key, member, callback) {
    var self = this;
    var promise = new Promise();
    callback = callback || utils.noop;

    self.exists(key)
      .then(function(exists) {
        if (exists) {
          return self.get(key);
        } else {
          var err = new Error('no such key');

          promise.reject(err);
          return callback(err);
        }
      })
      .then(function(data) {
        var scores = Object.keys(data.shm);
        var score = data.hsm[data.ms.indexOf(member)];

        var rank = scores.reverse().indexOf(score);

        promise.resolve(rank);
        callback(null, rank);
      })
      .fail(function(err) {
        promise.reject(err);
        callback(err);
      });

    return promise;
  };

  return min;
});