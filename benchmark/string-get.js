var bench = Benchmark.createBenchmark('nano.get', function(conf) {
  var ops = 0;
  var keys = [];

  (function loop() {
    var curr = Math.random().toString(32).substr(2);

    nano.set('bench-' + curr, curr, function() {
      if (++ops < 500) {
        keys.push('bench-' + curr);
        loop();
      } else {
        run();
      }
    });
  })();

  function run() {
    var n = 0;
    bench.start();
    (function loop(key) {
      if (key) {
        nano.get(key, function(err, value) {
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
    })(keys.shift());
  }
}, { silent: 1 }, function(rate) {
  nano.empty(function() {
    console.log(rate);
  });
});