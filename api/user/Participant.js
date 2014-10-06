/* globals FieldDB */
var Speaker = require("./Speaker").Speaker;
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
  this._fieldDBtype = "Participant";
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
        fields: []
      };
      try {
        if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application && FieldDB.FieldDBObject.application.corpus) {
          if (FieldDB.FieldDBObject.application.corpus.participantFields) {
            doc.fields = FieldDB.FieldDBObject.application.corpus.participantFields.clone();
          } else if (FieldDB.FieldDBObject.application.corpus.speakerFields) {
            doc.fields = FieldDB.FieldDBObject.application.corpus.speakerFields.clone();
          }
        }
      } catch (e) {
        console.warn("Cant get participatn fields from the current corpus, instead using defaults.");
        doc.fields = DEFAULT_CORPUS_MODEL.participantFields || DEFAULT_CORPUS_MODEL.speakerFields;
      }
      if (!doc.fields || doc.fields.length === 0) {
        console.warn("There were no corpus specific speaker or participant fiels, instead using defaults");
        doc.fields = DEFAULT_CORPUS_MODEL.participantFields || DEFAULT_CORPUS_MODEL.speakerFields;
      }
      return JSON.parse(JSON.stringify(doc));
    }
  }

});
exports.Participant = Participant;
