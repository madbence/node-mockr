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
    it('should set default hooks, if not provided', function() {
      var m = new Mockr({obj: obj, prop: 'prop'});
      m.before.should.be.an.instanceOf(Function);
      m.after.should.be.an.instanceOf(Function);
      m.error.should.be.an.instanceOf(Function);
    });
    it('should store mocked obj referenc and the mocked property', function() {
      var m = new Mockr({obj: obj, prop: 'prop'});
      m.obj.should.equal(obj);
      m.prop.should.equal('prop');
    });
    it('should cache original function', function() {
      var m = new Mockr({obj: obj, prop: 'prop'});
      m.original.should.equal(original);
    });
    it('should throw error if function is missing (or not function)', function() {
      (function() {
        var m = new Mockr({obj: obj, prop: 'missing'});
      }).should.throw();
    });
    it('should set up hooks', function() {
      var b = function(f) { bc = true; f.should.be.an.instanceOf(Function); };
      var a = function(f) { ac = true; f.should.be.an.instanceOf(Function); };
      var bc = false, ac = false;
      var m = new Mockr({before: b, after: a, obj: obj, prop: 'prop'});
      bc.should.be.true;
      ac.should.be.true;
    });
    describe('hook callbacks', function() {
      it('should call override/restore functions', function() {
        var b = function(f) { bcb = f };
        var a = function(f) { acb = f };
        var bcb, acb;
        var m = new Mockr({before: b, after: a, obj: obj, prop: 'prop', def: 1});
        override(m, 'override', function(a){ a.should.equal(1); })();
        override(m, 'restore', function(){ })();
        bcb();
        m.override.called.should.be.true;
        acb();
        m.restore.called.should.be.true;
      });
    });
    it('should create override/restore functions', function() {
      var o = function(ob, p) { oc = true; ob.should.equal(obj); p.should.equal('prop'); };
      var r = function(ob, p) { rc = true; ob.should.equal(obj); p.should.equal('prop'); };
      var oc = false, rc = false;
      var m = new Mockr({ obj: obj, prop: 'prop', overrider: o, restorer: r });
      oc.should.be.true;
      rc.should.be.true;
    });
  });
  describe('#override', function() {
    var original = function() {};
    var obj = {
      prop: original
    };
    var f = function() { return f; };
    var m = new Mockr({ obj: obj, prop: 'prop' });
    beforeEach(override(m, '_overrider', function() {}));
    beforeEach(override(m, 'makeAsyncMock', f));
    afterEach(restore(m, '_overrider', true));
    afterEach(restore(m, 'makeAsyncMock', true));
    it('should create mock function', function() {
      override(m, 'makeAsyncMock', function(ret) { ret.should.be.equal(1); })();
      m.override(1);
      m.makeAsyncMock.called.should.be.true;
    });
    it('should call overrider', function() {
      override(m, '_overrider', function(g) { g.should.equal(f); })();
      m.override();
      m._overrider.called.should.be.true;
    });
  });
  describe('#restore', function() {
    var original = function() {};
    var obj = {
      prop: original
    };
    var m = new Mockr({ obj: obj, prop: 'prop' });
    it('should call restorer', function() {
      override(m, '_restorer', function() {})();
      m.restore();
      m._restorer.called.should.be.true;
      restore(m, '_restorer')();
    });
  });
});
