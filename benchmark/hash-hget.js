var bench = Benchmark.createBenchmark('nano.hset', function(conf) {
  var ops = 0;
  var keys = [];

  (function loop() {
    var curr = Math.random().toString(32).substr(2);

    nano.hset('bench-hash', curr, curr, function(err) {
      if (++ops < 500) {
        loop();
        keys.push(curr);
      } else {
        run();
      }
    });
  })();

  function run() {
    bench.start();

    var n = 0;
    (function loop(key) {
      if (key) {
        console.log(key);
        n++;
        nano.hget('bench-hash', key, function(err, value) {
          if (err) {
            console.error(err);
          }

          if (value === key) {
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