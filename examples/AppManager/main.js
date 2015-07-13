(function(undefined) {
  var AppManager = {
    init: function() {
      var el = this.el = document.querySelector('#appmanager');
      el.apps = el.querySelector('#apps');
      el.newAppForm = el.querySelector('#newapp');
      el.newAppForm.url = el.newAppForm.querySelector('#url');
      el.newAppForm.name = el.newAppForm.querySelector('#name');
      el.newAppForm.addBtn = el.newAppForm.querySelector('#add');

      this.apply();
      this.bind();
    },

    apply: function() {
      var self = this;

      this.appRender = utils.compile([
        '<li class="app" id="app-{{id}}">',
          '<h3>{{name}} <button class="remove">Remove</button></h3>',
        '</li>'
      ].join(''));

      AppManagerCore.listApps(function(err, apps) {
        if (utils.checkErr(err)) return;

        apps.forEach(function(app) {
          self.addApp(utils.str2DOM(self.appRender(app)));
        });
      });
    },

    addApp: function(dom) {
      this.bindAppDOM(dom);

      this.el.apps.appendChild(dom);
    },

    bind: function() {
      var self = this;

      self.el.newAppForm.addBtn.addEventListener('click', function() {
        var url = self.el.newAppForm.url.value;
        var name = self.el.newAppForm.name.value;

        AppManagerCore.addNewApp(url, name, function(err, id) {
          if (utils.checkErr(err)) return err;

          self.addApp(utils.str2DOM(self.appRender({
            name: name,
            id: id
          })));

          self.el.newAppForm.url.value = '';
          self.el.newAppForm.name.value = '';
        });

        return false;
      });
    },

    bindAppDOM: function(dom) {
      var id = parseInt(dom.id.substr(4));

      dom.querySelector('.remove').addEventListener('click', function(evt) {
        AppManagerCore.removeApp(id, function(err) {
          if (utils.checkErr(err)) return;

          dom.remove();
        });
      });
    }
  };

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

          multi.exec(function(err, results) {
            if (err) return callback(err);

            var apps = results.map(function(args) {
              return args[0];
            });

            callback(null, apps);
          });
        }, callback);
    }
  };

  var utils = {
    checkErr: function(err) {
      if (err) {
        console.error(err);
        return true;
      } else {
        return false;
      }
    },

    compile: function(str) {
      var match = str.match(/{{(\w+)}}/g);

      var tmpl = ['return('];

      match.forEach(function(pattern) {
        var key = pattern.replace(/{{|}}/g, '');

        var tmp = str.substr(0, str.indexOf(pattern));

        tmpl.push("'" + tmp + "'+");
        tmpl.push('local["' + key + '"]+');

        str = str.substr(str.indexOf(pattern) + pattern.length);
      });

      tmpl.push("'" + str + "')");

      return (new Function('local', tmpl.join('')));
    },

    str2DOM: function(str) {
      var tmp = document.createElement('div');
      tmp.innerHTML = str;
      return tmp.firstChild;
    }
  };

  AppManager.init();
})();