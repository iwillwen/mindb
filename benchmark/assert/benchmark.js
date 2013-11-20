/**
 * TPS Benchmark Tools for Browser
 * @param {String}   name    benchmark name
 * @param {Function} fn      Function to run
 * @param {Object}   options options
 *
 * @example
 *   var bench = Benchmark.createBenchmark('test', function(conf) {
 *     var n = Math.random() * 1e3;
 *     var ops = 0;
 *     bench.start();
 *     while (n % 2 > 0) {
 *       n += Math.random() * 1e3;
 *       ops++;
 *     }
 *     bench.end(ops);
 *   }, { silent: 1 }, function(rate) {
 *     console.log(rate);
 *   });
 */
function Benchmark(name, fn, options, callback) {
  this.fn = fn;
  this.config = ('function' == typeof options || 'undefined' == typeof options) ? {} : options;
  this.callback = callback || function() {};
  if ('function' == typeof options) this.callback = options;
  this._name = name;
  this._start = 0;
  this._started = false;
  this.silent = this.config.silent || false;
  
  var self = this;
  setTimeout(function() {
    self._run();
  }, 0);
}

Benchmark.createBenchmark = function(name, fn, options, callback) {
  return new Benchmark(name, fn, options, callback);
};

Benchmark.prototype._run = function() {
  this.fn(this.config);
};

Benchmark.prototype.start = function() {
  if (this._started)
    throw new Error('Called start more than once in a single benchmark');

  this._started = true;
  this._start = Date.now();
};

Benchmark.prototype.end = function(operations) {
  var elapsed = Date.now() - this._start;
  if (this._started) {
    if (typeof operations !== 'number')
      throw new Error('called end() without specifying operation count');

    var time = elapsed / 1e3;
    var rate = operations / time;
    this.report(rate);
    this._started = false;
  }
};

Benchmark.prototype.report = function(value) {
  var heading = this.getHeading();
  if (!this.silent)
    console.log('%s: %s', heading, value.toPrecision(5));

  this.callback(value.toPrecision(5), heading);
};

Benchmark.prototype.getHeading = function() {
  var conf = this.config;
  return this._name + ' ' + Object.keys(conf).map(function(key) {
    return key + '=' + conf[key];
  }).join(' ');
};