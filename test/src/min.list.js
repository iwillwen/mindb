import { should as Should } from 'chai'
import min from './min'

const should = Should()

describe('MinDB - List', () => {
  describe('lpush', () => {
    it('should create a list when and the member become the first member when the list is not exists', done => {
      min.lpush('listKey', 'foo')
        .then(() => min.llen('listKey'))
        .then(count => {
          count.should.equal(1)

          return min.del('listKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should push a member to the left side of the list', done => {
      min.lpush('listKey', 'foo')
        .then(() => min.lpush('listKey', 'bar'))
        .then(() => min.llen('listKey'))
        .then(count => {
          count.should.equal(2)

          return min.lpop('listKey')
        })
        .then(member => {
          member.should.equal('bar')

          return min.del('listKey')
        })
        .then(() => done())
        .catch(done)
    })
  })

  describe('lpushx', () => {
    it('should push a member to the left side of the list', done => {
      min.lpush('listKey', 'foo')
        .then(() => min.lpushx('listKey', 'bar'))
        .then(() => min.llen('listKey'))
        .then(count => {
          count.should.equal(2)

          return min.del('listKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the list is not exists', done => {
      min.lpushx('listKey', 'foo')
        .catch(err => {
          err.message.should.equal('no such key')

          done()
        })
    })

    it('should throw an error when the list is empty', done => {
      min.lpush('listKey', 'foo')
        .then(() => min.lpop('listKey'))
        .then(() => min.lpushx('listKey', 'bar'))
        .catch(err => {
          err.message.should.equal('The list is empty.')

          return min.del('listKey')
        })
        .then(() => done())
        .catch(done)
    })
  })

  describe('rpush', () => {
    it('should create a list when and the member become the first member when the list is not exists', done => {
      min.rpush('listKey', 'foo')
        .then(() => min.llen('listKey'))
        .then(count => {
          count.should.equal(1)

          return min.del('listKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should push a member to the right side of the list', done => {
      min.rpush('listKey', 'foo')
        .then(() => min.rpush('listKey', 'bar'))
        .then(() => min.llen('listKey'))
        .then(count => {
          count.should.equal(2)

          return min.rpop('listKey')
        })
        .then(member => {
          member.should.equal('bar')

          return min.del('listKey')
        })
        .then(() => done())
        .catch(done)
    })
  })

  describe('rpushx', () => {
    it('should push a member to the right side of the list', done => {
      min.rpush('listKey', 'foo')
        .then(() => min.rpushx('listKey', 'bar'))
        .then(() => min.llen('listKey'))
        .then(count => {
          count.should.equal(2)

          return min.del('listKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the list is not exists', done => {
      min.rpushx('listKey', 'foo')
        .catch(err => {
          err.message.should.equal('no such key')

          done()
        })
    })

    it('should throw an error when the list is empty', done => {
      min.rpush('listKey', 'foo')
        .then(() => min.rpop('listKey'))
        .then(() => min.rpushx('listKey', 'bar'))
        .catch(err => {
          err.message.should.equal('The list is empty.')

          return min.del('listKey')
        })
        .then(() => done())
        .catch(done)
    })
  })

  describe('lpop', () => {
    it('should pop out a member from the front of the list', done => {
      min.lpush('listKey', 'foo')
        .then(() => min.lpop('listKey'))
        .then(member => {
          member.should.equal('foo')

          return min.llen('listKey')
        })
        .then(count => {
          count.should.equal(0)

          return min.del('listKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should return null if the list is not exists', done => {
      min.lpop('listKey')
        .then(member => {
           (member == null).should.be.true

           done()
        })
        .catch(done)
    })
  })

  describe('rpop', () => {
    it('should pop out a member from the last of the list', done => {
      min.rpush('listKey', 'foo')
        .then(() => min.rpop('listKey'))
        .then(member => {
          member.should.equal('foo')

          return min.llen('listKey')
        })
        .then(count => {
          count.should.equal(0)

          return min.del('listKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should return null if the list is not exists', done => {
      min.rpop('listKey')
        .then(member => {
           (member == null).should.be.true

           done()
        })
        .catch(done)
    })
  })

  describe('llen', () => {
    it('should return the count of members in the list', done => {
      min.lpush('listKey', 'foo')
        .then(() => min.llen('listKey'))
        .then(count => {
          count.should.equal(1)

          return min.lpush('listKey', 'bar')
        })
        .then(() => min.llen('listKey'))
        .then(count => {
          count.should.equal(2)

          return min.del('listKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should return 0 when the list is not exists', done => {
      min.llen('listKey')
        .then(count => {
          count.should.equal(0)

          done()
        })
        .catch(done)
    })
  })

  describe('lrange', () => {
    it('should return a sublist which sliced by the range', done => {
      min.lpush('listKey', 'foo', 'bar', 'one', 'two')
        .then(() => min.lrange('listKey', 1, 2))
        .then(sublist => {
          sublist.should.deep.equal(['bar', 'one'])

          return min.del('listKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should return a empty array which the list is not exists', done => {
      min.lrange('listKey', 1, 2)
        .then(sublist => {
          sublist.length.should.equal(0)

          done()
        })
        .catch(done)
    })
  })

  describe('lrem', () => {
    it('should remove all matching members from the list', done => {
      min.lpush('listKey', 'hello', 'world', 'hello', 'hello')
        .then(() => min.lrem('listKey', 0, 'hello'))
        .then(removeds => {
          removeds.should.equal(3)

          return min.llen('listKey')
        })
        .then(count => {
          count.should.equal(1)

          return min.lrange('listKey', 0, count)
        })
        .then(sublist => {
          sublist[0].should.equal('world')

          return min.del('listKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should remove a number of matching members from the list from the head to tail', done => {
      min.lpush('listKey', 'hello', 'world', 'hello', 'hello')
        .then(() => min.lrem('listKey', 2, 'hello'))
        .then(removeds => {
          removeds.should.equal(2)

          return min.llen('listKey')
        })
        .then(count => {
          count.should.equal(2)

          return min.lrange('listKey', 0, count)
        })
        .then(sublist => {
          sublist.should.deep.equal([ 'world', 'hello' ])

          return min.del('listKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should remove a number of matching members from the list from the tail to head', done => {
      min.lpush('listKey', 'hello', 'world', 'hello', 'hello')
        .then(() => min.lrem('listKey', -2, 'hello'))
        .then(removeds => {
          removeds.should.equal(2)

          return min.llen('listKey')
        })
        .then(count => {
          count.should.equal(2)

          return min.lrange('listKey', 0, count)
        })
        .then(sublist => {
          sublist.should.deep.equal([ 'hello', 'world' ])

          return min.del('listKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should return 0 when the list is not exists', done => {
      min.lrem('listKey', 2, 'hello')
        .then(removeds => {
          removeds.should.equal(0)

          done()
        })
        .catch(done)
    })
  })

  describe('lset', () => {
    it('should set member at the index of the list with new value', done => {
      min.lpush('listKey', 'one', 'two', 'three')
        .then(() => min.lset('listKey', 0, 'four'))
        .then(() => min.lset('listKey', -2, 'five'))
        .then(() => min.llen('listKey'))
        .then(count => min.lrange('listKey', 0, count))
        .then(sublist => {
          sublist.should.deep.equal([ 'four', 'five', 'three' ])

          return min.del('listKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the list is not exists', done => {
      min.lset('listKey', 0, 'four')
        .catch(err => {
          err.message.should.equal('no such key')

          done()
        })
    })

    it('should throw an error when the index is Illegal', done => {
      min.lpush('listKey', 'foo')
        .then(() => min.lset('listKey', 2, 'bar'))
        .catch(err => {
          err.message.should.equal('Illegal index')

          return min.del('listKey')
        })
        .then(() => done())
        .catch(done)
    })
  })

  describe('ltrim', () => {
    it('should trim the list to the specified range', done => {
      min.lpush('listKey', 'a', 'b', 'c', 'd')
        .then(() => min.ltrim('listKey', 1, 2))
        .then(() => min.llen('listKey'))
        .then(count => min.lrange('listKey', 0, count))
        .then(sublist => {
          sublist.should.deep.equal([ 'b', 'c' ])

          return min.del('listKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should trim the list to the specified range(from tail)', done => {
      min.lpush('listKey', 'a', 'b', 'c', 'd')
        .then(() => min.ltrim('listKey', -3, -2))
        .then(() => min.llen('listKey'))
        .then(count => min.lrange('listKey', 0, count))
        .then(sublist => {
          sublist.should.deep.equal([ 'b', 'c' ])

          return min.del('listKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the list is not exists', done => {
      min.ltrim('listKey', 1, 2)
        .catch(err => {
          err.message.should.equal('no such key')

          done()
        })
    })
  })

  describe('lindex', () => {
    it('should return the member at the index of the list', done => {
      min.lpush('listKey', 'a', 'b', 'c')
        .then(() => min.lindex('listKey', 2))
        .then(member => {
          member.should.equal('c')

          return min.del('listKey')
        })
        .then(() => done())
        .catch(done)
    })

    it('should throw an error when the list is not exists', done => {
      min.lindex('listKey', 2)
        .catch(err => {
          err.message.should.equal('no such key')

          done()
        })
    })

    it('should throw an error when the index is out of range of the list', done => {
      min.lpush('listKey', 'a', 'b')
        .then(() => min.lindex('listKey', 3))
        .catch(err => {
          err.message.should.equal('Illegal index')

          return min.del('listKey')
        })
        .then(() => done())
        .catch(done)
    })
  })

  describe('linsertBefore', () => {
    it('should insert an element before another element in a list', done => {
      min.lpush('listKey', 'a', 'b', 'c', 'd')
        .then(() => min.linsertBefore('listKey', 'c', 'e'))
        .then(() => min.llen('listKey'))
        .then(count => min.lrange('listKey', 0, count))
        .then(list => {
          list.should.deep.equal([ 'a', 'b', 'e', 'c', 'd' ])

          return min.del('listKey')
        })
        .then(() => done())
        .catch(done)
    })
  })
})
