var Speaker = require('./../Speaker').Speaker;

/**
 * @class The Participant is a type of Speaker with any additional fields or metadata that a team might use to run their psycholinguistics analyses.
 *
 *
 * @name  Participant
 * @extends Speaker
 * @constructs
 */
var Participant = function Participant(options) {
  this.debug("Constructing Participant length: ", options);
  Speaker.apply(this, arguments);
};

Participant.prototype = Object.create(Speaker.prototype, /** @lends Participant.prototype */ {
  constructor: {
    value: Participant
  }

});
exports.Participant = Participant;
