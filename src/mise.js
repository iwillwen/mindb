import utils from './utils.js'
import { Promise } from './events.js'

var noop = utils.noop

var min = {}
export default min

/******************************
**            Mise           **
******************************/
class Multi {
  constructor(_min) {
    this.queue = []
    this.last = null
    this.state = 0
    this.min = _min

    var keys = Object.getOwnPropertyNames(_min)

    for (var i = 0; i < keys.length; i++) {
      var prop = keys[i]

      if ('function' === typeof _min[prop]) {
        (method => {
          this[method] = () => {
            this.queue.push({
              method: method,
              args: arguments
            })

            return this
          }
        })(prop)
      }
    }
  }

  exec(callback = noop) {
    var promise = new Promise()
    var results = []
    var loop = null

    (loop = task => {
      if (task) {
        this.min[task.method].apply(this.min, task.args)
          .then(_ => {
            results.push(arguments)
            loop(this.queue.shift())
          }, err => {
            promise.reject(err)
            callback(err, results)
          })
      } else {
        promise.resolve(results)
        callback(null, results)
      }
    })(this.queue.shift())

    return promise
  }
}

min.multi = () => {
  return new Multi(this)
}

class Sorter {
  constructor(key, _min, callback = noop) {
    var loop = null

    this.min = _min
    this.callback = callback
    this.result = []
    this.keys = {}
    this.promise = new Promise(noop)
    this.sortFn = (a, b) => {
      if (utils.isNumber(a) && utils.isNumber(b)) {
        return a - b
      } else {
        return JSON.stringify(a) > JSON.stringify(b)
      }
    }

    var run = _ => {
      this.min.exists(key)
        .then(exists => {
          if (exists) {
            return this.min.get(key)
          } else {
            return new Error('no such key')
          }
        })
        .then(value => {
          var p = new Promise(noop)

          switch (true) {
            case Array.isArray(value):
              p.resolve(value)
              break
            case (value.ms && Array.isArray(value.ms)):
              p.resolve(value.ms)
              break
            
            default:
              return new Error('content type wrong')
          }

          return p
        })
        .then(data => {
          this.result = data.sort(this.sortFn)

          this.result.forEach(chunk => {
            this.keys[chunk] = chunk
          })

          this.promise.resolve(this.result)
          this.callback(null, this.result)
        }, err => {
          this.promise.reject(err)
          this.callback(err)
        })
    }

    // Promise Shim
    (loop = methods => {
      var curr = methods.shift()

      if (curr) {
        this[curr] = () => {
          return this.promise[curr].apply(this.promise, arguments)
        }

        loop(methods)
      } else {
        run()
      }
    })(['then', 'done'])
  }

  by(pattern, callback = noop) {
    var src2ref = {}
    var aviKeys = []

    // TODO: Sort by hash field
    var field = null

    if (pattern.indexOf('->') > 0) {
      var i = pattern.indexOf('->')
      field = pattern.substr(i + 2)
      pattern = pattern.substr(0, pattern.length - i)
    }

    this.min.keys(pattern)
      .then(keys => {
        var filter = new RegExp(pattern
          .replace('?', '(.)')
          .replace('*', '(.*)'))

        for (var i = 0; i < keys.length; i++) {
          var symbol = filter.exec(keys[i])[1]

          if (this.result.indexOf(symbol) >= 0) {
            src2ref[keys[i]] = symbol
          }
        }

        aviKeys = Object.keys(src2ref)

        return this.min.mget(aviKeys.slice())
      })
      .then(values => {
        var reverse = {}

        for (var i = 0; i < values.length; i++) {
          reverse[JSON.stringify(values[i])] = aviKeys[i]
        }

        values.sort(this.sortFn)

        var newResult = values
          .map(value => {
            return reverse[JSON.stringify(value)]
          })
          .map(key => {
            return src2ref[key]
          })

        this.result = newResult

        this.promise.resolve(newResult)
        callback(null, newResult)
      },
      err => {
        this.promise.reject(err)
        callback(err)
        this.callback(err)
      })
    
    return this
  }

  asc(callback = noop) {
    this.sortFn = (a, b) => {
      if (utils.isNumber(a) && utils.isNumber(b)) {
        return a - b
      } else {
        return JSON.stringify(a) > JSON.stringify(b); 
      }
    }

    var handle = result => {
      this.result = result.sort(this.sortFn)

      this.promise.resolve(this.result)
      callback(null, this.result)
    }

    if (this.promise.ended) {
      handle(this.result)
    } else {
      this.promise.once('resolve', handle)
    }

    return this
  }

  desc(callback = noop) {
    this.sortFn = (a, b) => {
      if (utils.isNumber(a) && utils.isNumber(b)) {
        return b - a
      } else {
        return JSON.stringify(a) < JSON.stringify(b); 
      }
    }

    var handle = result => {
      this.result = result.sort(this.sortFn)

      this.promise.resolve(this.result)
      callback(null, this.result)
    }

    if (this.promise.ended) {
      handle(this.result)
    } else {
      this.promise.once('resolve', handle)
    }

    return this
  }

