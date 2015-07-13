var wrap = {};

Object.defineProperty(wrap, 'session', {
  get: function() {
    return wrap.$session;
  },
  set: function(newValue) {
    var changes = objDiff(wrap.$session, newValue);

    var multi = min.multi();

    for (key in changes) {
      if (changes.hasOwnProperty(key)) {
        wrap.$session[key] = changes[key];
        multi.set('session:' + key, changes[key]);
      }
    }

    multi.exec(function(err, res) {
      console.log(err, res);
    })
  },
  configurable: true
});

Object.defineProperty(wrap, '$session', {
  get: function() {
    return {}
  },
  set: function(newValue) {
    console.log(newValue);
  }
});

function objDiff(obj1, obj2) {
  var keys1 = Object.keys(obj1);
  var keys2 = Object.keys(obj2);

  var diff = arrayDiff(keys2, keys1);
  var inter = arrayInter(keys2, keys1);

  console.log(keys1, keys2, diff, inter);

  var changes = {};

  diff.forEach(function(row) {
    changes[row] = obj2[row];
  });

  inter.forEach(function(row) {
    if (obj1[row] !== obj2[row]) {
      changes[row] = obj2[row];
    }
  });

  return changes;
}

function arrayDiff(array) {
  var rest = [].slice.call(arguments, 1);
  return array.filter(function(item) {
    var ret = true;

    for (var i = 0; i < rest.length; i++) {
      (function(index) {
        var other = rest[index];

        if (other.indexOf(item) >= 0) {
          ret = false;
        }
      })(i);
    }

    return ret;
  });
}

function arrayInter(array) {
  var rest = [].slice.call(arguments, 1);
  return arrayUnique(array).filter(function(item) {
    var ret = true;

    for (var i = 0; i < rest.length; i++) {
      (function(index) {
        var other = rest[index];

        if (other.indexOf(item) < 0) {
          ret = false;
        }
      })(i);
    }

    return ret;
  });
}

function arrayUnique(array) {
  var u = {};
  var ret = [];
  for (var i = 0, l = array.length; i < l; ++i) {
    if (u.hasOwnProperty(array[i]) && !utils.isObject(array[i])) {
       continue;
    }
    ret.push(array[i]);
    u[array[i]] = 1;
  }
  return ret;
}