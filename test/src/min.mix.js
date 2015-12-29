import { should as Should } from 'chai'
import min from './min'

const should = Should()

describe('MinDB - Mix', () => {
  describe('set', () => {
    it('should set a key with a string value', done => {
      min.set('key', 'value')
        .then(key => {
          return min.get(key)
        })
        .then(value => {
          value.should.be.equal('value')

          done()
        })
        .catch(done)
    })

    it('should set a key with a number value', function(done) {
      var value = null

      min.set('key', 2333)
        .then(key => {
          return min.get(key)
        })
        .then(value => {
          value.should.be.equal(2333)

          done()
        })
        .catch(done)
    })

    it('should set a key with a boolean value', function(done) {
      var value = null

      min.set('key', true)
        .then(key => {
          return min.get(key)
        })
        .then(value => {
          value.should.be.equal(true)

          done()
        })
        .catch(done)
    })

    it('should set a key with a array value', function(done) {
      var value = null

      min.set('key', [ 2, 3, 3, 3 ])
        .then(key => {
          return min.get(key)
        })
        .then(function(value) {
          value.should.be.deep.equal([ 2, 3, 3, 3 ])

          done()
        })
        .catch(done)
    })

    it('should set a key with a object value', function(done) {
      min.set('key', { code: 233 })
        .then(key => {
          key.should.be.equal('key')

          return min.get(key)
        })
        .then(value => {
          value.should.be.deep.equal({ code: 233 })

          done()
        })
        .catch(done)
    })
  })

  describe('setnx', function() {
    it('should set a key if the key is not exists', function(done) {
      min.set('fool', 'value')
        .then(key => {
          key.should.be.equal('fool')

          return min.get(key)
        })
        .then(value => {
          value.should.be.equal('value')

          return min.del('fool')
        })
        .then(() => done())
        .catch(done)
    })


    it('should return a error if the key was exists', function(done) {
      min.setnx('key', 'foobar')
        .catch(function(err) {
          err.message.should.equal('The key is exists.')

          done()
        })
    })
  })

  describe('setex', function() {
    it('should set a key with a TTL(Time to Live)(s)', function(done) {
      min.setex('fool', 0.01, 'value')
        .then(key => {
          key.should.be.equal('fool')

          return min.get(key)
        })
        .then(value => {
          value.should.equal('value')

          setTimeout(() => {
            min.exists('fool')
              .then(exists => {
                exists.should.be.false

                done()
              })
              .catch(done)
          }, 12)
        })
        .catch(done)
    })
  })

  describe('psetex', function() {
    it('should set a key with a TTL(Time to Live)(ms)', function(done) {
      min.psetex('fool1', 10, 'value')
        .then(key => {
          key.should.be.equal('fool1')

          return min.get(key)
        })
        .then(value => {
          value.should.equal('value')

          setTimeout(function() {
            min.exists('fool1')
              .then(function(exists) {
                exists.should.be.false

                done()
              })
              .catch(done)
          }, 12)
        })
        .catch(done)
    })
  })

  describe('mset', function() {
    it('should set a set of keys', function(done) {
      min.mset({
        '_key1': 'value1',
        '_key2': 'value2'
      })
      .then(function(results) {
        results[0].should.be.equal('_key1')
        results[1].should.be.equal('_key2')

        done()
      })
      .catch(done)
    })
  })

  describe('msetnx', function() {
    it('should set a set of keys if they are not exists', function(done) {
      min.msetnx({
        '_key3': 'value3',
        '_key4': 'value4'
      })
      .then(function(results) {
        results[0].should.be.equal('_key3')
        results[1].should.be.equal('_key4')

        var n = results.length

        for (var i = 0; i < results.length; i++) {
          min.del(results[i][0])
            .then(function() {
              --n || done()
            })
            .catch(function() {
              --n || done()
            })
        }
      })
      .catch(done)
    })

    it('should return a error if a key was exists', function(done) {
      min.set('_key5', 'value5')
        .then(function() {

          min.msetnx({
            '_key5': 'foobar',
            '_key6': 'value6'
          })
          .catch(function(errors) {
            errors.length.should.be.above(0)

            min.exists('_key6')
              .then(function(exists) {
                exists.should.be.false

                return min.del('_key5')
              })
              .then(function() {
                done()
              })
          })
        })
    })
  })

  describe('append', function() {
    it('should set a string to a key when it was not exists', function(done) {
      min.append('someKey', 'foobar')
        .then(function() {
          return min.get('someKey')
        })
        .then(function(val) {
          val.should.be.equal('foobar')

          return min.del('someKey')
        })
        .then(function() {
          done()
        })
        .catch(done)
    })

    it('should append a patch of string to a key of string', function(done) {
      min.set('someKey', 'foobar')
        .then(function() {
          return min.append('someKey', 'other')
        })
        .then(function() {
          return min.get('someKey')
        })
        .then(function(val) {
          val.should.be.equal('foobarother')

          return min.del('someKey')
        })
        .then(function() {
          done()
        })
        .catch(done)
    })
  })

  describe('incr', function() {
    it('should set 1 to the key when the key was not exists', function(done) {
      min.incr('number')
        .then(function() {
          return min.get('number')
        })
        .then(function(val) {
          val.should.be.equal(1)

          return min.del('number')
        })
        .then(function() {
          done()
        })
        .catch(done)
    })

    it('should add 1 to the key', function(done) {
      min.set('number', 1)
        .then(function() {
          return min.incr('number')
        })
        .then(function() {
          return min.get('number')
        })
        .then(function(val) {
          val.should.be.equal(2)

          return min.del('number')
        })
        .then(function() {
          done()
        })
        .catch(done)
    })

    it('should set a number to a key when the key was not exists', function(done) {
      min.incrby('number', 2)
        .then(function() {
          return min.get('number')
        })
        .then(function(val) {
          val.should.be.equal(2)

          return min.del('number')
        })
        .then(function() {
          done()
        })
        .catch(done)
    })

    it('should add a number to the key', function(done) {
      min.set('number', 1)
        .then(function() {
          return min.incrby('number', 2)
        })
        .then(function() {
          return min.get('number')
        })
        .then(function(val) {
          val.should.be.equal(3)

          return min.del('number')
        })
        .then(function() {
          done()
        })
        .catch(done)
    })
  })

  describe('decr', function() {
    it('should set -1 to the key when the key was not exists', function(done) {
      min.decr('number')
        .then(function() {
          return min.get('number')
        })
        .then(function(val) {
          val.should.be.equal(-1)

          return min.del('number')
        })
        .then(function() {
          done()
        })
        .catch(done)
    })

    it('should minus 1 to the key', function(done) {
      min.set('number', 1)
        .then(function() {
          return min.decr('number')
        })
        .then(function() {
          return min.get('number')
        })
        .then(function(val) {
          val.should.be.equal(0)

          return min.del('number')
        })
        .then(function() {
          done()
        })
        .catch(done)
    })

    it('should set a number to a key when the key was not exists', function(done) {
      min.decrby('number', 2)
        .then(function() {
          return min.get('number')
        })
        .then(function(val) {
          val.should.be.equal(-2)

          return min.del('number')
        })
        .then(function() {
          done()
        })
        .catch(done)
    })

    it('should minus a number to the key', function(done) {
      min.set('number', 1)
        .then(function() {
          return min.decrby('number', 2)
        })
        .then(function() {
          return min.get('number')
        })
        .then(function(val) {
          val.should.be.equal(-1)

          return min.del('number')
        })
        .then(function() {
          done()
        })
        .catch(done)
    })
  })

  describe('get', function() {
    it('should get the value of the key', function(done) {
      min.set('key', 'value')
        .then(function() {
          return min.get('key')
        })
        .then(function(value) {
          value.should.equal('value')

          done()
        })
        .catch(done)
    })

    it('should return a error if the key was not exists', function(done) {
      min.get('something')
        .catch(function(err) {
          err.message.should.equal('no such key')

          done()
        })
    })
  })

  describe('mget', function() {
    it('should get the values of a set of keys', function(done) {
      min.set('key', 'value')
        .then(function() {
          return min.mget([ 'key' ])
        })
        .then(function(values) {
          values[0].should.be.equal('value')

          done()
        })
        .catch(done)
    })

    it('should return errors if a key was not exists', function(done) {
      min.mget([ 'key', 'something' ])
        .catch(err => {
          err.message.should.equal('no such key')

          done()
        })
    })
  })

  describe('getset', function() {
    it('should set a value on a key and return the old value', function(done) {
      min.getset('key', 'new_value')
        .then(function(oldValue) {
          oldValue.should.be.equal('value')

          done()
        })
        .catch(done)
    })
  })

  describe('strlen', function() {
    it('should return the length of the string', function(done) {
      min.set('key', 'foobar')
        .then(function() {
          return min.strlen('key')
        })
        .then(function(length) {
          length.should.be.equal(6)

          return min.del('key')
        })
        .then(function() {
          done()
        })
        .catch(done)
    })
  })
})
