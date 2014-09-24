var Datum = require("./Datum").Datum;

/**
 * @class The Stimulus is a minimal customization of a Datum which allows the user to add additional information
 *  which can be used for experiments.
 *
 * @name  Stimulus
 * @extends Datum
 * @constructs
 */
var Stimulus = function Stimulus(options) {
  this.debug("Constructing Stimulus ", options);
  Datum.apply(this, arguments);
};

Stimulus.prototype = Object.create(Datum.prototype, /** @lends Stimulus.prototype */ {
  constructor: {
    value: Stimulus
  }

});
exports.Stimulus = Stimulus;
