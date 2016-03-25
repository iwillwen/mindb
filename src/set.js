import utils from './utils.js'
import { Promise } from './events.js'

const noop = utils.noop

const min = {}
export default min

/******************************
**           Set             **
******************************/
min.sadd = function(key, ...members) {
  const promise = new Promise(noop)

  promise.then(len => this.emit('sadd', key, len))

  let added = 0

  let callback = noop

  if ((members[members.length - 1] instanceof Function)) {
    callback = members.pop()
  }

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        const data = utils.arrayUnique(members)

        return this.set(key, data)
      }
    })
    .then((...args) => {
      if (Array.isArray(args[0])) {
        const data = args[0]

        for (const curr of members) {
          if (data.indexOf(curr) >= 0) {
            continue
          } else {
            data.push(curr)
            added++
          }
        }

        return this.set(key, data)
      } else if (typeof args[0] === 'string') {
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
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.srem = function(key, ...members) {
  const promise = new Promise(noop)
  let callback = noop

  promise.then(len => this.emit('srem', key, members, len))

  let removeds = 0

  if ((members[members.length - 1] instanceof Function)) {
    callback = members.pop()
  }

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        throw new Error('no such key')
      }
    })
    .then(data => {
      for (const curr of members) {
        const i = data.indexOf(curr)
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
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.smembers = function(key, callback = noop) {
  const promise = new Promise(noop)

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        throw new Error('no such key')
      }
    })
    .then(members => {
      promise.resolve(members)
      callback(null, members)
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.sismember = function(key, value, callback = noop) {
  const promise = new Promise(noop)

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        throw new Error('no such key')
      }
    })
    .then(members => {
      const res = members.indexOf(value) >= 0 ? true : false

      promise.resolve(res)
      callback(null, res)
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.scard = function(key, callback = noop) {
  const promise = new Promise(noop)

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        throw new Error('no such key')
      }
    })
    .then(data => {
      const length = data.length

      promise.resolve(length)
      callback(null, length)
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.smove = function(src, dest, member, callback = noop) {
  const promise = new Promise(noop)

  promise.then(ok => this.emit('smove', src, dest, member, ok))

  this.exists(src)
    .then(exists => {
      if (exists) {
        return this.sismember(src, member)
      } else {
        throw new Error('no such key')
      }
    })
    .then(isMember => {
      if (isMember) {
        return this.srem(src, member)
      } else {
        throw new Error('no such member')
      }
    })
    .then(() => this.sadd(dest, member))
    .then(_ => {
      this._keys[dest] = 3
      promise.resolve(1)
      callback(null, 1)
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.srandmember = function(key, callback = noop) {
  const promise = new Promise(noop)

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
      const index = Math.floor(Math.random() * members.length) || 0

      const member = members[index]

      promise.resolve(member)
      callback(null, member)
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.spop = function(key, callback = noop) {
  const promise = new Promise(noop)

  promise.then(value => this.emit('spop', key, value))

  let member = null

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
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.sunion = function(...keys) {
  const promise = new Promise(noop)

  let callback = noop

  if ((keys[keys.length - 1] instanceof Function)) {
    callback = keys.pop()
  }

  var members = []

  const loop = index => {
    const curr = keys[index]

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
  }

  loop(0)

  return promise
}

min.sunionstore = function(dest, ...keys) {
  const promise = new Promise(noop)
  let callback = noop

  promise.then(([length, members]) => this.emit('sunionstore', dest, keys, length, members))

  if ((keys[keys.length - 1] instanceof Function)) {
    callback = keys.pop()
  }

  let members = null

  this.sunion(...keys)
    .then(_members => {
      members = _members

      return this.del(dest)
    })
    .then(() => this.sadd(dest, ...members))
    .then(length => {
      promise.resolve([length, members])
      callback(null, length, members)
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.sinter = function(...keys) {
  const promise = new Promise(noop)
  let callback = noop

  if ((keys[keys.length - 1] instanceof Function)) {
    callback = keys.pop()
  }

  const memberRows = []

  const loop = index => {
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
  }
  loop(0)

  return promise
}

min.sinterstore = function(dest, ...keys) {
  const promise = new Promise(noop)
  let callback = noop

  if ((keys[keys.length - 1] instanceof Function)) {
    callback = keys.pop()
  }

  promise.then(([length, members]) => this.emit('sinterstore', dest, keys, length, members))

  let members = null

  this.sinter(...keys)
    .then(_members => {
      members = _members

      return this.del(dest)
    })
    .then(() => this.sadd(dest, ...members))
    .then(length => {
      promise.resolve([members.length, members])
      callback(null, members.length, members)
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.sdiff = function(...keys) {
  const promise = new Promise(noop)
  let callback = noop

  if ((keys[keys.length - 1] instanceof Function)) {
    callback = keys.pop()
  }

  const memberRows = []

  const loop = index => {
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
        })
        .catch(err => {
          promise.reject(err)
          return callback(err)
        })
    } else {
      const members = utils.arrayDiff.apply(utils, memberRows)

      promise.resolve(members)
      callback(null, members)
    }
  }
  loop(0)

  return promise
}

min.sdiffstore = function(dest, ...keys) {
  const promise = new Promise(noop)
  let callback = noop

  if ((keys[keys.length - 1] instanceof Function)) {
    callback = keys.pop()
  }

  promise.then(([length, members]) => this.emit('sdiffstore', dest, keys, length, members))

  let members = null

  this.sdiff(...keys)
    .then(_members => {
      members = _members

      return this.del(dest)
    })
    .then(exists => this.sadd(dest, ...members))
    .then(length => {
      promise.resolve([length, members])
      callback(null, length, members)
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}
