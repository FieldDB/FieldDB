var Speaker = require('./Speaker').Speaker;
var DEFAULT_CORPUS_MODEL = require("./../corpus/corpus.json");

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
  },

  api: {
    value: "participants"
  },

  defaults: {
    get: function() {
      var doc = {
        fields: DEFAULT_CORPUS_MODEL.participantFields || DEFAULT_CORPUS_MODEL.speakerFields
      };
      return JSON.parse(JSON.stringify(doc));
    }
  }

});
exports.Participant = Participant;
