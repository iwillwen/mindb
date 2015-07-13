var co = require('co');
var min = require('../');
var MemStore = require('./mem');

min.store = new MemStore();

co(function *() {
  yield min.set('foo', 'bar');
  var value = yield min.get('foo');

  console.log(value); //=> bar
})();