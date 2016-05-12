import utils from './utils.js'
import { Promise } from './events.js'

const noop = utils.noop

const min = {}
export default min

/******************************
**         Sorted Set        **
******************************/
min.zadd = function(key, score, member, callback = noop) {
  const promise = new Promise(noop)

  promise.then(len => this.emit('zadd', key, score, member, len))

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        const score2HashsMap = {}
        score2HashsMap[score] = [ 0 ]

        return this.set(key, {
          // members
          ms: [ member ],
          // mapping hash to score
          hsm: { 0: score },
          // mapping score to hash
          shm: score2HashsMap
        })
      }
    })
    .then(_key => {
      if ('string' === typeof _key) {
        this._keys[key] = 4

        promise.resolve(1, 1)
        callback(null, 1, 1)
      } else if ('object' === typeof _key) {
        const data = _key

        if (data.ms.indexOf(member) >= 0) {
          const len = data.ms.length

          promise.resolve(0, len)
          return callback(null, 0, len)
        }

        // new hash
        const hash = data.ms.length
        // append the new member
        data.ms.push(member)

        // mapping hash to score
        data.hsm[hash] = score

        // mapping score to hash
        if (Array.isArray(data.shm[score])) {
          data.shm[score].push(hash)
        } else {
          data.shm[score] = [ hash ]
        }

        return this.set(key, data)
      }
    })
    .then(() => this.get(key))
    .then(data => {
      this._keys[key] = 4

      var len = data.ms.length

      promise.resolve(1, len)
      callback(null, 1, len)
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.zcard = function(key, callback = noop) {
  const promise = new Promise(noop)

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        const err = new Error('no such key')

        promise.reject(err)
        callback(err)
      }
    })
    .then(data => {
      const len = data.ms.filter(Boolean).length

      promise.resolve(len)
      callback(null, len)
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.zcount = function(key, min, max, callback = noop) {
  const promise = new Promise(noop)

  promise.then(len => this.emit('zcount', key, min, max, value, len))

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        const err = new Error('no such key')

        promise.reject(err)
        callback(err)
      }
    })
    .then(data => {
      const hashs = Object
        .keys(data.shm)
        .filter(score => (min <= score && score <= max))
        .map(score => data.shm[score])

      const len = hashs
        .map(hash => hash.length)
        .reduce((a, b) => a + b)

      promise.resolve(len)
      callback(null, len)
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.zrem = function(key, ...members) {
  const promise = new Promise(noop)
  let callback = noop

  if (members[members.length - 1] instanceof Function) {
    callback = members.pop()
  }

  promise.then(removeds => this.emit('zrem', key, members, removeds))

  let removeds = 0

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        var err = new Error('no such key')

        promise.reject(err)
        callback(err)
      }
    })
    .then(data => {
      const p = new Promise(noop)


      for (let hash of members) {
        let i = data.ms.indexOf(hash)

        if (i >= 0) {
          delete data.ms[i]
          const score = data.hsm[i]
          delete data.hsm[i]

          const ii = data.shm[String(score)].indexOf(i)
          if (ii >= 0) {
            data.shm[String(score)].splice(ii, 1)
          }

          removeds++
        }
      }

      p.resolve(data)

      return p
    })
    .then(data => this.set(key, data))
    .then(_ => {
      promise.resolve(removeds)
      callback(null, removeds)
    })
    .catch(err => {
      promise.reject(err)
      callback(null, err)
    })

  return promise
}

min.zscore = function(key, member, callback = noop) {
  const promise = new Promise(noop)

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        const err = new Error('no such key')

        promise.reject(err)
        callback(err)
      }
    })
    .then(data => {
      const hash = data.ms.indexOf(member)

      if (hash >= 0) {
        const score = data.hsm[hash]

        promise.resolve(score)
        callback(null, score)
      } else {
        const err = new Error('This member does not be in the set')

        promise.reject(err)
        callback(err)
      }
    })

  return promise
}

