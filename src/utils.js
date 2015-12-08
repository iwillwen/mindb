// Utils
export default {
  noop() {
    return false
  },
  // Class Inherits
  inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    })
  },
  // Object Extend
  extend(target, ...objs) {
    for (var i = 0, l = objs.length; i < l; i++) {
      var keys = Object.getOwnPropertyNames(objs[i] || {})

      for (var j = 0;j < keys.length; j++) {
        target[keys[j]] = objs[i][keys[j]]
      }
    }

    return target
  },
  isNumber(obj) {
    return toString.call(obj) == '[object Number]'
  },
  isUndefined(val) {
    return val === void 0
  },
  isObject(obj) {
    return obj === Object(obj)
  },
  arrayUnique(array) {
    var u = {}
    var ret = []
    for (var i = 0, l = array.length; i < l; ++i) {
      if (u.hasOwnProperty(array[i]) && !utils.isObject(array[i])) {
         continue
      }
      ret.push(array[i])
      u[array[i]] = 1
    }
    return ret
  },
  arrayInter(array, ...rest) {
    return utils.arrayUnique(array).filter(function(item) {
      var ret = true

      for (let other of rest) {
        if (other.indexOf(item) < 0) {
          ret = false
        }
      }

      return ret
    })
  },
  arrayDiff(array, ...rest) {
    return array.filter(function(item) {
      var ret = true

      for (let other of rest) {
        if (other.indexOf(item) >= 0) {
          ret = false
        }
      }

      return ret
    })
  },

  flatten(input, shallow, strict, startIndex) {
    var output = [], idx = 0
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i]
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict)
        var j = 0, len = value.length
        output.length += len
        while (j < len) {
          output[idx++] = value[j++]
        }
      } else if (!strict) {
        output[idx++] = value
      }
    }
    return output
  }
}
