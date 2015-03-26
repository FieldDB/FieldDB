var DataList = require("./../data_list/DataList").DataList;
var Activity = require("./Activity").Activity;
var Connection = require("./../corpus/Connection").Connection;
var Comments = require("./../comment/Comments").Comments;
var DocumentCollection = require("./../datum/DocumentCollection").DocumentCollection;
var ContextualizableObject = require("./../locales/ContextualizableObject").ContextualizableObject;

var ActivityCollection = function ActivityCollection(options) {
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
      item: Activity,
      connection: Connection,
      comments: Comments,
      docs: ActivityCollection,
      title: ContextualizableObject,
      description: ContextualizableObject
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
      if (value === this._connection) {
        return;
      }
      if (!value) {
        delete this._connection;
        return;
      } else {
        if (typeof this.INTERNAL_MODELS["connection"] === "function" && !(value instanceof this.INTERNAL_MODELS["connection"])) {
          value = new this.INTERNAL_MODELS["connection"](value);
        }
      }
      this._connection = value;
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
      }
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
    value: function(activity) {
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
      try {
        return DataList.prototype.add.apply(this, [activity]);
      } catch (e) {
        this.warn("Error adding this activity, it was not complete enough", e);
        this.warn(e.stack);
        this.incompleteActivitesStockPile = this.incompleteActivitesStockPile || [];
        this.incompleteActivitesStockPile.push({
          activity: activity,
          errorMessage: e.message
        })
        return undefined;
      }
    }
  },

  save: {
    value: function() {
      this.docs.save();
    }
  },

  toJSON: {
    value: function(includeEvenEmptyAttributes, removeEmptyAttributes) {
      this.debug("Customizing toJSON ", includeEvenEmptyAttributes, removeEmptyAttributes);

      var json;
      if (this.connection && typeof this.connection.toJSON === "function") {
        json = this.connection.toJSON.apply(this.connection, arguments);
        json.dbname = this.dbname;
      }

      this.debug(json);
      return json;
    }
  }

});
exports.Activities = Activities;
