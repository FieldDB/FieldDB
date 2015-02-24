var Collection = require("./../Collection").Collection;
var UserMask = require("./UserMask").UserMask;

/**
 * @class Collection of Datum validation states

 * @name  Users
 * @description The Users is a minimal customization of the Collection
 * to add an internal model of UserMask.
 *
 * @extends Collection
 * @constructs
 */
var Users = function Users(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "Users";
  }
  this.debug("Constructing Users ", options);
  Collection.apply(this, arguments);
};

Users.prototype = Object.create(Collection.prototype, /** @lends Users.prototype */ {
  constructor: {
    value: Users
  },

  primaryKey: {
    value: "username"
  },

  INTERNAL_MODELS: {
    value: {
      item: UserMask
    }
  },

  sanitizeStringForPrimaryKey: {
    value: function(value) {
      return value;
    }
  }

});

exports.Users = Users;
