import { Base } from './base';
export default class MinSet extends Base {
    sadd(key: string, ...members: any[]): Promise<number>;
    srem(key: string, ...members: any[]): Promise<number>;
    smembers(key: string): Promise<any>;
    sismember(key: string, value: any): Promise<boolean>;
    scard(key: string): Promise<any>;
    smove(src: string, dest: string, member: any): Promise<number>;
    srandmember(key: string): Promise<any>;
    spop(key: string): Promise<any>;
    sunion(...keys: string[]): Promise<any[]>;
    sunionstore(dest: string, ...keys: string[]): Promise<number>;
    sinter(...keys: string[]): Promise<any[]>;
    sinterstore(dest: string, ...keys: string[]): Promise<number>;
    sdiff(...keys: string[]): Promise<any[]>;
    sdiffstore(dest: string, ...keys: string[]): Promise<number>;
}
