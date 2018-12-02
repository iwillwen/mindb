import { Base, TYPES } from './base'

interface ISortedSetData {
  ms: any[]
  hsm: { [hash: number]: number },
  shm: { [score: number]: number[] }
}

export default class MinSet extends Base {

  async zadd(key: string, score: number, member: any) {
    const exists = await this.exists(key)

    const isZset = exists ? await this.is(key, TYPES.zset) : false
    if (exists && !isZset) {
      throw new TypeError('the key is not a sorted set')
    }

    const { ms: members, hsm, shm }: ISortedSetData = exists ? await this.get(key) : {
      // members
      ms: [],
      // mapping hash to score
      hsm: {},
      // mapping score to hash
      shm: {}
    }

    if (members.indexOf(member) >= 0) {
      return 0
    }

    // next hash
    const hash = members.length
    members.push(member)

    hsm[hash] = score

    if (!Array.isArray(shm[score])) {
      shm[score] = []
    }

    shm[score].push(hash)

    await this.set(key, {
      ms: members, shm, hsm
    })
    await this._setType(key, TYPES.zset)

    this.emit('zadd', key, score, member, members.length)

    return 1
  }

  async zcard(key: string) {
    const exists = await this.exists(key)
    if (!exists) {
      throw new Error('no such key')
    }

    const isZset = exists ? await this.is(key, TYPES.zset) : false
    if (exists && !isZset) {
      throw new TypeError('the key is not a sorted set')
    }

    const data: ISortedSetData = await this.get(key)

    return data.ms.length
  }

  async zcount(key: string, min: number, max: number) {
    const exists = await this.exists(key)
    if (!exists) {
      throw new Error('no such key')
    }

    const isZset = exists ? await this.is(key, TYPES.zset) : false
    if (exists && !isZset) {
      throw new TypeError('the key is not a sorted set')
    }

    const data: ISortedSetData = await this.get(key)

    const length = Object.keys(data.shm)
      .map(score => parseFloat(score))
      .filter(score => (min <= score && score <= max))
      .map(score => data.shm[score])
      .reduce((leftHashs, rightHashs) => leftHashs.concat(rightHashs))
      .length

    return length
  }

  async zrem(key: string, ...members: any[]) {
    const exists = await this.exists(key)
    if (!exists) {
      throw new Error('no such key')
    }

    const isZset = exists ? await this.is(key, TYPES.zset) : false
    if (exists && !isZset) {
      throw new TypeError('the key is not a sorted set')
    }

    const data: ISortedSetData = await this.get(key)

    let removeds = 0

    for (const member of members) {
      const i = data.ms.indexOf(member)

      if (i >= 0) {
        data.ms.splice(i, 1)
        const score = data.hsm[i]
        delete data.hsm[i]

        const ii = data.shm[score].indexOf(i)
        if (ii >= 0) {
          data.shm[score].splice(ii, 1)
        }

        removeds++
      }
    }

    await this.set(key, data)
    await this._setType(key, TYPES.zset)

    this.emit('zrem', key, members, removeds)

    return removeds
  }

  async zscore(key: string, member: any) {
    const exists = await this.exists(key)
    if (!exists) {
      throw new Error('no such key')
    }

    const isZset = exists ? await this.is(key, TYPES.zset) : false
    if (exists && !isZset) {
      throw new TypeError('the key is not a sorted set')
    }

    const data: ISortedSetData = await this.get(key)

    const hash = data.ms.indexOf(member)
    if (hash < 0) {
      throw new Error('This member does not be in the set')
    }

    return data.hsm[hash]
  }

  async zrange(key: string, min: number, max: number) {
    const exists = await this.exists(key)
    if (!exists) {
      throw new Error('no such key')
    }

    const isZset = exists ? await this.is(key, TYPES.zset) : false
    if (exists && !isZset) {
      throw new TypeError('the key is not a sorted set')
    }

    const data: ISortedSetData = await this.get(key)

    const hashs = Object.keys(data.shm)
      .map(score => parseFloat(score))
      .sort()
      .filter(score => (min <= score && score <= max))
      .map(score => data.shm[score])

    const members = hashs
      .map(hash => hash.map(row => data.ms[row]))
      .reduce((leftMembers, rightMembers) => leftMembers.concat(rightMembers))
    
    return members
  }

