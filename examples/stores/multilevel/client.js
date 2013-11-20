var nano = require('../../nano');
var MultiLevelStore = require('./nano_multilevel');

nano.store = new MultiLevelStore('localhost', 8080);

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