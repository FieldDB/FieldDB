var FieldDBObject = require('./../FieldDBObject').FieldDBObject;
/**
 * @class The Activity is a record of the user's activity during one
 *        session, i.e. it might say "Edward LingLlama added 30 datums in Na
 *        Dene Corpus" This is so that users can see their history and teams
 *        can view teammate's contributions.
 *
 *
 * @name  Activity
 * @extends FieldDBObject
 * @constructs
 */
var Activity = function Activity(options) {
  this.debug("Constructing Activity ", options);
  FieldDBObject.apply(this, arguments);
};

Activity.prototype = Object.create(FieldDBObject.prototype, /** @lends Activity.prototype */ {

  constructor: {
    value: Activity
  },

  build: {
    value: function(usermask) {
      this.timestamp = Date.now();
      this.user = {
        gravatar: usermask.gravatar,
        username: usermask.username
      };
    }
  },
  api: {
    value: "/activities"
  },

  defaults: {
    value: {
      //      verbs : [ "added", "modified", "commented", "checked", "tagged", "imported" ],
      //      verb : "added",
      //      directobject : "an entry",
      //      indirectobject : "with Consultant-SJ",
      //      context : "via Android/ Offline Chrome App" ,
      //      link: "https:/www.fieldlinguist.com"
      //      timestamp: timestamp
    }
  },

  // Internal models: used by the parse function
  INTERNAL_MODELS: {
    value: {
      // user: UserMask
    }
  },

  timestamp: {
    get: function() {
      return this._timestamp;
    },
    set: function(value) {
      if (value === this._timestamp) {
        return;
      }
      if (!value) {
        delete this._timestamp;
        return;
      }
      if (("" + value).indexOf("Z") > -1) {
        value = (new Date(value)).getTime();
      }

      this._timestamp = value;
    }
  }
});

exports.Activity = Activity;
