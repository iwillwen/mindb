import utils from './utils.js'

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
  let callback = noop

  if (values[values.length - 1].apply) {
    callback = values.splice(values.length - 1)[0]
  }

  const promise = new Promise((resolve, reject) => {
    this.exists(key, (err, exists) => {
      if (err) {
        reject(err)
        return callback(err)
      }

      if (exists) {
        this.get(key, (err, data) => {
          if (err) {
            reject(err)
            return callback(err)
          }

          data.unshift(...values)

          this.set(key, data, err => {
            if (err) {
              reject(err)
              return callback(err)
            }

            var length = data.length

            resolve(length)
            callback(null, length)
          })
        })
      } else {
        const data = values.slice()

        this.set(key, data, err => {
          if (err) {
            reject(err)
            return callback(err)
          }

          this._keys[key] = 2

          resolve(1)
          callback(null, 1)
        })
      }
    })
  })

  promise.then(len => this.emit('lpush', key, values, len))

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
  let callback = noop

  if (values[values.length - 1].apply) {
    callback = values.splice(values.length - 1)[0]
  }

  const promise = new Promise((resolve, reject) => {
    this.exists(key, (err, exists) => {
      if (err) {
        reject(err)
        return callback(err)
      }

      if (exists) {
        this.get(key, (err, data) => {
          if (err) {
            reject(err)
            return callback(err)
          }

          if (!data.length) {
            var err = new Error('The list is empty.')

            callback(err)
            return reject(err)
          }

          data.unshift(...values)

          this.set(key, data, err => {
            if (err) {
              reject(err)
              return callback(err)
            }

            const length = data.length

            resolve(length)
            callback(null, length)
          })
        })
      } else {
        const err = new Error('no such key')

        callback(err)
        return reject(err)
      }
    })
  })
  promise.then(len => this.emit('lpush', key, values, len))

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
  let callback = noop

  if (values[values.length - 1].apply) {
    callback = values.splice(values.length - 1)[0]
  }

  const promise = new Promise((resolve, reject) => {
    this.exists(key, (err, exists) => {
      if (err) {
        reject(err)
        return callback(err)
      }

      if (exists) {
        this.get(key, (err, data) => {
          if (err) {
            reject(err)
            return callback(err)
          }

          data.push(...values)

          this.set(key, data, err => {
            if (err) {
              reject(err)
              return callback(err)
            }

            const length = data.length

            resolve(length)
            callback(null, length)
          })
        })
      } else {
        const data = values.slice()

        this.set(key, data, err => {
          if (err) {
            reject(err)
            return callback(err)
          }

          resolve(1)
          callback(null, 1)
        })
      }
    })
  })
  promise.then(len => this.emit('rpush', key, values, len))

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
  let callback = noop

  if (values[values.length - 1].apply) {
    callback = values.splice(values.length - 1)[0]
  }

  const promise = new Promise((resolve, reject) => {
    this.exists(key, (err, exists) => {
      if (err) {
        reject(err)
        return callback(err)
      }

      if (exists) {
        this.get(key, (err, data) => {
          if (err) {
            reject(err)
            return callback(err)
          }

          if (!data.length) {
            const err = new Error('The list is empty.')

            callback(err)
            return reject(err)
          }

          data.push(...values)

          this.set(key, data, err => {
            if (err) {
              reject(err)
              return callback(err)
            }

            const length = data.length

            resolve(length)
            callback(null, length)
          })
        })
      } else {
        const err = new Error('no such key')

        callback(err)
        return reject(err)
      }
    })
  })
  promise.then(len => this.emit('rpush', key, values, len))

  return promise
}

/**
 * Remove and get the first element in a list
 * @param  {String}   key      key
 * @param  {Function} callback Callback
 * @return {Promise}           promise
 */
min.lpop = function(key, callback = noop) {
  let val = null
  const promise = new Promise((resolve, reject) => {

    this.exists(key)
      .then(exists => {
        if (exists) {
          return this.get(key)
        } else {
          resolve(null)
          callback(null, null)
        }
      })
      .then(data => {
        val = data.shift()

        return this.set(key,data)
      })
      .then(_ => {
        resolve(val)
        callback(null, val)
      }, err => {
        reject(err)
        callback(err)
      })
  })

  promise.then(value => this.emit('lpop', key, value))


  return promise
}

/**
 * Remove and get the last element in a list
 * @param  {String}   key      key
 * @param  {Function} callback Callback
 * @return {Promise}           promise
 */
