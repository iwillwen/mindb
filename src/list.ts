import { Base, TYPES } from './base'

export default class MinList extends Base {

  async lpush(key: string, ...values: any[]) {
    const exists = await this.exists(key)
    const data: any[] = exists ? await this.get(key) : []

    const isList = exists ? await this.is(key, TYPES.list) : false
    if (exists && !isList) {
      throw new TypeError('the key is not a list')
    }

    data.unshift(...values)

    await this.set(key, data)
    await this._setType(key, TYPES.list)

    this.emit('lpush', key, values, data.length)

    return data.length
  }

  async lpushx(key: string, ...values: any[]) {
    const exists = await this.exists(key)
    if (!exists) {
      throw new Error('no such key')
    }

    const isList = exists ? await this.is(key, TYPES.list) : false
    if (exists && !isList) {
      throw new TypeError('the key is not a list')
    }

    const data: any[] = await this.get(key)
    if (!data || data.length <= 0) {
      throw new Error('the list is empty')
    }

    data.unshift(...values)
    await this.set(key, data)

    this.emit('lpushx', key, values, data.length)

    return data.length
  }

  async rpush(key: string, ...values: any[]) {
    const exists = await this.exists(key)
    const data: any[] = exists ? await this.get(key) : []

    const isList = exists ? await this.is(key, TYPES.list) : false
    if (exists && !isList) {
      throw new TypeError('the key is not a list')
    }

    data.push(...values)

    await this.set(key, data)
    await this._setType(key, TYPES.list)

    this.emit('lpush', key, values, data.length)

    return data.length
  }

  async rpushx(key: string, ...values: any[]) {
    const exists = await this.exists(key)
    if (!exists) {
      throw new Error('no such key')
    }

    const isList = exists ? await this.is(key, TYPES.list) : false
    if (exists && !isList) {
      throw new TypeError('the key is not a list')
    }

    const data: any[] = await this.get(key)
    if (!data || data.length <= 0) {
      throw new Error('the list is empty')
    }

    data.push(...values)
    await this.set(key, data)

    this.emit('lpushx', key, values, data.length)

    return data.length
  }

  async lpop(key: string) {
    const exists = await this.exists(key)
    if (!exists) {
      return null
    }

    const isList = await this.is(key, TYPES.list)
    if (!isList) {
      throw new TypeError('the key is not a list')
    }

    const data = await this.get(key)
    const value = data.shift()

    await this.set(key, data)

    this.emit('lpop', key, value)

    return value
  }

  async rpop(key: string) {
    const exists = await this.exists(key)
    if (!exists) {
      return null
    }

    const isList = await this.is(key, TYPES.list)
    if (!isList) {
      throw new TypeError('the key is not a list')
    }

    const data = await this.get(key)
    const value = data.pop()

    await this.set(key, data)

    this.emit('rpop', key, value)

    return value
  }

  async llen(key: string) {
    const exists = await this.exists(key)
    if (!exists) {
      return 0
    }

    const isList = await this.is(key, TYPES.list)
    if (!isList) {
      throw new TypeError('the key is not a list')
    }

    const data: any[] = await this.get(key)

    return data.length
  }

  async lrange(key: string, start: number, stop: number) {
    const exists = await this.exists(key)
    if (!exists) {
      return []
    }

    const isList = await this.is(key, TYPES.list)
    if (!isList) {
      throw new TypeError('the key is not a list')
    }

    const data: any[] = await this.get(key)

    if (stop < 0) {
      stop = data.length + stop
    }

    const values = data.slice(start, stop + 1)

    return values
  }

  async lrem(key: string, count: number, value: any) {
    const exists = await this.exists(key)
    if (!exists) {
      return 0
    }

    const isList = await this.is(key, TYPES.list)
    if (!isList) {
      throw new TypeError('the key is not a list')
    }

    let removeds = 0

    const data: any[] = await this.get(key)

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

    await this.set(key, data)

    this.emit('lrem', key, count, value, removeds)

    return removeds
  }

  async lset(key: string, index: number, value: any) {
    const exists = await this.exists(key)
    if (!exists) {
      throw new Error('no such key')
    }

    const isList = await this.is(key, TYPES.list)
    if (!isList) {
      throw new TypeError('the key is not a list')
    }

    const data = await this.get(key)

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

    await this.set(key, data)

    this.emit('lset', key, index, value, data.length)

    return true
  }

  async ltrim(key: string, start: number, stop: number) {
    const exists = await this.exists(key)
    if (!exists) {
      throw new Error('no such key')
    }

    const isList = await this.is(key, TYPES.list)
    if (!isList) {
      throw new TypeError('the key is not a list')
    }

    const data: any[] = await this.get(key)

    if (start < 0) {
      start = data.length + start
    }

    if (stop < 0) {
      stop = data.length + stop
    }

    const values = data.slice(start, stop + 1)

    await this.set(key, values)

    this.emit('ltrim', key, start, stop, values.length)

    return values
  }

  async lindex(key: string, index: number) {
    const exists = await this.exists(key)
    if (!exists) {
      throw new Error('no such key')
    }

    const isList = await this.is(key, TYPES.list)
    if (!isList) {
      throw new TypeError('the key is not a list')
    }

    const data = await this.get(key)
    if (index > (data.length - 1)) {
      throw new Error('out of bound')
    }

    const value = data[index]

    return value
  }

  async linsertBefore(key: string, pivot: any, value: any) {
    const exists = await this.exists(key)
    if (!exists) {
      throw new Error('no such key')
    }

    const isList = await this.is(key, TYPES.list)
    if (!isList) {
      throw new TypeError('the key is not a list')
    }

    const data = await this.get(key)

    const index = data.indexOf(pivot)

    if (index < 0) {
      return -1
    }

    data.splice(index, 0, value)
    await this.set(key, data)

    this.emit('linsertBefore', key, pivot, value, data.length)

    return data.length
  }

  async linsertAfter(key: string, pivot: any, value: any) {
    const exists = await this.exists(key)
    if (!exists) {
      throw new Error('no such key')
    }

    const isList = await this.is(key, TYPES.list)
    if (!isList) {
      throw new TypeError('the key is not a list')
    }

    const data = await this.get(key)

    const index = data.indexOf(pivot)

    if (index < 0) {
      return -1
    }

    data.splice(index + 1, 0, value)
    await this.set(key, data)

    this.emit('linsertAfter', key, pivot, value, data.length)

    return data.length
  }

  async rpoplpush(src: string, dest: string) {
    const value = await this.rpop(src)
    const length = await this.lpush(dest, value)

    this.emit('rpoplpush', src, dest, value, length)

    return length
  }

  async lpoprpush(src: string, dest: string) {
    const value = await this.lpop(src)
    const length = await this.rpush(dest, value)

    this.emit('lpoprpush', src, dest, value, length)

    return length
  }

}