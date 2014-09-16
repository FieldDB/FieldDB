var FieldDBObject = require('./../FieldDBObject').FieldDBObject;

/**
 * @class The PsycholinguisticsApp allows the user to label data with grammatical tags
 *        i.e. passive, causative. This is useful for searches.
 *
 * @name  PsycholinguisticsApp
 * @description The initialize function brings up a field in which the user
 *              can enter tags.@class FieldDBObject of Datum validation states
 * @extends FieldDBObject
 * @constructs
 */
var PsycholinguisticsApp = function PsycholinguisticsApp(options) {
  this.debug("Constructing PsycholinguisticsApp ", options);
  FieldDBObject.apply(this, arguments);
};

PsycholinguisticsApp.prototype = Object.create(FieldDBObject.prototype, /** @lends PsycholinguisticsApp.prototype */ {
  constructor: {
    value: PsycholinguisticsApp
  },

  hasParticipants:{
    get: function() {
      if (!this.participantsList || !this.participantsList.docs || !this.participantsList.docs.length) {
        return false;
      }
      return this.participantsList.docs.length > 0;
    }
  }

});
exports.PsycholinguisticsApp = PsycholinguisticsApp;
