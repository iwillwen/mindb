![MinDB](https://raw.githubusercontent.com/iwillwen/mindb/master/assets/mindb.png)**Database on JavaScript**

Storing and structuring your application data on JavaScript.  
Providing a standard *Store Interface* and **Redis**-like API that you can use in wherever.

[Chinese version](https://github.com/iwillwen/mindb/blob/master/README_zhcn.md)

# Installation

Loading via script tag:

```html
<script style="text/javascript" src="/path/to/script/min.js">
```

With [node](http://nodejs.org) previously installed:

```shell
$ npm install min
```
    
# Basic Usage

Common key-value via such as `SET`, `GET`, etc.

```javascript
min.set('foo', 'bar')
  .then(() => min.get('foo'))
  .then(value => console.log(value)) //=> bar
  .catch(err => console.error(err))
```

## Basic commands
- `set` Set the value of a key `(key, value)`
- `setnx` Set the value of a key, only if the key does not exist `(key, value)`
- `setex` Set the value and expiration of a key `(key, seconds, value)`
- `psetex` Set the value and expiration in milliseconds of a key `(key, millseconds, value)`
- `mset` Set multiple keys to multiple values `(plainObject)`
- `msetnx` Set multiple keys to multiple values, only if none of the keys exist `(plainObject)`
- `append` Append a value to a key `(key, value)`
- `get` Get the value of a key `(key)`
- `mget` Get the values of a set of keys `(keys)`
- `getset` Set the value of a key and return its old value `(key, value)`
- `strlen` Get the length of a key `(key)`
- `incr` Increment the integer value of a key by one `(key)`
- `incrby` Increment the integer value of a key by the given amount `(key, increment)`
- `incrbyfloat` Increment the float value of a key by the given amount `(key, increment)`

## Hash, List, Set, Sorted Set
Maybe you can get the way by browsing [Redis Commands](http://redis.io/commands). XD

## Sweet
Anymore else? How about `MULTI`?

```javascript
min.multi()
  .incr('msg-seq')
  .incr('msg-seq')
  .incr('msg-seq')
  .exec()
  .then(results => console.log(results)) //=> [ [ 1 ], [ 2 ], [ 3 ] ]
  .catch(err => console.error(err))
```

SWEET! Let's run to **Harmony**(ES2015)!

```javascript
async _ => {
  var userId = await min.incr('users:id:seq')
  await min.hmset(`user:${userId}`, {
    name: 'Will Wen Gunn',
    sign: 'iwillwen',
    homepage: 'http://lifemap.in'
  })
  await min.sadd(`user:${userId}:msgs`, 'Welcome')
}
```

Support multiple databases:

```javascript
var Min = min.fork()
Min.set('foo', 'bar')
  .then(/*...*/)
  .catch(/*...*/)
```

# Contributing
Contribution is welcome.There are more than one way to contribute, and I will appreciate any way you choose.

- tell your friends about iwillwen/mindb, let MinDB to be known
- discuss MinDB, and submit bugs with github issues
- send patch with github pull request
- donate MinDB

## Donate 
Because of the Alipay donate page service had been stopped so if you want to support our job, please transfer to my Alipay account(willwengunn@gmail.com) manually. Thanks.
PayPal is welcome too: willwengunn@gmail.com

## git-flow
We recommend you to use [`git-flow`](https://github.com/nvie/gitflow) to make a patch.

Hint:

```shell
$ git flow feature start [featurename]
$ git add .
$ git commit -m 'new feature description'
$ git flow feature finish [featurename]
```

# License

Copyright (c) 2012-2019 Will Wen Gunn(willwengunn@gmail.com)
All rights reserved.

MIT License

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.
