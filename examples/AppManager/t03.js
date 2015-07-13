(function(undefined) {
  var AppManagerCore = {
    addNewApp: function(url, name, callback) {
      var app = {
        url: url,
        name: name
      };

      min.incr('apps:id')
        .then(function(id) {
          app.id = parseInt(id);

          return min.sadd('apps:ids', id);
        })
        .then(function() {
          return min.hmset('app:' + app.id, app);
        })
        .then(
          callback.bind(null, null, app.id),
          callback
        );
    },

    removeApp: function(id, callback) {
      min.multi()
        .srem('apps:ids', id)
        .del('app:' + id)
        .exec(callback); 
    },

    listApps: function(callback) {
      min.smembers('apps:ids')
        .then(function(ids) {
          var multi = min.multi();

          ids.forEach(function(id) {
            multi.hgetall('app:' + id);
          });

          multi.exec(function(err, res) {
            if (err) return callback(err);

            callback(null, apps);
          })
        }, callback);
    }
  };
})();
