var FieldDBObject = require("./../FieldDBObject").FieldDBObject;
var UserMask = require("./../user/UserMask").UserMask;
var CORS = require("./../CORS").CORS;
var Q = require("q");
/**
 * @class The Activity is a record of the user's activity during one
 *        session, i.e. it might say "Edward LingLlama added 30 datums in Na
 *        Dene Corpus" This is so that users can see their history and teams
 *        can view teammate"s contributions.
 *
 * @name  Activity
 * @extends FieldDBObject
 * @constructs
 */
var Activity = function Activity(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "Activity";
  }
  this.debug("Constructing Activity ", options);
  FieldDBObject.apply(this, arguments);
  if (!this.timestamp) {
    this.timestamp = Date.now();
  }
  if (!this.verbicon) {
    this.verbicon = this.verbicon;
  }
};
Activity.uuidGenerator = FieldDBObject.uuidGenerator;

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
    value: "activities"
  },

  whenWhatWho: {
    get: function() {
      if (this.id) {
        return this.id;
      }
      var uniqueActivitiesOnWhenWhatWho = "";
      if (this.timestamp) {
        uniqueActivitiesOnWhenWhatWho = uniqueActivitiesOnWhenWhatWho + this.timestamp;
      } else {
        return;
      }
      if (this.verb) {
        uniqueActivitiesOnWhenWhatWho = uniqueActivitiesOnWhenWhatWho + this.verb;
      } else {
        return;
      }
      if (this.directobject) {
        uniqueActivitiesOnWhenWhatWho = uniqueActivitiesOnWhenWhatWho + this.directobject;
      }
      if (this.user && this.user.username) {
        uniqueActivitiesOnWhenWhatWho = uniqueActivitiesOnWhenWhatWho + this.user.username;
      }

      return uniqueActivitiesOnWhenWhatWho;
    }
  },

  defaults: {
    value: {
      verb: {
        create: {
          verb: "added",
          verbmask: "did something",
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
          verbicon: "icon-key",
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
          verbRevisionBefore: "itemrevbefore",
          verbRevisionAfter: "itemrevafter",
          verbicon: "icon-pencil",
          directobject: "something",
          directobjectId: "",
          directobjectmask: "to something",
          directobjecticon: "icon-circle-o",
          indirectobject: "in something",
          indirectobjectId: "",
          indirectobjectmask: "in something",
          indirectobjecticon: "icon-square-o"
        },
        remove: {
          verb: "removed",
          verbmask: "did something",
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
      user: UserMask
    }
  },

  getDefaultForVerb: {
    value: function(value) {
      if (!value) {
        return {};
      }
      if (value.replace) {
        value.replace(/ed$/, "");
      }
      if (this.defaults.verb[value]) {
        return this.defaults.verb[value];

      } else if (value.indexOf("log") > -1 && value.indexOf("in") > -1) {
        return this.defaults.verb.login;

      } else if (value.indexOf("dele") > -1) {
        return this.defaults.verb.delete;

      } else if (value.indexOf("remov") > -1) {
        return this.defaults.verb.remove;

      } else if (value.indexOf("modif") > -1) {
        return this.defaults.verb.modify;

      } else if (value.indexOf("downloa") > -1) {
        return this.defaults.verb.download;

      } else if (value.indexOf("view") > -1) {
        return this.defaults.verb.view;

      } else if (value.indexOf("import") > -1) {
        return this.defaults.verb.import;

      } else if (value.indexOf("shar") > -1) {
        return this.defaults.verb.share;

      } else if (value.indexOf("ASR result") > -1) {
        return this.defaults.verb.recievedRecognition;

      } else if (value.indexOf("used speech recognier") > -1) {
        return this.defaults.verb.requestedRecognition;

      } else if (value.indexOf("phot") > -1) {
        return this.defaults.verb.photo;

      } else if (value.indexOf("video") > -1) {
        return this.defaults.verb.video;

      } else if (value.indexOf("recor") > -1) {
        return this.defaults.verb.record;

      } else if (value.indexOf("add") > -1 && value.indexOf("creat") > -1) {
        return this.defaults.verb.create;
      } else {

        return {
          verb: "did something",
          verbmask: "did something",
          verbicon: "icon-bell",
          directobject: "something",
          directobjecturl: "",
          directobjectmask: "to something",
          directobjecticon: "icon-circle-o",
          indirectobject: "in something",
          indirectobjecturl: "",
          indirectobjectmask: "in something",
          indirectobjecticon: "icon-square-o"
        };
      }

    }
  },

  verb: {
    get: function() {
      return this._verb;
    },
    set: function(value) {
      if (value === this._verb) {
        return;
      }
      value = this.makeLinksOpenNewWindows(value);
      if (value) {
        this._verb = value;
      }
    }
  },

  verbicon: {
    get: function() {
      if (this._verbicon) {
        return this._verbicon;
      } else {
        return this.getDefaultForVerb(this.verb).verbicon;
      }
    },
    set: function(value) {
      if (value === this._verbicon) {
        return;
      }
      value = this.makeLinksOpenNewWindows(value);
      if (value) {
        this._verbicon = value;
      }
    }
  },

  directobject: {
    get: function() {
      return this._directobject;
    },
    set: function(value) {
      if (value === this._directobject) {
        return;
      }
      value = this.makeLinksOpenNewWindows(value);
      if (value) {
        this._directobject = value;
      }
    }
  },

  indirectobject: {
    get: function() {
      return this._indirectobject;
    },
    set: function(value) {
      if (value === this._indirectobject) {
        return;
      }
      value = this.makeLinksOpenNewWindows(value);
      if (value) {
        this._indirectobject = value;
      }
    }
  },

  context: {
    get: function() {
      return this._context;
    },
    set: function(value) {
      if (value === this._context) {
        return;
      }
      value = this.makeLinksOpenNewWindows(value);
      if (value) {
        this._context = value;
      }
    }
  },

  makeLinksOpenNewWindows: {
    value: function(value) {
      if (value.replace) {
        value = value.replace("href=", "target='_blank' href=");
      }
      return value;
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
  },

  corpus: {
    get: function() {
      return this._database;
    },
    set: function(value) {
      this._database = value;
    }
  },

  createSaveSnapshot: {
    value: function(selfOrSnapshot, optionalUserWhoSaved) {

      selfOrSnapshot = this;

      if (!selfOrSnapshot.user) {
        if (!optionalUserWhoSaved) {
          optionalUserWhoSaved = {
            name: "",
            username: "unknown"
          };
          try {
            if (this.corpus && this.corpus.connectionInfo && this.corpus.connectionInfo.userCtx) {
              optionalUserWhoSaved.username = this.corpus.connectionInfo.userCtx.name;
            } else if (this.application && this.application.user && this.application.user.username) {
              optionalUserWhoSaved.username = optionalUserWhoSaved.username || this.application.user.username;
              optionalUserWhoSaved.gravatar = optionalUserWhoSaved.gravatar || this.application.user.gravatar;
            }
          } catch (e) {
            this.warn("Can't get the corpus connection info to guess who saved this.", e);
          }
        }

        // optionalUserWhoSaved._name = optionalUserWhoSaved.name || optionalUserWhoSaved.username || optionalUserWhoSaved.browserVersion;
        if (typeof optionalUserWhoSaved.toJSON === "function") {
          var asJson = optionalUserWhoSaved.toJSON();
          asJson.name = optionalUserWhoSaved.name;
          optionalUserWhoSaved = asJson;
        } else {
          optionalUserWhoSaved.name = optionalUserWhoSaved.name;
        }
        // optionalUserWhoSaved.browser = browser;

        selfOrSnapshot.user = {
          username: optionalUserWhoSaved.username,
          name: optionalUserWhoSaved.name,
          lastname: optionalUserWhoSaved.lastname,
          firstname: optionalUserWhoSaved.firstname,
          gravatar: optionalUserWhoSaved.gravatar
        };
      }

      //update to this version
      selfOrSnapshot.version = FieldDBObject.DEFAULT_VERSION;

      return selfOrSnapshot.toJSON();
      // return selfOrSnapshot.toJSON ? selfOrSnapshot.toJSON() : selfOrSnapshot;
    }
  },

  saveDoesntNeedCustomziation: {
    value: function(optionalUserWhoSaved, saveEvenIfSeemsUnchanged, optionalUrl) {
      this.debug("Customizing activity save ", optionalUserWhoSaved);
      var deferred = Q.defer(),
        self = this;

      if (this.fetching) {
        self.warn("Fetching is in process, can't save right now...");
        Q.nextTick(function() {
          deferred.reject("Fetching is in process, can't save right now...");
        });
        return deferred.promise;
      }
      if (this.saving) {
        self.warn("Save was already in process...");
        Q.nextTick(function() {
          deferred.reject("Fetching is in process, can't save right now...");
        });
        return deferred.promise;
      }

      if (saveEvenIfSeemsUnchanged) {
        this.debug("Not calculating if this object has changed, assuming it needs to be saved anyway.");
      } else {
        console.log("    Checking to see if item needs to be saved.", saveEvenIfSeemsUnchanged, this.unsaved);

        if (!this.unsaved && !this.calculateUnsaved()) {
          self.warn("Item hasn't really changed, no need to save...");
          Q.nextTick(function() {
            deferred.resolve(self);
            return self;
          });
          return deferred.promise;
        }
      }

      if (!optionalUrl && this.parent && this.parent.url) {
        optionalUrl = this.parent.url;
      }

      if (!optionalUrl) {
        Q.nextTick(function() {
          self.saving = false;
          deferred.reject({
            status: 406,
            userFriendlyErrors: ["This application has errored. Please notify its developers: Cannot save activity the  activity" + this.dbname + " database is not currently opened."]
          });
        });
        return deferred.promise;
      }

      self.debug("    Calculating userWhoSaved...");

      if (!this.user) {

        if (!optionalUserWhoSaved) {
          optionalUserWhoSaved = {
            name: "",
            username: "unknown"
          };
          try {
            if (this.corpus && this.corpus.connectionInfo && this.corpus.connectionInfo.userCtx) {
              optionalUserWhoSaved.username = this.corpus.connectionInfo.userCtx.name;
            } else if (this.application && this.application.user && this.application.user.username) {
              optionalUserWhoSaved.username = optionalUserWhoSaved.username || this.application.user.username;
              optionalUserWhoSaved.gravatar = optionalUserWhoSaved.gravatar || this.application.user.gravatar;
            }
          } catch (e) {
            this.warn("Can't get the corpus connection info to guess who saved this.", e);
          }

        }
        // optionalUserWhoSaved._name = optionalUserWhoSaved.name || optionalUserWhoSaved.username || optionalUserWhoSaved.browserVersion;
        if (typeof optionalUserWhoSaved.toJSON === "function") {
          var asJson = optionalUserWhoSaved.toJSON();
          asJson.name = optionalUserWhoSaved.name;
          optionalUserWhoSaved = asJson;
        } else {
          optionalUserWhoSaved.name = optionalUserWhoSaved.name;
        }
        // optionalUserWhoSaved.browser = browser;

        this.user = {
          username: optionalUserWhoSaved.username,
          name: optionalUserWhoSaved.name,
          lastname: optionalUserWhoSaved.lastname,
          firstname: optionalUserWhoSaved.firstname,
          gravatar: optionalUserWhoSaved.gravatar
        };
      }

      //update to this version
      this.version = FieldDBObject.DEFAULT_VERSION;
      this.debug("saving   ", this);

      var data = this.toJSON();
      this.saving = true;
      this.whenReady = CORS.makeCORSRequest({
          type: this.id ? "PUT" : "POST",
          dataType: "json",
          url: optionalUrl,
          data: data
        }).then(function(result) {
            self.debug("saved ", result);
            self.saving = false;
            if (result.id) {
              self.id = result.id;
              self.rev = result.rev;
              deferred.resolve(self);
            } else {
              deferred.reject(result);
            }
          },
          function(reason) {
            self.debug(reason);
            self.saving = false;
            deferred.reject(reason);
          })
        .fail(function(error) {
          console.error(error.stack);
          self.saving = false;
          deferred.reject(error);
        });

      return deferred.promise;
    }
  },

  toJSON: {
    value: function(includeEvenEmptyAttributes, removeEmptyAttributes) {
      this.debug("Customizing activity toJSON ", includeEvenEmptyAttributes, removeEmptyAttributes);

      this.verb = this.verb;
      this.directobject = this.directobject;
      this.indirectobject = this.indirectobject;
      this.context = this.context;
      // this.user = this.user;

      var json = FieldDBObject.prototype.toJSON.apply(this, arguments);

      if (json) {
        delete json.dateCreated;
      }

      this.debug(json);
      return json;
    }
  }

});

exports.Activity = Activity;
