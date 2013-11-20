describe('NanoDB - Hash - Set', function() {
  describe('hset', function() {
    it('should set the field in the hash on the key with the value', function(done) {
      nano.hset('hashKey', 'foo', 'bar')
        .done(function(key, field, value) {
          assert('hashKey' === key);
          assert('foo' === field);
          assert('bar' === value);

          done();
        })
        .fail(done);
    });
  });

  describe('hexists', function() {
    it('should return the status of a field in a hash', function(done) {
      nano.hexists('hashKey', 'foo')
        .done(function(exists) {
          assert(exists);

          done();
        })
        .fail(done);
    });
  });
});