var override = require('mock-fun').override;
var restore = require('mock-fun').restore;

module.exports = function(before, after) {
  before = before || noop;
  after = after || noop;
  return function mockr(obj, prop, def) {
    var original = obj[prop];
    if(typeof original !== 'function') {
      throw new Error('You can override only functions');
    }
    before(override(obj, prop, makeAsyncMock(original, def)));
    after(restore(obj, prop, true));
    return function overrider(ret) {
      override(obj, prop, makeAsyncMock(original, ret))();
    };

  };
};

function Mockr(opts) {
  var self = this;
  this.before = opts.before || noop;
  this.after = opts.after || noop;
  this.error = opts.error || noop;
  this.obj = opts.obj;
  this.prop = opts.prop;
  this.def = opts.def;
  this.original = this.obj[this.prop];

  var overrider = opts.overrider || override;
  var restorer = opts.restorer || restore;
  this._overrider = overrider(this.obj, this.prop);
  this._restorer = restorer(this.obj, this.prop, true);
  if(typeof this.original !== 'function') {
    throw new Error('You can override only functions');
  }
  this.before(function() {
    self.override(self.def);
  });
  this.after(function() {
    self.restore();
  });
}

Mockr.prototype.override = function override(ret) {
  this._overrider(this.makeAsyncMock(ret));
};

Mockr.prototype.restore = function restore() {
  this._restorer();
};

function makeAsyncMock(original, ret) {
  if(typeof ret === 'function') {
    return ret;
  }
  return function() {
    var cb = arguments[original.length-1];
    if(ret instanceof Error) {
      cb(ret);
    } else {
      cb(null, ret);
    }
  };
};
function noop() {}

module.exports.Mockr = Mockr;
