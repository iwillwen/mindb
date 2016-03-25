// Utils
const utils = {
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
    for (let i = 0, l = objs.length; i < l; i++) {
      const keys = Object.getOwnPropertyNames(objs[i] || {})

      for (let j = 0;j < keys.length; j++) {
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
    const u = {}
    const ret = []
    for (let i = 0, l = array.length; i < l; ++i) {
      if (u.hasOwnProperty(array[i]) && !utils.isObject(array[i])) {
         continue
      }
      ret.push(array[i])
      u[array[i]] = 1
    }
    return ret
  },
  arrayInter(array, ...rest) {
    return utils.arrayUnique(array).filter(item => {
      let ret = true

      for (const other of rest) {
        if (other.indexOf(item) < 0) {
          ret = false
        }
      }

      return ret
    })
  },
  arrayDiff(array, ...rest) {
    let inter = utils.arrayInter(array, ...rest)
    let union = utils.arrayUnique(array.concat(...rest))
    return union.filter(item => inter.indexOf(item) < 0)
  },

  flatten(input, shallow, strict, startIndex) {
    const output = []
    let idx = 0
    for (let i = startIndex || 0, length = getLength(input); i < length; i++) {
      let value = input[i]
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict)
        let j = 0, len = value.length
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

export default utils