min.zrange = function(key, min, max, callback = noop) {
  const promise = new Promise(noop)

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        const err = new Error('no such key')

        promise.reject(err)
        callback(err)
      }
    })
    .then(data => {
      const hashs = Object.keys(data.shm)
        .map(s => parseFloat(s))
        .sort()
        .filter(score => (min <= score && score <= max))
        .map(score => data.shm[score])

      const members = hashs
        .map(hash => hash.map(row => data.ms[row]))
        .reduce((a, b) => a.concat(b))

      promise.resolve(members)
      callback(null, members)
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  promise.withScore = (callback = noop) => {
    const p = new Promise(noop)

    promise
      .then(members => {
        const multi = this.multi()

        members.forEach(member => multi.zscore(key, member))

        multi.exec((err, replies) => {
          if (err) {
            callback(err)
            return p.reject(err)
          }

          const rtn = replies.map((reply, ii) => ({
            member: members[ii],
            score: reply
          }))

          p.resolve(rtn)
          callback(null, rtn)
        })
      })

    return p
  }

  return promise
}

min.zrevrange = function(key, min, max, callback = noop) {
  const promise = new Promise(noop)

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.get(key)
      } else {
        const err = new Error('no such key')

        promise.reject(err)
        callback(err)
      }
    })
    .then(data => {
      const hashs = Object.keys(data.shm)
        .map(s => parseFloat(s))
        .sort((a, b) => b > a)
        .filter(score => (min <= score && score <= max))
        .map(score => data.shm[score])

      const members = hashs
        .map(hash => hash.map(row => data.ms[row]))
        .reduce((a, b) => a.concat(b))

      promise.resolve(members)
      callback(null, members)
    }, err => {
      promise.reject(err)
      callback(err)
    })

  promise.withScore = (callback = noop) => {
    const p = new Promise(noop)

    promise
      .then(members => {
        const multi = this.multi()

        members.forEach(member => multi.zscore(key, member))

        multi.exec((err, replies) => {
          if (err) {
            callback(err)
            return p.reject(err)
          }

          const rtn = replies.map((reply, ii) => ({
            member: members[ii],
            score: reply
          }))

          p.resolve(rtn)
          callback(null, rtn)
        })
      })

    return p
  }

  return promise
}

min.zincrby = function(key, increment, member, callback = noop) {
  const promise = new Promise(noop)

  promise.then(score => this.emit('zincrby', key, increment, member, score))

  let newScore = null

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.zscore(key, member)
      } else {
        this.zadd(key, 0, member, callback)
          .then(promise.resolve.bind(promise),
            promise.reject.bind(promise))
      }
    })
    .then(_ => this.get(key))
    .then(data => {
      const hash = data.ms.indexOf(member)
      const score = data.hsm[hash]

      newScore = score + increment

      const ii = data.shm[score].indexOf(hash)
      data.shm[score].splice(ii, 1)

      data.hsm[hash] = newScore
      if (data.shm[newScore]) {
        data.shm[newScore].push(hash)
      } else {
        data.shm[newScore] = [ hash ]
      }

      return this.set(key, data)
    })
    .then(_ => {
      promise.resolve(newScore)
      callback(null, newScore)
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.zdecrby = function(key, decrement, member, callback = noop) {
  const promise = new Promise(noop)

  promise.then(score => this.emit('zdecrby', keys, decrement, member, score))

  let newScore = null

  this.exists(key)
    .then(exists => {
      if (exists) {
        return this.zscore(key, member)
      } else {
        const err = new Error('no such key')

        promise.reject(err)
        callback(err)
      }
    })
    .then(_ => this.get(key))
    .then(data => {
      const hash = data.ms.indexOf(member)
      const score = data.hsm[hash]

      newScore = score - decrement

      const ii = data.shm[score].indexOf(hash)
      data.shm[score].splice(ii, 1)

      data.hsm[hash] = newScore
      if (data.shm[newScore]) {
        data.shm[newScore].push(hash)
      } else {
        data.shm[newScore] = [ hash ]
      }

      return this.set(key, data)
    })
    .then(_ => {
      promise.resolve(newScore)
      callback(null, newScore)
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.zrank = function(key, member, callback = noop) {
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
      const scores = Object.keys(data.shm).map(s => parseFloat(s)).sort()
      const score = parseFloat(data.hsm[data.ms.indexOf(member)])

      const rank = scores.indexOf(score) + 1

      promise.resolve(rank)
      callback(null, rank)
    })
    .catch(err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}

min.zrevrank = function(key, member, callback = noop) {
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
      const scores = Object.keys(data.shm).map(s => parseFloat(s)).sort()
      const score = parseFloat(data.hsm[data.ms.indexOf(member)])

      const rank = scores.reverse().indexOf(score) + 1

      promise.resolve(rank)
      callback(null, rank)
    }, err => {
      promise.reject(err)
      callback(err)
    })

  return promise
}
