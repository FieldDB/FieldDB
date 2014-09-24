var Stimulus = require("./Stimulus").Stimulus;

/**
 * @class The Response is a minimal customization of a Stimulus which allows the user to add additional information
 *  which can be used for experiments.
 *
 * @name  Response
 * @extends Stimulus
 * @constructs
 */
var Response = function Response(options) {
  this.debug("Constructing Response ", options);
  Stimulus.apply(this, arguments);
};

Response.prototype = Object.create(Stimulus.prototype, /** @lends Response.prototype */ {
  constructor: {
    value: Response
  },

  jsonType: {
    get: function() {
      return this.type;
    }
  },

  collection: {
    get: function() {
      return this.type;
    }
  }

});
exports.Response = Response;
