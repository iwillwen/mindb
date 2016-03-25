import utils from './utils.js'
import { Promise } from './events.js'

const noop = utils.noop
const min = {}
export default min

/******************************
**           List            **
******************************/

/**
 * Prepend one or multiple values to a list
 * @param  {String}   key      key
 * @param  {Mix}   value       value
 * @param  {Function} callback Callback
 * @return {Promise}           promise
 */
min.lpush = function(key, ...values) {
  const promise = new Promise()
  let callback = noop

  if (values[values.length - 1].apply) {
    callback = values.splice(values.length - 1)[0]
  }

  promise.then(len => this.emit('lpush', key, values, len))

  this.exists(key, (err, exists) => {
    if (err) {
      promise.reject(err)
      return callback(err)
    }

    if (exists) {
      this.get(key, (err, data) => {
        if (err) {
          promise.reject(err)
          return callback(err)
        }

        data.unshift(...values)

        this.set(key, data, err => {
          if (err) {
            promise.reject(err)
            return callback(err)
          }

          var length = data.length

          promise.resolve(length)
          callback(null, length)
        })
      })
    } else {
      const data = values.slice()

      this.set(key, data, err => {
        if (err) {
          promise.reject(err)
          return callback(err)
        }

        this._keys[key] = 2

        promise.resolve(1)
        callback(null, 1)
      })
    }
  })

  return promise
}

/**
 * Prepend a value to a list, only if the list exists
 * @param  {String}   key      key
 * @param  {Mix}   value       value
 * @param  {Function} callback Callback
 * @return {Promise}           promise
 */
min.lpushx = function(key, ...values) {
  const promise = new Promise()
  let callback = noop

  if (values[values.length - 1].apply) {
    callback = values.splice(values.length - 1)[0]
  }

  promise.then(len => this.emit('lpush', key, values, len))

  this.exists(key, (err, exists) => {
    if (err) {
      promise.reject(err)
      return callback(err)
    }

    if (exists) {
      this.get(key, (err, data) => {
        if (err) {
          promise.reject(err)
          return callback(err)
        }

        if (!data.length) {
          var err = new Error('The list is empty.')

          callback(err)
          return promise.reject(err)
        }

        data.unshift(...values)

        this.set(key, data, err => {
          if (err) {
            promise.reject(err)
            return callback(err)
          }

          const length = data.length

          promise.resolve(length)
          callback(null, length)
        })
      })
    } else {
      const err = new Error('no such key')

      callback(err)
      return promise.reject(err)
    }
  })

  return promise
}

/**
 * Append one or multiple values to a list
 * @param  {String}   key      key
 * @param  {Mix}   value       value
 * @param  {Function} callback Callback
 * @return {Promise}           promise
 */
min.rpush = function(key, ...values) {
  const promise = new Promise()
  let callback = noop

  if (values[values.length - 1].apply) {
    callback = values.splice(values.length - 1)[0]
  }

  promise.then(len => this.emit('rpush', key, values, len))

  this.exists(key, (err, exists) => {
    if (err) {
      promise.reject(err)
      return callback(err)
    }

    if (exists) {
      this.get(key, (err, data) => {
        if (err) {
          promise.reject(err)
          return callback(err)
        }

        data.push(...values)

        this.set(key, data, err => {
          if (err) {
            promise.reject(err)
            return callback(err)
          }

          const length = data.length

          promise.resolve(length)
          callback(null, length)
        })
      })
    } else {
      const data = values.slice()

      this.set(key, data, err => {
        if (err) {
          promise.reject(err)
          return callback(err)
        }

        promise.resolve(1)
        callback(null, 1)
      })
    }
  })

  return promise
}

/**
 * Prepend a value to a list, only if the list exists
 * @param  {String}   key      key
 * @param  {Mix}   value       value
 * @param  {Function} callback Callback
 * @return {Promise}           promise
 */
min.rpushx = function(key, ...values) {
  const promise = new Promise()
  let callback = noop

  if (values[values.length - 1].apply) {
    callback = values.splice(values.length - 1)[0]
  }

  promise.then(len => this.emit('rpush', key, values, len))

  this.exists(key, (err, exists) => {
    if (err) {
      promise.reject(err)
      return callback(err)
    }

    if (exists) {
      this.get(key, (err, data) => {
        if (err) {
          promise.reject(err)
          return callback(err)
        }

        if (!data.length) {
          const err = new Error('The list is empty.')

          callback(err)
          return promise.reject(err)
        }

        data.push(...values)

        this.set(key, data, err => {
          if (err) {
            promise.reject(err)
            return callback(err)
          }

          const length = data.length

          promise.resolve(length)
          callback(null, length)
        })
      })
    } else {
      const err = new Error('no such key')

      callback(err)
      return promise.reject(err)
    }
  })

  return promise
}

