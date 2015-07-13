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
    }
  };
})();