import { should as Should } from 'chai'
import min from './min'

const should = Should()

describe('MinDB - Sorted Set', () => {
  describe('zadd', () => {
    it('should add elements to an empty sorted set', done => {
      min.zadd('zsetKey', 1, 'foo')
        .then(() => min.zcard('zsetKey'))
        .then(count => {
          count.should.equal(1)

          return min.del('zsetKey')
        })
        .then(() => done())
        .catch(done)
    })
  })

  describe('zcard', () => {
    it('should return the count of elements in the sorted set', done => {
      min.zadd('zsetKey', 1, 'foo')
        .then(() => min.zadd('zsetKey', 2, 'bar'))
        .then(() => min.zcard('zsetKey'))
        .then(count => {
          count.should.equal(2)

          return min.zrem('zsetKey', 'foo')
        })
        .then(() => min.zcard('zsetKey'))
        .then(count => {
          count.should.equal(1)

          return min.del('zsetKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the sorted set is not exists', done => {
      min.zcard('zsetKey')
        .catch(err => {
          err.message.should.equal('no such key')

          done()
        })
    })
  })

  describe('zcount', () => {
    it('should return the number of elements between the range of score', done => {
      min.zadd('zsetKey', 1, 'foo')
        .then(() => min.zadd('zsetKey', 3, 'bar'))
        .then(() => min.zadd('zsetKey', 4, 'abc'))
        .then(() => min.zcount('zsetKey', 2, 5))
        .then(count => {
          count.should.equal(2)

          return min.del('zsetKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the sorted set is not exists', done => {
      min.zcount('zsetKey', 2, 5)
        .catch(err => {
          err.message.should.equal('no such key')

          done()
        })
    })
  })

  describe('zrem', () => {
    it('should remove a member from a sorted set', done => {
      min.zadd('zsetKey', 1, 'foo')
        .then(() => min.zadd('zsetKey', 3, 'bar'))
        .then(() => min.zadd('zsetKey', 4, 'abc'))
        .then(() => min.zrem('zsetKey', 'bar'))
        .then(() => min.zscore('zsetKey', 'bar'))
        .catch(err => {
          err.message.should.equal('This member does not be in the set')

          return min.del('zsetKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the sorted set is not exists', done => {
      min.zrem('zsetKey', 'bar')
        .catch(err => {
          err.message.should.equal('no such key')

          done()
        })
    })
  })

  describe('zscore', () => {
    it('should return the score of the member in the sorted set', done => {
      min.zadd('zsetKey', 2, 'foo')
        .then(() => min.zadd('zsetKey', 3, 'bar'))
        .then(() => min.zscore('zsetKey', 'foo'))
        .then(score => {
          score.should.equal(2)

          return min.zscore('zsetKey', 'bar')
        })
        .then(score => {
          score.should.equal(3)

          return min.del('zsetKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the sorted set is not exists', done => {
      min.zscore('zsetKey', 'foo')
        .catch(err => {
          err.message.should.equal('no such key')

          done()
        })
    })

    it('should throw an error when the member is not in the sorted set', done => {
      min.zadd('zsetKey', 1, 'foo')
        .then(() => min.zscore('zsetKey', 'bar'))
        .catch(err => {
          err.message.should.equal('This member does not be in the set')

          return min.del('zsetKey')
        })
        .then(() => done())
        .catch(done)
    })
  })

  describe('zrange', () => {
    it('should return the number of elements between the range of score', done => {
      min.zadd('zsetKey', 1, 'foo')
        .then(() => min.zadd('zsetKey', 3, 'bar'))
        .then(() => min.zadd('zsetKey', 4, 'abc'))
        .then(() => min.zrange('zsetKey', 2, 5))
        .then(set => {
          set.should.deep.equal([ 'bar', 'abc' ])

          return min.del('zsetKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the sorted set is not exists', done => {
      min.zrange('zsetKey', 2, 5)
        .catch(err => {
          err.message.should.equal('no such key')

          done()
        })
    })
  })

  describe('zrange.withScore', () => {
    it('should return the number of elements with their score between the range of score', done => {
      min.zadd('zsetKey', 1, 'foo')
        .then(() => min.zadd('zsetKey', 3, 'bar'))
        .then(() => min.zadd('zsetKey', 4, 'abc'))
        .then(() => min.zrange('zsetKey', 2, 5).withScore())
        .then(set => {
          set.map(member => member.member).should.deep.equal([ 'bar', 'abc' ])
          set.map(member => member.score).should.deep.equal([ 3, 4 ])

          return min.del('zsetKey')
        })
        .then(() => done())
        .catch(done)
    })
  })

  describe('zrevrange', () => {
    it('should return the number of elements between the range of score', done => {
      min.zadd('zsetKey', 1, 'foo')
        .then(() => min.zadd('zsetKey', 3, 'bar'))
        .then(() => min.zadd('zsetKey', 4, 'abc'))
        .then(() => min.zrevrange('zsetKey', 2, 5))
        .then(set => {
          set.should.deep.equal([ 'abc', 'bar' ])

          return min.del('zsetKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the sorted set is not exists', done => {
      min.zrevrange('zsetKey', 2, 5)
        .catch(err => {
          err.message.should.equal('no such key')

          done()
        })
    })
  })

  describe('zrevrange.withScore', () => {
    it('should return the number of elements with their score between the range of score', done => {
      min.zadd('zsetKey', 1, 'foo')
        .then(() => min.zadd('zsetKey', 3, 'bar'))
        .then(() => min.zadd('zsetKey', 4, 'abc'))
        .then(() => min.zrevrange('zsetKey', 2, 5).withScore())
        .then(set => {
          set.map(member => member.member).should.deep.equal([ 'abc', 'bar' ])
          set.map(member => member.score).should.deep.equal([ 4, 3 ])

          return min.del('zsetKey')
        })
        .then(() => done())
        .catch(done)
    })
  })

  describe('zincrby', () => {
    it('should increase the score of the member by the increment', done => {
      min.zadd('zsetKey', 1, 'foo')
        .then(() => min.zincrby('zsetKey', 1.1, 'foo'))
        .then(() => min.zscore('zsetKey', 'foo'))
        .then(score => {
          score.should.equal(2.1)

          return min.del('zsetKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should set the score of the member by the increment if the member is not in the sorted set', done => {
      min.zincrby('zsetKey', 1.1, 'foo')
        .then(() => min.zscore('zsetKey', 'foo'))
        .then(score => {
          score.should.equal(1.1)

          return min.del('zsetKey')
        })
        .then(() => done())
        .catch(done)
    })
  })

  describe('zdecrby', () => {
    it('should decrease the score of the member by the decrement', done => {
      min.zadd('zsetKey', 2, 'foo')
        .then(() => min.zdecrby('zsetKey', 1, 'foo'))
        .then(() => min.zscore('zsetKey', 'foo'))
        .then(score => {
          score.should.equal(1)

          return min.del('zsetKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the sorted set is not exists', done => {
      min.zdecrby('zsetKey', 2, 'foo')
        .catch(err => {
          err.message.should.equal('no such key')

          done()
        })
    })
  })

  describe('zrank', () => {
    it('should return the rank of the member in the sorted set', done => {
      min.zadd('zsetKey', 1, 'foo')
        .then(() => min.zadd('zsetKey', 2, 'bar'))
        .then(() => min.zadd('zsetKey', 3, 'a'))
        .then(() => min.zadd('zsetKey', 4, 'b'))
        .then(() => min.zrank('zsetKey', 'a'))
        .then(rank => {
          rank.should.equal(3)

          return min.zrank('zsetKey', 'foo')
        })
        .then(rank => {
          rank.should.equal(1)

          return min.del('zsetKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the sorted set is not exists', done => {
      min.zrank('zsetKey', 'foo')
        .catch(err => {
          err.message.should.equal('no such key')

          done()
        })
    })
  })

  describe('zrevrank', () => {
    it('should return the rank of the member in the sorted set reversed', done => {
      min.zadd('zsetKey', 1, 'foo')
        .then(() => min.zadd('zsetKey', 2, 'bar'))
        .then(() => min.zadd('zsetKey', 3, 'a'))
        .then(() => min.zadd('zsetKey', 4, 'b'))
        .then(() => min.zrevrank('zsetKey', 'a'))
        .then(rank => {
          rank.should.equal(2)

          return min.zrevrank('zsetKey', 'foo')
        })
        .then(rank => {
          rank.should.equal(4)

          return min.del('zsetKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the sorted set is not exists', done => {
      min.zrevrank('zsetKey', 'foo')
        .catch(err => {
          err.message.should.equal('no such key')

          done()
        })
    })
  })
})