  async zrevrange(key: string, min: number, max: number) {
    const exists = await this.exists(key)
    if (!exists) {
      throw new Error('no such key')
    }

    const isZset = exists ? await this.is(key, TYPES.zset) : false
    if (exists && !isZset) {
      throw new TypeError('the key is not a sorted set')
    }

    const data: ISortedSetData = await this.get(key)

    const hashs = Object.keys(data.shm)
      .map(score => parseFloat(score))
      .sort((a, b) => b - a)
      .filter(score => (min <= score && score <= max))
      .map(score => data.shm[score])

    const members = hashs
      .map(hash => hash.map(row => data.ms[row]))
      .reduce((a, b) => a.concat(b))
    
    return members
  }

  async zincrby(key: string, increment: number, member: any) {
    const exists = await this.exists(key)
    if (!exists) {
      await this.zadd(key, 0, member)
    }

    const isZset = exists ? await this.is(key, TYPES.zset) : false
    if (exists && !isZset) {
      throw new TypeError('the key is not a sorted set')
    }

    const data: ISortedSetData = await this.get(key)

    const hash = data.ms.indexOf(member)
    let score = data.hsm[hash]

    const ii = data.shm[score].indexOf(hash)
    data.shm[score].splice(ii, 1)

    score += increment

    data.hsm[hash] = score
    if (!Array.isArray(data.shm[score])) {
      data.shm[score] = []
    }

    data.shm[score].push(hash)

    await this.set(key, data)
    await this._setType(key, TYPES.zset)

    this.emit('zincrby', key, increment, member, score)

    return score
  }

  async zdecrby(key: string, decrement: number, member: any) {
    const exists = await this.exists(key)
    if (exists) {
      throw new Error('no such key')
    }

    const isZset = exists ? await this.is(key, TYPES.zset) : false
    if (exists && !isZset) {
      throw new TypeError('the key is not a sorted set')
    }

    const data: ISortedSetData = await this.get(key)

    const hash = data.ms.indexOf(member)
    let score = data.hsm[hash]

    const ii = data.shm[score].indexOf(hash)
    data.shm[score].splice(ii, 1)

    score -= decrement

    data.hsm[hash] = score
    if (!Array.isArray(data.shm[score])) {
      data.shm[score] = []
    }

    data.shm[score].push(hash)

    await this.set(key, data)
    await this._setType(key, TYPES.zset)

    this.emit('zdecrby', key, decrement, member, score)

    return score
  }

  async zrank(key: string, member: any) {
    const exists = await this.exists(key)
    if (exists) {
      throw new Error('no such key')
    }

    const isZset = exists ? await this.is(key, TYPES.zset) : false
    if (exists && !isZset) {
      throw new TypeError('the key is not a sorted set')
    }

    const data: ISortedSetData = await this.get(key)

    const scores = Object.keys(data.shm).map(s => parseFloat(s)).sort()
    const score = parseFloat(data.hsm[data.ms.indexOf(member)] as any)

    const rank = scores.indexOf(score) + 1

    return rank
  }

  async zrevrank(key: string, member: any) {
    const exists = await this.exists(key)
    if (exists) {
      throw new Error('no such key')
    }

    const isZset = exists ? await this.is(key, TYPES.zset) : false
    if (exists && !isZset) {
      throw new TypeError('the key is not a sorted set')
    }

    const data: ISortedSetData = await this.get(key)

    const scores = Object.keys(data.shm).map(s => parseFloat(s)).sort()
    const score = parseFloat(data.hsm[data.ms.indexOf(member)] as any)

    const rank = scores.reverse().indexOf(score) + 1

    return rank
  }

}