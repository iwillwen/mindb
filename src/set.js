import utils from './utils.js'
import { Promise } from './events.js'

var noop = utils.noop

var min = {}
export default min

/******************************
**           Set             **
******************************/
min.sadd = function(key, ...members) {
  var promise = new Promise(noop)

  promise.then(len => this.emit('sadd', key, len))

  var added = 0

  if (!(members[members.length - 1] instanceof Function)) {
    var callback = noop
  } else {
    var callback = members.splice(members.length - 1, 1)[0]
  }

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        var data = utils.arrayUnique(members)

        return this.set(key, data)
      }
    })
    .then(_ => {
      if (Array.isArray(arguments[0])) {
        var data = arguments[0]

        for (var curr of members) {
          if (data.indexOf(curr) >= 0) {
            return
          } else {
            data.push(curr)
            added++
          }
        }

        return this.set(key, data)
      } else if (typeof arguments[0] === 'string') {
        added += members.length

        this._keys[key] = 3

        promise.resolve(added)
        callback(null, added)
      }
    })
    .then(_ => {
      this._keys[key] = 3

      promise.resolve(added)
      callback(null, added)
    }, err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.srem = function(key, ...members) {
  var promise = new Promise(noop)
  var callback = noop

  promise.then(len => this.emit('srem', key, members, len))

  var removeds = 0

  if ((members[members.length - 1] instanceof Function)) {
    callback = members.pop()
  }

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        return new Error('no such key')
      }
    })
    .then(data => {
      for (var curr of members) {
        var i = data.indexOf(curr)
        if (i >= 0) {
          data.splice(i, 1)
          removeds++
        }
      }

      return this.set(key, data)
    })
    .then(_ => {

      this._keys[key] = 3

      promise.resolve(removeds)
      callback(null, removeds)
    }, err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.smembers = function(key, callback = noop) {
  var promise = new Promise(noop)

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        return new Error('no such key')
      }
    })
    .then(members => {
      promise.resolve(members)
      callback(null, members)
    }, err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.sismember = function(key, value, callback = noop) {
  var promise = new Promise(noop)

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        return new Error('no such key')
      }
    })
    .then(members => {
      var res = members.indexOf(value) >= 0 ? 1 : 0

      promise.resolve(res)
      callback(null, res)
    }, err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.scard = function(key, callback = noop) {
  var promise = new Promise(noop)

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        return new Error('no such key')
      }
    })
    .then(data => {
      var length = data.length

      promise.resolve(length)
      callback(null, length)
    }, err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.smove = function(src, dest, member, callback = noop) {
  var promise = new Promise(noop)

  promise.then(ok => this.emit('smove', src, dest, member, ok))

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.sismember(src, member)
      } else {
        return new Error('no such key')
      }
    })
    .then(isMember => {
      if (isMember) {
        return this.srem(src, member)
      } else {
        return new Error('no such member')
      }
    })
    .then(_ => {
      return this.sismember(dest, member)
    })
    .then(isMember => {
      if (!isMember) {
        return this.sadd(dest, member)
      } else {

        this._keys[key] = 3

        promise.resolve(0)
        callback(null, 0)
      }
    })
    .then(_ => {
      this._keys[key] = 3
      promise.resolve(1)
      callback(null, 1)
    }, err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.srandmember = function(key, callback = noop) {
  var promise = new Promise(noop)

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        promise.resolve(null)
        callback(null, null)
      }
    })
    .then(members => {
      var index = Math.floor(Math.random() * members.length) || 0

      var member = members[index]

      promise.resolve(member)
      callback(null, member)
    }, err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.spop = function(key, callback = noop) {
  var promise = new Promise(noop)

  promise.then(value => this.emit('spop', key, value))

  var member = null

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.srandmember(key)
      } else {
        promise.resolve(null)
        callback(null, null)
      }
    })
    .then(_member => {
      member = _member

      return this.srem(key, member)
    })
    .then(_ => {
      promise.resolve(member)
      callback(null, member)
    }, err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.sunion = function(...keys) {
  var promise = new Promise(noop)
  var callback = noop
  var loop = null

  if ((keys[keys.length - 1] instanceof Function)) {
    callback = keys.pop()
  }

  var members = []

  (loop = index => {
    var curr = keys[index]

    if (curr) {
      this.exists(curr)
        .then(exists => {
          if (exists) {
            return this.get(curr)
          } else {
            loop(++index)
          }
        })
        .then(data => {
          if (Array.isArray(data)) {
            members = members.concat(data)
          }

          loop(++index)
        }, err => {
          promise.reject(err)
          return callback(err)
        })
    } else {
      members = utils.arrayUnique(members)
      promise.resolve(members)
      callback(null, members)
    }
  })(0)

  return promise
}

min.sunionstore = function(dest, ...keys) {
  var promise = new Promise(noop)
  var callback = noop

  promise.then(([length, members]) => this.emit('sunionstore', dest, keys, length, members))

  if ((keys[keys.length - 1] instanceof Function)) {
    callback = keys.pop()
  }

  var members = null

  this.sunion(keys)
    .then(_members => {
      members = _members

      return this.exists(dest)
    })
    .then(exists => {
      if (exists) {
        return this.del(dest)
      } else {
        return this.sadd(dest, members)
      }
    })
    .then(length => {
      if (typeof length == 'number') {
        promise.resolve([length, members])
        callback(null, length, members)
      } else {
        return this.sadd(dest, members)
      }
    })
    .then(length => {
      promise.resolve(length, members)
      callback(null, length, members)
    }, err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.sinter = function(...keys) {
  var promise = new Promise(noop)
  var callback = noop
  var loop = null

  if ((keys[keys.length - 1] instanceof Function)) {
    callback = keys.pop()
  }

  var memberRows = []

  (loop = index => {
    var curr = keys[index]

    if (curr) {
      this.exists(curr)
        .then(exists => {
          if (exists) {
            return this.get(curr)
          } else {
            loop(++index)
          }
        })
        .then(data => {
          if (Array.isArray(data)) {
            memberRows.push(data)
          }

          loop(++index)
        }, err => {
          promise.reject(err)
          return callback(err)
        })
    } else {
      var members = utils.arrayInter.apply(utils, memberRows)

      promise.resolve(members)
      callback(null, members)
    }
  })(0)

  return promise
}

min.sinterstore = function(dest, ...keys) {
  var promise = new Promise(noop)
  var callback = noop

  if ((keys[keys.length - 1] instanceof Function)) {
    callback = keys.pop()
  }

  var members = null

  this.sinter.apply(this, keys)
    .then(_members => {
      members = _members

      return this.exists(dest)
    })
    .then(exists => {
      if (exists) {
        return this.del(dest)
      } else {
        members.unshift(dest)
        return this.sadd.apply(this, members)
      }
    })
    .then(key => {
      if (typeof key == 'string') {
        promise.resolve(members.length, members)
        callback(null, members.length, members)
      } else {
        return this.sadd(dest, members)
      }
    })
    .then(_ => {
      promise.resolve(members.length, members)
      callback(null, members.length, members)
    }, err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.sdiff = function(...keys) {
  var promise = new Promise(noop)
  var callback = noop
  var loop = null

  if ((keys[keys.length - 1] instanceof Function)) {
    callback = keys.pop()
  }

  var memberRows = []

  (loop = index => {
    var curr = keys[index]

    if (curr) {
      this.exists(curr)
        .then(exists => {
          if (exists) {
            return this.get(curr)
          } else {
            loop(++index)
          }
        })
        .then(data => {
          if (Array.isArray(data)) {
            memberRows.push(data)
          }

          loop(++index)
        }, err => {
          promise.reject(err)
          return callback(err)
        })
    } else {
      var members = utils.arrayDiff.apply(utils, memberRows)

      promise.resolve(members)
      callback(null, members)
    }
  })(0)

  return promise
}

min.sdiffstore = function(dest, ...keys) {
  var promise = new Promise(noop)
  var callback = noop

  if ((keys[keys.length - 1] instanceof Function)) {
    callback = keys.pop()
  }

  var members = null

  this.sdiff(keys)
    .then(_members => {
      members = _members

      return this.exists(dest)
    })
    .then(exists => {
      if (exists) {
        return this.del(dest)
      } else {
        return this.sadd(dest, members)
      }
    })
    .then(length => {
      if (typeof length == 'number') {
        promise.resolve(length, members)
        callback(null, length, members)
      } else {
        return this.sadd(dest, members)
      }
    })
    .then(length => {
      promise.resolve(length, members)
      callback(null, length, members)
    }, err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}