describe('MinDB - Keys', function() {
  describe('del', function() {
    it('should delete a key', function(done) {
      nano.del('key')
        .done(function(key) {
          assert('key' === key);

          done();
        })
        .fail(done);

    });
  });

  describe('exists', function() {
    it('should check a key is exists or not', function(done) {
      nano.exists('key')
        .done(function(exists) {
          assert(!exists);

          done();
        })
        .fail(done);

    });
  });


  describe('rename', function() {
    it('should rename a key when the new key is not equal to the old key', function(done) {

      nano.set('key', 'value')
        .done(function() {

          nano.rename('key', 'newKey')
            .done(function() {

              nano.get('newKey')
                .done(function(value) {
                  assert('value' === value);

                  done();
                })
                .fail(done);
            })
            .fail(done);
        })
        .fail(done);

    });

    it('should return a error if the new key is equal to the old key', function(done) {
      nano.rename('newKey', 'newKey')
        .fail(function(err) {
          assert(err instanceof Error);

          done();
        });
    });
  });

  describe('renamenx', function() {
    it('should rename a key to the other key', function(done) {
      nano.renamenx('newKey', 'lastKey')
        .done(function() {
          done();
        })
        .fail(done);
    });
  });

  describe('keys', function() {
    it('should return a set of keys which were exists', function(done) {
      nano.keys('*')
        .done(function(keys) {
          assert(keys.length > 0);

          done();
        })
        .fail(done);
    });
  });

  describe('randomkey', function() {
    it('should return a key which was selected randomly', function(done) {
      nano.randomkey()
        .done(function(key) {
          assert(~key);

          done();
        });
    });
  });

  describe('type', function() {
    it('should return the type of the value of the key', function(done) {
      nano.type('key1')
        .done(function(type) {
          assert(type === 'mix');

          done();
        })
        .fail(done);
    });
  });
});