/**
 * Remove and get the first element in a list
 * @param  {String}   key      key
 * @param  {Function} callback Callback
 * @return {Promise}           promise
 */
min.lpop = function(key, callback = noop) {
  const promise = new Promise()
  let val = null

  promise.then(value => this.emit('lpop', key, value))

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        promise.resolve(null)
        callback(null, null)
      }
    })
    .then(data => {
      val = data.shift()

      return this.set(key,data)
    })
    .then(_ => {
      promise.resolve(val)
      callback(null, val)
    }, err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

/**
 * Remove and get the last element in a list
 * @param  {String}   key      key
 * @param  {Function} callback Callback
 * @return {Promise}           promise
 */
min.rpop = function(key, callback = noop) {
  const promise = new Promise()

  promise.then(value => this.emit('rpop', key, value))

  let value = null

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        promise.resolve(null)
        callback(null, null)
      }
    })
    .then(data => {
      value = data.pop()

      return this.set(key, data)
    })
    .then(_ => {
      promise.resolve(value)
      callback(null, value)
    }, err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

/**
 * Get the length of a list
 * @param  {String}   key      key
 * @param  {Function} callback callback
 * @return {Promise}           promise
 */
min.llen = function(key, callback = noop) {
  const promise = new Promise()

  this.exists(key, (err, exists) => {
    if (err) {
      promise.reject(err)
      return callback(err)
    }

    if (exists) {
      this.get(key, (err, data) => {
        if (err) {
          promise.reject(err)
          return callback(err)
        }

        var length = data.length

        promise.resolve(length)
        callback(null, length)
      })
    } else {
      promise.resolve(0)
      callback(null, 0)
    }
  })

  return promise
}

/**
 * Get a range of elements from a list
 * @param  {String}   key      key
 * @param  {Number}   start    min score
 * @param  {Number}   stop     max score
 * @param  {Function} callback callback
 * @return {Promise}           promise
 */
min.lrange = function(key, start, stop, callback = noop) {
  const promise = new Promise()

  this.exists(key, (err, exists) => {
    if (err) {
      promise.reject(err)
      return callback(err)
    }

    if (exists) {
      this.get(key, (err, data) => {
        if (err) {
          promise.reject(err)
          return callback(err)
        }

        if (stop < 0) {
          stop = data.length + stop
        }

        var values = data.slice(start, stop + 1)

        promise.resolve(values)
        callback(null, values)
      })
    } else {
      promise.resolve([])
      callback(null, [])
    }
  })

  return promise
}

/**
 * Remove elements from a list
 * @param  {String}   key      key
 * @param  {Number}   count    count to remove
 * @param  {Mix}      value    value
 * @param  {Function} callback callback
 * @return {Promise}           promise
 */
min.lrem = function(key, count, value, callback = noop) {
  const promise = new Promise()

  promise.then(removeds => this.emit('lrem', key, count, value, removeds))

  let removeds = 0

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        promise.resolve(0)
        callback(null, 0)
      }
    })
    .then(data => {
      switch (true) {
        case count > 0:
          for (let i = 0; i < data.length && removeds < count; i++) {
            if (data[i] === value) {
              data.splice(i, 1)[0]

              removeds++
            }
          }
          break
        case count < 0:
          for (let i = data.length - 1; i >= 0 && removeds < -count; i--) {
            if (data[i] === value) {
              data.splice(i, 1)[0]

              removeds++
            }
          }
          break
        case count == 0:
          for (let i = data.length - 1; i >= 0; i--) {
            if (data[i] === value) {
              data.splice(i, 1)[0]

              removeds++
            }
          }
          break
      }

      return this.set(key, data)
    })
    .then(() => {
      promise.resolve(removeds)
      callback(null, removeds)
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

/**
 * Remove elements from a list
 * @param  {String}   key      key
 * @param  {Number}   index    position to set
 * @param  {Mix}      value    value
 * @param  {Function} callback callback
 * @return {Promise}           promise
 */
min.lset = function(key, index, value, callback = noop) {
  const promise = new Promise()

  promise.then(len => this.emit('lset', key, index, value, len))

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        throw new Error('no such key')
      }
    })
    .then(data => {
      if (index < 0 && data.length > 0) {
        index = data.length + index
      }

      if (!data[index] || !data.length) {
        throw new Error('Illegal index')
      }

      if (data.length == index) {
        data.push(value)
      } else {
        data[index] = value
      }

      return this.set(key, data)
    })
    .then(() => {
      promise.resolve()
      callback(null)
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

/**
 * Trim a list to the specified range
 * @param  {String}   key      key
 * @param  {Number}   start    start
 * @param  {Number}   stop     stop
 * @param  {Function} callback callback
 * @return {Promise}           promise
 */
min.ltrim = function(key, start, stop, callback = noop) {
  const promise = new Promise()

  this.exists(key)
    .then(exists => {
      if (!exists) {
        throw new Error('no such key')
      }

      return this.get(key)
    })
    .then(data => {
      if (start < 0) {
        start = data.length + start
      }

      if (stop < 0) {
        stop = data.length + stop
      }

      var values = data.slice(start, stop + 1)

      return this.set(key, values)
    })
    .then(() => this.get(key))
    .then(values => {
      promise.resolve(values)
      callback(null, values, key)
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

/**
 * Get an element from a list by its index
 * @param  {String}   key      key
 * @param  {Number}   index    index
 * @param  {Function} callback callback
 * @return {Promise}           promise
 */
min.lindex = function(key, index, callback = noop) {
  const promise = new Promise()

  this.exists(key)
    .then(exists => {
      if (!exists) {
        const err = new Error('no such key')

        promise.reject(err)
        return callback(err)
      }

      return this.get(key)
    })
    .then(data => {
      if (index > (data.length - 1)) {
        throw new Error('Illegal index')
      }

      const value = data[index]

      promise.resolve(value)
      callback(null, value)
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

/**
 * Insert an element before another element in a list
 * @param  {String}   key      key
 * @param  {Mix}   pivot       pivot
 * @param  {Mix}   value       value
 * @param  {Function} callback callback
 * @return {Promise}           promise
 */
min.linsertBefore = function(key, pivot, value, callback = noop) {
  const promise = new Promise()

  promise.then(len => this.emit('linsertBefore', key, pivot, value, len))

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        throw new Error('no such key')
      }
    })
    .then(data => {
      const index = data.indexOf(pivot)

      if (index < 0) {
        promise.resolve(-1)
        callback(null, -1)
        return
      }

      const prev = data.slice(0, index)
      const next = data.slice(index)

      const newData = prev.slice()
      newData.push(value, ...next)

      return this.set(key, newData)
    })
    .then(key => {
      if (key.substr) {
        return this.get(key)
      }
    })
    .then(data => {
      promise.resolve(data.length)
      callback(null, data.length)
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

/**
 * Insert an element after another element in a list
 * @param  {String}   key      key
 * @param  {Mix}   pivot       pivot
 * @param  {Mix}   value       value
 * @param  {Function} callback callback
 * @return {Promise}           promise
 */
min.linsertAfter = function(key, pivot, value, callback = noop) {
  const promise = new Promise()

  promise.then(len => this.emit('linsertAfter', key, pivot, value, len))

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        throw new Error('no such key')
      }
    })
    .then(data => {
      const index = data.indexOf(pivot) + 1

      if (index < 0) {
        promise.resolve(-1)
        callback(null, -1)
        return
      }

      const prev = data.slice(0, index)
      const next = data.slice(index)

      const newData = prev.slice()
      newData.push(value, ...next)

      return this.set(key, newData)
    })
    .then(key => {
      if (key.substr) {
        return this.get(key)
      }
    })
    .then(data => {
      promise.resolve(data.length)
      callback(null, data.length)
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

/**
 * Remove the last element in a list, append it to another list and return it
 * @param  {String}   src      source
 * @param  {String}   dest     destination
 * @param  {Function} callback callback
 * @return {Promise}           promise
 */
min.rpoplpush = function(src, dest, callback = noop) {
  const promise = new Promise()
  let value = null

  promise.then(([value, len]) => this.emit('rpoplpush', src, dest, value, len))

  this.rpop(src)
    .then(_ => this.lpush(dest, (value = _)))
    .then(length => {
      promise.resolve([value, length])
      callback(null, value, length)
    }, err => {
      callback(err)
      promise.reject(err)
    })

  return promise
}

/**
 * Remove the last element in a list, append it to another list and return it
 * @param  {String}   src      source
 * @param  {String}   dest     destination
 * @param  {Function} callback callback
 * @return {Promise}           promise
 */
min.lpoprpush = function(src, dest, callback = noop) {
  const promise = new Promise()
  let value = null

  promise.then((value, len) => this.emit('lpoprpush', src, dest, value, len))

  this.lpop(src)
    .then(_ => this.rpush(dest, (value = _)))
    .then(length => {
      promise.resolve(value, length)
      callback(null, value, length)
    }, err => {
      callback(err)
      promise.reject(err)
    })

  return promise
}
