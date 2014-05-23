describe('MinDB - Mix - Get', function() {
  describe('get', function() {
    it('should get the value of the key', function(done) {
      nano.get('key')
        .done(function(value) {
          assert('value' === value);

          done();
        })
        .fail(done);

    });

    it('should return a error if the key was not exists', function(done) {
      nano.get('something')
        .fail(function(err) {
          assert(err instanceof Error);

          done();
        });

    });
  });

  describe('mget', function() {
    it('should get the values of a set of keys', function(done) {
      nano.mget([ 'key' ])
        .done(function(values) {
          assert('value' === values[0]);

          done();
        })
        .fail(done);

    });

    it('should return errors if a key was not exists', function(done) {
      nano.mget([ 'key', 'something' ])
        .fail(function(errors) {
          assert(errors.length > 0);

          done();
        });

    });
  });


  describe('getset', function() {
    it('should set a value on a key and return the old value', function(done) {
      nano.getset('key', 'new_value')
        .done(function(oldValue) {
          assert('value' === oldValue);

          done();
        })
        .fail(done);

    });
  });
});