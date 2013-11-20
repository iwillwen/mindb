var bench = Benchmark.createBenchmark('nano.hset', function(conf) {
  var ops = 0;

  bench.start();
  (function loop() {
    var curr = Math.random().toString(32).substr(2);

    nano.hset('bench-hash', curr, curr, function() {
      if (++ops < 500) {
        loop();
      } else {
        bench.end(ops);
      }
    });
  })();
}, { silent: 1 }, function(rate) {
  nano.empty(function() {
    console.log(rate);
  });
});