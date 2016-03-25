import utils from './utils.js'
import { Promise } from './events.js'

const noop = utils.noop

const min = {}
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

    const keys = Object.getOwnPropertyNames(_min)

    for (let i = 0; i < keys.length; i++) {
      const prop = keys[i]

      if ('function' === typeof _min[prop]) {
        (method => {
          this[method] = (...args) => {
            this.queue.push({
              method: method,
              args: args
            })

            return this
          }
        })(prop)
      }
    }
  }

  exec(callback = noop) {
    const promise = new Promise()
    const results = [];

    const loop = task => {
      if (task) {
        this.min[task.method].apply(this.min, task.args)
          .then((...args) => {
            if (args.length > 1) {
              results.push(args)
            } else {
              results.push(args[0])
            }
            loop(this.queue.shift())
          })
          .catch(err => {
            promise.reject(err)
            callback(err, results)
          })
      } else {
        promise.resolve(results)
        callback(null, results)
      }
    }

    loop(this.queue.shift())

    return promise
  }
}

min.multi = function() {
  return new Multi(this)
}

class Sorter {
  constructor(key, _min, callback = noop) {
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

    const run = _ => {
      this.min.exists(key)
        .then(exists => {
          if (exists) {
            return this.min.get(key)
          } else {
            return new Error('no such key')
          }
        })
        .then(value => {
          const p = new Promise(noop)

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
        })
        .catch(err => {
          this.promise.reject(err)
          this.callback(err)
        })
    }

    // Promise Shim
    const loop = methods => {
      var curr = methods.shift()

      if (curr) {
        this[curr] = (...args) => {
          return this.promise[curr].apply(this.promise, args)
        }

        loop(methods)
      } else {
        run()
      }
    }

    loop(['then', 'done'])
  }

  by(pattern, callback = noop) {
    const src2ref = {}
    let aviKeys = []

    // TODO: Sort by hash field
    let field = null

    if (pattern.indexOf('->') > 0) {
      const i = pattern.indexOf('->')
      field = pattern.substr(i + 2)
      pattern = pattern.substr(0, pattern.length - i)
    }

    this.min.keys(pattern)
      .then(keys => {
        const filter = new RegExp(pattern
          .replace('?', '(.)')
          .replace('*', '(.*)'))

        for (let i = 0; i < keys.length; i++) {
          const symbol = filter.exec(keys[i])[1]

          if (this.result.indexOf(symbol) >= 0) {
            src2ref[keys[i]] = symbol
          }
        }

        aviKeys = Object.keys(src2ref)

        return this.min.mget(aviKeys.slice())
      })
      .then(values => {
        const reverse = {}

        for (let i = 0; i < values.length; i++) {
          reverse[JSON.stringify(values[i])] = aviKeys[i]
        }

        values.sort(this.sortFn)

        const newResult = values
          .map(value => reverse[JSON.stringify(value)])
          .map(key => src2ref[key])

        this.result = newResult

        this.promise.resolve(newResult)
        callback(null, newResult)
      })
      .catch(err => {
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

    const handle = result => {
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

    const handle = result => {
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
    const handle = (_result) => {
      const result = []

      const loop = res => {
        const curr = res.shift()

        if (!utils.isUndefined(curr)) {
          if (Array.isArray(curr)) {
            const key = this.keys[curr[0]]

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
            const key = this.keys[curr]

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
      }

      loop(_result.slice())
    }

    if (this.promise.ended) {
      handle(this.result)
    } else {
      this.promise.once('resolve', handle)
    }

    return this
  }

  hget(pattern, field, callback = noop) {
    const handle = _result => {
      const result = []

      const loop = res => {
        const curr = res.shift()

        if (!utils.isUndefined(curr)) {
          if (Array.isArray(curr)) {
            const key = this.keys[curr[0]]

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
            const key = this.keys[curr]

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
      }

      loop(_result.slice())
    }

    if (this.promise.ended) {
      handle(this.result)
    } else {
      this.promise.once('resolve', handle)
    }

    return this
  }

  limit(offset, count, callback = noop) {
    const handle = result => {
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
      const rtn = []

      for (let i = 0; i < this.result.length; i++) {
        for (let j = 0; j < this.result[i].length; j++) {
          rtn.push(this.result[i][j])
        }
      }

      this.result = rtn

      this.promise.resolve(rtn)
      callback(null, rtn)
    } else {
      this.promise.once('resolve', result => {
        const rtn = []

        for (let i = 0; i < result.length; i++) {
          for (let j = 0; j < result[i].length; j++) {
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
    const rtn = []

    this.parent.get('min_keys')
      .then(data => {
        data = JSON.parse(data)

        const keys = Object.keys(data)

        const scan = ii => {
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
        }

        scan(this.cursor)
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
  const scanner = new Scanner(cursor, null, -1, this)

  scanner.scan(callback)

  return scanner
}