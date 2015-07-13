import utils from './utils.js'
import { Promise } from './deps/events.js'

var self = this || window || global

var noop = utils.noop

var min = {}
export default min

var _keysTimer = null

/******************************
** Mix(String/Number/Object) **
******************************/

/**
 * Set the value of a key
 * @param  {String}   key      Key
 * @param  {Mix}      value    Value
 * @param  {Function} callback Callback
 * @return {Promise}           Promise Object
 */
min.set = function(key, value, callback) {
  // Promise Object
  var promise = new Promise()

  promise.then(_ => {
    this.emit('set', key, value)

    if (_keysTimer) {
      clearTimeout(_keysTimer)
    }

    _keysTimer = setTimeout(this.save.bind(this), 1000)
  })

  // Store
  var store = this.store

  // Callback and Promise's shim
  callback = callback || utils.noop

  // Key prefix
  var $key = `min-${key}`

  if (store.async) {
    // Async Store Operating
    var load = _ => {
      // Value processing
      var $value = JSON.stringify(value)
      store.set($key, $value, err => {
        if (err) {
          // Error!
          promise.reject(err)
          return callback(err)
        }

        this._keys[key] = 0

        // Done
        promise.resolve([key, value])
        callback(null, key, value)
      })
    }
    if (store.ready) {
      load()
    } else {
      store.on('ready', load)
    }
  } else {
    try {
      // Value processing
      var $value = JSON.stringify(value)
      store.set($key, $value)
      this._keys[key] = 0

      // Done
      promise.resolve([key, value])
      callback(null, key, value)
    } catch(err) {
      // Error!
      promise.reject(err)
      callback(err)
    }
  }

  return promise
}

/**
 * Set the value of a key, only if the key does not exist
 * @param  {String}   key      the key
 * @param  {Mix}      value    Value
 * @param  {Function} callback Callback
 * @return {Promise}           Promise Object
 */
min.setnx = function(key, value, callback = noop) {
  // Promise Object
  var promise = new Promise()

  this.exists(key, (err, exists) => {
    if (err) {
      callback(err)
      promise.reject(err)
    }

    if (exists) {
      // The key is exists
      return promise.reject(new Error('The key is exists.'))
    } else {
      this.set(key, value, callback)
        .then((key, value) => {
          // Done
          callback(null, key, value)
          promise.resolve([key, value])
        }, err => {
          callback(err)
          promise.reject(err)
        });          
    }
  })

  return promise
}

/**
 * Set the value and expiration of a key
 * @param  {String}   key      key
 * @param  {Number}   seconds  TTL
 * @param  {Mix}      value    value
 * @param  {Function} callback Callback
 * @return {Promise}           promise object
 */
