describe('Benchmark-Mix', function () {
  var keys1 = [];
  var keys2 = [];

  describe('SET', function() {
    it('set 500 item to NanoDB', function(done) {
      var bench = Benchmark.createBenchmark('nano.set', function(conf) {
        var ops = 0;

        bench.start();
        (function loop() {
          var curr = Math.random().toString(32).substr(2);

          nano.set('bench-' + curr, curr, function() {
            if (++ops < 5e2) {
              keys1.push(curr);

              loop();
            } else {
              bench.end(ops);
            }
          });
        })();
      }, { silent: 1 }, function(rate) {
        assert(rate > 1e4);

        done();
      });
    });

    it('set 1000 item to NanoDB', function(done) {
      var bench = Benchmark.createBenchmark('nano.set', function(conf) {
        var ops = 0;

        bench.start();
        (function loop() {
          var curr = Math.random().toString(32).substr(2);

          nano.set('bench-' + curr, curr, function() {
            if (++ops < 1e3) {
              keys2.push(curr);

              loop();
            } else {
              bench.end(ops);
            }
          });
        })();
      }, { silent: 1 }, function(rate) {
        assert(rate > 1e4);

        done();
      });
    });
  });

  describe('GET', function () {
    it('get 500 item to NanoDB', function(done) {
      var bench = Benchmark.createBenchmark('nano.get', function(conf) {
        var n = 0;
        bench.start();
        (function loop(key) {
          if (key) {
            nano.get('bench-' + key, function(err, value) {
              n++;
              if (err) {
                console.error(err);
              }

              if (value == key) {
                loop(keys.shift());
              }
            });
          } else {
            bench.end(n);
          }
        })(keys1.shift());
      }, { silent: 1 }, function(rate) {
        assert(rate > 1e4);

        done();
      });
    });

    it('get 1000 item to NanoDB', function(done) {
      var bench = Benchmark.createBenchmark('nano.get', function(conf) {
        var n = 0;
        bench.start();
        (function loop(key) {
          if (key) {
            nano.get('bench-' + key, function(err, value) {
              n++;
              if (err) {
                console.error(err);
              }

              if (value == key) {
                loop(keys.shift());
              }
            });
          } else {
            bench.end(n);
          }
        })(keys2.shift());
      }, { silent: 1 }, function(rate) {
        nano.empty(function() {
          assert(rate > 1e4);

          done();
        });
      });
    });
  });
});