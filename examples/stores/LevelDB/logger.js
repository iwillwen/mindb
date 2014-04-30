var min = require('../../../min');
var LevelStore = require('./nano_level');

min.store = new LevelStore('/tmp/mydb', { encoding: 'json' });

var logger = exports;

logger.log = function(ctx, callback) {
  callback = callback || noop;

  return min.incr('log-seq')
    .then(function(id) {
      return min.hmset('log-' + id, {
        type: 'log',
        content: ctx,
        time: Date.now()
      });
    })
    .then(function(key) {
      var id = parseInt(key.substr(4));

      callback(null, id);
    })
    .fail(function(err) {
      callback(err);
    });
};

logger.error = function(err, callback) {
  callback = callback || noop;

  return min.incr('log-seq')
    .then(function(id) {
      return min.hmset('log-' + id, {
        type: 'error',
        stack: err.stack,
        time: Date.now()
      });
    })
    .then(function(key) {
      var id = parseInt(key.substr(4));

      callback(null, id);
    })
    .fail(function(err) {
      callback(err);
    });
};

function noop() {
  return false;
}