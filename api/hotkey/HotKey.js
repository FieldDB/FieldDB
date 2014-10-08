var FieldDBObject = require("./../FieldDBObject").FieldDBObject;

/**
 * @class A HotKey is a keyboard shortcut that uses one key (or a
 *        combination thereof) which allows users to execute a command
 *        without using a mouse, a menu, etc.
 *
 * @name  HotKey
 * @extends FieldDBObject
 * @constructs
 */
var HotKey = function HotKey(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "HotKey";
  }
  this.debug("Constructing HotKey", options);
  FieldDBObject.apply(this, arguments);
};

HotKey.prototype = Object.create(FieldDBObject.prototype, /** @lends HotKey.prototype */ {
  constructor: {
    value: HotKey
  },

  defaults: {
    value: {
      firstKey: "",
      secondKey: "",
      functiontocall: function() {},
      description: ""
    }
  },

  keySequence: {
    get: function() {
      var value = this.firstKey + "+" + this.secondKey;
      this.debug("Getting keySequence " + value);
      return value;
    }
  }

});
exports.HotKey = HotKey;
