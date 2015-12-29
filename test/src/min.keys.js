import { should as Should } from 'chai'
import min from './min'

const should = Should()

describe('MinDB - Keys', () => {
  describe('del', () => {
    it('should delete a key', done => {
      min.set('key', 'foobar')
        .then(() => min.del('key'))
        .then(key => {
          key.should.be.equal('key')

          return min.exists('key')
        })
        .then(exists => {
          exists.should.be.false

          done()
        })
        .catch(done)

    })
  })

  describe('exists', () => {
    it('should check a key is exists or not', done => {
      min.exists('key')
        .then(exists => {
          exists.should.be.false

          done()
        })
        .catch(done)

    })
  })

  describe('renamenx', () => {
    it('should rename a key', done => {

      min.set('key', 'foobar')
        .then(() => min.renamenx('key', 'key'))
        .then(() => min.get('key'))
        .then(val => {
          val.should.be.equal('foobar')

          return min.del('key')
        })
        .then(() => done())
        .catch(done)

    })
  })

  describe('rename', () => {
    it('should rename a key when the new key is not equal to the old key', done => {

      min.set('key', 'value')
        .then(() => min.rename('key', 'newKey'))
        .then(() => min.get('newKey'))
        .then(value => {
          value.should.be.equal('value')

          return min.del('newKey')
        })
        .then(() => done())
        .catch(done)

    })

    it('should return a error if the new key is equal to the old key', done => {
      min.set('newKey', 'foo')
        .then(() => min.rename('newKey', 'newKey'))
        .catch(err => {
          err.message.should.equal('The key is equal to the new key.')

          return min.del('newKey')
        })
        .then(() => done())
        .catch(done)
    })
  })
  describe('keys', () => {
    it('should return a set of keys which were exists', done => {
      min.set('key', 1)
        .then(() => min.keys('*'))
        .then(keys => {
          keys.length.should.be.above(0)

          done()
        })
        .catch(done)
    })
  })

  describe('randomkey', () => {
    it('should return a key which was selected randomly', done => {
      min.set('key', 1)
        .then(() => min.randomkey())
        .then(key => {
          key.should.be.ok

          done()
        })
    })
  })

  describe('type', () => {
    it('should return the type of the value of the key', done => {
      min.set('tmpKey', 'foobar')
        .then(() => min.type('tmpKey'))
        .then(type => {
          type.should.be.equal('mix')

          return min.del('tmpKey')
        })
        .then(() => min.hset('tmpKey', 'foo', 'bar'))
        .then(() => min.type('tmpKey'))
        .then(type => {
          type.should.be.equal('hash')

          return min.del('tmpKey')
        })
        .then(() => min.lpush('tmpKey', 1))
        .then(() => min.type('tmpKey'))
        .then(type => {
          type.should.be.equal('list')

          return min.del('tmpKey')
        })
        .then(() => min.sadd('tmpKey', 1))
        .then(() => min.type('tmpKey'))
        .then(type => {
          type.should.be.equal('set')

          return min.del('tmpKey')
        })
        .then(() => min.zadd('tmpKey', 1, 1))
        .then(() => min.type('tmpKey'))
        .then(type => {
          type.should.be.equal('zset')

          return min.del('tmpKey')
        })
        .then(() => done())
        .catch(done)
    })
  })

  describe('empty', () => {
    it('should empty all the database', done => {
      min.mset({
        'foo': 1,
        'bar': 2
      })
        .then(() => min.empty())
        .then(() => min.exists('foo'))
        .then(exists => {
          exists.should.be.false

          return min.exists('bar')
        })
        .then(exists => {
          exists.should.be.false

          done()
        })
        .catch(done)
    })
  })

  describe('save', () => {
    it('should save the keys of current database into store', done => {
      min.set('key', 'foobar')
        .then(() => min.save())
        .then(args => {
          var dump = args[0]

          dump.should.to.include.keys('key')
          dump['key'].should.to.be.equal('foobar')

          done()
        })
        .catch(done)
    })
  })

  describe('dump', () => {
    it('should return the whole', done => {
      min.set('key', 'foobar')
        .then(() => min.dump())
        .then(args => {
          var dump = args[0]

          dump.should.to.include.keys('key')
          dump['key'].should.to.be.equal('foobar')

          done()
        })
        .catch(done)
    })
  })

  describe('restore', () => {
    it('should restore the data back to the databse', done => {
      min.restore({
        key: 'foobar',
        min_keys: '{"key":0}'
      })
        .then(() => min.exists('key'))
        .then(exists => {
          exists.should.be.true

          return min.get('key')
        })
        .then(val => {
          val.should.be.equal('foobar')

          return min.type('key')
        })
        .then(type => {
          type.should.be.equal('mix')

          return min.empty()
        })
        .then(() => {
          done()
        })
        .catch(done)
    })
  })

  describe('watch', () => {
    it('should watch a key\'s set(default) actions', done => {

      min.watch('someKey1', newValue => {
        newValue.should.be.equal('foo')

        min.del('someKey1', done)
      })

      min.set('someKey1', 'foo')
    })

    it('should watch a key\'s some actions like remove', done => {
      min.watch('someKey2', 'del', () => {
        min.exists('someKey2')
          .then(exists => {
            exists.should.be.false

            done()
          })
          .catch(done)
      })

      min.set('someKey2', 'foo')
        .then(() => {
          return min.del('someKey2')
        })
    })
  })

  describe('unwatch', () => {
    it('should unwatch the watcher had established before', done => {
      var id = min.watch('key', newValue => {
        done(new Error('wrong'))
      })

      min.unwatch('key', id)

      min.set('key', 1)
        .then(() => min.del('key'))
        .then(() => done())
        .catch(done)
    })

    it('should unwatch the watcher of some actions', done => {
      var id = min.watch('key', 'rename', newKey => {
        done(new Error('wrong'))
      })

      min.unwatch('key', 'rename', id)

      min.set('key', 1)
        .then(() => min.rename('key', 'newKey'))
        .then(() => done())
        .catch(done)
    })
  })

  describe('unwatchForKey', () => {
    it('should unwatch all the watcher of the key', done => {
      min.watch('key', newValue => {
        done(new Error('wrong'))
      })

      min.watch('key', 'del', () => {
        done(new Error('wrong'))
      })

      min.unwatchForKey('key')

      min.multi()
        .set('key', 'foobar')
        .del('key')
        .exec(() => done())
    })
  })
})