min.setex = function(key, seconds, value, callback = noop) {

  // Promise Object
  var promise = new Promise()

  // TTL
  var timeout = _ => {
    this.del(key, noop)
  }

  // Set
  this.set(key, value, (err, result) => {
    // Done
    setTimeout(timeout, seconds * 1000)
    callback(err, result)
  })
    .then((key, value) => {
      // Done
      setTimeout(timeout, seconds * 1000)
      promise.resolve([key, value])
      callback(null, key, value)
    }, err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

/**
 * Set the value and expiration in milliseconds of a key
 * @param  {String}   key      key
 * @param  {Number}   millionseconds  TTL
 * @param  {Mix}      value    value
 * @param  {Function} callback Callback
 * @return {Promise}           promise object
 */
min.psetex = function(key, milliseconds, value, callback = noop) {

  // Promise Object
  var promise = new Promise()

  // TTL
  var timeout = _ => {
    this.del(key, utils.noop)
  }

  // Set
  this.set(key, value, (err, result) => {
    // Done
    setTimeout(timeout, milliseconds)
    callback(err, result)
  })
    .then(_ => {
      // Done
      setTimeout(timeout, milliseconds)
      promise.resolve.apply(promise, arguments)
    }, promise.reject.bind(promise))

  return promise
}

/**
 * Set multiple keys to multiple values
 * @param  {Object}   plainObject      Object to set
 * @param  {Function} callback Callback
 * @return {Promise}           promise object
 */
min.mset = function(plainObject, callback = noop) {
  var promise = new Promise()

  // keys
  var keys = Object.keys(plainObject)
  // counter
  var i = 0

  // the results and errors to return
  var results = []
  var errors = []

  // Loop
  var next = (key, index) => {
    // remove the current element of the plainObject
    delete keys[index]

    this.set(key, plainObject[key])
      .then(_ => {
        results.push(arguments)

        i++
        if (keys[i]) {
          next(keys[i], i)
        } else {
          out()
        }
      }, err => {
        errors.push(err)

        i++
        if (keys[i]) {
          return next(keys[i], i)
        } else {
          return out()
        }
      })
  }

  function out() {
    if (errors.length) {
      callback(errors)
      promise.reject(errors)
    } else {
      callback(null, results)
      promise.resolve(results)
    }
  }

  next(keys[i], i)

  return promise
}

/**
 * Set multiple keys to multiple values, only if none of the keys exist
 * @param  {Object}   plainObject      Object to set
 * @param  {Function} callback Callback
 * @return {Promise}           promise object
 */
min.msetnx = function(plainObject, callback = noop) {
  var promise = new Promise()
  var keys = Object.keys(plainObject)
  var i = 0

  var results = []
  var errors = []

  var next = (key, index) => {
    delete keys[index]

    this.setnx(key, plainObject[key])
      .then(_ => {
        results.push(arguments)

        i++
        if (keys[i]) {
          next(keys[i], i)
        } else {
          out()
        }
      }, err => {
        errors.push(err)
        out()
      })
  }

  function out() {
    if (errors.length) {
      callback(errors)
      return promise.reject(errors)
    } else {
      callback(null, results)
      promise.resolve(results)
    }
  }

  next(keys[i], i)

  return promise
}

/**
 * Append a value to a key
 * @param  {String}   key      key
 * @param  {String}   value    value
 * @param  {Function} callback Callback
 * @return {Promise}           promise
 */
min.append = function(key, value, callback = noop) {
  var promise = new Promise()

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        var p = new Promise()

        p.resolve('')

        return p
      }
    })
    .then(currVal => {
      return this.set(key, currVal + value)
    })
    .then((key, value) => {
      return this.strlen(key)
    })
    .then(len => {
      promise.resolve(len)
      callback(null, len)
    }, err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

/**
 * Get the value of a key
 * @param  {String}   key      Key
 * @param  {Function} callback Callback
 * @return {Promise}           Promise Object
 */
min.get = function(key, callback = noop) {
  // Promise Object
  var promise = new Promise()

  promise.then(value => this.emit('get', key, value))

  // Store
  var store = this.store

  // Key prefix
  var $key = `min-${key}`

  if (store.async) {
    // Async Store Operating
    var load = _ => {
      // Value processing
      store.get($key, (err, value) => {
        if (err) {
          var _err = new Error('no such key')
          // Error!
          promise.reject(_err)
          return callback(_err)
        }

        if (value) {
          // Done
          try {
            var ret = JSON.parse(value)
            promise.resolve(ret)
            callback(null, ret)
          } catch(err) {
            promise.reject(err)
            callback(err)
          }
        } else {
          var err = new Error('no such key')

          promise.reject(err)
          callback(err)
        }

      })
    }
    if (store.ready) {
      load()
    } else {
      store.on('ready', load)
    }
  } else {
    try {
      // Value processing
      var _value = this.store.get($key)

      if (_value) {
        try {
          var value = JSON.parse(_value)
          // Done
          promise.resolve(value)
          callback(null, value)
        } catch(err) {
          promise.reject(err)
          callback(err)
        }
      } else {
        var err = new Error('no such key')

        promise.reject(err)
        callback(err)
      }
    } catch(err) {
      // Error!
      promise.reject(err)
      callback(err)
    }
  }

  return promise
}

min.getrange = function(key, start, end, callback = noop) {
  var promise = new Promise()

  promise.then(value => this.emit('getrange', key, start, end, value))

  var len = end - start + 1

  this.get(key)
    .then(value => {
      var val = value.substr(start, len)

      promise.resolve(val)
      callback(null, val)
    }, err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

/**
 * Get the values of a set of keys
 * @param  {Array}   keys      the keys
 * @param  {Function} callback Callback
 * @return {Promise}           promise object
 */
min.mget = function(keys, callback = noop) {

  // Promise Object
  var promise = new Promise()

  var i = 0
  var results = []
  var errors = []

  var next = (key, index) => {
    delete keys[index]
    
    if (!key) {
      i++
      return next(keys[i], i)
    }
    this.get(key, (err, value) => {
      if (err) {
        errors.push(err)
        results.push(null)

        i++
        if (keys[i]) {
          return next(keys[i], i)
        } else {
          return out()
        }
      }

      results.push(value)

      i++
      if (keys[i]) {
        next(keys[i], i)
      } else {
        out()
      }
    })
  }

  function out() {
    if (errors.length) {
      callback(errors)
      promise.reject(errors)
    } else {
      callback(null, results)
      promise.resolve(results)
    }
  }

  next(keys[i], i)

  return promise
}

/**
 * Set the value of a key and return its old value
 * @param  {String}   key      key
 * @param  {Mix}   value       value
 * @param  {Function} callback Callback
 * @return {Promise}           promise object
 */
min.getset = function(key, value, callback = noop) {
  var promise = new Promise()

  promise.then(old => this.emit('getset', key, value, old))

  var _value = null

  this.get(key)
    .then($value => {
      _value = $value

      return this.set(key, value)
    })
    .then(_ => {
      promise.resolve(_value)
      callback(null, _value)
    }, err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

/**
 * Get the length of a key
 * @param  {String}   key      Key
 * @param  {Function} callback Callback
 * @return {Promise}           promise
 */
min.strlen = function(key, callback = noop) {
  var promise = new Promise()

  this.get(key)
    .then(value => {
      if ('string' === typeof value) {
        var len = value.length

        promise.resolve(len)
        callback(null, len)
      } else {
        var err = new TypeError()

        promise.reject(err)
        callback(err)
      }
    }, err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

/**
 * Increment the integer value of a key by one
 * @param  {String}   key      key
 * @param  {Function} callback callback
 * @return {Promise}           promise
 */
min.incr = function(key, callback = noop) {
  var promise = new Promise()

  promise.then(value => this.emit('incr', key, value))

  this.get(key)
    .then((curr = 0) => {
      if (isNaN(parseInt(curr))) {
        promise.reject('value wrong')
        return callback('value wrong')
      }

      curr = parseInt(curr)

      return this.set(key, ++curr)
    })
    .then(([key, value]) => {
      promise.resolve(value)
      callback(null, value)
    }, err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

/**
 * Increment the integer value of a key by the given amount
 * @param  {String}   key      key
 * @param  {Number}   increment increment
 * @param  {Function} callback callback
 * @return {Promise}           promise
 */
min.incrby = function(key, increment, callback = noop) {
  var promise = new Promise()

  promise.then(value => this.emit('incrby', key, increment, value))

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        var p = new Promise()

        p.resolve(0)

        return p
      }
    })
    .then(curr => {
      if (isNaN(parseFloat(curr))) {
        promise.reject('value wrong')
        return callback('value wrong')
      }

      curr = parseFloat(curr)

      return this.set(key, curr + increment)
    })
    .then((key, value) => {
      promise.resolve(value)
      callback(null, value)
    }, err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.incrbyfloat = min.incrby

min.decr = function(key, callback = noop) {
  var promise = new Promise()

  promise.then(curr => this.emit('decr', key, curr))

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        var p = new Promise()

        p.resolve(0)

        return p
      }
    })
    .then(curr => {
      if (isNaN(parseInt(curr))) {
        promise.reject('value wrong')
        return callback('value wrong')
      }

      curr = parseInt(curr)

      return this.set(key, --curr)
    })
    .then((key, value) => {
      promise.resolve(value)
      callback(null, value)
    }, err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.decrby = function(key, decrement, callback = noop) {
  var promise = new Promise()
  promise.then(curr => this.emit('decrby', key, decrement, curr))

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        var p = new Promise()

        p.resolve(0)

        return p
      }
    })
    .then(curr => {
      if (isNaN(parseInt(curr))) {
        promise.reject('value wrong')
        return callback('value wrong')
      }

      curr = parseInt(curr)

      return this.set(key, curr - decrement)
    })
    .then((key, value) => {
      promise.resolve(value)
      callback(null, value)
    }, err => {
      promise.reject(err)
      callback(err)
    })

  return promise
};