var co = require('co');
var min = require('../../../');
var LevelStore = require('./min-level');

min.store = new LevelStore('./db');

co(function *() {
  yield min.set('foo', 'bar');
  var value = yield min.get('foo');

  console.log(value); //=> bar
})();