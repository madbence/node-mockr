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

function noop() {}

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
}
