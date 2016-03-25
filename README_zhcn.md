![MinDB](http://iwillwen.u.qiniudn.com/min/mindb_logo.png?123)**JavaScript 数据库**

在 JavaScript 中对你的应用数据进行存储和操作。  
MinDB 提供一个标准的存储接口(`Store Interface`)和 **Redis** 风格的 API，你可以在任何 JavaScript 环境中使用。

# 安装

普通`script`标签引入:

    <script style="text/javascript" src="/path/to/script/min.js">

通过 [Node.js](http://nodejs.org) 和 [npm](http://npmjs.org) 安装:

    $ npm install min

如果你喜欢 [component](http://component.io)，你也可以使用它进行安装:

    $ component install iwillwen/mindb
    
# 基本使用方法

基本的键值存储可以通过`SET`、`GET`等命令操作:

    min.set('foo', 'bar', function(err) {
      if (err) {
        return console.error(err);
      }
      
      min.get('foo', function(err, value) {
        if (err) {
          return console.error(err);
        }
        
        console.log(value); //=> bar
      });
    });

## 基本方法
- `set` 对指定键设置数据 `(key, value[, callback])`
- `setnx` 当指定键不存在时，对其设置数据 `(key, value[, callback])`
- `setex` 对指定键设置数据，并设置生命周期 `(key, seconds, value[, callback])`
- `psetex` 对指定键设置数据，并设置以毫秒为单位的生命周期 `(key, millseconds, value[, callback])`
- `mset` 批量对指定键设置数据 `(plainObject[, callback])`
- `msetnx` 当一批指定键全部不存在时，批量对其设置数据 `(plainObject[, callback])`
- `append` 在指定键后插入值 `(key, value[, callback])`
- `get` 获取指定键的值 `(key[, callback])`
- `mget` 批量获取指定键的值 `(keys[, callback])`
- `getset` 对指定键设置数据并返回其之前的值 `(key, value[, callback])`
- `strlen` 获取指定键值的长度 `(key[, callback])`
- `incr` 将指定键中储存的数字值增一 `(key[, callback])`
- `incrby` 将指定键中储存的数字值增加若干量 `(key, increment[, callback])`
- `incrbyfloat` 将指定键中储存的浮点值增加若干量 `(key, increment[, callback])`

## Hash, List, Set, Sorted Set
你或许可以在 [Redis](http://redis.io/commands) 的官方网站中得到启示。

## 语法糖([Syntactic sugar](http://zh.wikipedia.org/zh/%E8%AF%AD%E6%B3%95%E7%B3%96))
不喜欢嵌套回调？你或许会喜欢 [Promise](http://promises-aplus.github.io/promises-spec/):

    min.incr('user_id')
      .then(function(curr) {
        return min.hmset('user-' + curr, {
          name: 'Will Wen Gunn',
          id: 'iwillwen',
          email: 'willwengunn@gmail.com'
        });
      })
      .then(function(key) {
        var id = key.substr(5);
        
        return min.sadd('user-msg-' + id, 'WelCome!');
      })
      .then(function(length) {
        // ...
      })
      .catch(function(err) {
        console.log(err);
      });

还不行？不需要依赖？那么来看看`MULTI`吧:

    min.multi()
      .incr('msg-seq')
      .incr('msg-seq')
      .incr('msg-seq')
      .exec(function(err, results) {
        if (err) {
          return console.error(err);
        }
        
        console.log(results); //=> [ [ 1 ], [ 2 ], [ 3 ] ]
      });

ES2015的时代已经到来，你还在等什么？

    async _ => {
      var userId = await min.incr('users:id:seq')
      await min.hmset(`user:${userId}`, {
        name: 'Will Wen Gunn',
        sign: 'iwillwen',
        homepage: 'http://lifemap.in'
      })
      await min.sadd(`user:${userId}:msgs`, 'Welcome')
    }

MinDB 也支持多数据库:

    var Min = min.fork();
    Min.set('foo', 'bar')
      .then(/*...*/)
      .catch(/*...*/);

# Store Interface
请阅读 [Store Interface 文档](https://github.com/iwillwen/mindb/blob/master/docs/store_interface.md).

# 贡献
我们非常欢迎贡献。当然为 MinDB 作出贡献的方法有很多。

- 向你的朋友介绍 MinDB，让更多人知道 MinDB
- 与大家讨论 MinDB，在 Github 上提出 Bug
- 在 Github 上为提交更新
- 为 MinDB 捐款

## 资助我们
[![通过支付宝捐款](http://iwillwen.u.qiniudn.com/donate-with-alipay.png)](http://me.alipay.com/iwillwen)

## git-flow
我们推荐你使用 [`git-flow`](https://github.com/nvie/gitflow)。

提示:

    $ git flow feature start [featurename]
    $ git add .
    $ git commit -m 'new feature description'
    $ git flow feature finish [featurename]

# 许可

Copyright (c) 2012-2013 Will Wen Gunn(willwengunn@gmail.com)
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
