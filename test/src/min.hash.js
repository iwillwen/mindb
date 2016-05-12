import { should as Should } from 'chai'
import min from './min'

const should = Should()

describe('MinDB - Hash', () => {
  describe('hset', () => {
    it('should set the field in the hash on the key with the value', done => {
      min.hset('hashKey', 'foo', 'bar')
        .then(([ key, field, value ]) => {
          key.should.be.equal('hashKey')
          field.should.be.equal('foo')
          value.should.be.equal('bar')

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })
  })

  describe('hsetnx', () => {
    it('should set the field in the hash on the key if it was not exists', done => {
      min.hsetnx('hashKey', 'foo', 'bar')
        .then(() => min.hget('hashKey', 'foo'))
        .then(value => {
          value.should.be.equal('bar')

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should return an error when the field of the hash was exists', done => {
      min.hset('hashKey', 'foo', 'bar')
        .then(() => min.hsetnx('hashKey', 'foo', 'bar'))
        .catch(err => {
          err.message.should.equal('The field of the hash is exists')

          done()
        })
    })
  })

  describe('hmset', () => {
    it('should set the fileds in the hash on the key with the values', done => {
      min.hmset('hashKey', {
        foo: 1,
        bar: 2
      })
        .then(() => min.hgetall('hashKey'))
        .then(hash => {
          hash.should.be.include.keys('foo')
          hash['foo'].should.be.equal(1)

          hash.should.be.include.keys('bar')
          hash['bar'].should.be.equal(2)

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })
  })

  describe('hexists', () => {
    it('should return the status of a field in a hash', done => {
      min.hset('hashKey', 'foo', 'bar')
        .then(() => min.hexists('hashKey', 'foo'))
        .then(exists => {
          exists.should.be.true

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should return false when the hash is not exists', done => {
      min.hexists('hashKey', 'foo')
        .then(exists => {
          exists.should.be.false

          done()
        })
        .catch(done)
    })

    it('should return false when the field in the hash is not exists', done => {
      min.hset('hashKey', 'foo', 'bar')
        .then(() => min.hexists('hashKey', 'bar'))
        .then(exists => {
          exists.should.be.false

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })
  })

  describe('hget', () => {
    it('should return the correct value in the key', done => {
      min.hset('hashKey', 'foo', 'bar')
        .then(() => min.hget('hashKey', 'foo'))
        .then(value => {
          value.should.equal('bar')

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the key is not exists', done => {
      min.hget('nothing', 'foo')
        .catch(err => {
          err.message.should.equal('no such field')

          done()
        })
    })
  })

  describe('hmget', () => {
    it('should return multiples values of a key in the fields', done => {
      min.hmset('hashKey', {
        'foo': 1,
        'bar': 2
      })
        .then(() => min.hmget('hashKey', [ 'foo', 'bar' ]))
        .then(([ result1, result2 ]) => {
          result1.should.equal(1)
          result2.should.equal(2)

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when there is a field not exists in the key', done => {
      min.hmset('hashKey', {
        'foo': 1,
      })
        .then(() => min.hmget('hashKey', [ 'foo', 'bar' ]))
        .catch(err => {
          err.message.should.equal('no such field')

          done()
        })
    })
  })

  describe('hgetall', () => {
    it('should return the whold hash of the key', done => {
      min.hmset('hashKey', {
        foo: 1,
        bar: 2
      })
        .then(() => min.hgetall('hashKey'))
        .then(hash => {
          hash.should.deep.equal({
            foo: 1,
            bar: 2
          })

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the key is not exists', done => {
      min.hgetall('hashKey')
        .catch(err => {
          err.message.should.equal('no such key')

          done()
        })
    })
  })

  describe('hdel', () => {
    it('should remove the hash of the key', done => {
      min.hset('hashKey', 'foo', 'bar')
        .then(() => min.hget('hashKey', 'foo'))
        .then(value => {
          value.should.equal('bar')

          return min.hdel('hashKey', 'foo')
        })
        .then(() => min.hexists('hashKey', 'foo'))
        .then(exists => {
          exists.should.be.false

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when trying to remove a not exists hash', done => {
      min.hdel('hashKey', 'foo')
        .catch(err => {
          err.message.should.equal('no such key')

          done()
        })
    })

    it('should throw an error when trying to remove a not exists field in the hash', done => {
      min.hmset('hashKey', {
        foo: 1
      })
        .then(() => min.hdel('hashKey', 'bar'))
        .catch(err => {
          err.message.should.equal('no such key')

          done()
        })
    })
  })

  describe('hlen', () => {
    it('should return the correct amount of fields in the hash', done => {
      min.hmset('hashKey', {
        foo: 1,
        bar: 2
      })
        .then(() => min.hlen('hashKey'))
        .then(len => {
          len.should.equal(2)

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should return 0 when the hash is not exists', done => {
      min.hlen('hashKey')
        .then(len => {
          len.should.equal(0)

          done()
        })
        .catch(done)
    })
  })

  describe('hkeys', () => {
    it('should return the keys of the hash', done => {
      min.hmset('hashKey', {
        'a': 1,
        'b': 2,
        'c': 3
      })
        .then(() => min.hkeys('hashKey'))
        .then(keys => {
          keys.should.include.members([ 'a', 'b', 'c' ])

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should return an empty arry when the hash is not exists', done => {
      min.hkeys('hashKey')
        .then(keys => {
          keys.length.should.equal(0)

          done()
        })
        .catch(done)
    })
  })

  describe('hincr', () => {
    it('should set the not exists field to 1 of the hash', done => {
      min.hincr('hashKey', 'foo')
        .then(() => min.hget('hashKey', 'foo'))
        .then(value => {
          value.should.equal(1)

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should increase 1 the number in an exists field of the key', done => {
      min.hset('hashKey', 'foo', 1)
        .then(() => min.hincr('hashKey', 'foo'))
        .then(() => min.hget('hashKey', 'foo'))
        .then(value => {
          value.should.equal(2)

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the value of the field is not a number', done => {
      min.hset('hashKey', 'foo', 'bar')
        .then(() => min.hincr('hashKey', 'foo'))
        .catch(err => {
          err.message.should.equal('value wrong')

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })
  })

  describe('hincrby', () => {
    it('should set the not exists field to 0 of the hash', done => {
      min.hincrby('hashKey', 'foo', 2)
        .then(() => min.hget('hashKey', 'foo'))
        .then(value => {
          value.should.equal(2)

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should increase 1 the number in an exists field of the key', done => {
      min.hset('hashKey', 'foo', 1)
        .then(() => min.hincrby('hashKey', 'foo', 2))
        .then(() => min.hget('hashKey', 'foo'))
        .then(value => {
          value.should.equal(3)

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the value of the field is not a number', done => {
      min.hset('hashKey', 'foo', 'bar')
        .then(() => min.hincrby('hashKey', 'foo', 2))
        .catch(err => {
          err.message.should.equal('value wrong')

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })
  })

  describe('hincrbyfloat', () => {
    it('should set the not exists field to 0 of the hash', done => {
      min.hincrbyfloat('hashKey', 'foo', 2.1)
        .then(() => min.hget('hashKey', 'foo'))
        .then(value => {
          value.should.equal(2.1)

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should increase 1 the number in an exists field of the key', done => {
      min.hset('hashKey', 'foo', 1)
        .then(() => min.hincrbyfloat('hashKey', 'foo', 2.1))
        .then(() => min.hget('hashKey', 'foo'))
        .then(value => {
          value.should.equal(3.1)

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the value of the field is not a number', done => {
      min.hset('hashKey', 'foo', 'bar')
        .then(() => min.hincrbyfloat('hashKey', 'foo', 2.1))
        .catch(err => {
          err.message.should.equal('value wrong')

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })
  })

  describe('hdecr', () => {
    it('should set the not exists field to -1 of the hash', done => {
      min.hdecr('hashKey', 'foo')
        .then(() => min.hget('hashKey', 'foo'))
        .then(value => {
          value.should.equal(-1)

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should decrease 1 the number in an exists field of the key', done => {
      min.hset('hashKey', 'foo', 1)
        .then(() => min.hdecr('hashKey', 'foo'))
        .then(() => min.hget('hashKey', 'foo'))
        .then(value => {
          value.should.equal(0)

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the value of the field is not a number', done => {
      min.hset('hashKey', 'foo', 'bar')
        .then(() => min.hdecr('hashKey', 'foo'))
        .catch(err => {
          err.message.should.equal('value wrong')

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })
  })

  describe('hdecrby', () => {
    it('should set the not exists field to 0 of the hash', done => {
      min.hdecrby('hashKey', 'foo', 2)
        .then(() => min.hget('hashKey', 'foo'))
        .then(value => {
          value.should.equal(-2)

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should decrease 1 the number in an exists field of the key', done => {
      min.hset('hashKey', 'foo', 1)
        .then(() => min.hdecrby('hashKey', 'foo', 2))
        .then(() => min.hget('hashKey', 'foo'))
        .then(value => {
          value.should.equal(-1)

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the value of the field is not a number', done => {
      min.hset('hashKey', 'foo', 'bar')
        .then(() => min.hdecrby('hashKey', 'foo', 2))
        .catch(err => {
          err.message.should.equal('value wrong')

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })
  })

  describe('hdecrbyfloat', () => {
    it('should set the not exists field to 0 of the hash', done => {
      min.hdecrbyfloat('hashKey', 'foo', 2.1)
        .then(() => min.hget('hashKey', 'foo'))
        .then(value => {
          value.should.equal(-2.1)

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should decrease a decrement to the number in an exists field of the key', done => {
      min.hset('hashKey', 'foo', 1)
        .then(() => min.hdecrbyfloat('hashKey', 'foo', 2.1))
        .then(() => min.hget('hashKey', 'foo'))
        .then(value => {
          value.should.equal(-1.1)

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the value of the field is not a number', done => {
      min.hset('hashKey', 'foo', 'bar')
        .then(() => min.hdecrbyfloat('hashKey', 'foo', 2.1))
        .catch(err => {
          err.message.should.equal('value wrong')

          return min.del('hashKey')
        })
        .then(() => done())
        .catch(done)
    })
  })
})
