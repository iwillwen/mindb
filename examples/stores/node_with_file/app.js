var nano = require('../../nano');
var FileStore = require('./filestore');

nano.store = new FileStore(__dirname + '/mydata.db');

nano.multi()
  .sadd('foo', 'bar')
  .sadd('foo', 'test')
  .smembers('foo')
  .exec(function(err, results) {
    if (err) {
      return console.error(err);
    }

    console.dir(results[2][0]);
  });