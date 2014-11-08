def('min.utils', [], function() {
  // Utils
  var utils = {
    noop: function() {
      return false;
    },
    // Class Inherits
    inherits: function (ctor, superCtor) {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    },
    // Object Extend
    extend: function() {
      var target = arguments[0];

      var objs = [].slice.call(arguments, 1);

      for (var i = 0, l = objs.length; i < l; i++) {
        for (var key in objs[i]) {
          target[key] = objs[i][key];
        }
      }

      return target;
    },
    isNumber: function(obj) {
      return toString.call(obj) == '[object Number]';
    },
    isUndefined: function(val) {
      return val === void 0;
    },
    isObject: function (obj) {
      return obj === Object(obj);
    },
    arrayUnique: function(array) {
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
    },
    arrayInter: function(array) {
      var rest = [].slice.call(arguments, 1);
      return utils.arrayUnique(array).filter(function(item) {
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
    },
    arrayDiff: function(array) {
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
  };

  return utils;
});