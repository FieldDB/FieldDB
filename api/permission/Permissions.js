var Collection = require("./../Collection").Collection;
var Permission = require("./Permission").Permission;
var Users = require("./../user/Users").Users;

/**
 * @class Permissions
 * @name  Permissions
 *
 * @description A collection of open ended permissions which can be applied to any object
 * (usually a corpus, but could be a datalist, or datum, or datumField). A permission
 * can be thought of roughly as a phrase:
 * <pre>
 *
 * User [{username: "lingllama", gravatar: "123"}]
 * has permission ["admin","write","read","comment","export","import",etc]
 * to "corpus"/"datalist"/"datum"/"datumField"
 *
 * <pre>
 *
 * @property {Permission} admins Users who can perform admin operations on the corpus/datalist/datum/datumField.
 * @property {Permission} exporters Users who can export the items in a corpus/datalist/datum/datumField.
 * @property {Permission} writers Users who can modify the items in a corpus/datalist/datum/datumField.
 * @property {Permission} commenters Users who can comment on the items in a corpus/datalist/datum/datumField.
 * @property {Permission} readers Users who can read the items in a corpus/datalist/datum/datumField.
 *
 * @property {Object} viewAsBasePermissionSystem  This is just syntactic sugar which points to the actual
 *    permission system. The actual permission system should be used by apps who want provide a power user or
 *    fine grained and open ended control over the permissions, or whose users want to understand
 *    the fine graned control at a lower level.
 *    - Kind of like Unix permissions.
 * @property {Object} viewAsDataBasePermissionSystem This is syntactic sugar which makes
 *    the permission system look like there is an implicative relationship betwween roles.
 *    - Kind of like PhP/MySQL systems.
 * @property {Object} viewAsGroupedPermissionSystem This is syntactic sugar which shows users in
 *    only one category (readOnly, writeOnly, read/write, admins) it also makes
 *    the permission system look like there is an implicative relationship betwween roles, but with some hint that
 *    there are some rare roles (such as write only) for crowdsourcing/non-standard data entry contexts.
 *    - Kind of like PhP/MySQL systems.
 * @property {Object} viewAsEmailingTeamPermissionSystem This might be the way that
 *    some computational linguistics teams will understand the permission system best,
 *    but the words `collaborator` and `contributor` are so similar that thus far no one
 *    has used these terms (that we know of).
 *    - Kind of like GitHub.
 *
 * @extends Collection
 * @tutorial tests/permission/PermissionTest.js
 */
var Permissions = function Permissions(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "Permissions";
  }
  this.debug("Constructing Permissions ", options);
  this.cacheTimeLength = 1000;
  Collection.apply(this, arguments);
};

