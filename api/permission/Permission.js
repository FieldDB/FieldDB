var FieldDBObject = require("./../FieldDBObject").FieldDBObject;
var Users = require("./../user/Users").Users;

/**
 * @class Permission
 * @name  Permission
 *
 * @description  The permission class specifies which user (User, Consultant or Bot)
 *        can do what action to what component in a given corpus.
 *        The specification needs three arguments: User, Verb, Object
 *
 *
 * @property {UserGeneric} user This is userid or username
 * @property {String} verb Verb is the action permitted:
 *        admin: corpus admin. admin can handle permission of other users
 *        read: can read
 *        addNew: can add/create new datum etc.
 *        edit: can edit/change the content of datum etc., including delete datum which is basically just changing datum states
 *        comment: can comment on datum etc.
 *        export: can export datum etc.
 * @property {String} directObject Object is sub-component of the corpus to which
 *            the action is directed:
 *        corpus: corpus and corpus details (description etc.)
 *        datum: datums in the corpus including their states
 *        session: sessions in the corpus
 *        datalist: datalists in the corpus
 *
 * @extends FieldDBObject
 */
var Permission = function Permission(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "Permission";
  }
  this.debug("Constructing Permission ", options);
  FieldDBObject.apply(this, arguments);
};

Permission.prototype = Object.create(FieldDBObject.prototype, /** @lends Permission.prototype */ {
  constructor: {
    value: Permission
  },

  // Internal models: used by the parse function
  INTERNAL_MODELS: {
    value: {
      users: Users
    }
  },

  length: {
    get: function() {
      if (this.users && this.users.length) {
        return this.users.length;
      }
      return 0;
    }
  }
});
exports.Permission = Permission;
