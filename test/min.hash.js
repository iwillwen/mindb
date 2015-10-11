var assert = require('assert')
var should = require('chai').should()
var min = require('./min')

describe('MinDB - Hash', function() {
  describe('hset', function() {
    it('should set the field in the hash on the key with the value', function(done) {
      min.hset('hashKey', 'foo', 'bar')
        .then(function(args) {
          var key = args[0]
          var field = args[1]
          var value = args[2]

          key.should.be.equal('hashKey')
          field.should.be.equal('foo')
          value.should.be.equal('bar')

          return min.del('hashKey')
        })
        .then(function() {
          done()
        })
        .catch(done)
    })
  })

  describe('hsetnx', function() {
    it('should set the field in the hash on the key if it was not exists', function(done) {
      min.hsetnx('hashKey', 'foo', 'bar')
        .then(function() {
          return min.hget('hashKey', 'foo')
        })
        .then(function(value) {
          value.should.be.equal('bar')

          return min.del('hashKey')
        })
        .then(function() {
          done()
        })
        .catch(done)
    })

    it('should return an error when the field of the hash was exists', function(done) {
      min.hset('hashKey', 'foo', 'bar')
        .then(function() {
          return min.hsetnx('hashKey', 'foo', 'bar')
        })
        .catch(function(err) {
          err.should.be.an('error')

          done()
        })
    })
  })

  describe('hmset', function() {
    it('should set the fileds in the hash on the key with the values', function(done) {
      min.hmset('hashKey', {
        foo: 1,
        bar: 2
      })
        .then(function() {
          return min.hgetall('hashKey')
        })
        .then(function(hash) {
          hash.should.be.include.keys('foo')
          hash['foo'].should.be.equal(1)

          hash.should.be.include.keys('bar')
          hash['bar'].should.be.equal(2)

          return min.del('hashKey')
        })
        .then(function() {
          done()
        })
        .catch(done)
    })
  })

  describe('hexists', function() {
    it('should return the status of a field in a hash', function(done) {
      min.hset('hashKey', 'foo', 'bar')
        .then(function() {
          return min.hexists('hashKey', 'foo')
        })
        .then(function(exists) {
          exists.should.be.true

          done()
        })
        .catch(done)
    })
  })
})