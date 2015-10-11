var assert = require('assert')
var should = require('chai').should()
var min = require('./min')

describe('MinDB - Keys', function() {
  describe('del', function() {
    it('should delete a key', function(done) {
      min.del('key')
        .then(function(key) {
          key.should.be.equal('key')

          done()
        })
        .catch(done)

    })
  })

  describe('exists', function() {
    it('should check a key is exists or not', function(done) {
      min.exists('key')
        .then(function(exists) {
          exists.should.be.false

          done()
        })
        .catch(done)

    })
  })

  describe('renamenx', function() {
    it('should rename a key', function(done) {

      min.set('key', 'foobar')
        .then(function() {
          return min.renamenx('key', 'key')
        })
        .then(function() {
          return min.get('key')
        })
        .then(function(val) {
          val.should.be.equal('foobar')

          done()
        })
        .catch(done)

    })
  })

  describe('rename', function() {
    it('should rename a key when the new key is not equal to the old key', function(done) {

      min.set('key', 'value')
        .then(function() {
          return min.rename('key', 'newKey')
        })
        .then(function() {
          return min.get('newKey')
        })
        .then(function(value) {
          value.should.be.equal('value')

          done()
        })
        .catch(done)

    })

    it('should return a error if the new key is equal to the old key', function(done) {
      min.set('newKey', 'foo')
        .then(function() {
          return min.rename('newKey', 'newKey')
        })
        .catch(function(err) {
          err.should.be.an('error')

          return min.del('newKey')
        })
        .then(function() {
          done()
        })
        .catch(done)
    })
  })
  describe('keys', function() {
    it('should return a set of keys which were exists', function(done) {
      min.keys('*')
        .then(function(keys) {
          keys.length.should.be.above(0)

          done()
        })
        .catch(done)
    })
  })

  describe('randomkey', function() {
    it('should return a key which was selected randomly', function(done) {
      min.randomkey()
        .then(function(key) {
          key.should.be.ok

          done()
        })
    })
  })

  describe('type', function() {
    it('should return the type of the value of the key', function(done) {
      min.set('tmpKey', 'foobar')
        .then(function() {
          return min.type('tmpKey')
        })
        .then(function(type) {
          type.should.be.equal('mix')

          return min.del('tmpKey')
        })
        .then(function() {
          return min.hset('tmpKey', 'foo', 'bar')
        })
        .then(function() {
          return min.type('tmpKey')
        })
        .then(function(type) {
          type.should.be.equal('hash')

          return min.del('tmpKey')
        })
        .then(function() {
          return min.lpush('tmpKey', 1)
        })
        .then(function() {
          return min.type('tmpKey')
        })
        .then(function(type) {
          type.should.be.equal('list')

          return min.del('tmpKey')
        })
        .then(function() {
          return min.sadd('tmpKey', 1)
        })
        .then(function() {
          return min.type('tmpKey')
        })
        .then(function(type) {
          type.should.be.equal('set')

          return min.del('tmpKey')
        })
        .then(function() {
          return min.zadd('tmpKey', 1, 1)
        })
        .then(function() {
          return min.type('tmpKey')
        })
        .then(function(type) {
          type.should.be.equal('zset')

          return min.del('tmpKey')
        })
        .then(function() {
          done(null)
        })
        .catch(done)
    })
  })

  describe('empty', function() {
    it('should empty all the database', function(done) {
      min.mset({
        'foo': 1,
        'bar': 2
      })
        .then(function() {
          return min.empty()
        })
        .then(function() {
          return min.exists('foo')
        })
        .then(function(exists) {
          exists.should.be.false

          return min.exists('bar')
        })
        .then(function(exists) {
          exists.should.be.false

          done()
        })
        .catch(done)
    })
  })

  describe('save', function() {
    it('should save the keys of current database into store', function(done) {
      min.set('key', 'foobar')
        .then(function() {
          return min.save()
        })
        .then(function(args) {
          var dump = args[0]

          dump.should.to.include.keys('key')
          dump['key'].should.to.be.equal('foobar')

          done()
        })
        .catch(done)
    })
  })

  describe('dump', function() {
    it('should return the whole', function(done) {
      min.set('key', 'foobar')
        .then(function() {
          return min.dump()
        })
        .then(function(args) {
          var dump = args[0]

          dump.should.to.include.keys('key')
          dump['key'].should.to.be.equal('foobar')

          done()
        })
        .catch(done)
    })
  })

  describe('restore', function() {
    it('should restore the data back to the databse', function(done) {
      min.restore({
        key: 'foobar',
        min_keys: '{"key":0}'
      })
        .then(function() {
          return min.exists('key')
        })
        .then(function(exists) {
          exists.should.be.true

          return min.get('key')
        })
        .then(function(val) {
          val.should.be.equal('foobar')

          return min.type('key')
        })
        .then(function(type) {
          type.should.be.equal('mix')

          return min.empty()
        })
        .then(function() {
          done()
        })
        .catch(done)
    })
  })

  describe('watch', function() {
    it('should watch a key\'s set(default) actions', function(done) {

      min.watch('someKey1', function(newValue) {
        newValue.should.be.equal('foo')

        min.del('someKey1', done)
      })

      min.set('someKey1', 'foo')
    })

    it('should watch a key\'s some actions like remove', function(done) {
      min.watch('someKey2', 'del', function() {
        min.exists('someKey2')
          .then(function(exists) {
            exists.should.be.false

            done()
          })
          .catch(done)
      })

      min.set('someKey2', 'foo')
        .then(function() {
          return min.del('someKey2')
        })
    })
  })

  describe('unwatch', function() {
    it('should unwatch the watcher had established before', function(done) {
      var id = min.watch('key', function(newValue) {
        done(new Error('wrong'))
      })

      min.unwatch('key', id)

      min.set('key', 1)
        .then(function() {
          return min.del('key')
        })
        .then(function() {
          done()
        })
        .catch(done)
    })

    it('should unwatch the watcher of some actions', function(done) {
      var id = min.watch('key', 'rename', function(newKey) {
        done(new Error('wrong'))
      })

      min.unwatch('key', 'rename', id)

      min.set('key', 1)
        .then(function() {
          return min.rename('key', 'newKey')
        })
        .then(function() {
          done()
        })
        .catch(done)
    })
  })

  describe('unwatchForKey', function() {
    it('should unwatch all the watcher of the key', function(done) {
      min.watch('key', function(newValue) {
        done(new Error('wrong'))
      })

      min.watch('key', 'del', function() {
        done(new Error('wrong'))
      })

      min.unwatchForKey('key')

      min.multi()
        .set('key', 'foobar')
        .del('key')
        .exec(function() {
          done()
        })
    })
  })
})