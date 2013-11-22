var assert = require('assert');
var path = require('path');
var silent = +process.env.NODE_BENCH_SILENT;

function Benchmark(name, fn, options, callback) {
  this.fn = fn;
  this.options = options;
  this._start = [0,0];
  this.config = options;
  this._name = name;
  this._callback = callback;
  this._started = false;
  var self = this;
  process.nextTick(function() {
    self._run();
  });
}

Benchmark.createBenchmark = function(name, fn, options, callback) {
  return new Benchmark(name, fn, options, callback);
};

Benchmark.prototype._run = function() {
  if (this.config)
    return this.fn(this.config);

  // one more more options weren't set.
  // run with all combinations
  var main = require.main.filename;
  var settings = [];
  var queueLen = 1;
  var options = this.options;

  var queue = Object.keys(options).reduce(function(set, key) {
    var vals = options[key];
    assert(Array.isArray(vals));

    // match each item in the set with each item in the list
    var newSet = new Array(set.length * vals.length);
    var j = 0;
    set.forEach(function(s) {
      vals.forEach(function(val) {
        newSet[j++] = s.concat(key + '=' + val);
      });
    });
    return newSet;
  }, [[main]]);

  var spawn = require('child_process').spawn;
  var node = process.execPath;
  var i = 0;
  function run() {
    var argv = queue[i++];
    if (!argv)
      return;
    var child = spawn(node, argv, { stdio: 'inherit' });
    child.on('close', function(code, signal) {
      if (code)
        console.error('child process exited with code ' + code);
      else
        run();
    });
  }
  run();
};

Benchmark.prototype.start = function() {
  if (this._started)
    throw new Error('Called start more than once in a single benchmark');
  this._started = true;
  this._start = process.hrtime();
};

Benchmark.prototype.end = function(operations) {
  var elapsed = process.hrtime(this._start);
  if (!this._started)
    throw new Error('called end without start');
  if (typeof operations !== 'number')
    throw new Error('called end() without specifying operation count');
  var time = elapsed[0] + elapsed[1]/1e9;
  var rate = operations/time;
  this._callback(rate);
};

module.exports = Benchmark;