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
      verb: {
        create: {
          verb: "added",
          verbmask: "did something",
          verburl: "",
          verbicon: "icon-plus",
          directobject: "something",
          directobjecturl: "",
          directobjectmask: "to something",
          directobjecticon: "icon-circle-o",
          indirectobject: "in something",
          indirectobjecturl: "",
          indirectobjectmask: "in something",
          indirectobjecticon: "icon-square-o"
        },
        record: {
          verb: "recorded",
          verbmask: "did something",
          verburl: "",
          verbicon: "icon-microphone",
          directobject: "something",
          directobjecturl: "",
          directobjectmask: "to something",
          directobjecticon: "icon-circle-o",
          indirectobject: "in something",
          indirectobjecturl: "",
          indirectobjectmask: "in something",
          indirectobjecticon: "icon-square-o"
        },
        video: {
          verb: "videoed",
          verbmask: "did something",
          verburl: "",
          verbicon: "icon-video-camera",
          directobject: "something",
          directobjecturl: "",
          directobjectmask: "to something",
          directobjecticon: "icon-circle-o",
          indirectobject: "in something",
          indirectobjecturl: "",
          indirectobjectmask: "in something",
          indirectobjecticon: "icon-square-o"
        },
        photo: {
          verb: "photographed",
          verbmask: "did something",
          verburl: "",
          verbicon: "icon-camera",
          directobject: "something",
          directobjecturl: "",
          directobjectmask: "to something",
          directobjecticon: "icon-circle-o",
          indirectobject: "in something",
          indirectobjecturl: "",
          indirectobjectmask: "in something",
          indirectobjecticon: "icon-square-o"
        },
        requestedRecognition: {
          verb: "used speech recognier",
          verbmask: "did something",
          verburl: "",
          verbicon: "icon-microphone",
          directobject: "something",
          directobjecturl: "",
          directobjectmask: "to something",
          directobjecticon: "icon-circle-o",
          indirectobject: "in something",
          indirectobjecturl: "",
          indirectobjectmask: "in something",
          indirectobjecticon: "icon-square-o"
        },
        recievedRecognition: {
          verb: "recieved an ASR result",
          verbmask: "did something",
          verburl: "",
          verbicon: "icon-refresh",
          directobject: "something",
          directobjecturl: "",
          directobjectmask: "to something",
          directobjecticon: "icon-circle-o",
          indirectobject: "in something",
          indirectobjecturl: "",
          indirectobjectmask: "in something",
          indirectobjecticon: "icon-square-o"
        },
        share: {
          verb: "added",
          verbmask: "added",
          verburl: "",
          verbicon: "icon-share",
          directobject: "someone",
          directobjecturl: "",
          directobjectmask: "someone",
          directobjecticon: "icon-user",
          indirectobject: "as a role",
          indirectobjecturl: "#team",
          indirectobjectmask: "as a role",
          indirectobjecticon: "icon-cloud"
        },
        import: {
          verb: "imported",
          verbmask: "did something",
          verburl: "",
          verbicon: "icon-folder-open",
          directobject: "something",
          directobjecturl: "",
          directobjectmask: "to something",
          directobjecticon: "icon-circle-o",
          indirectobject: "in something",
          indirectobjecturl: "",
          indirectobjectmask: "in something",
          indirectobjecticon: "icon-square-o"
        },
        view: {
          verb: "viewed",
          verbmask: "did something",
          verburl: "",
          verbicon: "icon-eye",
          directobject: "something",
          directobjecturl: "",
          directobjectmask: "to something",
          directobjecticon: "icon-circle-o",
          indirectobject: "in something",
          indirectobjecturl: "",
          indirectobjectmask: "in something",
          indirectobjecticon: "icon-square-o"
        },
        download: {
          verb: "downloaded",
          verbmask: "did something",
          verburl: "",
          verbicon: "icon-download",
          directobject: "something",
          directobjecturl: "",
          directobjectmask: "to something",
          directobjecticon: "icon-circle-o",
          indirectobject: "in something",
          indirectobjecturl: "",
          indirectobjectmask: "in something",
          indirectobjecticon: "icon-square-o"
        },
        modify: {
          verb: "modified",
          verbmask: "did something",
          verburl: "#diff/oldrev/itemrevbefore/newrev/itemrevafter",
          verbicon: "icon-pencil",
          directobject: "something",
          directobjecturl: "",
          directobjectmask: "to something",
          directobjecticon: "icon-circle-o",
          indirectobject: "in something",
          indirectobjecturl: "",
          indirectobjectmask: "in something",
          indirectobjecticon: "icon-square-o"
        },
        remove: {
          verb: "removed",
          verbmask: "did something",
          verburl: "",
          verbicon: "icon-times-circle",
          directobject: "something",
          directobjecturl: "",
          directobjectmask: "to something",
          directobjecticon: "icon-circle-o",
          indirectobject: "in something",
          indirectobjecturl: "",
          indirectobjectmask: "in something",
          indirectobjecticon: "icon-square-o"
        },
        delete: {
          verb: "deleted",
          verbmask: "did something",
          verburl: "",
          verbicon: "icon-plus",
          directobject: "something",
          directobjecturl: "",
          directobjectmask: "to something",
          directobjecticon: "icon-circle-o",
          indirectobject: "in something",
          indirectobjecturl: "",
          indirectobjectmask: "in something",
          indirectobjecticon: "icon-square-o"
        },
        login: {
          verb: "logged in",
          verbmask: "did something",
          verburl: "",
          verbicon: "icon-check",
          directobject: "something",
          indirectobject: "to something",
          indirectobjecturl: "",
          indirectobjectmask: "in something",
          indirectobjecticon: "icon-cloud"
        }
      },
      context: {
        prototype: "via Offline App",
        spreadsheet: "via Spreadsheet App",
        learnx: "via LearnX App",
        speechrecognitiontrainer: "via Kartuli Speech Recognizer",
        bot: "via Futon Bot"
      }
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
