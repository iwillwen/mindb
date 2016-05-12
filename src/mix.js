import utils from './utils.js'
import { Promise } from './events.js'

const noop = utils.noop

const min = {}
export default min

let _keysTimer = null

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
  const promise = new Promise()

  promise.then(_ => {
    this.emit('set', key, value)

    if (_keysTimer) {
      clearTimeout(_keysTimer)
    }

    _keysTimer = setTimeout(this.save.bind(this), 1000)
  })

  // Store
  const store = this.store

  // Callback and Promise's shim
  callback = callback || utils.noop

  // Key prefix
  const $key = `min-${key}`

  if (store.async) {
    // Async Store Operating
    const load = _ => {
      // Value processing
      const $value = JSON.stringify(value)
      store.set($key, $value, err => {
        if (err) {
          // Error!
          promise.reject(err)
          return callback(err)
        }

        this._keys[key] = 0

        // Done
        promise.resolve(key)
        callback(null, key, value)
      })
    }
    if (store.ready) {
      load()
    } else {
      store.on('ready', load)
    }
  } else {
    // Value processing
    const $value = JSON.stringify(value)
    store.set($key, $value)
    this._keys[key] = 0

    // Done
    promise.resolve(key)
    callback(null, key, value)
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
  const promise = new Promise()

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
        .then(key => {
          // Done
          callback(null, key)
          promise.resolve(key)
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
  const promise = new Promise()

  // TTL
  const timeout = _ => {
    this.del(key, noop)
  }

  // Set
  this.set(key, value, (err, result) => {
    // Done
    setTimeout(timeout, seconds * 1000)
    callback(err, result)
  })
    .then(key => {
      // Done
      setTimeout(timeout, seconds * 1000)
      promise.resolve(key)
      callback(null, key)
    })
    .catch(err => {
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
  const promise = new Promise()

  // TTL
  const timeout = _ => {
    this.del(key, utils.noop)
  }

  // Set
  this.set(key, value, (err, result) => {
    // Done
    setTimeout(timeout, milliseconds)
    callback(err, result)
  })
    .then(key => {
      // Done
      setTimeout(timeout, milliseconds)
      promise.resolve(key)
      callback(null, key)
    })
    .catch(promise.reject.bind(promise))

  return promise
}

/**
 * Set multiple keys to multiple values
 * @param  {Object}   plainObject      Object to set
 * @param  {Function} callback Callback
 * @return {Promise}           promise object
 */
min.mset = function(plainObject, callback = noop) {
  const promise = new Promise()

  // keys
  const keys = Object.keys(plainObject)
  // counter
  let i = 0

  // the results and errors to return
  let results = []
  let errors = []

  // Loop
  const next = (key, index) => {
    // remove the current element of the plainObject
    delete keys[index]

    this.set(key, plainObject[key])
      .then(key => {
        results.push(key)

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
    if (errors.length > 0) {
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
  const promise = new Promise()
  const keys = Object.keys(plainObject)
  let i = 0

  let results = []
  let errors = []

  const next = (key, index) => {
    delete keys[index]

    this.setnx(key, plainObject[key])
      .then(key => {
        results.push(key)

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
  const promise = new Promise()

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        const p = new Promise()

        p.resolve('')

        return p
      }
    })
    .then(currVal => {
      return this.set(key, currVal + value)
    })
    .then(_ => {
      return this.strlen(key)
    })
    .then(len => {
      promise.resolve(len)
      callback(null, len)
    })
    .catch(err => {
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
  const promise = new Promise()

  promise.then(value => this.emit('get', key, value))

  // Store
  const store = this.store

  // Key prefix
  const $key = `min-${key}`

  if (store.async) {
    // Async Store Operating
    const load = _ => {
      // Value processing
      store.get($key, (err, value) => {
        if (err) {
          const _err = new Error('no such key')
          // Error!
          promise.reject(_err)
          return callback(_err)
        }

        if (value) {
          // Done
          try {
            const ret = JSON.parse(value)
            promise.resolve(ret)
            callback(null, ret)
          } catch(err) {
            promise.reject(err)
            callback(err)
          }
        } else {
          const err = new Error('no such key')

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
      const _value = this.store.get($key)

      if (_value) {
        try {
          const value = JSON.parse(_value)
          // Done
          promise.resolve(value)
          callback(null, value)
        } catch(err) {
          promise.reject(err)
          callback(err)
        }
      } else {
        const err = new Error('no such key')

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
  const promise = new Promise()

  promise.then(value => this.emit('getrange', key, start, end, value))

  const len = end - start + 1

  this.get(key)
    .then(value => {
      const val = value.substr(start, len)

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
  const promise = new Promise()

  const multi = this.multi()

  for (let i = 0; i < keys.length; i++) {
    multi.get(keys[i])
  }

  multi.exec((err, results) => {
    if (err) {
      callback(err)
      return promise.reject(err)
    }

    callback(err)
    promise.resolve(results)
  })

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
  const promise = new Promise()

  promise.then(old => this.emit('getset', key, value, old))

  let _value = null

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
  const promise = new Promise()

  this.get(key)
    .then(value => {
      if ('string' === typeof value) {
        const len = value.length

        promise.resolve(len)
        callback(null, len)
      } else {
        const err = new TypeError()

        promise.reject(err)
        callback(err)
      }
    })
    .catch(err => {
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
  const promise = new Promise()

  promise.then(value => this.emit('incr', key, value))

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        const p = new Promise()

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

      return this.set(key, ++curr)
    })
    .then(key => {
      return this.get(key)
    })
    .then(value => {
      promise.resolve(value)
      callback(null, value, key)
    })
    .catch(err => {
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
  const promise = new Promise()

  promise.then(value => this.emit('incrby', key, increment, value))

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        const p = new Promise()

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
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.incrbyfloat = min.incrby

min.decr = function(key, callback = noop) {
  const promise = new Promise()

  promise.then(curr => this.emit('decr', key, curr))

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        const p = new Promise()

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
    .then(key => {
      return this.get(key)
    })
    .then(value => {
      promise.resolve(value)
      callback(null, value, key)
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.decrby = function(key, decrement, callback = noop) {
  const promise = new Promise()
  promise.then(curr => this.emit('decrby', key, decrement, curr))

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        const p = new Promise()

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
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}