Permissions.prototype = Object.create(Collection.prototype, /** @lends Permissions.prototype */ {
  constructor: {
    value: Permissions
  },

  INTERNAL_MODELS: {
    value: {
      item: Permission,
      usersNotOnTeam: Users,
      allUsers: Users
    }
  },

  /*** Syntactic sugar for research teams how have been collaborating via email
  sharing (To, BCC, CC) and/or Dropbox and/or github ***/


  /**
   * Syntactic sugar for users who have reader+commenter+writer permissions.
   *
   * This is a common permission in version control systems
   * where the user can do everything, including categorize data, assign data cleaning
   * to team members, edit information about the database but cannot perform
   * except admin functions such as adding other users to the database.
   *
   * This should be the default permission for most users on the corpus, as the corpus
   * is version controlled any action can be undone if users use their power too much,
   * they can be downgraded to a collaborator or read only role.
   *
   * Email collaboration analog: This is for users who would be in a
   * To or CC category for emails,
   *
   * Dropbox analog: This is for users who would be invited to join a shared
   * folder on Dropbox.
   *
   * @type {Permission}
   */
  contributors: {
    value: this.readerCommenterWriters
  },

  /**
   * Syntactic sugar for users who have reader+commenter permissions.
   *
   * This is a common permission used by research teams where an external reviewer,
   * or a second language consultant can review and coment on the data,
   * but cannot modify the data itself.
   *
   * Email collaboration analog: This is for users who would be in a BCC category
   * for emails (they can read the paper, but they arent supposed to send back a
   * version which they modified for the team to accept),
   *
   * Dropbox analog: This is for uswers who would be given a URL to a folder in Dropbox
   * (but cannot download the files and modify them with the others)
   *
   * @type {Permission}
   */
  collaborators: {
    value: this.readerCommenterOnlys
  },

  owners: {
    value: this.admins
  },



  /*** Gropued permissions (useful to show permissions in an app) ***/

  giveMeUsersWithTheseRolesAndNotTheseRoles: {
    value: function(wantTheseRoles, dontWantTheseRoles) {
      if (!wantTheseRoles || !dontWantTheseRoles) {
        this.bug("Invalid request for users, you must supply the roles you want, and the roles you dont want.");
        return new Users();
      }
      if (Object.prototype.toString.call(wantTheseRoles) !== "[object Array]" || Object.prototype.toString.call(dontWantTheseRoles) !== "[object Array]") {
        this.bug("Invalid request for users, you must supply an array of the roles you want, and the roles you dont want.");
        return new Users();
      }
      this.debugMode = true;

      var empty = new Users(),
        permissionType,
        permissionTypeIndex,
        self = this,
        groupLabel = wantTheseRoles.join(" ") + " onlys",
        usersWhoAreOnlyInThisPermissionType = [];

      /* accept requests for the plural or singular of the permission type */

      wantTheseRoles = wantTheseRoles.map(function(role) {
        return (role + "s").replace(/ss$/, "s");
      });

      dontWantTheseRoles = dontWantTheseRoles.map(function(role) {
        return (role + "s").replace(/ss+$/, "s");
      });

      // Add users who have the wanted roles
      permissionType = wantTheseRoles.pop();
      if (this[permissionType]) {
        usersWhoAreOnlyInThisPermissionType = new Users(this[permissionType].users.toJSON());
      } else {
        usersWhoAreOnlyInThisPermissionType = new Users();
      }


      var howToRemoveSomeoneWhoIsntInAllRoles = function(user) {
        if (self[permissionType].users.indexOf(user.username) === -1) {
          self.debug("removing " + user.username + " from " + groupLabel + " because they are not in " + permissionType);
          usersWhoAreOnlyInThisPermissionType.remove(user.username);
        }
      };

      for (permissionTypeIndex = wantTheseRoles.length - 1; permissionTypeIndex >= 0; permissionTypeIndex--) {
        permissionType = wantTheseRoles[permissionTypeIndex];
        if (!self[permissionType]) {
          continue;
        }

        if (!self[permissionType]) {
          this.warn("This team doesn't have a " + permissionType + " so this means the " + groupLabel + " is empty.");
          return empty;
        }
        // If the user isn't in this permisisonType also, remove it
        usersWhoAreOnlyInThisPermissionType.map(howToRemoveSomeoneWhoIsntInAllRoles);
      }

      this.debug("There are " + usersWhoAreOnlyInThisPermissionType.length + " users who have all the roles requested: " + groupLabel.replace("onlys", ""));
      if (!usersWhoAreOnlyInThisPermissionType || usersWhoAreOnlyInThisPermissionType.length === 0) {
        return empty;
      }

      var howToRemoveSomeoneWhoIsInTheUnWantedPermissions = function(user) {
        if (usersWhoAreOnlyInThisPermissionType[user.username]) {
          self.debug(user.username + " is also in " + permissionType + " so removing them from the " + groupLabel + ", there are " + usersWhoAreOnlyInThisPermissionType.length + " left");
          usersWhoAreOnlyInThisPermissionType.remove(user.username);
        }
      };

      for (permissionTypeIndex = dontWantTheseRoles.length - 1; permissionTypeIndex >= 0; permissionTypeIndex--) {
        permissionType = dontWantTheseRoles[permissionTypeIndex];
        if (!self[permissionType]) {
          continue;
        }
        // remove users who are in the permission type we dont want
        self[permissionType].users.map(howToRemoveSomeoneWhoIsInTheUnWantedPermissions);

        if (usersWhoAreOnlyInThisPermissionType.length === 0) {
          return empty;
        }
      }
      return usersWhoAreOnlyInThisPermissionType;
    }
  },

  /**
   * Syntactic sugar for apps who want to show users in one category, not in each low level permissions.
   *
   * This permission is side effect of when a user has only admin permission.
   * In this case the user can only access to only admin functionalities such
   * as adding new users to the database. This role is used by project managers or IT staff
   * who dont know anything about the data itself, and are only setting up the corpus for
   * the team to use if the PI or corpus owner doesnt know how to do the permissions.
   * set-up themselves.
   *
   * @type {Permission}
   */
  adminOnlys: {
    get: function() {
      if (this._adminOnlys && this._adminOnlys.timestamp && (Date.now() - this._adminOnlys.timestamp < this.cacheTimeLength)) {
        this.debug("Not regenerating the list of adminOnlys, its fresh enough. " + new Date(this._adminOnlys.timestamp));
      } else {
        this._adminOnlys = this.giveMeUsersWithTheseRolesAndNotTheseRoles(["admin"], ["writer", "reader"]);
        this._adminOnlys.timestamp = Date.now();
      }
      return this._adminOnlys;
    },
    set: function() {
      this.warn("adminOnlys cannot be set. it is only syntactic sugar. If you want to modify roles, see the addUser and removeUser functions");
    }
  },

  /**
   * Syntactic sugar for apps who want to show users in one category, not grouped by low level permissions.
   *
   * This permission is side effect of when a user has only write permission.
   * In this case the user can add new data to the database, but cannot
   * review or read or see existing data. They can edit data if it is specifically
   * presented to them, they cannot query the database. As all data is version
   * controlled edits can be undone so this user is not able to destroy a database that they cant read.
   *
   * This is not a common permission to use in the system.
   *
   * This permission can be used for psycholinguistics or crowdsourcing experiemnts
   * where users are anonymous (identified anoymously by session or by device)
   * and visit a given website or Android app and can respond to stimuli and their responses
   * become new data points in the system. These users cannot access fieldlinguistics apps
   * which permit browsing of the data, but is a rare permission used by web widgets or other smaller apps which write to a corpus.
   *
   * @type {Permission}
   */
  writeOnlys: {
    get: function() {
      if (this._writeOnlys && this._writeOnlys.timestamp && (Date.now() - this._writeOnlys.timestamp < this.cacheTimeLength)) {
        this.debug("Not regenerating the list of writeOnlys, its fresh enough. " + new Date(this._writeOnlys.timestamp));
      } else {
        this._writeOnlys = this.giveMeUsersWithTheseRolesAndNotTheseRoles(["writer"], ["admin", "reader"]);
        this._writeOnlys.timestamp = Date.now();
      }
      return this._writeOnlys;
    },
    set: function() {
      this.warn("writeOnlys cannot be set. it is only syntactic sugar. If you want to modify roles, see the addUser and removeUser functions");
    }
  },

  /**
   * Syntactic sugar for apps who want to show users in one category, not grouped by low level permissions.
   *
   * This permission is side effect of when a user has only read permission.
   * In this case the user might be part of a grant commitees or the general public (for
   * the aspects of the corpus which have been made @publicic),
   * language consultants who might leave mean comments on other consultant's data,
   * or other sorts of external viewers of the data who the team doesnt want to leave
   * comments.
   *
   * @type {Permission}
   */
  readOnlys: {
    get: function() {
      if (this._readOnlys && this._readOnlys.timestamp && (Date.now() - this._readOnlys.timestamp < this.cacheTimeLength)) {
        this.debug("Not regenerating the list of readOnlys, its fresh enough. " + new Date(this._readOnlys.timestamp));
      } else {
        this._readOnlys = this.giveMeUsersWithTheseRolesAndNotTheseRoles(["reader"], ["admin", "writer"]);
        this._readOnlys.timestamp = Date.now();
      }
      return this._readOnlys;
    },
    set: function() {
      this.warn("readOnlys cannot be set. it is only syntactic sugar. If you want to modify roles, see the addUser and removeUser functions");
    }
  },

  /**
   * Syntactic sugar for apps who want to show users in one category, not grouped by low level permissions.
   *
   * This permission is side effect of when a user has only comment permission.
   * This is a rare case which might be used in a web widget external to the data entry apps
   * where users or anonymous visitors can leave a comment on data if it is presented to them,
   * but cannot browse the database.
   *
   * @type {Permission}
   */
  commentOnlys: {
    get: function() {
      if (this._commentOnlys && this._commentOnlys.timestamp && (Date.now() - this._commentOnlys.timestamp < this.cacheTimeLength)) {
        this.debug("Not regenerating the list of commentOnlys, its fresh enough. " + new Date(this._commentOnlys.timestamp));
      } else {
        this._commentOnlys = this.giveMeUsersWithTheseRolesAndNotTheseRoles(["commenter"], ["admin", "writer", "reader"]);
        this._commentOnlys.timestamp = Date.now();
      }
      return this._commentOnlys;
    },
    set: function() {
      this.warn("commentOnlys cannot be set. it is only syntactic sugar. If you want to modify roles, see the addUser and removeUser functions");
    }
  },

  /**
   * Syntactic sugar for apps who want to show users in one category, not grouped by low level permissions.
   *
   * This permission is side effect of when a user has only read and comment permission.
   * This is a common permission used by research teams where an external reviewer,
   * or a second language consultant can review and coment on the data,
   * but cannot modify the data itself.
   *
   * @type {Permission}
   */
  readerCommenterOnlys: {
    get: function() {
      if (this._readerCommenterOnlys && this._readerCommenterOnlys.timestamp && (Date.now() - this._readerCommenterOnlys.timestamp < this.cacheTimeLength)) {
        this.debug("Not regenerating the list of readerCommenterOnlys, its fresh enough. " + new Date(this._readerCommenterOnlys.timestamp));
      } else {
        this._readerCommenterOnlys = this.giveMeUsersWithTheseRolesAndNotTheseRoles(["reader", "commenter"], ["admin", "writer"]);
        this._readerCommenterOnlys.timestamp = Date.now();
      }
      return this._readerCommenterOnlys;
    },
    set: function() {
      this.warn("readerCommenterOnlys cannot be set. it is only syntactic sugar. If you want to modify roles, see the addUser and removeUser functions");
    }
  },

  /**
   * Syntactic sugar for apps who want to show users in one category, not grouped by low level permissions.
   *
   * This permission is side effect of when a user has only read and write permission.
   * This is a rare permission where the user has been leaving abusive comments,
   * and are thus only permitted to browse and edit the data itself, not add or edit comments.
   *
   * If you want to give someone access as a reader+writer, use readerWritersComenters.
   *
   * @type {Permission}
   */
  readerWriters: {
    get: function() {
      return this.readerWriter || [];
    },
    set: function() {
      this.warn("readerWriters cannot be set. it is only syntactic sugar. If you want to modify roles, see the addUser and removeUser functions");
    }
  },

  /**
   * Syntactic sugar for apps who want to show users in one category, not grouped by low level permissions.
   *
   * This permission is side effect of when a user has only read comment and write permission.
   * This is syntactic sugar which is often refered to as "writers" in traditional databases permissions.
   * It means the user can write data, read data and comment on data
   *
   * @return {Permission} A permission group with an array of Users who fall into this category
   */
  readerCommenterWriters: {
    get: function() {
      if (this._readerCommenterWriterOnlys && this._readerCommenterWriterOnlys.timestamp && (Date.now() - this._readerCommenterWriterOnlys.timestamp < this.cacheTimeLength)) {
        this.debug("Not regenerating the list of readerCommenterWriterOnlys, its fresh enough. " + new Date(this._readerCommenterWriterOnlys.timestamp));
      } else {
        this._readerCommenterWriterOnlys = this.giveMeUsersWithTheseRolesAndNotTheseRoles(["reader", "writer"], ["admin"]);
        this._readerCommenterWriterOnlys.timestamp = Date.now();
      }
      return this._readerCommenterWriterOnlys;
    },
    set: function() {
      this.warn("readerCommenterWriters cannot be set. it is only syntactic sugar. If you want to modify roles, see the addUser and removeUser functions");
    }
  },

  /**
   * Syntactic sugar for apps who want to show users in one category, not grouped by low level permissions.
   *
   * Often refered to as "admins" in traditional databases permissio ns
   * It means the user can write data, read data and comment on data, and perform any operation on the data.
   *
   * @return {Permission} A permission group with an array of Users who fall into this category
   */
  readerCommenterWriterAdmins: {
    get: function() {
      if (this._readerCommenterWriterAdminAlso && this._readerCommenterWriterAdminAlso.timestamp && (Date.now() - this._readerCommenterWriterAdminAlso.timestamp < this.cacheTimeLength)) {
        this.debug("Not regenerating the list of readerCommenterWriterAdminAlso, its fresh enough. " + new Date(this._readerCommenterWriterAdminAlso.timestamp));
      } else {
        this._readerCommenterWriterAdminAlso = this.giveMeUsersWithTheseRolesAndNotTheseRoles(["reader", "writer", "admin"], []);
        this._readerCommenterWriterAdminAlso.timestamp = Date.now();
      }
      return this._readerCommenterWriterAdminAlso;
    },
    set: function() {
      this.warn("readerCommenterWriterAdmins cannot be set. it is only syntactic sugar. If you want to modify roles, see the addUser and removeUser functions");
    }
  },

  /*** Permissions to control unruly users who the team is not able to convince to work as a team ***/

  /**
   * Syntactic sugar for apps who want to show users in one category, not grouped by low level permissions.
   *
   * This is a permission provided for teams who want many language consultants to contribute to one
   * database without seeing the data other consultants have added. We expect this may be a common
   * permission especially for teams where there is no `standard` dialect and speakers of other dialects
   * are very prescriptive and think others are making `errors` which need to be corrected, this permission prevents them from `correcting` others data.
   *
   * @return {Permission} A permission group with an array of Users who fall into this category
   */
  readOwnDataWriteOwnDataOnlys: {
    get: function() {
      return this.readOwnDataWriteOwnDataOnly || [];
    },
    set: function() {
      this.warn("readOwnDataWriteOwnDataOnlys cannot be set. it is only syntactic sugar. If you want to modify roles, see the addUser and removeUser functions");
    }
  },

  /**
   * Syntactic sugar for apps who want to show users in one category, not grouped by low level permissions.
   *
   * This is a rare permission provided for team members who have been editing other people's
   * data either to update it to their own dialect (when it was supposed to be the dialect
   * of the original source) or other sorts of 'destructive' edits. A user with this permission
   * will know that they have been limited to commenting on others' data, and editing their own
   * data only (similar to Facebook).
   *
   * This permission should not be a default permission among research teams, instead the readerCommenterWriter
   * permission should be used to reduce territoriality in the data and makes it harder for the database to be kept clean
   * because users cannot update/comment on data when they notice a problem. All data is versioned so any
   * mistakes can be undone.
   *
   * @return {Permission} A permission group with an array of Users who fall into this category
   */
  readCommentAllWriteOwnDataOnlys: {
    get: function() {
      return this.readCommentAllWriteOwnDataOnly || [];
    },
    set: function() {
      this.warn("readCommentAllWriteOwnDataOnlys cannot be set. it is only syntactic sugar. If you want to modify roles, see the addUser and removeUser functions");
    }
  },

  /**
   * Syntactic sugar for apps who want to show users in one category, not grouped by low level permissions.
   *
   * This is a rare permission provided for team members who have been editing other people's
   * data either to update it to their own dialect (when it was supposed to be the dialect
   * of the original source) or other sorts of 'destructive' edits which the team wants to
   * prevent the user from doing this without making the user uncomfortable. A user with this permission
   * will know that they have been limited to editing their own data only (similar to Facebook) and cannot
   * edit other people's data.
   *
   * This permission should not be a default permission among research teams, instead the readerCommenterWriter
   * permission should be used to reduce territoriality in the data and makes it harder for the database to be kept clean
   * because users cannot update/comment on data when they notice a problem. All data is versioned so any
   * mistakes can be undone.
   *
   * @return {Permission} A permission group with an array of Users who fall into this category
   */
  readAllWriteOwnDataOnlys: {
    get: function() {
      return this.readAllWriteOwnDataOnly || [];
    },
    set: function() {
      this.warn("readAllWriteOwnDataOnlys cannot be set. it is only syntactic sugar. If you want to modify roles, see the addUser and removeUser functions");
    }
  },

  /**
   * This might be used by teams who want to have fine grained control over the
   * permissions, or who want to understand the fine grained control at a lower level.
   *
   * @return {Object} an object with the 3 categories of permission like you
   * would have in a PHPmyAdmin console.
   */
  viewAsBasePermissionSystem: {
    get: function() {
      return this;
    }
  },

  /**
   * This view will be missing some members of the corpora since not all combinations of
   * permission have syntactic sugar methods in this library. This shoudlnt be used
   * unless the app dev is sure that the users wont be using corpora for psycholinguistics or
   * crowdsourcing or computational linguistics.
   *
   * @return {Object} an object with the 3 categories of permission like you
   * would have in a PHPmyAdmin console.
   */
  viewAsGroupedPermissionSystem: {
    get: function() {
      return {
        adminOnlys: this.adminOnlys,
        writeOnlys: this.writeOnlys,
        readOnlys: this.readOnlys,
        readerCommenterOnlys: this.readerCommenterOnlys,
        readerWriters: this.readerCommenterWriters,
        admins: this.readerCommenterWriterAdmins,
        commentOnlys: this.commentOnlys,
        // readerCommenterWriters: readerCommenterWriters,
        //writerCommenterOnlys
        //writerAdminOnlys
        //writerCommenterAdminOnlys
      };
    }
  },

  /**
   * This is the way most field linguistics apps present the permissions system.
   *
   * @return {Object} an object with the 3 categories of permission like you
   * would have in a PHPmyAdmin console.
   */
  viewAsDataBasePermissionSystem: {
    get: function() {
      return {
        admins: this.readerCommenterWriterAdmins,
        writers: this.readerCommenterWriters,
        readers: this.readerCommenterOnlys,
        commenters: this.readerCommenterOnlys
      };
    }
  },

  /**
   * This might be the way that some computational linguistics teams will
   * understand the permission system best, but the words
   * `collaborator` and `contributor` are so similar that thus far no one
   * has used these terms.
   *
   * @return {Object} an object with the 2 categories of permission like you
   * would have on GitHub
   */
  viewAsEmailingTeamPermissionSystem: {
    get: function() {
      return {
        contributors: this.contributors,
        collaborators: this.collaborators,
        owners: this.readerCommenterWriterAdmins
      };
    }
  },

  addUser: {
    value: function(user) {
      if (!user || !user.roles) {
        this.warn("You should provide roles you want to add... doing nothing.");
        return;
      }
      this.debug(user.roles);
      var roles = user.roles;
      delete user.roles;

      for (var roleIndex = roles.length - 1; roleIndex >= 0; roleIndex--) {
        var permissionType = roles[roleIndex];
        if (!this[permissionType]) {
          permissionType = permissionType.toLowerCase() + "s";
          if (!this[permissionType]) {
            var newPermission = this.buildPermissionFromAPermissionType(permissionType);
            this.debug(" Creating a permssion group for " + permissionType, newPermission);

            this.add(newPermission);
          }
        }
        this[permissionType].users.add(user);
        this.debug("the user was added to the permission group " + permissionType + " there are a total of " + this[permissionType].length + " users with this sort of access ", this[permissionType].users);
      }
    }
  },

  /**
   * Removes user from roles on this permissions team, or removes user entirely if only a username is supplied.
   *
   * @param  {Object} user A user with minimally a username and roles which should be removed, or alternatively can be just a username if you want to remove the user entirely from the team.
   */
  removeUser: {
    value: function(user) {
      if (typeof user === "string") {
        user = {
          username: user,
          roles: this.currentPermissions
        };
        this.warn("Remove was requested of a username, removing the username entirely from the permission team.");
      }
      if (!user || !user.roles) {
        this.warn("You should provide roles you want to remove... doing nothing.");
        return;
      }
      // this.debugMode = true;
      this.debug(user.roles);
      var roles = user.roles;
      delete user.roles;

      for (var roleIndex = roles.length - 1; roleIndex >= 0; roleIndex--) {
        var permissionType = roles[roleIndex];
        if (!this[permissionType]) {
          permissionType = permissionType.toLowerCase() + "s";
        }
        if (this[permissionType]) {
          // this[permissionType].users.debugMode = true;
          if (this[permissionType].users[user.username]) {
            var userWasInThisPermission = this[permissionType].users.remove(user);
            this.debug("removed ", userWasInThisPermission);
          } else {
            this.warn("The user " + user.username + " was not in the " + permissionType + " anyway.");
          }
          this.debug("the user " + user.username + " is not in " + permissionType + " there are a total of " + this[permissionType].length + " users with this sort of access ", this[permissionType].users);
        }
      }
    }
  },

  /**
   * A list of "hats" which team members can wear in this team.
   */
  currentPermissions: {
    get: function() {
      if (!this._collection || this._collection === 0) {
        return [];
      }
      var self = this;
      return this._collection.map(function(permission) {
        return permission[self.primaryKey];
      });

    }
  },

  buildPermissionFromAPermissionType: {
    value: function(permissionType) {
      var verb = permissionType.replace(/s/, "").replace(/writer/, "write").replace(/er/, "");
      var label = permissionType;
      if (label && label.length > 2) {
        label = label[0].toUpperCase() + label.substring(1, label.length);
      }
      var helpLinguists = "These users can perform " + verb + " operations on the corpus";

      return {
        users: [],
        verb: verb,
        id: permissionType,
        labelFieldLinguists: label,
        helpLinguists: helpLinguists,
        directObject: "corpus",
        // debugMode: true
      };
    }
  },

  /**
   * Accepts an object containing permission groups which are an array of
   * users masks which have this permission. This simple object is used to populate the permissions model.
   *
   * @param  {Object} users an object containing keys which are verbs (permission types) and the value is an array of users who are in this category
   */
  populate: {
    value: function(users) {
      if (!users || users === "defaults") {
        users = {};
        this.warn("Using default permission types");
      }
      users.admins = users.admins || [];
      users.writers = users.writers || [];
      users.readers = users.readers || [];
      users.commenters = users.commenters || [];
      users.exporters = users.exporters || [];

      users.notonteam = users.notonteam || [];
      users.allusers = users.allusers || [];

      this.usersNotOnTeam = new Users(users.notonteam);
      this.allUsers = new Users(users.allusers);

      delete users.allusers;
      delete users.notonteam;

      var permissionType;
      for (permissionType in users) {
        if (users.hasOwnProperty(permissionType) && permissionType) {
          /* if the permission is just an array of users, construct basic permission meta data around it */
          if (Object.prototype.toString.call(users[permissionType]) === "[object Array]") {
            var usersArray = users[permissionType];
            users[permissionType] = this.buildPermissionFromAPermissionType(permissionType);
            users[permissionType].users = usersArray;
          }
          this.debug("adding " + permissionType, users[permissionType]);
          this.add(new Permission(users[permissionType]));
        }
      }
    }
  },

  sanitizeStringForPrimaryKey: {
    value: function(value) {
      return value;
    }
  }

});

exports.Permissions = Permissions;