  get(pattern, callback = noop) {
    var handle = (_result) => {
      var result = []
      var loop = null

      (loop = res => {
        var curr = res.shift()

        if (!utils.isUndefined(curr)) {
          if (Array.isArray(curr)) {
            var key = this.keys[curr[0]]

            this.min.get(pattern.replace('*', key))
              .then(value => {
                curr.push(value)
                result.push(curr)

                loop(res)
              }, err => {
                this.promise.reject(err)
                callback(err)
              })

          } else if (curr.substr || utils.isNumber(curr)) {
            var key = this.keys[curr]

            this.min.get(pattern.replace('*', key))
              .then(value => {
                result.push([ value ])
                if (value.substr || utils.isNumber(value)) {
                  this.keys[value] = key
                } else {
                  this.keys[JSON.stringify(value)] = key
                }

                loop(res)
              }, err => {
                this.promise.reject(err)
                callback(err)
              })
          }
        } else {
          this.result = result

          this.promise.resolve(result)
          callback(null, result)
        }
      })(_result.slice())
    }

    if (this.promise.ended) {
      handle(this.result)
    } else {
      this.promise.once('resolve', handle)
    }

    return this
  }

  hget(pattern, field, callback = noop) {
    var handle = _result => {
      var result = []
      var loop = null

      (loop = res => {
        var curr = res.shift()

        if (!utils.isUndefined(curr)) {
          if (Array.isArray(curr)) {
            var key = this.keys[curr[0]]

            this.min.hget(pattern.replace('*', key), field)
              .then(value => {
                curr.push(value)
                result.push(curr)

                loop(res)
              }, err => {
                this.promise.reject(err)
                callback(err)
              })

          } else if (curr.substr || utils.isNumber(curr)) {
            var key = this.keys[curr]

            this.min.hget(pattern.replace('*', key))
              .then(value => {
                result.push([ value ])
                if (value.substr || utils.isNumber(value)) {
                  this.keys[value] = key
                } else {
                  this.keys[JSON.stringify(value)] = key
                }

                loop(res)
              }, err => {
                this.promise.reject(err)
                callback(err)
              })
          }
        } else {
          this.result = result

          this.promise.resolve(result)
          callback(null, result)
        }
      })(_result.slice())
    }

    if (this.promise.ended) {
      handle(this.result)
    } else {
      this.promise.once('resolve', handle)
    }

    return this
  }

  limit(offset, count, callback = noop) {
    var handle = result => {
      this.result = result.splice(offset, count)

      this.promise.resolve(this.result)
      callback(null, this.result)
    }

    if (this.promise.ended) {
      handle(this.result)
    } else {
      this.promise.once('resolve', handle)
    }

    return this
  }

  flatten(callback = noop) {
    if (this.promise.ended) {
      var rtn = []

      for (var i = 0; i < this.result.length; i++) {
        for (var j = 0; j < this.result[i].length; j++) {
          rtn.push(this.result[i][j])
        }
      }

      this.result = rtn

      this.promise.resolve(rtn)
      callback(null, rtn)
    } else {
      this.promise.once('resolve', result => {
        var rtn = []

        for (var i = 0; i < result.length; i++) {
          for (var j = 0; j < result[i].length; j++) {
            rtn.push(result[i][j])
          }
        }

        this.result = rtn

        this.promise.resolve(rtn)
        callback(null, rtn)
      })
    }

    return this
  }

  store(dest, callback = noop) {
    if (this.promise.ended) {
      this.min.set(dest, this.result)
        .then(_ => {
          this.promise.resolve(this.result)
          callback(null, this.result)
        }, err => {
          this.promise.reject(err)
          callback(err)
        })
    } else {
      this.promise.once('resolve', result => {
        this.min.set(dest, result)
          .then(_ => {
            this.promise.resolve(result)
            callback(null, result)
          }, err => {
            this.promise.reject(err)
            callback(err)
          })
      })
    }

    return this
  }
}

min.sort = (key, callback = noop) => new Sorter(key, this, callback)

class Scanner {
  constructor(cursor, pattern, count, min) {
    pattern = pattern || '*'

    this.cursor = cursor || 0
    this.pattern = new RegExp(pattern.replace('*', '(.*)'))
    this.limit = count > -1 ? count : 10
    this.end = this.cursor

    this.parent = min
  }

  scan(callback = noop) {
    var rtn = []

    this.parent.get('min_keys')
      .then(data => {
        data = JSON.parse(data)
        var scan = null

        var keys = Object.keys(data)

        (scan = ii => {
          var key = keys[ii]

          if (key && this.pattern.test(key) && key !== 'min_keys') {
            rtn.push(key)

            if ((++this.end - this.cursor) >= this.limit) {
              return callback(null, rtn, this.end)
            }
          } else if (!key) {
            this.end = 0
            return callback(null, rtn, this.end)
          }

          return scan(++ii)
        })(this.cursor)
      }, err => {
        callback(err)
      })

    return this
  }

  match(pattern, callback = noop) {
    this.pattern = new RegExp(pattern.replace('*', '(.*)'))
    this.end = this.cursor

    return this.scan(callback)
  }

  count(count, callback = noop) {
    this.limit = count
    this.end = this.cursor

    return this.scan(callback)
  }
}

min.scan = (cursor, callback = noop) => {
  var scanner = new Scanner(cursor, null, -1, this)

  scanner.scan(callback)

  return scanner
}