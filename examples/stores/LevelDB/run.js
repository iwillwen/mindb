var async = require('async');
var LevelStore = require('./min_level');
var Benchmark = require('./benchmark');
var min = require('./min');

min.store = new LevelStore('/tmp/benchmark');

var n = 0;
var keys = [];
(function loop() {
  var curr = Math.random().toString(32).substr(2);

  min.set('bench-' + curr, curr)
    .then(function() {
      if (++n < 1e4) {
        keys.push(curr);
        setTimeout(loop);
      } else {
        run();
      }
    });
})();