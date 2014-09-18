var Collection = require("./../Collection").Collection;
var Activity = require("./Activity").Activity;

/**
 * @class

 * @name  Activities
 * @description The Activities is a minimal customization of the Collection
 * to add an internal model of Activity.
 *
 * @extends Collection
 * @constructs
 */
var Activities = function Activities(options) {
  this.debug("Constructing Activities ", options);
  Collection.apply(this, arguments);
};

Activities.prototype = Object.create(Collection.prototype, /** @lends Activities.prototype */ {
  constructor: {
    value: Activities
  },

  // primaryKey: {
  //   value: "timestamp" //not unique enough
  // },

  INTERNAL_MODELS: {
    value: {
      item: Activity
    }
  },

  user: {
    get: function() {
      return this._user;
    },
    set: function(value) {
      if (value === this._user) {
        return;
      }
      if (this.dbname && this.teamOrPersonal === "personal" && this.dbname !== value.username + "-activity_feed") {
        this.bug("Cannot change the user of " + this.dbname + " activity feed to " + value.username + "-activity_feed");
        return;
      }
      if (value) {
        this._user = value;
      }
    }
  },

  dbname: {
    get: function() {
      if (this._dbname) {
        return this._dbname;
      }
      if (this.user && this.teamOrPersonal === "personal") {
        return this.user.username + "-activity_feed";
      }
    },
    set: function(value) {
      if (value === this._dbname) {
        return;
      }
      if (this.user && this.teamOrPersonal === "personal" && value !== this.user.username + "-activity_feed") {
        this.bug("Cannot change the " + this.user.username + "-activity_feed" + " to " + value);
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
      if (!activity.user) {
        activity.user = this.user;
      }
      if (!activity._id) {
        activity._id = Activity.uuidGenerator();
      }
      activity.url = this.url;
      activity.dbname = this.dbname;
      this.debug(activity);
      activity = new Activity(activity);
      return Collection.prototype.add.apply(this, [activity]);
    }
  },

  save: {
    value: function() {
      var self = this;

      this.map(function(activity) {
        if (activity.dbname !== self.dbname) {
          self.warn("This activity is not for this activity feed.");
        } else {
          activity.save();
        }
      });
    }
  }

});
exports.Activities = Activities;
