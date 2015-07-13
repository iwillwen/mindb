// Node shim
if ('undefined' !== typeof process) {
  var min = require('min');
  var MemStore = require('./mem');
  min.store = new MemStore();
} else {
  module = { exports: {} };
}

var Messages = (function(undefined) {
  var Messages = {
    pushMessage: function(appId, content, callback) {
      var msg = {
        content: content
      };

      min.incr('msgs:' + appId + ':id_seq')
        .then(function(id) {
          msg.id = parseInt(id);

          return min.sadd('msg:' + appId, id);
        })
        .then(function() {
          return min.set('msg:' + appId + ':' + msg.id, content);
        })
        .then(function() {
          callback(null, msg.id);
        }, callback);
    },

    pullMessages: function(appId, callback) {
      min.smembers('msg:' + appId)
        .then(function(msgIds) {
          return min.mget(msgIds.map(function(id) {
            return 'msg:' + appId + ':' + id;
          }));
        })
        .then(function(msgs) {
          return callback(null, msgs);
        }, callback);
    }
  };

  return Messages;
})();

var testMessages = module.exports = function() {
  var msgs = [
    'foo',
    'bar',
    'abc'
  ];

  (function loop(arr) {
    var msg = arr.shift();

    if (!msg) return;

    Messages.pushMessage('test', msg, function(err, id) {
      return loop(arr);
    });
  })(msgs);

  Messages.pullMessages('test', function(err, res) {
    console.dir(res);
  });
};