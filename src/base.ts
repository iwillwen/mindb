import * as LocalForage from 'localforage'
import { EventEmitter } from 'events'

export enum TYPES {
  'mix',
  'hash',
  'list',
  'set',
  'zset'
}

export class Base extends EventEmitter {

  name: string
  store: LocalForage

  _keys: { [key: string]: TYPES } = {}

  constructor(name = 'mindb') {
    super()
    this.name = name
    this.store = LocalForage.createInstance({ name })

    this._restoreKeys()
    // TODO: await for ready
  }

  async _setType(key: string, type: TYPES) {
    this._keys[key] = type
    await this.store.setItem('min:private-keys', this._keys)
  }

  async _delType(key: string) {
    delete this._keys[key]
    await this.store.setItem('min:private-keys', this._keys)
  }

  async _restoreKeys() {
    this._keys = (await this.store.getItem('min:private-keys')) as { [key: string]: TYPES } || {}
  }

  /**
   * Delete a key
   * @param {String} key  Key
   * @return {Promise}    Promise<String>
   */
  async del(key: string) {
    const $key = 'min-' + key

    await this.store.removeItem($key)
    await this._delType(key)

    this.emit('del', key)

    return key
  }

  /**
   * Check a key is exists or not
   * @param  {String}   key      Key
   * @return {Promise}           Promise Object
   */
  async exists(key: string) {
    const $key = 'min-' + key
    const keys = await this.store.keys()  // TODO: Cache the keys
    return keys.indexOf($key) >= 0
  }

  async is(key: string, type: TYPES) {
    const exists = (await this.exists(key)) && !!this._keys[key]
    
    if (!exists) {
      throw new Error('no such key')
    }

    return this._keys[key] === type
  }

  async renamenx(key: string, newKey: string) {
    const exists = await this.exists(key)
    if (!exists) {
      throw new Error('no such key')
    }

    const value = await this.get(key)
    const type = this._keys[key]
    await this.del(key)
    await this.set(newKey, value)
    await this._setType(newKey, type)

    return true
  }

  async rename(key: string, newKey: string) {
    if (key === newKey) {
      throw new Error('The key is equal to the new key')
    }

    return await this.renamenx(key, newKey)
  }

  async keys(pattern: string = '*') {
    const keys = (await this.store.keys()).map($key => $key.substr(4))

    const filter = new RegExp(pattern
      .replace('?', '(.)')
      .replace('*', '(.*)'))

    return keys.filter(key => filter.test(key))
  }

  async randomKey() {
    const keys = (await this.store.keys()).map($key => $key.substr(4))
    const index = Math.round(Math.random() * (keys.length - 1))

    return keys[index]
  }

  async type(key: string) {
    const exists = (await this.exists(key)) && typeof this._keys[key] !== 'undefined'
    if (!exists) {
      throw new Error('no such key')
    }

    return TYPES[this._keys[key]]
  }

  async empty() {
    const removed = (await this.keys("*")).length
    this._keys = {}
    LocalForage.dropInstance({ name: this.name })
    this.store = LocalForage.createInstance({ name: this.name })

    this.emit('empty', removed)
    return removed
  }

  async set(key: string, value: any) {
    const $key = 'min-' + key

    await this.store.setItem($key, value)
    await this._setType(key, TYPES.mix)

    this.emit('set', key, value)

    return key
  }

  async setnx(key: string, value: any) {
    const exists = await this.exists(key)
    if (exists) {
      throw new Error('the key is exists')
    }

    return await this.set(key, value)
  }

  async setex(key: string, seconds: number, value: any) {
    return await this.psetex(key, seconds * 1e3, value)
  }

  async psetex(key: string, milliseconds: number, value: any) {
    await this.set(key, value)
    setTimeout(() => {
      this.del(key)
    }, milliseconds)

    return key
  }

  async mset(doc: { [key: string]: any }) {

    const results: string[] = []
    const errors: any[] = []

    for (const key of Object.keys(doc)) {
      try {
        await this.set(key, doc[key])
        results.push(key)
      } catch(err) {
        errors.push(err)
      }
    }

    if (errors.length > 0) {
      throw errors
    }

    return results
  }

  async append(key: string, value: string) {
    const exists = await this.exists(key)
    const currValue = exists ? await this.get(key) : ''
    const savedValue = await this.set(key, currValue + value)

    return savedValue.length
  }

  async get(key: string) {
    if (!(await this.exists(key))) {
      throw new Error('no such key')
    }

    const $key = 'min-' + key
    const value = await this.store.getItem($key)

    this.emit('get', key, value)

    return value as any
  }

  async getrange(key: string, start: number, end: number) {
    const length = end - start + 1

    const value: string = await this.get(key)
    const val = value.substr(start, length)

    this.emit('getrange', key, start, end, val)

    return val
  }

  async mget(keys: string[]) {
    const values = await Promise.all(keys.map(key => this.get(key)))
    this.emit('mget', keys, values)
    return values
  }

  async getset(key: string, value: any) {
    const oldValue = await this.get(key)
    await this.set(key, value)

    this.emit('getset', key, value, oldValue)

    return oldValue
  }

  async strlen(key: string) {
    const value: any = await this.get(key)
    if ('string' !== typeof value) {
      throw new TypeError()
    }

    return value.length
  }

  async incr(key: string) {
    const exists = await this.exists(key)
    let currValue: any = exists ? await this.get(key) : 0

    if (isNaN(parseInt(currValue, 10))) {
      throw new TypeError('value wrong')
    }

    currValue = parseInt(currValue, 10)
    await this.set(key, ++currValue)
    
    this.emit('incr', key, parseInt(currValue, 10))
    return currValue
  }
  
}