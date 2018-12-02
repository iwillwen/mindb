import { Base } from './base';
export default class MinList extends Base {
    lpush(key: string, ...values: any[]): Promise<number>;
    lpushx(key: string, ...values: any[]): Promise<number>;
    rpush(key: string, ...values: any[]): Promise<number>;
    rpushx(key: string, ...values: any[]): Promise<number>;
    lpop(key: string): Promise<any>;
    rpop(key: string): Promise<any>;
    llen(key: string): Promise<number>;
    lrange(key: string, start: number, stop: number): Promise<any[]>;
    lrem(key: string, count: number, value: any): Promise<number>;
    lset(key: string, index: number, value: any): Promise<boolean>;
    ltrim(key: string, start: number, stop: number): Promise<any[]>;
    lindex(key: string, index: number): Promise<any>;
    linsertBefore(key: string, pivot: any, value: any): Promise<any>;
    linsertAfter(key: string, pivot: any, value: any): Promise<any>;
    rpoplpush(src: string, dest: string): Promise<number>;
    lpoprpush(src: string, dest: string): Promise<number>;
}
