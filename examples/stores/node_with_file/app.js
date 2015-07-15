var min = require('../../dist/min');
var FileStore = require('./filestore');

min.store = new FileStore(__dirname + '/mydata.db');

min.multi()
  .sadd('foo', 'bar')
  .sadd('foo', 'test')
  .smembers('foo')
  .exec(function(err, results) {
    if (err) {
      return console.error(err);
    }

    console.dir(results[2][0]);
  });