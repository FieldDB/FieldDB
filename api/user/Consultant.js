var Speaker = require("./Speaker").Speaker;
var DEFAULT_CORPUS_MODEL = require("./../corpus/corpus.json");

/**
 *
 * @class The Consultant (commonly refered to as a "language consultant")
 * is a type of Speaker with any additional fields or metadata that a
 * team might use to to cluster consultants into dialects or variations.
 *
 * A consultant might also be associated to a user. In this case a consultant
 * has the same information as a user plus extra, some info (e.g. date of birth)
 * which must be kept confidential. Consultant's gravatar are default
 * unless he/she wants to be public associated with/his username.
 * Consultants which are also users have permissions about the
 * level of access to the data (read only, add/edit).
 *
 *
 * @name  Consultant
 * @extends Speaker
 * @constructs
 */
var Consultant = function Consultant(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "Consultant";
  }
  this.debug("Constructing Consultant: ", options);
  Speaker.apply(this, arguments);
};

Consultant.prototype = Object.create(Speaker.prototype, /** @lends Consultant.prototype */ {
  constructor: {
    value: Consultant
  },

  api: {
    value: "consultants"
  },

  defaults: {
    get: function() {
      var doc = {
        fields: DEFAULT_CORPUS_MODEL.consultantFields || DEFAULT_CORPUS_MODEL.speakerFields
      };
      return JSON.parse(JSON.stringify(doc));
    }
  }

});
exports.Consultant = Consultant;
