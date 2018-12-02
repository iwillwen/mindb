import { EventEmitter } from 'events'

import { Base, TYPES } from './base'
import Hsah from './hash'
import List from './list'
import Set from './set'
import SortedSet from './zset'
import { Multi } from './mise'

export class MinDB extends EventEmitter implements Base, Hsah, List, Set, SortedSet {
  constructor(...args: any[]) {
    super()
    Base.call(this, ...args)
  }

  name: string
  store: LocalForage
  _keys: { [key: string]: TYPES }

  _setType: () => Promise<void>
  _delType: () => Promise<void>
  _restoreKeys: () => Promise<void>

  exists: (key: string) => Promise<boolean>
  is: (key: string, type: TYPES) => Promise<boolean>
  renamenx: (key: string, newKey: string) => Promise<boolean>
  rename: (key: string, newKey: string) => Promise<boolean>
  set: (key: string, value: any) => Promise<string>
  setnx: (key: string, value: any) => Promise<string>
  setex: (key: string, seconds: number, value: any) => Promise<string>
  psetex: (key: string, milliseconds: number, value: any) => Promise<string>
  mset: (doc: { [key: string]: any }) => Promise<string[]>
  append: (key: string, value: string) => Promise<number>
  get: (key: string) => Promise<any>
  getrange: (key: string, start: number, end: number) => Promise<string>
  mget: (keys: string[]) => Promise<any[]>
  getset: (key: string, value: any) => Promise<any>
  strlen: (key: string) => Promise<number>
  incr: (key: string) => Promise<number>
  del: (key: string) => Promise<string>
  keys: (pattern?: string) => Promise<string[]>
  randomKey: () => Promise<string>
  type: (key: string) => Promise<string>
  empty: () => Promise<number>

  hset: (key: string, field: string, value: any) => Promise<string>
  hsetnx: (key: string, field: string, value: any) => Promise<string>
  hexists: (key: string, field: string) => Promise<boolean>
  hmset: (key: string, doc: { [field: string]: any }) => Promise<string[]>
  hget: (key: string, field: string) => Promise<any>
  hmget: (key: string, fields: string[]) => Promise<any[]>
  hgetall: (key: string) => Promise<{ [field: string]: any }>
  hdel: (key: string, field: string) => Promise<any>
  hlen: (key: string) => Promise<number>
  hkeys: (key: string) => Promise<string[]>
  hincr: (key: string, field: string) => Promise<number>
  hincrby: (key: string, field: string, increment: number) => Promise<number>
  hincrbyfloat: (key: string, field: string, increment: number) => Promise<number>
  hdecr: (key: string, field: string) => Promise<number>
  hdecrby: (key: string, field: string, decrement: number) => Promise<number>
  hdecrbyfloat: (key: string, field: string, decrement: number) => Promise<number>

  lpush: (key: string, ...values: any[]) => Promise<number>
  lpushx: (key: string, ...values: any[]) => Promise<number>
  rpush: (key: string, ...values: any[]) => Promise<number>
  rpushx: (key: string, ...values: any[]) => Promise<number>
  lpop: (key: string) => Promise<any>
  rpop: (key: string) => Promise<any>
  llen: (key: string) => Promise<number>
  lrange: (key: string, start: number, stop: number) => Promise<any[]>
  lrem: (key: string, count: number, value: any) => Promise<number>
  lset: (key: string, index: number, value: any) => Promise<boolean>
  ltrim: (key: string, start: number, stop: number) => Promise<any[]>
  lindex: (key: string, index: number) => Promise<any>
  linsertBefore: (key: string, pivot: any, value: any) => Promise<any>
  linsertAfter: (key: string, pivot: any, value: any) => Promise<any>
  rpoplpush: (src: string, dest: string) => Promise<any>
  lpoprpush: (src: string, dest: string) => Promise<any>

  sadd: (key: string, ...members: any[]) => Promise<number>
  srem: (key: string, ...members: any[]) => Promise<number>
  smembers: (key: string) => Promise<any[]>
  sismember: (key: string, value: any) => Promise<boolean>
  scard: (key: string) => Promise<number>
  smove: (src: string, dest: string, member: any) => Promise<number>
  srandmember: (key: string) => Promise<any>
  spop: (key: string) => Promise<any>
  sunion: (...keys: string[]) => Promise<any[]>
  sunionstore: (dest: string, ...keys: string[]) => Promise<number>
  sinter: (...keys: string[]) => Promise<any[]>
  sinterstore: (dest: string, ...keys: string[]) => Promise<number>
  sdiff: (...keys: string[]) => Promise<any[]>
  sdiffstore: (dest: string, ...keys: string[]) => Promise<number>

  zadd: (key: string, score: number, member: any) => Promise<0 | 1>
  zcard: (key: string) => Promise<number>
  zcount: (key: string, min: number, max: number) => Promise<number>
  zrem: (key: string, ...members: any[]) => Promise<number>
  zscore: (key: string, member: any) => Promise<number>
  zrange: (key: string, min: number, max: number) => Promise<any[]>
  zrevrange: (key: string, min: number, max: number) => Promise<any[]>
  zincrby: (key: string, increment: number, member: any) => Promise<number>
  zdecrby: (key: string, decrement: number, member: any) => Promise<number>
  zrank: (key: string, member: any) => Promise<number>
  zrevrank: (key: string, member: any) => Promise<number>

  multi() {
    return new Multi(this)
  }
}
applyMixins(MinDB, [ Base, Hsah, List, Set, SortedSet ])

export default new MinDB()

function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
        derivedCtor.prototype[name] = baseCtor.prototype[name]
    })
  })
}
