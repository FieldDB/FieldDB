var Confidential = require("./../confidentiality_encryption/Confidential").Confidential;
var DataList = require("./../data_list/DataList").DataList;
var Activity = require("./Activity").Activity;
var Connection = require("./../corpus/Connection").Connection;
var Comments = require("./../comment/Comments").Comments;
var DocumentCollection = require("./../datum/DocumentCollection").DocumentCollection;
var Database = require("./../corpus/Database").Database;
var ContextualizableObject = require("./../locales/ContextualizableObject").ContextualizableObject;
var Q = require("q");

var ActivityCollection = function ActivityCollection() {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "ActivityCollection";
  }
  DocumentCollection.apply(this, arguments);
};
ActivityCollection.prototype = Object.create(DocumentCollection.prototype, /** @lends ActivityCollection.prototype */ {
  constructor: {
    value: ActivityCollection
  },
  primaryKey: {
    value: "whenWhatWho"
  },
  INTERNAL_MODELS: {
    value: {
      item: Activity
    }
  }
});
exports.ActivityCollection = ActivityCollection;


/**
 * @class

 * @name  Activities
 * @description The Activities is a minimal customization of the DataList
 * to add an internal model of Activity.
 *
 * @extends DataList
 * @constructs
 */
var Activities = function Activities(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "Activities";
  }
  if (options && options.port) {
    options = {
      connection: options
    };
  }
  this.debug("Constructing Activities ", options);
  DataList.apply(this, arguments);
};

