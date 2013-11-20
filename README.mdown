# NanoDB
跨平臺前端數據庫

NanoDB 用於解決 WebApp 或網站中，需要在前端頁面(或是 HTML5 應用)中進行持久化(或非持久化)的結構化數據進行存儲的需求。  
NanoDB 可以於任何可以運行 JavaScript 的運行環境中(於非現代瀏覽器中時，需要網絡支持)，無論是一般的瀏覽器(Chrome, FireFox, Safari, Opera, Internet Explorer 等)，還是其餘任何支持顯示 HTML 和運行 JavaScript 的環境中(如 Adobe Air, Apache Cordova, AppCan, node-webkit, AppJS 等)。

## 特色
- 跨平臺，NanoDB 提供一個開放的 Store Interface，以使數據可以存儲在不同的數據容器中，你也可以根據你的實際需求，自主開發 Store Interface。NanoDB 默認提供兩個用於現代瀏覽器的 Store Interface(分別用於持久化存儲和內存存儲)。
- 輕量化，NanoDB 的核心部件只有不到 35K。如果你的服務器開啓了 gzip 壓縮，經過最小化後的文件(nanodb.min.js)只有 7.5K！
- 簡潔優雅，NanoDB 提供 Redis 風格的 API 供開發者使用。
- 全棧 JavaScript 開發，無需其他運行環境支持。

## 安裝

若你想在頁面中使用 NanoDB，你需要引入 nanodb.js (或是 nanodb.min.js)。

    <script src="/path/to/script/nanodb.js" type="text/javascript"></script>
    <script type="text/javascript">
      // Build an AWESOME App with NanoDB!
      nano.set('foo', 'bar')
        .then(function() {
          return nano.get('foo');
        })
        .then(function(value) {
          console.log(value); //=> bar
        });
    </script>

你也可以在有 SeaJS 或 RequireJS 等 CommonJS 環境中使用。

```js
// SeaJS
seajs.use('/path/to/script/nanodb', function(nano) {
  nano.set('me', 'Will Wen Gunn');
});

// RequireJS
require(['/path/to/script/nanodb'], function(nano) {
  nano.get('me', function(name) {
    console.log(name); //=> Will Wen Gunn
  });
})
```

NanoDB 也可以在 Node.js 環境中運行。

```js
var nano = require('nano');
var fs   = require('fs');

function FileStore(filename) {
  this.filename = filename;
  this.buffer   = null;
  this.async    = true;
}
FileStore.prototype.set = function(key, value[, callback]) {
  var self = this;

  if (!self.buffer) {
    fs.readFile(self.filename, function(err, data) {
      if (err)
        return callback(err);

      self.buffer = JSON.parse(data.toString());
      self.buffer[key] = value;
      fs.writeFile(self.filename, JSON.stringify(self.buffer), function(err) {
        if (err)
          return callback(err);

        callback();
      });
    });
  } else {
    self.buffer[key] = value;

    fs.writeFile(self.filename, JSON.stringify(self.buffer), function(err) {
      if (err)
        return callback(err);

      callback();
    });
  }
};
FileStore.prototype.get = function(key[, callback]) {
  var self = this;

  if (!self.buffer) {
    fs.readFile(self.filename, function(err, data) {
      if (err)
        return callback(err);

      self.buffer = JSON.parse(data);

      callback(null, self.buffer[key]);
    });
  } else {
    if (self.buffer[key]) {
      return callback(null, self.buffer[key]);
    } else {
      return callback(new Error('This key is not exists.'));
    }
  }
};
FileStore.prototype.remove = function(key[, callback]) {
  var self = this;

  if (!self.buffer) {
    fs.readFile(self.filename, function(err, data) {
      if (err)
        return callback(err);

      delete self.buffer[key];

      fs.writeFile(self.filename, JSON.stringify(self.buffer)[, callback]);
    });
  } else {
    delete self.buffer[key];

    fs.writeFile(self.filename, JSON.stringify(self.buffer)[, callback]);
  }
};

nano.store = new FileStore(__dirname + '/mydb.data');

nano.set('foo', 'bar', function(err) {
  if (err) {
    return console.error(err);
  }

  // Do somethings.
});
```

如果你所用的 JavaScript 環境並非瀏覽器，並提供專有的數據存儲接口(如 Adobe AIR)，你也可以通過它來使用 NanoDB。

```js
// For Adobe AIR EncryptedLocalStore
function EncryptedLocalStore() {}
EncryptedLocalStore.prototype.get = function(key) {
  return air.EncryptedLocalStore.getItem(key);
};
EncryptedLocalStore.prototype.set = function(key, value) {
  return air.EncryptedLocalStore.setItem(key, value);
};
EncryptedLocalStore.prototype.remove = function(key) {
  return air.EncryptedLocalStore.removeItem(key);
};

nano.store = new EncryptedLocalStore();
```

