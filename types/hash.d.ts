import { Base } from './base';
export default class MinHash extends Base {
    hset(key: string, field: string, value: any): Promise<string>;
    hsetnx(key: string, field: string, value: any): Promise<string>;
    hmset(key: string, doc: {
        [field: string]: any;
    }): Promise<string[]>;
    hget(key: string, field: string): Promise<any>;
    hmget(key: string, fields: string[]): Promise<any[]>;
    hgetall(key: string): Promise<{
        [field: string]: any;
    }>;
    hdel(key: string, field: string): Promise<any>;
    hlen(key: string): Promise<number>;
    hkeys(key: string): Promise<string[]>;
    hexists(key: string, field: string): Promise<boolean>;
    hincr(key: string, field: string): Promise<number>;
    hincrby(key: string, field: string, increment: number): Promise<number>;
    hincrbyfloat(key: string, field: string, increment: number): Promise<number>;
    hdecr(key: string, field: string): Promise<number>;
    hdecrby(key: string, field: string, decrement: number): Promise<number>;
    hdecrbyfloat(key: string, field: string, decrement: number): Promise<number>;
}
