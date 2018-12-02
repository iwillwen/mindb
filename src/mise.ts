import { MinDB } from './index'
import { TYPES } from './base'

interface IMultuTask {
  task: string
  args: any[]
}

export class Multi {
  
  private min: MinDB
  private queue: IMultuTask[] = []

  constructor(min: MinDB) {
    this.min = min
  }

  public async exec() {
    const results = []

    for (const { task, args } of this.queue) {
      const method: (...args: any[]) => Promise<any> = (this.min as any)[task]
      const result = await method.apply(this.min, args)

      results.push(result)
    }

    return results
  }

  exists(key: string) { this.queue.push({ task: 'exists', args: [ key ] }); return this }
  is(key: string, type: TYPES) { this.queue.push({ task: 'is', args: [ key, type ] }); return this }
  renamenx(key: string, newKey: string) { this.queue.push({ task: 'renamenx', args: [ key, newKey ] }); return this }
  rename(key: string, newKey: string) { this.queue.push({ task: 'rename', args: [ key, newKey ] }); return this }
  set(key: string, value: any) { this.queue.push({ task: 'set', args: [ key, value ] }); return this }
  setnx(key: string, value: any) { this.queue.push({ task: 'setnx', args: [ key, value ] }); return this }
  setex(key: string, seconds: number, value: any) { this.queue.push({ task: 'setex', args: [ key, seconds, value ] }); return this }
  psetex(key: string, milliseconds: number, value: any) { this.queue.push({ task: 'psetex', args: [ key, milliseconds, value ] }); return this }
  mset(doc: { [key: string]: any }) { this.queue.push({ task: 'mset', args: [ doc ] }); return this }
  append(key: string, value: string) { this.queue.push({ task: 'append', args: [ key, value ] }); return this }
  get(key: string) { this.queue.push({ task: 'get', args: [ key ] }); return this }
  getrange(key: string, start: number, end: number) { this.queue.push({ task: 'getrange', args: [ key, start, end ] }); return this }
  mget(keys: string[]) { this.queue.push({ task: 'mget', args: [ keys ] }); return this }
  getset(key: string, value: any) { this.queue.push({ task: 'getset', args: [ key, value ] }); return this }
  strlen(key: string) { this.queue.push({ task: 'strlen', args: [ key ] }); return this }
  incr(key: string) { this.queue.push({ task: 'incr', args: [ key ] }); return this }
  del(key: string) { this.queue.push({ task: 'del', args: [ key ] }); return this }
  keys(pattern: string = '*') { this.queue.push({ task: 'keys', args: [ pattern ] }); return this }
  randomKey() { this.queue.push({ task: 'randomKey', args: [] }); return this }
  type(key: string) { this.queue.push({ task: 'type', args: [ key ] }); return this }
  empty() { this.queue.push({ task: 'empty', args: [] }); return this }

  hset(key: string, field: string, value: any) { this.queue.push({ task: 'hset', args: [ key, field, value ] }); return this }
  hsetnx(key: string, field: string, value: any) { this.queue.push({ task: 'hsetnx', args: [ key, field, value ] }); return this }
  hexists(key: string, field: string) { this.queue.push({ task: 'hexists', args: [ key, field ] }); return this }
  hmset(key: string, doc: { [field: string]: any }) { this.queue.push({ task: 'hmset', args: [ key, doc ] }); return this }
  hget(key: string, field: string) { this.queue.push({ task: 'hget', args: [ key, field ] }); return this }
  hmget(key: string, fields: string[]) { this.queue.push({ task: 'hmget', args: [ key, fields ] }); return this }
  hgetall(key: string) { this.queue.push({ task: 'hgetall', args: [ key ] }); return this }
  hdel(key: string, field: string) { this.queue.push({ task: 'hdel', args: [ key, field ] }); return this }
  hlen(key: string) { this.queue.push({ task: 'hlen', args: [ key ] }); return this }
  hkeys(key: string) { this.queue.push({ task: 'hkeys', args: [ key ] }); return this }
  hincr(key: string, field: string) { this.queue.push({ task: 'hincr', args: [ key, field ] }); return this }
  hincrby(key: string, field: string, increment: number) { this.queue.push({ task: 'hincrby', args: [ key, field, increment ] }); return this }
  hincrbyfloat(key: string, field: string, increment: number) { this.queue.push({ task: 'hincrbyfloat', args: [ key, field, increment ] }); return this }
  hdecr(key: string, field: string) { this.queue.push({ task: 'hdecr', args: [ key, field ] }); return this }
  hdecrby(key: string, field: string, decrement: number) { this.queue.push({ task: 'hdecrby', args: [ key, field, decrement ] }); return this }
  hdecrbyfloat(key: string, field: string, decrement: number) { this.queue.push({ task: 'hdecrby', args: [ key, field, decrement ] }); return this }

