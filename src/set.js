import utils from './utils.js'

const noop = utils.noop

const min = {}
export default min

/******************************
**           Set             **
******************************/
min.sadd = function(key, ...members) {
  const promise = new Promise((resolve, reject) => {

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

        resolve(added)
        callback(null, added)
      }
    })
    .then(_ => {
      this._keys[key] = 3

      resolve(added)
      callback(null, added)
    })
    .catch(err => {
      reject(err)
      callback(err)
    })
  })

  promise.then(len => this.emit('sadd', key, len))

  return promise
}

min.srem = function(key, ...members) {
  let callback = noop
  const promise = new Promise((resolve, reject) => {

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

      resolve(removeds)
      callback(null, removeds)
    })
    .catch(err => {
      reject(err)
      callback(err)
    })
  })

  promise.then(len => this.emit('srem', key, members, len))


  return promise
}

min.smembers = function(key, callback = noop) {
  return new Promise((resolve, reject) => {

    this.exists(key)
      .then(exists => {
        if (exists) {
          return this.get(key)
        } else {
          throw new Error('no such key')
        }
      })
      .then(members => {
        resolve(members)
        callback(null, members)
      })
      .catch(err => {
        reject(err)
        callback(err)
      })

  })
}

min.sismember = function(key, value, callback = noop) {
  return new Promise((resolve, reject) => {
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

      resolve(res)
      callback(null, res)
    })
    .catch(err => {
      reject(err)
      callback(err)
    })

  })
}

min.scard = function(key, callback = noop) {
  return new Promise((resolve, reject) => {

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

        resolve(length)
        callback(null, length)
      })
      .catch(err => {
        reject(err)
        callback(err)
      })

  })
}

min.smove = function(src, dest, member, callback = noop) {
  const promise = new Promise((resolve, reject) => {

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
      resolve(1)
      callback(null, 1)
    })
    .catch(err => {
      reject(err)
      callback(err)
    })
  })

  promise.then(ok => this.emit('smove', src, dest, member, ok))


  return promise
}

min.srandmember = function(key, callback = noop) {
  return new Promise((resolve, reject) => {

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        resolve(null)
        callback(null, null)
      }
    })
    .then(members => {
      const index = Math.floor(Math.random() * members.length) || 0

      const member = members[index]

      resolve(member)
      callback(null, member)
    })
    .catch(err => {
      reject(err)
      callback(err)
    })
  })
}

min.spop = function(key, callback = noop) {
  const promise = new Promise((resolve, reject) => {

  let member = null

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.srandmember(key)
      } else {
        resolve(null)
        callback(null, null)
      }
    })
    .then(_member => {
      member = _member

      return this.srem(key, member)
    })
    .then(_ => {
      resolve(member)
      callback(null, member)
    })
    .catch(err => {
      reject(err)
      callback(err)
    })
  })

  promise.then(value => this.emit('spop', key, value))


  return promise
}

min.sunion = function(...keys) {
  return new Promise((resolve, reject) => {

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
          reject(err)
          return callback(err)
        })
    } else {
      members = utils.arrayUnique(members)
      resolve(members)
      callback(null, members)
    }
  }

  loop(0)
  })
}

min.sunionstore = function(dest, ...keys) {
  const promise = new Promise((resolve, reject) => {

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
      resolve([length, members])
      callback(null, length, members)
    })
    .catch(err => {
      reject(err)
      callback(err)
    })
  })
  let callback = noop

  promise.then(([length, members]) => this.emit('sunionstore', dest, keys, length, members))

  return promise
}

min.sinter = function(...keys) {
  return new Promise((resolve, reject) => {

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
          reject(err)
          return callback(err)
        })
    } else {
      var members = utils.arrayInter.apply(utils, memberRows)
      resolve(members)
      callback(null, members)
    }
  }
  loop(0)
  })
}

min.sinterstore = function(dest, ...keys) {
  return new Promise((resolve, reject) => {

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
      resolve([members.length, members])
      callback(null, members.length, members)
    })
    .catch(err => {
      reject(err)
      callback(err)
    })

  })
}

min.sdiff = function(...keys) {
  return new Promise((resolve, reject) => {

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
          reject(err)
          return callback(err)
        })
    } else {
      const members = utils.arrayDiff.apply(utils, memberRows)

      resolve(members)
      callback(null, members)
    }
  }
  loop(0)
  })
}

min.sdiffstore = function(dest, ...keys) {
  return new Promise((resolve, reject) => {

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
      resolve([length, members])
      callback(null, length, members)
    })
    .catch(err => {
      reject(err)
      callback(err)
    })
  })
}