## 對比

<table>
<thead>
<tr>
  <th>名稱</th>
  <th style="text-align:left;">優點</th>
  <th style="text-align:left;">缺點</th>
</tr>
</thead>
<tbody><tr>
  <td>Cookies</td>
  <td style="text-align:left;">瀏覽器全兼容</td>
  <td style="text-align:left;">安全性低，容量小，限制較大，而且只能存儲字符串。</td>
</tr>
<tr>
  <td>DOM Storage</td>
  <td style="text-align:left;">提供了較好的 Key/Value 形式的存儲接口</td>
  <td style="text-align:left;">只能存儲字符串，靈活性較低</td>
</tr>
<tr>
  <td>Store.js</td>
  <td style="text-align:left;">跨平臺 K/V 存儲接口包裝器</td>
  <td style="text-align:left;">無法移植到非瀏覽器或類瀏覽器的平臺上，靈活性較低</td>
</tr>
<tr>
  <td>IndexedDB</td>
  <td style="text-align:left;">數據結構較以上三種要豐富靈活</td>
  <td style="text-align:left;">兼容性較低，數據結構較爲單一，門檻較高</td>
</tr>
<tr>
  <td>Web SQL</td>
  <td style="text-align:left;">可用通用型結構化查詢語言 SQL(Structured Query Language) 進行數據查詢</td>
  <td style="text-align:left;">遭到“拋棄”，使用不方便，兼容性較差</td>
</tr>
<tr>
  <td>SQLite</td>
  <td style="text-align:left;">傳統的 RDMS (關係型數據庫)的輕量級產品，符合輕量、簡潔的需求</td>
  <td style="text-align:left;">需要獨立運行，無法在前端頁面中調用</td>
</tr>
<tr>
  <td>EJDB</td>
  <td style="text-align:left;">嵌入式的 JSON 数据库引擎，旨在提供快速的类 MongoDB 的嵌入式数据库</td>
  <td style="text-align:left;">無法運行於前端</td>
</tr>
</tbody></table>

## 背景

Christian Helimann 在《衆妙之門 JavaScript 與 jQuery 技術精髓》中提到：
> JavaScript 包括豐富的交互接口，但在進行數據處理和數據庫訪問時效果不佳。—— Christian Helimann

當初 NanoDB 的開發初衷就是爲了解決在 WebApp 中，前端數據處理和存儲的缺陷。所以 NanoDB 是爲了 WebApp 而誕生的。但是在傳統網站和 HTML5 移動應用開發中，發現也存在不少存在 NanoDB 可以運用到的場景，於是 NanoDB 便被安上“跨平臺”、“兼容性高”的標籤。

NanoDB 至今經歷了兩個主要版本：

1. 第一個發佈版本爲 MongoDB 風格的 API 版本，該版本學習 MongoDB 的設計理念，較適合於傳統應用開發中的數據存儲。
存在“表”的概念，適合於開發存在複數原子單位的應用。但經過實踐之後發現，因爲“表”不適合存儲以“鍵-值”爲結構的數據，
於是則選擇了開發第二個版本的 NanoDB。
2. 在 WebApp 和傳統網站的開發中，我們發現“鍵-值”的數據結構的應用場景也十分常見，
所以新版的 NanoDB 需要定位在既支持以列的形式存在的數據，也對“鍵-值”形式的數據有良好的支持。
於是，我們便選擇了新型 NoSQL 鍵值數據庫 Redis 的設計理念。

Redis 是一個真正的鍵值存儲系統，且帶有常用的幾種基本數據結構的直接操作方法。
Redis 最基本的數據結構便是字符串(String)，其外還有哈希值(Hash)、列表(List)、集合(Set)和有序集(Sorted Set)。
這五種基本的數據結構基本可以滿足一般應用的數據處理存儲需求。

## 應用範圍

- **WebApp**

其中 WebApp 的典型案例諸如 WebQQ、EverNote(印象筆記)、網頁遊戲等等，HTML5 標準便成爲了 WebApp 發展的原動力。
而 JavaScript 作爲標準前端腳本語言，在開源社區中，各種適用於 WebApp 開發的庫也如雨後春筍般出現。
W3C、WHATWG、IETF 等 Web 標準制定委員會也不斷適應 WebApp 的發展，制定出不少更方便的 JavaScript API。

其中用於數據存儲的 DOM Storage、Web SQL、IndexedDB 等便是發展潮流中的產物。
但是作爲新標準，各瀏覽器廠商的支持不一，存在兼容性參差不齊的情況。
NanoDB 便是爲了解決這一問題而誕生的庫。

