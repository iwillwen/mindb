import { Base, TYPES } from './base'
import { arrayUnique, arrayInter, arrayDiff } from './utils'

export default class MinSet extends Base {

  async sadd(key: string, ...members: any[]) {
    const exists = await this.exists(key)

    const isSet = exists ? await this.is(key, TYPES.set) : false
    if (exists && !isSet) {
      throw new TypeError('the key is not a set')
    }

    const data = exists ? await this.get(key) : []
    let added = 0

    for (const member of arrayUnique(members)) {
      if (data.indexOf(member) < 0) {
        data.push(member)
        added++
      }
    }

    await this.set(key, data)
    await this._setType(key, TYPES.set)
    
    this.emit('sadd', key, data.length)

    return added
  }

  async srem(key: string, ...members: any[]) {
    const exists = await this.exists(key)
    if (!exists) {
      throw new Error('no such key')
    }

    const isSet = exists ? await this.is(key, TYPES.set) : false
    if (exists && !isSet) {
      throw new TypeError('the key is not a set')
    }

    let removeds = 0

    const data = await this.get(key)

    for (const curr of arrayUnique(members)) {
      const index = data.indexOf(curr)
      if (index >= 0) {
        data.splice(index, 1)
        removeds++
      }
    }

    await this.set(key, data)

    this.emit('srem', key, members, data.length)

    return removeds
  }

  async smembers(key: string) {
    const exists = await this.exists(key)
    if (!exists) {
      throw new Error('no such key')
    }

    const isSet = exists ? await this.is(key, TYPES.set) : false
    if (exists && !isSet) {
      throw new TypeError('the key is not a set')
    }

    return await this.get(key)
  }

  async sismember(key: string, value: any) {
    const exists = await this.exists(key)
    if (!exists) {
      throw new Error('no such key')
    }

    const isSet = exists ? await this.is(key, TYPES.set) : false
    if (exists && !isSet) {
      throw new TypeError('the key is not a set')
    }

    const members = await this.get(key)

    return members.indexOf(value) >= 0
  }

  async scard(key: string) {
    const members = await this.smembers(key)

    return members.length
  }

  async smove(src: string, dest: string, member: any) {
    const exists = await this.exists(src)
    if (!exists) {
      throw new Error('no such key')
    }

    const isSet = exists ? await this.is(src, TYPES.set) : false
    if (exists && !isSet) {
      throw new TypeError('the key is not a set')
    }

    const isMember = await this.sismember(src, member)
    if (!isMember) {
      throw new Error('no such member')
    }

    await this.sadd(dest, member)
    
    this.emit('smove', src, dest, member)

    return 1
  }

  async srandmember(key: string) {
    const exists = await this.exists(key)
    if (!exists) {
      return null
    }

    const isSet = exists ? await this.is(key, TYPES.set) : false
    if (exists && !isSet) {
      throw new TypeError('the key is not a set')
    }

    const members = await this.smembers(key)
    const index = Math.floor(Math.random() * members) || 0

    const member = members[index]

    return member
  }

  async spop(key: string) {
    const exists = await this.exists(key)
    if (!exists) {
      return null
    }

    const isSet = exists ? await this.is(key, TYPES.set) : false
    if (exists && !isSet) {
      throw new TypeError('the key is not a set')
    }

    const member = await this.srandmember(key)
    await this.srem(key, member)

    this.emit('spop', key, member)

    return member
  }

  async sunion(...keys: string[]) {
    const members: any[] = []

    for (const key of keys) {
      try {
        const subMembers = await this.smembers(key)
        members.push(...subMembers)
      } catch(err) {
        // Skip
      }
    }

    return arrayUnique(members)
  }

  async sunionstore(dest: string, ...keys: string[]) {
    const members = await this.sunion(...keys)

    const length = await this.sadd(dest, ...members)

    this.emit('sunionstore', dest, keys, length, members)

    return length
  }

  async sinter(...keys: string[]) {
    const membersRows: any[][] = []

    for (const key of keys) {
      try {
        const subMembers = await this.smembers(key)
        membersRows.push(subMembers)
      } catch(err) {
        // Skip
      }
    }

    const members = membersRows.reduce((leftMembers, rightMembers) => arrayInter(leftMembers, ...rightMembers))

    return members
  }

  async sinterstore(dest: string, ...keys: string[]) {
    const members = await this.sinter(...keys)

    const length = await this.sadd(dest, ...members)

    this.emit('sinterstore', dest, keys, length, members)

    return length
  }

  async sdiff(...keys: string[]) {
    const membersRows: any[][] = []

    for (const key of keys) {
      try {
        const subMembers = await this.smembers(key)
        membersRows.push(subMembers)
      } catch(err) {
        // Skip
      }
    }

    const members = membersRows.reduce((leftMembers, rightMembers) => arrayDiff(leftMembers, ...rightMembers))

    return members
  }

  async sdiffstore(dest: string, ...keys: string[]) {
    const members = await this.sdiff(...keys)

    const length = await this.sadd(dest, ...members)

    this.emit('sdiffstore', dest, keys, length, members)

    return length
  }

}