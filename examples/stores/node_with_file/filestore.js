var fs   = require('fs');

function FileStore(filename) {
  this.filename = filename;
  this.buffer   = null;
  
  this.async    = true;
  this.ready    = true;
}
FileStore.prototype.set = function(key, value[, callback]) {
  var self = this;

  if (!self.buffer) {
    fs.readFile(self.filename, function(err, data) {
      if (err)
        return callback(err);

      self.buffer = JSON.parse(data.toString());
      self.buffer[key] = value;
      fs.writeFile(self.filename, JSON.stringify(self.buffer), function(err) {
        if (err)
          return callback(err);

        callback();
      });
    });
  } else {
    self.buffer[key] = value;

    fs.writeFile(self.filename, JSON.stringify(self.buffer), function(err) {
      if (err)
        return callback(err);

      callback();
    });
  }
};
FileStore.prototype.get = function(key[, callback]) {
  var self = this;

  if (!self.buffer) {
    fs.readFile(self.filename, function(err, data) {
      if (err)
        return callback(err);

      self.buffer = JSON.parse(data);

      callback(null, self.buffer[key]);
    });
  } else {
    if (self.buffer[key]) {
      return callback(null, self.buffer[key]);
    } else {
      return callback(new Error('This key is not exists.'));
    }
  }
};
FileStore.prototype.remove = function(key[, callback]) {
  var self = this;

  if (!self.buffer) {
    fs.readFile(self.filename, function(err, data) {
      if (err)
        return callback(err);

      delete self.buffer[key];

      fs.writeFile(self.filename, JSON.stringify(self.buffer)[, callback]);
    });
  } else {
    delete self.buffer[key];

    fs.writeFile(self.filename, JSON.stringify(self.buffer)[, callback]);
  }
};

module.exports = FileStore;