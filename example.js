// pass `before` and `after` hooks, and mockr handles the rest
var mock = require('./')(beforeEach, afterEach);
var should = require('should');

var mylib = {
  method: function(cb) {
    this.other(cb);
  },
  other: function(cb) {
    console.log('whoops, original');
    cb();
  }
};

describe('My awesome library', function() {
  describe('My awesome async method', function() {
    // override mylib.other with a stub (async style)
    // before/after hooks are registered here
    // returns a function to set return/error value per testcase
    var other = mock(mylib, 'other');
    it('should call `other`', function() {
      mylib.method(function(err) {
        mylib.other.called.should.be.true;
      });
    });
    it('should return foo', function() {
      // other now returns foo
      other('foo');
      mylib.method(function(err, foo) {
        foo.should.equal('foo');
      });
    });
    it('should return error sometimes', function() {
      other(new Error());
      mylib.method(function(err) {
        should.exist(err);
      });
    });
  });
});
