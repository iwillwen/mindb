import { Base } from './base';
export default class MinSet extends Base {
    zadd(key: string, score: number, member: any): Promise<0 | 1>;
    zcard(key: string): Promise<number>;
    zcount(key: string, min: number, max: number): Promise<number>;
    zrem(key: string, ...members: any[]): Promise<number>;
    zscore(key: string, member: any): Promise<number>;
    zrange(key: string, min: number, max: number): Promise<any[]>;
    zrevrange(key: string, min: number, max: number): Promise<any[]>;
    zincrby(key: string, increment: number, member: any): Promise<number>;
    zdecrby(key: string, decrement: number, member: any): Promise<number>;
    zrank(key: string, member: any): Promise<number>;
    zrevrank(key: string, member: any): Promise<number>;
}
