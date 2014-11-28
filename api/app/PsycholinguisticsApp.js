var App = require("./App").App;

/**
 * @class The PsycholinguisticsApp is a minimal extension of the App with the preferences
 *  set to default to a psycholinguistics terminology and look and feel.
 *
 * @name  PsycholinguisticsApp
 * @extends App
 * @constructs
 */
var PsycholinguisticsApp = function PsycholinguisticsApp(options) {
  if(!this._fieldDBtype){
		this._fieldDBtype = "PsycholinguisticsApp";
	}
  this.debug("Constructing PsycholinguisticsApp ", options);
  App.apply(this, arguments);
};

PsycholinguisticsApp.prototype = Object.create(App.prototype, /** @lends PsycholinguisticsApp.prototype */ {
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
