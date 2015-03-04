var UserMask = require("./UserMask").UserMask;

/**
 *
 * @class Team extends from UserMask. It inherits the same attributes as UserMask but can
 * login.
 *
 * @name  Team
 * @extends UserMask
 * @constructs
 */
var Team = function Team(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "Team";
  }
  this.debug("Constructing Team: ", options);
  UserMask.apply(this, arguments);
};

Team.prototype = Object.create(UserMask.prototype, /** @lends Team.prototype */ {
  constructor: {
    value: Team
  },

  id: {
    get: function() {
      return "team";
    },
    set: function(value) {
      if (value === this._id) {
        return;
      }
      if (value !== "team") {
        this.warn("Cannot set team id to anything other than \"team.\"");
      }
      this._id = "team";
    }
  },

  defaults: {
    value: {
      // Defaults from UserMask
      username: "",
      password: "",
      email: "",
      gravatar: "",
      researchInterest: "",
      affiliation: "",
      description: "",
      subtitle: "",
      corpuses: [],
      dataLists: [],
      mostRecentIds: {},
      // Defaults from User
      firstname: "",
      lastname: "",
      teams: [],
      sessionHistory: []
    }
  },

  /**
   * The subtitle function returns user's first and last names.
   */
  subtitle: {
    get: function() {
      return this.name;
    },
    set: function(value) {
      if (value === this.name) {
        return;
      }
      this.warn("subtitle is deprecated, use name instead.");
      this.name = value;
    }
  }

});

exports.Team = Team;
