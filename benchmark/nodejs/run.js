var async = require('async');
var LevelStore = require('./min_level');
var Benchmark = require('./benchmark');
var min = require('./min');

min.store = new LevelStore('/tmp/bencmhnoark');

var n = 0;
var keys = [];
(function loop() {
  var curr = Math.random().toString(32).substr(2);

  min.set('bench-' + curr, curr)
    .then(function() {
      if (++n <= 5e4) {
        keys.push(curr);
        loop();
      } else {
        run();
      }
    });
})();

function run() {
  async.waterfall([
    function(next) {
      var bench = Benchmark.createBenchmark('min.get-500', function(conf) {
        var ops = 0;
        bench.start();
        (function loop(key) {
          if (key && ops <= 5e2) {
            min.get('bench-' + key)
              .then(function(val) {
                if (val == key) {
                  ops++;
                  loop(keys.shift());
                }
              });
          } else {
            bench.end(ops);
          }
        })(keys.shift());
      }, { silent: 1 }, function(rate) {
        next(null, {
          5e2: rate
        });
      });
    },
    function(data, next) {
      var bench = Benchmark.createBenchmark('min.get-1000', function(conf) {
        var ops = 0;
        bench.start();
        (function loop(key) {
          if (key && ops <= 1e3) {
            min.get('bench-' + key)
              .then(function(val) {
                if (val == key) {
                  ops++;
                  loop(keys.shift());
                }
              });
          } else {
            bench.end(ops);
          }
        })(keys.shift());
      }, { silent: 1 }, function(rate) {
        data[1e3] = rate;
        next(null, data);
      });
    },
    function(data, next) {
      var bench = Benchmark.createBenchmark('min.get-2000', function(conf) {
        var ops = 0;
        bench.start();
        (function loop(key) {
          if (key && ops <= 2e3) {
            min.get('bench-' + key)
              .then(function(val) {
                if (val == key) {
                  ops++;
                  loop(keys.shift());
                }
              });
          } else {
            bench.end(ops);
          }
        })(keys.shift());
      }, { silent: 1 }, function(rate) {
        data[2e3] = rate;
        next(null, data);
      });
    },
    function(data, next) {
      var bench = Benchmark.createBenchmark('min.get-5000', function(conf) {
        var ops = 0;
        bench.start();
        (function loop(key) {
          if (key && ops <= 5e3) {
            min.get('bench-' + key)
              .then(function(val) {
                if (val == key) {
                  ops++;
                  loop(keys.shift());
                }
              });
          } else {
            bench.end(ops);
          }
        })(keys.shift());
      }, { silent: 1 }, function(rate) {
        data[5e3] = rate;
        next(null, data);
      });
    },
    function(data, next) {
      var bench = Benchmark.createBenchmark('min.get-10000', function(conf) {
        var ops = 0;
        bench.start();
        (function loop(key) {
          if (key && ops <= 1e4) {
            min.get('bench-' + key)
              .then(function(val) {
                if (val == key) {
                  ops++;
                  loop(keys.shift());
                }
              });
          } else {
            bench.end(ops);
          }
        })(keys.shift());
      }, { silent: 1 }, function(rate) {
        data[1e4] = rate;
        next(null, data);
      });
    },
    function(data, next) {
      var bench = Benchmark.createBenchmark('min.get-50000', function(conf) {
        var ops = 0;
        bench.start();
        (function loop(key) {
          if (key && ops <= 5e4) {
            min.get('bench-' + key)
              .then(function(val) {
                if (val == key) {
                  ops++;
                  loop(keys.shift());
                }
              });
          } else {
            bench.end(ops);
          }
        })(keys.shift());
      }, { silent: 1 }, function(rate) {
        data[5e4] = rate;
        next(null, data);
      });
    }
  ], function(err, data) {
    min.empty(function() {
      console.log(data);
      process.exit(1);
    });
  });
}