Activities.prototype = Object.create(DataList.prototype, /** @lends Activities.prototype */ {
  constructor: {
    value: Activities
  },

  INTERNAL_MODELS: {
    value: {
      connection: Connection,
      comments: Comments,
      docs: ActivityCollection,
      title: ContextualizableObject,
      description: ContextualizableObject,
      database: Database,
      confidential: Confidential,
      item: Activity
    }
  },

  api: {
    get: function() {
      return "activities";
    },
    set: function() {
      // no op
    }
  },

  primaryKey: {
    get: function() {
      return "whenWhatWho";
    },
    set: function() {
      // cant change the primary key of the activity feed.
    }
  },

  teamOrPersonal: {
    get: function() {
      if (this._teamOrPersonal) {
        return this._teamOrPersonal;
      }

      if (this.parent && this.parent.fieldDBtype) {
        var type = this.parent.fieldDBtype || "";
        type = type.toLowerCase();
        if (type.indexOf("user") > -1) {
          this._teamOrPersonal = "personal";
          return this._teamOrPersonal;
        }
        if (type.indexOf("corpus") > -1) {
          this._teamOrPersonal = "team";
          return this._teamOrPersonal;
        }
      }

      if (this._connection && typeof this._connection.guessDbType === "function") {
        var guessedType = this._connection.guessDbType(this._connection.dbname);
        this.debug(" acitivyt feed guessed the db type " + guessedType);
        if (guessedType === "user_activity_feed") {
          this._teamOrPersonal = "personal";
          return this._teamOrPersonal;
        } else if (guessedType === "corpus_activity_feed") {
          this._teamOrPersonal = "team";
          return this._teamOrPersonal;
        }
      }
    },
    set: function() {
      // no op
    }
  },

  connection: {
    get: function() {
      this.debug("getting connection");

      if (this.parent && this.parent.connection && typeof this.parent.connection.toJSON === "function") {
        this.connection = this.parent.connection.toJSON();
      }

      return this._connection;
    },
    set: function(value) {
      this.ensureSetViaAppropriateType("connection", value);

      this.title = this._connection.title || "Activity feed";
      this.description = this._connection.description || "";
    }
  },

  url: {
    get: function() {
      if (this.connection && this.connection.corpusUrl) {
        return this.connection.corpusUrl;
      }
    },
    set: function(value) {
      if (this.connection) {
        this.connection.corpusUrl = value;
      } else {
        this.warn("not setting hte url", value);
      }
    }
  },

  parent: {
    get: function() {
      return this._parent;
    },
    set: function(value) {
      if (value === this._parent) {
        return;
      }
      if (this.dbname && this.teamOrPersonal === "personal" && this.dbname !== value.username + "-activity_feed") {
        this.bug("Cannot change the " + this.dbname + " activity feed to " + value.username + "-activity_feed");
        return;
      }
      if (this.dbname && this.teamOrPersonal === "team" && this.dbname !== value.dbname + "-activity_feed") {
        this.bug("Cannot change the " + this.dbname + " activity feed to " + value.dbname + "-activity_feed");
        return;
      }

      if (value) {
        this._parent = value;
        if (value && value.set && value.get && this.teamOrPersonal === "team") {
          this._database = value;
        }
      }
    }
  },

  confidential: {
    get: function() {
      this.debug("getting confidential");
      if (this.parent && this.parent.confidential) {
        return this.parent.confidential;
      } else {
        this.warn("Activites can only be viewed in masked form in this app. The parent of the activity feed is not defined.");
      }
    },
    set: function() {
      // cant set confidential on activity feeds, it must come from the parent. This means activities cannot be demasked unless in the context of the orignal corpus or user
    }
  },

  database: {
    get: function() {
      this.debug("getting database");
      return this._database;
    },
    set: function(value) {
      this.ensureSetViaAppropriateType("database", value);
    }
  },

  dbname: {
    get: function() {
      if (this.parent && this.teamOrPersonal === "personal") {
        return this.parent.username + "-activity_feed";
      }

      if (this.parent && this.teamOrPersonal === "team") {
        return this.parent.dbname + "-activity_feed";
      }

      if (this._connection && this._connection.dbname) {
        return this._connection.dbname;
      }

      if (this._dbname) {
        return this._dbname;
      }
    },
    set: function(value) {
      if (value === this._dbname) {
        return;
      }
      if (this.parent && this.teamOrPersonal === "personal" && value !== this.parent.dbname + "-activity_feed") {
        this.bug("Cannot change the " + this.parent.dbname + "-activity_feed" + " to " + value);
        return;
      }
      if (value) {
        this.dbname = value;
      }
    }
  },

  add: {
    value: function(activity, optionalUserWhoSaved) {
      if (activity.url && activity.url !== this.url) {
        this.bug("Cannot add " + activity.url + " activity to " + this.url + " server, please report this. ");
        return;
      }
      if (activity.dbname && activity.dbname !== this.dbname) {
        this.bug("Cannot add " + activity.dbname + " activity to " + this.dbname + " activity feed, please report this. ");
        return;
      }
      if (!activity.parent && this.parent) {
        activity.parent = this.parent;
      }
      activity.dbname = this.dbname;
      activity.fieldDBtype = "Activity";
      this.debug("adding activity", activity);
      activity.timestamp = Date.now();


      if (!activity.user) {
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

        activity.user = {
          username: optionalUserWhoSaved.username,
          name: optionalUserWhoSaved.name,
          lastname: optionalUserWhoSaved.lastname,
          firstname: optionalUserWhoSaved.firstname,
          gravatar: optionalUserWhoSaved.gravatar
        };
      }

      activity.parent = this;
      var addedActivity;
      try {
        addedActivity = DataList.prototype.add.apply(this, [activity]);
      } catch (e) {
        this.warn("Error adding this activity", e);
        var message = e ? e.message : " Error adding this activity.";
        if (e) {
          console.error(e.stack);
        }
        this.warn(message);
        activity.errorMessage = message;
      }

      if (addedActivity) {
        if (this._database) {
          addedActivity.corpus = this._database;
        }
        if (!addedActivity.rev) {
          addedActivity.debug("This activity " + addedActivity.directobject + " has no evidence of having been saved before, makeing its fossil empty to trigger save.");
          addedActivity.unsaved = true;
          addedActivity.fossil = {};
          addedActivity.debug("This activity", addedActivity);
        }
        return addedActivity;
      }

      if (!addedActivity) {
        this.incompleteActivitesStockPile = this.incompleteActivitesStockPile || [];
        delete activity.parent;
        this.incompleteActivitesStockPile.push({
          activity: activity,
          errorMessage: activity.errorMessage || "Activity was not added."
        });
        return undefined;
      }

    }
  },

  save: {
    value: function() {
      var deferred = Q.defer(),
        self = this;

      this.whenReady = deferred.promise;

      this.saving = true;
      if (!this._docs || this._docs.length === 0) {
        this.warn("Save was unncessary, the activity feed was empty...");
        Q.nextTick(function() {
          self.saving = false;
          deferred.resolve(self);
          return self;
        });
        return deferred.promise;
      }

      try {
        this._docs.save(null, null, this.url).done(function() {
          self.saving = false;
          deferred.resolve(self);
          return self;
        });
        this.warn("Requested save of activity feed", this.whenReady);
      } catch (e) {
        console.log("problem saving activity feed");
        console.error(e);
      }

      return deferred.promise;
    }
  },

  toJSON: {
    value: function(includeEvenEmptyAttributes, removeEmptyAttributes) {
      this.debug("Customizing toJSON ", includeEvenEmptyAttributes, removeEmptyAttributes);

      var json;
      if (this.connection && typeof this.connection.toJSON === "function") {
        json = this.connection.toJSON.apply(this.connection, arguments);
        json.dbname = this.dbname;
      } else {
        json = new Connection().toJSON(includeEvenEmptyAttributes, removeEmptyAttributes);
      }

      this.debug(json);
      return json;
    }
  }

});
exports.Activities = Activities;
