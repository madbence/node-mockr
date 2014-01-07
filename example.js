var mock = require('./')(beforeEach, afterEach);
var should = require('should');

var mylib = {
  method: function(cb) {
    this.other(cb);
  },
  other: function(cb) {
    console.log('original');
    cb();
  }
};

describe('My awesome library', function() {
  describe('My awesome async method', function() {
    var other = mock(mylib, 'other');
    it('should call `other`', function() {
      mylib.method(function(err) {
        mylib.other.called.should.be.true;
      })
    });
    it('should return foo', function() {
      other('foo');
      mylib.method(function(err, foo) {
        foo.should.equal('foo');
      });
      other(new Error());
      mylib.method(function(err) {
        should.exist(err);
      });
    });
  });
});