  lpush(key: string, ...values: any[]) { this.queue.push({ task: 'lpush', args: [ key, ...values ] }); return this }
  lpushx(key: string, ...values: any[]) { this.queue.push({ task: 'lpushx', args: [ key, ...values ] }); return this }
  rpush(key: string, ...values: any[]) { this.queue.push({ task: 'rpush', args: [ key, ...values ] }); return this }
  rpushx(key: string, ...values: any[]) { this.queue.push({ task: 'rpushx', args: [ key, ...values ] }); return this }
  lpop(key: string) { this.queue.push({ task: 'lpop', args: [ key ] }); return this }
  rpop(key: string) { this.queue.push({ task: 'rpop', args: [ key ] }); return this }
  llen(key: string) { this.queue.push({ task: 'llen', args: [ key ] }); return this }
  lrange(key: string, start: number, stop: number) { this.queue.push({ task: 'lrange', args: [ key, start, stop ] }); return this }
  lrem(key: string, count: number, value: any) { this.queue.push({ task: 'lrem', args: [ key, count, value ] }); return this }
  lset(key: string, index: number, value: any) { this.queue.push({ task: 'lset', args: [ key, index, value ] }); return this }
  ltrim(key: string, start: number, stop: number) { this.queue.push({ task: 'ltrim', args: [ key, start, stop ] }); return this }
  lindex(key: string, index: number) { this.queue.push({ task: 'lindex', args: [ key, index ] }); return this }
  linsertBefore(key: string, pivot: any, value: any) { this.queue.push({ task: 'linsertBefore', args: [ key, pivot, value ] }); return this }
  linsertAfter(key: string, pivot: any, value: any) { this.queue.push({ task: 'linsertAfter', args: [ key, pivot, value ] }); return this }
  rpoplpush(src: string, dest: string) { this.queue.push({ task: 'rpoplpush', args: [ src, dest ] }); return this }
  lpoprpush(src: string, dest: string) { this.queue.push({ task: 'lpoprpush', args: [ src, dest ] }); return this }

  sadd(key: string, ...members: any[]) { this.queue.push({ task: 'sadd', args: [ key, ...members ] }); return this }
  srem(key: string, ...members: any[]) { this.queue.push({ task: 'srem', args: [ key, ...members ] }); return this }
  smembers(key: string) { this.queue.push({ task: 'smembers', args: [ key ] }); return this }
  sismember(key: string, value: any) { this.queue.push({ task: 'sismember', args: [ key, value ] }); return this }
  scard(key: string) { this.queue.push({ task: 'scard', args: [ key ] }); return this }
  smove(src: string, dest: string, member: any) { this.queue.push({ task: 'smove', args: [ src, dest, member ] }); return this }
  srandmember(key: string) { this.queue.push({ task: 'srandmember', args: [ key ] }); return this }
  spop(key: string) { this.queue.push({ task: 'spop', args: [ key ] }); return this }
  sunion(...keys: string[]) { this.queue.push({ task: 'sunion', args: keys }); return this }
  sunionstore(dest: string, ...keys: string[]) { this.queue.push({ task: 'sunionstore', args: [ dest, ...keys ] }); return this }
  sinter(...keys: string[]) { this.queue.push({ task: 'sinter', args: keys }); return this }
  sinterstore(dest: string, ...keys: string[]) { this.queue.push({ task: 'sinterstore', args: [ dest, ...keys ] }); return this }
  sdiff(...keys: string[]) { this.queue.push({ task: 'sdiff', args: keys }); return this }
  sdiffstore(dest: string, ...keys: string[]) { this.queue.push({ task: 'sdiffstore', args: [ dest, ...keys ] }); return this }

  zadd(key: string, score: number, member: any) { this.queue.push({ task: 'zadd', args: [ key, score, member ] }); return this }
  zcard(key: string) { this.queue.push({ task: 'zcard', args: [ key ] }); return this }
  zcount(key: string, min: number, max: number) { this.queue.push({ task: 'zcount', args: [ key, min, max ] }); return this }
  zrem(key: string, ...members: any[]) { this.queue.push({ task: 'zrem', args: [ key, ...members ] }); return this }
  zscore(key: string, member: any) { this.queue.push({ task: 'zscore', args: [ key, member ] }); return this }
  zrange(key: string, min: number, max: number) { this.queue.push({ task: 'zrange', args: [ key, min, max ] }); return this }
  zrevrange(key: string, min: number, max: number) { this.queue.push({ task: 'zrevrange', args: [ key, min, max ] }); return this }
  zincrby(key: string, increment: number, member: any) { this.queue.push({ task: 'zincrby', args: [ key, increment,  member ] }); return this }
  zdecrby(key: string, decrement: number, member: any) { this.queue.push({ task: 'zdecrby', args: [ key, decrement,  member ] }); return this }
  zrank(key: string, member: any) { this.queue.push({ task: 'zrank', args: [ key,  member ] }); return this }
  zrevrank(key: string, member: any) { this.queue.push({ task: 'zrevrank', args: [ key,  member ] }); return this }

}