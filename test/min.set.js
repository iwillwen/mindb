describe('MinDB - Mix - Set', function() {
  describe('set', function() {
    it('should set a key with a string value', function(done) {
      nano.set('key', 'value')
        .done(function(key, value) {
          nano.get(key)
            .done(function(_value) {
              assert(value === _value);

              done();
            })
            .fail(done);
        })
        .fail(done);

    });

    it('should set a key with a number value', function(done) {
      nano.set('key1', 2333)
        .done(function(key, value) {
          nano.get(key)
            .done(function(_value) {
              assert(value === _value);

              done();
            })
            .fail(done);
        })
        .fail(done);

    });

    it('should set a key with a boolean value', function(done) {
      nano.set('key2', true)
        .done(function(key, value) {
          nano.get(key)
            .done(function(_value) {
              assert(value === _value);

              done();
            })
            .fail(done);
        })
        .fail(done);

    });

    it('should set a key with a array value', function(done) {
      nano.set('key3', [ 2, 3, 3, 3 ])
        .done(function(key, value) {
          nano.get(key)
            .done(function(_value) {
              assert(value.join() === _value.join());

              done();
            })
            .fail(done);
        })
        .fail(done);

    });

    it('should set a key with a object value', function(done) {
      nano.set('key4', { code: 233 })
        .done(function(key, value) {
          assert('key4' === key);
          assert(JSON.stringify({ code: 233 }) === JSON.stringify(value));

          done();
        })
        .fail(done);

    });
  });

  describe('setnx', function() {
    it('should set a key if the key is not exists', function(done) {
      nano.set('fool', 'value')
        .done(function(key, value) {
          assert('fool' === key);
          assert('value' === value);

          nano.del(key)
            .done(function() {
              done();
            })
            .fail(done);
        })
        .fail(done);
    });


    it('should return a error if the key was exists', function(done) {
      nano.setnx('key', 'foobar')
        .fail(function(err) {
          assert(err instanceof Error);

          done();
        });
    });
  });


  describe('setex', function() {
    it('should set a key with a TTL(Time to Live)(s)', function(done) {
      nano.setex('fool', 0.01, 'value')
        .done(function(key, value) {

          assert('fool' === key);
          assert('value' === value);

          setTimeout(function() {
            nano.exists(key)
              .done(function(exists) {
                if (!exists) {
                  done();
                }
              })
              .fail(done);
          }, 11);
        })
        .fail(done);

    });
  });

  describe('psetex', function() {
    it('should set a key with a TTL(Time to Live)(ms)', function(done) {
      nano.psetex('fool1', 10, 'value')
        .done(function(key, value) {
          assert('fool1' === key);
          assert('value' === value);

          setTimeout(function() {
            nano.exists(key)
              .done(function(exists) {
                if (!exists) {
                  done();
                }
              })
              .fail(done);
          }, 11);
        })
        .fail(done);

    });
  });


  describe('mset', function() {
    it('should set a set of keys', function(done) {
      nano.mset({
        '_key1': 'value1',
        '_key2': 'value2'
      })
      .done(function(results) {
        assert(results[0][0] === '_key1');
        assert(results[0][1] === 'value1');

        assert(results[1][0] === '_key2');
        assert(results[1][1] === 'value2');

        done();
      })
      .fail(done);

    });
  });


  describe('msetnx', function() {
    it('should set a set of keys if they are not exists', function(done) {
      nano.msetnx({
        '_key3': 'value3',
        '_key4': 'value4'
      })
      .done(function(results) {
        assert(results[0][0] === '_key3');
        assert(results[0][1] === 'value3');

        assert(results[1][0] === '_key4');
        assert(results[1][1] === 'value4');

        var n = results.length;

        for (var i = 0; i < results.length; i++) {
          nano.del(results[i][0])
            .done(function() {
              --n || done();
            })
            .fail(function() {
              --n || done();
            });
        }
      })
      .fail(done);

    });

    it('should return a error if a key was exists', function(done) {
      nano.set('_key5', 'value5')
        .done(function() {

          nano.msetnx({
            '_key5': 'foobar',
            '_key6': 'value6'
          })
          .fail(function(errors) {
            assert(errors.length > 0);

            nano.exists('_key6')
              .done(function(exists) {
                assert(!exists);


                nano.del('_key5')
                  .done(function() {
                    done();
                  });
              });
          });
        });
    });
  });
});