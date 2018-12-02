import { Base, TYPES } from './base'

export default class MinHash extends Base {

  async hset(key: string, field: string, value: any) {
    const exists = await this.exists(key)
    const body = exists ? await this.get(key) : {}

    body[field] = value

    await this.set(key, body)
    await this._setType(key, TYPES.hash)

    this.emit('hset', key, field, value)

    return key
  }

  async hsetnx(key: string, field: string, value: any) {
    const exists = await this.hexists(key, field)
    if (exists) {
      throw new Error('The field of the hash is exists')
    }

    await this.hset(key, value, value)
    return key
  }

  async hmset(key: string, doc: { [field: string]: any }) {
    
    const results: string[] = []

    for (const field of Object.keys(doc)) {
      results.push(await this.hset(key, field, doc[field]))
    }

    return results
  }

  async hget(key: string, field: string) {
    const exists = await this.hexists(key, field)
    if (!exists) {
      throw new Error('no such field')
    }

    const data = await this.get(key)
    const value = data[field]

    this.emit('hget', key, field, value)

    return value
  }

  async hmget(key: string, fields: string[]) {
    return await Promise.all(fields.map(field => this.hget(key, field)))
  }

  async hgetall(key: string) {
    const isHash = await this.is(key, TYPES.hash)
    
    if (!isHash) {
      throw new TypeError('type wrong')
    }

    return await this.get(key) as { [field: string]: any }
  }

  async hdel(key: string, field: string) {
    const exists = await this.hexists(key, field)

    if (!exists) {
      throw new Error('no such key')
    }

    const data = await this.hgetall(key)

    const removed = data[field]
    delete data[field]

    await this.set(key, data)

    this.emit('hdel', key, field, removed)

    return removed
  }

  async hlen(key: string) {
    try {
      const data = await this.hgetall(key)
      return Object.keys(data).length
    } catch(err) {
      return 0
    }
  }

  async hkeys(key: string) {
    try {
      const data = await this.hgetall(key)
      return Object.keys(data)
    } catch(err) {
      return []
    }
  }

  async hexists(key: string, field: string) {
    const keyExists = await this.exists(key)
    if (!keyExists) {
      return false
    }

    const isHash = await this.is(key, TYPES.hash)
    if (!isHash) {
      return false
    }

    const body: { [key: string]: any }  = await this.get(key)
    return body.hasOwnProperty(field)
  }

  async hincr(key: string, field: string) {
    return this.hincrby(key, field, 1)
  }

  async hincrby(key: string, field: string, increment: number) {
    const exists = await this.hexists(key, field)
    const currValue = parseFloat(exists ? await this.hget(key, field) : 0)

    if (isNaN(currValue)) {
      throw new TypeError('type wrong')
    }

    await this.hset(key, field, currValue + increment)

    this.emit('hincrby', key, field, currValue + increment)

    return currValue + increment
  }

  async hincrbyfloat(key: string, field: string, increment: number) {
    return await this.hincrby(key, field, increment)
  }

  async hdecr(key: string, field: string) {
    return await this.hdecrby(key, field, 1)
  }

  async hdecrby(key: string, field: string, decrement: number) {
    const exists = await this.hexists(key, field)
    const currValue = parseFloat(exists ? await this.hget(key, field) : 0)

    if (isNaN(currValue)) {
      throw new TypeError('type wrong')
    }

    await this.hset(key, field, currValue - decrement)

    this.emit('hincrby', key, field, currValue - decrement)

    return currValue - decrement
  }

  async hdecrbyfloat(key: string, field: string, decrement: number) {
    return await this.hdecrby(key, field, decrement)
  }

}