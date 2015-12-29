import { should as Should } from 'chai'
import min from './min'

const should = Should()

describe('MinDB - Sets', () => {
  describe('sadd', () => {
    it('should add elements to an empty set and return the count of added elements', done => {
      min.sadd('setKey', 1, 2)
        .then(count => {
          count.should.equal(2)

          return min.del('setKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should add elements to an empty set and return the correct count of added elements', done => {
      min.sadd('setKey', 1, 2)
        .then(() => min.sadd('setKey', 2, 3))
        .then(count => {
          count.should.equal(1)

          return min.del('setKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should add elements to an exists set', done => {
      min.sadd('setKey', 1)
        .then(() => min.sadd('setKey', 3, 4))
        .then(count => {
          count.should.equal(2)

          return min.scard('setKey')
        })
        .then(count => {
          count.should.equal(3)

          return min.del('setKey')
        })
        .then(() => done())
        .catch(done)
    })
  })


  describe('srem', () => {
    it('should remove the elements in the set and return the count of removed elements', done => {
      min.sadd('setKey', 1, 2, 3)
        .then(() => min.srem('setKey', 1, 2))
        .then(count => {
          count.should.equal(2)

          return min.scard('setKey')
        })
        .then(count => {
          count.should.equal(1)

          return min.del('setKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the set is not exists', done => {
      min.srem('setKey', 1)
        .catch(err => {
          err.message.should.equal('no such key')

          done()
        })
    })
  })

  describe('smembers', () => {
    it('should return all the members of the set', done => {
      min.sadd('setKey', 1, 2)
        .then(() => min.smembers('setKey'))
        .then(members => {
          members.should.include.members([ 1, 2 ])

          return min.del('setKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the set is not exists', done => {
      min.smembers('setKey')
        .catch(err => {
          err.message.should.equal('no such key')

          done()
        })
    })
  })

  describe('sismember', () => {
    it('should check a item is in the set or not', done => {
      min.sadd('setKey', 1)
        .then(() => min.sismember('setKey', 1))
        .then(isMember => {
          isMember.should.be.true

          return min.sismember('setKey', 2)
        })
        .then(isMember => {
          isMember.should.be.false

          return min.del('setKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the set is not exists', done => {
      min.sismember('setKey', 1)
        .catch(err => {
          err.message.should.equal('no such key')

          done()
        })
    })
  })

  describe('scard', () => {
    it('should return the count of the elements in the set', done => {
      min.sadd('setKey', 1, 2, 3)
        .then(() => min.scard('setKey'))
        .then(count => {
          count.should.equal(3)

          return min.del('setKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the set is not exists', done => {
      min.scard('setKey')
        .catch(err => {
          err.message.should.equal('no such key')

          done()
        })
    })
  })

  describe('smove', () => {
    it('should move a member from a set to another one', done => {
      min.sadd('setKey', 1, 2)
        .then(() => min.sadd('setKey1', 3))
        .then(() => min.smove('setKey', 'setKey1', 2))
        .then(() => min.sismember('setKey', 2))
        .then(is => {
          is.should.be.false

          return min.sismember('setKey1', 2)
        })
        .then(is => {
          is.should.be.true

          return min.smembers('setKey')
        })
        .then(members => {
          members.should.include.members([ 1 ])

          return min.smembers('setKey1')
        })
        .then(members => {
          members.should.include.members([ 2, 3 ])

          return min.empty()
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the member is not in the source set', done => {
      min.sadd('setKey', 1, 2)
        .then(() => min.sadd('setKey1', 3))
        .then(() => min.smove('setKey', 'setKey1', 3))
        .catch(err => {
          err.message.should.equal('no such member')

          return min.del('setKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the source set is not exists', done => {
      min.smove('setKey', 'setKey1', 1)
        .catch(err => {
          err.message.should.equal('no such key')

          done()
        })
    })
  })

  describe('srandmember', () => {
    it('should return a random member of the set', done => {
      min.sadd('setKey', 1, 2, 3)
        .then(() => min.srandmember('setKey'))
        .then(member => min.sismember('setKey', member))
        .then(is => {
          is.should.be.true

          return min.del('setKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should return null when the set is not exists', done => {
      min.srandmember('setKey')
        .then(member => {
          (member === null).should.be.true

          done()
        })
    })
  })

  describe('spop', () => {
    it('should pop a random member out of the set', done => {
      min.sadd('setKey', 1, 2, 3)
        .then(() => min.spop('setKey'))
        .then(member => min.sismember('setKey', member))
        .then(is => {
          is.should.be.false

          return min.del('setKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should return null when the set is not exists', done => {
      min.spop('setKey')
        .then(member => {
          (member === null).should.be.true

          done()
        })
    })
  })

  describe('sunion', () => {
    it('should merge multiple sets and return the result', done => {
      min.sadd('setKey1', 1, 2)
        .then(() => min.sadd('setKey2', 2, 3))
        .then(() => min.sunion('setKey1', 'setKey2'))
        .then(set => {
          set.should.include.members([ 1, 2, 3 ])

          return min.empty()
        })
        .then(() => done())
        .catch(done)
    })
  })

  describe('sunionstore', () => {
    it('should merge multiple sets and store into the destation key', done => {
      min.sadd('setKey1', 1, 2)
        .then(() => min.sadd('setKey2', 2, 3))
        .then(() => min.sunionstore('setKey', 'setKey1', 'setKey2'))
        .then(() => min.smembers('setKey'))
        .then(set => {
          set.should.include.members([ 1, 2, 3 ])

          return min.empty()
        })
        .then(() => done())
        .catch(done)
    })
  })

  describe('sinter', () => {
    it('should find the intersection of multiple sets and return the result', done => {
      min.sadd('setKey1', 1, 2)
        .then(() => min.sadd('setKey2', 2, 3))
        .then(() => min.sinter('setKey1', 'setKey2'))
        .then(set => {
          set[0].should.equal(2)

          return min.empty()
        })
        .then(() => done())
        .catch(done)
    })
  })

  describe('sinterstore', () => {
    it('should find the intersection of multiple sets and store into the destation key', done => {
      min.sadd('setKey1', 1, 2)
        .then(() => min.sadd('setKey2', 2, 3))
        .then(() => min.sinterstore('setKey', 'setKey1', 'setKey2'))
        .then(() => min.smembers('setKey'))
        .then(set => {
          set[0].should.equal(2)

          return min.empty()
        })
        .then(() => done())
        .catch(done)
    })
  })

  describe('sdiff', () => {
    it('should find the difference of multiple sets and return the result', done => {
      min.sadd('setKey1', 1, 2)
        .then(() => min.sadd('setKey2', 2, 3))
        .then(() => min.sdiff('setKey1', 'setKey2'))
        .then(set => {
          set.should.include.members([ 1, 3 ])

          return min.empty()
        })
        .then(() => done())
        .catch(done)
    })
  })

  describe('sdiffstore', () => {
    it('should find the difference of multiple sets and store into the destation key', done => {
      min.sadd('setKey1', 1, 2)
        .then(() => min.sadd('setKey2', 2, 3))
        .then(() => min.sdiffstore('setKey', 'setKey1', 'setKey2'))
        .then(() => min.smembers('setKey'))
        .then(set => {
          set.should.include.members([ 1, 3 ])

          return min.empty()
        })
        .then(() => done())
        .catch(done)
    })
  })
})
