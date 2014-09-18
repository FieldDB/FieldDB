var Collection = require("./../Collection").Collection;
var Image = require("./Image").Image;

/**
 * @class Images of Datum validation states
 * @name  Images
 * @description The Images is a minimal customization of the Collection
 * to add an internal model of Image.
 *
 * @extends Collection
 * @constructs
 */
var Images = function Images(options) {
  this.debug("Constructing Images length: ", options);
  Collection.apply(this, arguments);
};

Images.prototype = Object.create(Collection.prototype, /** @lends Images.prototype */ {
  constructor: {
    value: Images
  },

  primaryKey: {
    value: "URL"
  },

  INTERNAL_MODELS: {
    value: {
      item: Image
    }
  }

});
exports.Images = Images;
