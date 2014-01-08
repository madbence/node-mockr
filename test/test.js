var should = require('should');
var mockr = require('../');
var Mockr = mockr.Mockr;
var override = require('mock-fun').override;
var restore = require('mock-fun').restore;

describe('Mockr', function() {
  describe('#ctor', function() {
    var original = function() {};
    var obj = {
      prop: original
    };
    it('should set hook properties', function() {
      var b = function() {}, a = function() {}, e = function() {};
      var m = new Mockr({before: b, after: a, error: e, obj: obj, prop: 'prop'});
      m.before.should.equal(b);
      m.after.should.equal(a);
      m.error.should.equal(e);
    });
  });
});
