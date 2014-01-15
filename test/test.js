var should = require('should');
var mockr = require('../');
var Mockr = mockr.Mockr;
var override = require('mock-fun').override;
var restore = require('mock-fun').restore;

describe('wrapper interface', function() {
  describe('init', function() {
    var b, bc, a, ac;
    beforeEach(function() {
      b = function() { bc = true; };
      bc = false;
    });
    afterEach(function() {
      a = function() { ac = true; };
      ac = false;
    });
    it('should return create Function', function() {
      mockr().should.be.an.instanceOf(Function);
    });
    it('should use installed hooks', function() {
      var m = mockr(b, a);
      m({a: function() {}}, 'a');
      bc.should.be.true;
      ac.should.be.true;
    });
  });
  describe('create', function() {
    var m = mockr();
    it('should return overrider Function', function() {
      var o = m({a: function() {}}, 'a');
      var mo = o._mockr;
      override(mo, 'override', function(a){ a.should.equal(1); })();
      o.should.be.an.instanceOf(Function);
      o(1);
      mo.override.called.should.be.true;
    });
  });
});

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
  describe('#makeAsyncMock', function() {
    var original = function(a, b, c) {};
    var obj = {
      prop: original
    };
    var m = new Mockr({ obj: obj, prop: 'prop' });
    describe('without function', function() {
      it('should create a function with the same arguments as the original', function() {
        var f = m.makeAsyncMock(1);
        var c = false
        f(2, 3, function() {
          c = true;
        });
        c.should.be.true;
      });
      describe('with value', function() {
        it('should call the last argument with the return value', function() {
          var f = m.makeAsyncMock(1);
          f(2, 3, function(err, n) {
            should.not.exist(err);
            n.should.equal(1);
          });
        });
      });
      describe('with error', function() {
        it('should call the last argument with error', function() {
          var f = m.makeAsyncMock(new Error());
          f(1, 2, function(err) {
            should.exist(err);
          });
        });
      });
    });
    describe('with function', function() {
      m.error = function() { throw new Error(); };
      it('should check arg count', function() {
        (function() {
          m.makeAsyncMock(function(a, b) {});
        }).should.throw();
      });
      it('should check arg names', function() {
        (function() {
          m.makeAsyncMock(function(a, b, d) {});
        }).should.throw();
        (function() {
          m.makeAsyncMock(function( a, b, c ) {});
        }).should.not.throw();
      });
      it('should return the same function', function() {
        var f = function(a, b, c) {};
        m.makeAsyncMock(f).should.equal(f);
      });
    });
  });
});
