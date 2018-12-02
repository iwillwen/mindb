import { EventEmitter } from 'events';
export declare enum TYPES {
    'mix' = 0,
    'hash' = 1,
    'list' = 2,
    'set' = 3,
    'zset' = 4
}
export declare class Base extends EventEmitter {
    name: string;
    store: LocalForage;
    _keys: {
        [key: string]: TYPES;
    };
    constructor(name?: string);
    _setType(key: string, type: TYPES): Promise<void>;
    _delType(key: string): Promise<void>;
    _restoreKeys(): Promise<void>;
    /**
     * Delete a key
     * @param {String} key  Key
     * @return {Promise}    Promise<String>
     */
    del(key: string): Promise<string>;
    /**
     * Check a key is exists or not
     * @param  {String}   key      Key
     * @return {Promise}           Promise Object
     */
    exists(key: string): Promise<boolean>;
    is(key: string, type: TYPES): Promise<boolean>;
    renamenx(key: string, newKey: string): Promise<boolean>;
    rename(key: string, newKey: string): Promise<boolean>;
    keys(pattern?: string): Promise<string[]>;
    randomKey(): Promise<string>;
    type(key: string): Promise<string>;
    empty(): Promise<number>;
    set(key: string, value: any): Promise<string>;
    setnx(key: string, value: any): Promise<string>;
    setex(key: string, seconds: number, value: any): Promise<string>;
    psetex(key: string, milliseconds: number, value: any): Promise<string>;
    mset(doc: {
        [key: string]: any;
    }): Promise<string[]>;
    append(key: string, value: string): Promise<number>;
    get(key: string): Promise<any>;
    getrange(key: string, start: number, end: number): Promise<string>;
    mget(keys: string[]): Promise<any[]>;
    getset(key: string, value: any): Promise<any>;
    strlen(key: string): Promise<number>;
    incr(key: string): Promise<any>;
}