min.rpop = function(key, callback = noop) {
  let value = null

  const promise = new Promise((resolve, reject) => {

    this.exists(key)
      .then(exists => {
        if (exists) {
          return this.get(key)
        } else {
          resolve(null)
          callback(null, null)
        }
      })
      .then(data => {
        value = data.pop()

        return this.set(key, data)
      })
      .then(_ => {
        resolve(value)
        callback(null, value)
      }, err => {
        reject(err)
        callback(err)
      })
  })

  promise.then(value => this.emit('rpop', key, value))

  return promise
}

/**
 * Get the length of a list
 * @param  {String}   key      key
 * @param  {Function} callback callback
 * @return {Promise}           promise
 */
min.llen = function(key, callback = noop) {
  return new Promise((resolve, reject) => {

    this.exists(key, (err, exists) => {
      if (err) {
        reject(err)
        return callback(err)
      }

      if (exists) {
        this.get(key, (err, data) => {
          if (err) {
            reject(err)
            return callback(err)
          }

          var length = data.length

          resolve(length)
          callback(null, length)
        })
      } else {
        resolve(0)
        callback(null, 0)
      }
    })
  })
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
  return new Promise((resolve, reject) => {

    this.exists(key, (err, exists) => {
      if (err) {
        reject(err)
        return callback(err)
      }

      if (exists) {
        this.get(key, (err, data) => {
          if (err) {
            reject(err)
            return callback(err)
          }

          if (stop < 0) {
            stop = data.length + stop
          }

          var values = data.slice(start, stop + 1)

          resolve(values)
          callback(null, values)
        })
      } else {
        resolve([])
        callback(null, [])
      }
    })
  })
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

  let removeds = 0

  const promise = new Promise((resolve, reject) => {

    this.exists(key)
      .then(exists => {
        if (exists) {
          return this.get(key)
        } else {
          resolve(0)
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
        resolve(removeds)
        callback(null, removeds)
      })
      .catch(err => {
        reject(err)
        callback(err)
      })

  })

  promise.then(removeds => this.emit('lrem', key, count, value, removeds))

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
  const promise = new Promise((resolve, reject) => {

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
        resolve()
        callback(null)
      })
      .catch(err => {
        reject(err)
        callback(err)
      })

  })

  promise.then(len => this.emit('lset', key, index, value, len))

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
  return new Promise((resolve, reject) => {

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
        resolve(values)
        callback(null, values, key)
      })
      .catch(err => {
        reject(err)
        callback(err)
      })

  })
}

/**
 * Get an element from a list by its index
 * @param  {String}   key      key
 * @param  {Number}   index    index
 * @param  {Function} callback callback
 * @return {Promise}           promise
 */
min.lindex = function(key, index, callback = noop) {
  return new Promise((resolve, reject) => {

    this.exists(key)
      .then(exists => {
        if (!exists) {
          const err = new Error('no such key')

          reject(err)
          return callback(err)
        }

        return this.get(key)
      })
      .then(data => {
        if (index > (data.length - 1)) {
          throw new Error('Illegal index')
        }

        const value = data[index]

        resolve(value)
        callback(null, value)
      })
      .catch(err => {
        reject(err)
        callback(err)
      })
  })
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
  const promise = new Promise((resolve, reject) => {

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
        resolve(-1)
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
      resolve(data.length)
      callback(null, data.length)
    })
    .catch(err => {
      reject(err)
      callback(err)
    })

  })

  promise.then(len => this.emit('linsertBefore', key, pivot, value, len))

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
  const promise = new Promise((resolve, reject) => {

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
        resolve(-1)
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
      resolve(data.length)
      callback(null, data.length)
    })
    .catch(err => {
      reject(err)
      callback(err)
    })
  })

  promise.then(len => this.emit('linsertAfter', key, pivot, value, len))


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
  let value = null

  const promise = new Promise((resolve, reject) => {
    
  this.rpop(src)
    .then(_ => this.lpush(dest, (value = _)))
    .then(length => {
      resolve([value, length])
      callback(null, value, length)
    }, err => {
      callback(err)
      reject(err)
    })
  })

  promise.then(([value, len]) => this.emit('rpoplpush', src, dest, value, len))


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
  let value = null

  const promise = new Promise((resolve, reject) => {
  this.lpop(src)
    .then(_ => this.rpush(dest, (value = _)))
    .then(length => {
      resolve(value, length)
      callback(null, value, length)
    }, err => {
      callback(err)
      reject(err)
    })
  })

  promise.then((value, len) => this.emit('lpoprpush', src, dest, value, len))


  return promise
}
