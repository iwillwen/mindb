def('min.mise', [ 'min.utils', 'min.deps.events' ], function(require, exports, module) {
  
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
  **            Mise           **
  ******************************/
  function Multi(_nano) {
    var self = this;
    this.queue = [];
    this.last = null;
    this.state = 0;
    this.min = _nano;

    for (var prop in _nano) {
      if (_nano.hasOwnProperty(prop) && 'function' === typeof _nano[prop]) {
        (function(method) {
          self[method] = function() {
            self.queue.push({
              method: method,
              args: arguments
            });

            return self;
          };
        })(prop);
      }
    }
  }
  Multi.prototype.exec = function(callback) {
    var self = this;
    var results = [];

    (function loop(task) {
      if (task) {
        self.min[task.method].apply(self.min, task.args)
          .then(function() {
            results.push(arguments);
            loop(self.queue.shift());
          })
          .fail(function(err) {
            callback(err, results);
          });
      } else {
        callback(null, results);
      }
    })(self.queue.shift());
  };

  min.multi = function() {
    return new Multi(this);
  };

  function Sorter(key, _min, callback) {
    var self = this;
    self.min = _min;
    self.callback = callback;
    self.result = [];
    self.keys = {};
    self.promise = new Promise();
    self.sortFn = function(a, b) {
      if (utils.isNumber(a) && utils.isNumber(b)) {
        return a - b;
      } else {
        return JSON.stringify(a) > JSON.stringify(b);
      }
    };

    var run = function() {
      self.min.exists(key)
        .then(function(exists) {
          if (exists) {
            return self.min.get(key);
          } else {
            return new Error('no such key');
          }
        })
        .then(function(value) {
          var p = new Promise();

          switch (true) {
            case Array.isArray(value):
              p.resolve(value);
              break;
            case (value.ms && Array.isArray(value.ms)):
              p.resolve(value.ms);
              break;
            
            default:
              return new Error('content type wrong');
          }

          return p;
        })
        .then(function(data) {
          self.result = data.sort(self.sortFn);

          self.result.forEach(function(chunk) {
            self.keys[chunk] = chunk;
          });

          self.promise.resolve(self.result);
          self.callback(null, self.result);
        })
        .fail(function(err) {
          self.promise.reject(err);
          self.callback(err);
        });
    };

    // Promise Shim
    (function loop(methods) {
      var curr = methods.shift();

      if (curr) {
        self[curr] = function() {
          return self.promise[curr].apply(self.promise, arguments);
        };

        loop(methods);
      } else {
        run();
      }
    })([ 'then', 'fail', 'done']);
  }
  Sorter.prototype.by = function(pattern, callback) {
    var self = this;
    callback = callback || utils.noop;

    var src2ref = {};
    var refs = {};
    var aviKeys = [];

    // TODO: Sort by hash field
    var field = null;

    if (pattern.indexOf('->') > 0) {
      var i = pattern.indexOf('->');
      field = pattern.substr(i + 2);
      pattern = pattern.substr(0, pattern.length - i);
    }
    var isHash = !!field;

    self.min.keys(pattern)
      .then(function(keys) {
        var filter = new RegExp(pattern
          .replace('?', '(.)')
          .replace('*', '(.*)'));

        for (var i = 0; i < keys.length; i++) {
          var symbol = filter.exec(keys[i])[1];

          if (self.result.indexOf(symbol) >= 0) {
            src2ref[keys[i]] = symbol;
          }
        }

        aviKeys = Object.keys(src2ref);

        return self.min.mget(aviKeys.slice());
      })
      .then(function(values) {
        var reverse = {};

        for (var i = 0; i < values.length; i++) {
          reverse[JSON.stringify(values[i])] = aviKeys[i];
        }

        values.sort(self.sortFn);

        var newResult = values
          .map(function(value) {
            return reverse[JSON.stringify(value)];
          })
          .map(function(key) {
            return src2ref[key];
          });

        self.result = newResult;

        self.promise.resolve(newResult);
        callback(null, newResult);
      })
      .fail(function(err) {
        self.promise.reject(err);
        callback(err);
        self.callback(err);
      });
    
    return this;
  };
  Sorter.prototype.asc = function(callback) {
    var self = this;
    callback = callback || utils.noop;

    self.sortFn = function(a, b) {
      if (utils.isNumber(a) && utils.isNumber(b)) {
        return a - b;
      } else {
        return JSON.stringify(a) > JSON.stringify(b); 
      }
    };

    var handle = function(result) {
      self.result = result.sort(self.sortFn);

      self.promise.resolve(self.result);
      callback(null, self.result);
    };

    if (self.promise.ended) {
      handle(self.result);
    } else {
      self.promise.once('resolve', handle);
    }

    return self;
  };
  Sorter.prototype.desc = function(callback) {
    var self = this;
    callback = callback || utils.noop;

    self.sortFn = function(a, b) {
      if (utils.isNumber(a) && utils.isNumber(b)) {
        return b - a;
      } else {
        return JSON.stringify(a) < JSON.stringify(b); 
      }
    };

    var handle = function(result) {
      self.result = result.sort(self.sortFn);

      self.promise.resolve(self.result);
      callback(null, self.result);
    };

    if (self.promise.ended) {
      handle(self.result);
    } else {
      self.promise.once('resolve', handle);
    }

    return self;
  };
  Sorter.prototype.get = function(pattern, callback) {
    var self = this;
    callback = callback || utils.noop;

    var handle = function(_result) {
      var result = [];

      (function loop(res) {
        var curr = res.shift();

        if (!utils.isUndefined(curr)) {
          if (Array.isArray(curr)) {
            var key = self.keys[curr[0]];

            self.min.get(pattern.replace('*', key))
              .then(function(value) {
                curr.push(value);
                result.push(curr);

                loop(res);
              })
              .fail(function(err) {
                self.promise.reject(err);
                callback(err);
              });

          } else if (curr.substr || utils.isNumber(curr)) {
            var key = self.keys[curr];

            self.min.get(pattern.replace('*', key))
              .then(function(value) {
                result.push([ value ]);
                if (value.substr || utils.isNumber(value)) {
                  self.keys[value] = key;
                } else {
                  self.keys[JSON.stringify(value)] = key;
                }

                loop(res);
              })
              .fail(function(err) {
                self.promise.reject(err);
                callback(err);
              });
          }
        } else {
          self.result = result;

          self.promise.resolve(result);
          callback(null, result);
        }
      })(_result.slice());
    };

    if (self.promise.ended) {
      handle(self.result);
    } else {
      self.promise.once('resolve', handle);
    }

    return this;
  };
  Sorter.prototype.hget = function(pattern, field, callback) {
    callback = callback || utils.noop;
    var self = this;

    var handle = function(_result) {
      var result = [];

      (function loop(res) {
        var curr = res.shift();

        if (!utils.isUndefined(curr)) {
          if (Array.isArray(curr)) {
            var key = self.keys[curr[0]];

            self.min.hget(pattern.replace('*', key), field)
              .then(function(value) {
                curr.push(value);
                result.push(curr);

                loop(res);
              })
              .fail(function(err) {
                self.promise.reject(err);
                callback(err);
              });

          } else if (curr.substr || utils.isNumber(curr)) {
            var key = self.keys[curr];

            self.min.hget(pattern.replace('*', key))
              .then(function(value) {
                result.push([ value ]);
                if (value.substr || utils.isNumber(value)) {
                  self.keys[value] = key;
                } else {
                  self.keys[JSON.stringify(value)] = key;
                }

                loop(res);
              })
              .fail(function(err) {
                self.promise.reject(err);
                callback(err);
              });
          }
        } else {
          self.result = result;

          self.promise.resolve(result);
          callback(null, result);
        }
      })(_result.slice());
    };

    if (self.promise.ended) {
      handle(self.result);
    } else {
      self.promise.once('resolve', handle);
    }

    return this;
  };
  Sorter.prototype.limit = function(offset, count, callback) {
    callback = callback || utils.noop;
    var self = this;

    var handle = function(result) {
      self.result = result.splice(offset, count);

      self.promise.resolve(self.result);
      callback(null, self.result);
    };

    if (self.promise.ended) {
      handle(self.result);
    } else {
      self.promise.once('resolve', handle);
    }

    return this;
  };
  Sorter.prototype.flatten = function(callback) {
    callback = callback || utils.noop;
    var self = this;

    if (self.promise.ended) {
      var rtn = [];

      for (var i = 0; i < self.result.length; i++) {
        for (var j = 0; j < self.result[i].length; j++) {
          rtn.push(self.result[i][j]);
        }
      }

      self.result = rtn;

      self.promise.resolve(rtn);
      callback(null, rtn);
    } else {
      self.promise.once('resolve', function(result) {
        var rtn = [];

        for (var i = 0; i < result.length; i++) {
          for (var j = 0; j < result[i].length; j++) {
            rtn.push(result[i][j]);
          }
        }

        self.result = rtn;

        self.promise.resolve(rtn);
        callback(null, rtn);
      });
    }

    return this;
  };
  Sorter.prototype.store = function(dest, callback) {
    var self = this;
    callback = callback || utils.noop;

    if (self.promise.ended) {
      self.min.set(dest, self.result)
        .then(function() {
          self.promise.resolve(self.result);
          callback(null, self.result);
        })
        .fail(function(err) {
          self.promise.reject(err);
          callback(err);
        });
    } else {
      self.promise.once('resolve', function(result) {
        self.min.set(dest, result)
          .then(function() {
            self.promise.resolve(result);
            callback(null, result);
          })
          .fail(function(err) {
            self.promise.reject(err);
            callback(err);
          });
      });
    }

    return this;
  };

  min.sort = function(key, callback) {
    callback = callback || utils.noop;

    return new Sorter(key, this, callback);
  };

  function Scanner(cursor, pattern, count, min) {
    pattern = pattern || '*';

    this.cursor = cursor || 0;
    this.pattern = new RegExp(pattern.replace('*', '(.*)'));
    this.limit = count > -1 ? count : 10;
    this.end = this.cursor;

    this.parent = min;
  }
  Scanner.prototype.scan = function(callback) {
    var self = this;

    var rtn = [];

    self.parent.get('min_keys')
      .then(function(data) {
        data = JSON.parse(data);

        var keys = Object.keys(data);

        (function scan(ii) {
          var key = keys[ii];

          if (key && self.pattern.test(key) && key !== 'min_keys') {
            rtn.push(key);

            if ((++self.end - self.cursor) >= self.limit) {
              return callback(null, rtn, self.end);
            }
          } else if (!key) {
            self.end = 0;
            return callback(null, rtn, self.end);
          }

          return scan(++ii);
        })(self.cursor);
      }, function(err) {
        callback(err);
      });

    return this;
  };
  Scanner.prototype.match = function(pattern, callback) {
    this.pattern = new RegExp(pattern.replace('*', '(.*)'));
    this.end = this.cursor;

    return this.scan(callback || utils.noop);
  };
  Scanner.prototype.count = function(count, callback) {
    this.limit = count;
    this.end = this.cursor;

    return this.scan(callback || utils.noop);
  };

  min.scan = function(cursor, callback) {
    var self = this;
    callback = callback || utils.noop;

    var scanner = new Scanner(cursor, null, -1, self);

    scanner.scan(callback);

    return scanner;
  };

  return min;
});