var Collection = require("./../Collection").Collection;
var HotKey = require("./HotKey").HotKey;

/**
 * @class HotKeys is a set of HotKey. A user will be able to have multiple shortcuts.
 * There will be defaults, but users will also be able to select their own HotKeys.
 *
 * IPA This will allow users to easily switch to type in IPA
 * fullscreen This will expand the view
 * nextDatum This will allow users to skip to the next datum entry field
 * previousDatum This will allow users to go back to the previous datum entry field
 * sync This will allow users to easily sync to the server
 *
 * @name  HotKeys
 *
 * @extends Collection
 * @constructs
 */
var HotKeys = function HotKeys(options) {
  if (options && options.firstkey === "" && options.secondKey === "" && options.description === "") {
    options = null;
    console.warn("Upgrading pre v2 hotkeys");
  }
  this.debug("Constructing HotKeys ", options);
  Collection.apply(this, arguments);
};

HotKeys.prototype = Object.create(Collection.prototype, /** @lends HotKeys.prototype */ {
  constructor: {
    value: HotKeys
  },

  primaryKey: {
    value: "keySequence"
  },

  INTERNAL_MODELS: {
    value: {
      item: HotKey
    }
  }

});
exports.HotKeys = HotKeys;