- **傳統網站**

在傳統網站中，前端數據存儲也是出現的需求，比如十分流行的 MVC、MVVM 架構等，都需要數據存儲、操作的支持。

在 Facebook 的蒋长浩(Changhao Jiang)博士發明的 BigPipe 技術中，需要 JavaScript 的支持。
但在實際開發應用中，我們發現在某些特定的開發環境內，BigPipe 技術並不能十分直接地運用，
在實際邏輯操作和服務器輸出 Pagelets 的過程中存在鴻溝。

而 NanoDB 則可以充當一個獨立的數據層，在邏輯操作和 BigPipe 管道之間搭建聯通橋樑。

- **非傳統網頁的開發平臺**

隨着 JavaScript 的潛力在近年來被不斷開發，一些非傳統網頁運行的開發平臺，如 Adobe Air、Apache Cordova、Windows 8、Windows Phone 7/8 等，
也提供了原生的 HTML5/JavaScript 的開發支持。
然而在這些開發平臺中，對數據的管理和存儲往往都需要依賴第三方數據庫的支持，如 SQLite、EJDB 等。
NanoDB 則可以在無需運行獨立第三方數據庫的情況下，對應用數據進行存儲和管理。

## 使用

- [Mix Value (GET/SET)](#nano-mix)  
  - [SET](#nanoset)
  - [SETNX](#nanosetnx)
  - [SETEX](#nanosetex)
  - [PSETEX](#nanopsetex)
  - [MSET](#nanomset)
  - [MSETNX](#nanomsetnx)
  - [GET](#nanoget)
  - [MGET](#nanomget)
  - [GETSET](#nanogetset)
  - [DEL](#nanodel)
  - [EXISTS](#nanoexists)
  - [RENAME](#nanorename)
  - [RENAMENX](#nanorenamenx)
  - [KEYS](#nanokeys)
  - [RANDOMKEY](#nanorandomkey)
  - [TYPE](#nanotype)
- [Hash](#nano-hash)
  - [HSET](#nanohset)
  - [HSETNX](#nanohsetnx)
  - [HMSET](#nanohmset)
  - [HGET](#nanohget)
  - [HMGET](#nanohmget)
  - [HGETALL](#nanohgetall)
  - [HDEL](#nanohdel)
  - [HLEN](#nanohlen)
  - [HEXISTS](#nanohexists)
  - [HKEYS](#nanohkeys)
  - [HVALS](#nanovals)


### Nano Mix

#### `nano.set`

```js
nano.set(key, value[, callback]);
```

将字符串值 value 关联到 key 。
如果 key 已经持有其他值， SET 就覆写旧值，无视类型。

```js
nano.set('myname', 'Will Wen Gunn', function(err) {
  if (err) {
    // fail
    return console.error(err);
  }

  // done
});

// Promise
nano.set('myName', 'Will Wen Gunn')
  .then(function() {
    // done
  })
  .fail(function(err) {
    console.error(err);
  });
```

NanoDB 中所有方法都支持 Promise/A(+) 的回調處理方法。

```js
nano.set(key, value)
  .then(...)
  .then(...)
  .done(...)
  .fail(...);
```

#### `nano.setnx`

```js
nano.setnx(key, value[, callback]);
```

将 key 的值设为 value ，当且仅当 key 不存在。 
若给定的 key 已经存在，则 SETNX 不做任何动作。
SETNX 是『SET if Not eXists』(如果不存在，则 SET)的简写。

```js
var key = 'uniqueKey123456';
nano.exists(key)
  .then(function(exists) {
    console.log(exists); //=> false

    return nano.setnx(key, 'foobar');
  })
  .then(function() {
    return 
  })
```

#### `nano.setex`

```js
nano.setex(key, seconds, value[, callback]);
```

将值 value 关联到 key ，并将 key 的生存时间设为 seconds (以秒为单位)。

如果 key 已经存在， SETEX 命令将覆写旧值。

```js
nano.setex('cache_user_id', 60, 10086)
  .then(function() {
    return nano.get('cache_user_id');
  })
  .then(function(value) {
    console.log(value); //=> 10086
  })
  .fail(function(err) {
    console.error(err);
  });
```

#### `nano.psetex`

```js
nano.psetex(key, milliseconds, value[, callback]);
```

这个命令和 SETEX 命令相似，但它以毫秒为单位设置 key 的生存时间，而不是像 SETEX 命令那样，以秒为单位。

```js
nano.psetex('mykey', 1000, 'Hello')
  .then(function() {
    return nano.get('cache_user_id');
  })
  .then(function(value) {
    console.log(value); //=> 'Hello'
  })
  .fail(function(err) {
    console.error(err);
  });
```

#### `nano.mset`

```js
nano.mset(plainObject[, callback]);
```

同时设置一个或多个 key-value 对。

如果某个给定 key 已经存在，那么 MSET 会用新值覆盖原来的旧值，如果这不是你所希望的效果，请考虑使用 MSETNX 命令：它只会在所有给定 key 都不存在的情况下进行设置操作。

MSET 是一个原子性(atomic)操作，所有给定 key 都会在同一时间内被设置，某些给定 key 被更新而另一些给定 key 没有改变的情况，不可能发生。

```js
nano.mset({
  'date'    : '2012.3.30',
  'time'    : '11:00 a.m.',
  'weather' : 'sunny'
})
  .then(function() {
    return nano.mget([ 'date', 'time', 'weather' ]);
  })
  .then(function(values) {
    console.log(values); //=> 2012.3.30, 11:00 a.m., sunny
  })
  .fail(function(err) {
    console.error(err);
  });
```

#### `nano.msetnx`

```js
nano.msetnx(plainObject[, callback]);
```

同时设置一个或多个 key-value 对，当且仅当所有给定 key 都不存在。

即使只有一个给定 key 已存在， MSETNX 也会拒绝执行所有给定 key 的设置操作。

MSETNX 是原子性的，因此它可以用作设置多个不同 key 表示不同字段(field)的唯一性逻辑对象(unique logic object)，所有字段要么全被设置，要么全不被设置。

```js
nano.msetnx({
  'rmdbs'           : 'MySQL',
  'nosql'           : 'MongoDB',
  'key-value-store' : 'redis',
  'font-end-db'     : 'NanoDB'
})
  .then(function() {
    return nano.mget([ 'rmdbs', 'nosql', 'key-value-store', 'font-end-db' ]);
  })
  .then(function(values) {
    console.log(values); //=> MySQL, MongoDB, Redis, NanoDB
  })
  .fail(function(err) {
    console.error(err);
  });
```

#### `nano.get`

```js
nano.get(key[, callback]);
```

返回 key 所关联的值。

如果 key 不存在那么返回 null 。

```js
nano.get('myName')
  .then(function(value) {
    console.log(value); //=> Will Wen Gunn
  })
  .fail(function(err) {
    console.error(err);
  });
```

#### `nano.mget`

```js
nano.mget(keys[, callback]);
```

返回所有给定 key 的值。

如果给定的 key 里面，有某个 key 不存在，那么这个 key 返回特殊值 null。因此，该命令永不失败。

```js
nano.mget([ 'myName' ])
  .then(function(values) {
    console.log(values); //=> Will Wen Gunn
  })
  .fail(function(err) {
    console.error(err);
  });
```

#### `nano.getset`

```js
nano.getset(key, value[, callback]);
```

将给定 key 的值设为 value ，并返回 key 的旧值(old value)。

```js
nano.getset('myName', '小問')
  .then(function(value) {
    console.log(value); //=> Will Wen Gunn
  });
```

### Nano Hash

#### `nano.hset`

```js
nano.hset(key, field, value[, callback]);
```

将哈希表 key 中的域 field 的值设为 value 。

如果 key 不存在，一个新的哈希表被创建并进行 HSET 操作。

如果域 field 已经存在于哈希表中，旧值将被覆盖。

```js
nano.hset('websites', 'google', 'www.google.com')
  .then(function() {
    return nano.hget('websites', 'google');
  })
  .then(function(value) {
    console.log(value); //=> www.google.com
  });
```

#### `nano.hsetnx`

```js
nano.hsetnx(key, field, value[, callback]);
```

将哈希表 key 中的域 field 的值设置为 value ，当且仅当域 field 不存在。

若域 field 已经存在，该操作无效。

如果 key 不存在，一个新哈希表被创建并执行 HSETNX 命令。

```js
nano.hsetnx('nosql', 'front-end-db', 'NanoDB')
  .then(function(reply) {
    console.log(reply); //=> OK

    return nano.hsetnx('nosql', 'front-end-db');
  })
  .fail(function(err) {
    console.error(err); //=> The field of the hash is exists
  });
```

#### `nano.hmset`

```js
nano.hmset(key, plainObject[, callback]);
```

同时将多个 field-value (域-值)对设置到哈希表 key 中。

此命令会覆盖哈希表中已存在的域。

如果 key 不存在，一个空哈希表被创建并执行 HMSET 操作。

```js
nano.hmset('websites', {
  'yahoo': 'www.yahoo.com',
  'github': 'www.github.com'
})
  .then(function() {
    return nano.hget('websites', 'github');
  })
  .then(function(value) {
    console.log(value); //=> www.github.com
  })
  .fail(function(err) {
    console.error(err);
  });
```