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
    value: this.adminOnlys
  },



  /*** Gropued permissions (useful to show permissions in an app) ***/

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
      return this.adminOnly || [];
    },
    set: function(value) {
      this.adminOnly = value;
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
  writerOnlys: {
    get: function() {
      return this.writeOnly || [];
    },
    set: function(value) {
      this.writeOnly = value;
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
  readerOnlys: {
    get: function() {
      return this.readOnly || [];
    },
    set: function(value) {
      this.readOnly = value;
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
  commenterOnlys: {
    get: function() {
      return this.commenter || [];
    },
    set: function(value) {
      this.commenter = value;
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
      return this.readerCommenter || [];
    },
    set: function(value) {
      this.readerCommenter = value;
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
    set: function(value) {
      this.readerWriter = value;
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
      return this.readerCommenterWriter || [];
    },
    set: function(value) {
      this.readerCommenterWriter = value;
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
      return this.readerCommenterWriterAdmin || [];
    },
    set: function(value) {
      this.readerCommenterWriterAdmin = value;
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
    set: function(value) {
      this.readOwnDataWriteOwnDataOnly = value;
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
    set: function(value) {
      this.readCommentAllWriteOwnDataOnly = value;
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
    set: function(value) {
      this.readAllWriteOwnDataOnly = value;
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
        admins: this.readerCommenterWriterAdmins
        // commenterOnlys: this.commenterOnlys,
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


  populate: {
    /**
     * Accepts an object containing permission groups which are an array of
     * users masks which have this permission. This simple object is used to populate the permissions model.
     *
     * @param  {Object} users an object containing keys which are verbs (permission types) and the value is an array of users who are in this category
     */
    value: function(users) {
      if (!this.get("team")) {
        //If app is completed loaded use the user, otherwise put a blank user
        if (window.appView) {
          this.set("team", window.app.get("authentication").get("userPublic"));
          //          this.get("team").id = window.app.get("authentication").get("userPublic").id;
        } else {
          //          this.set("team", new UserMask({pouchname: this.get("pouchname")}));
        }
      }

      var self = this;
      // load the permissions in from the server.
      window.app.get("authentication").fetchListOfUsersGroupedByPermissions(function(users) {
        var typeaheadusers = [];
        for (var userX in users.notonteam) {
          if (users.notonteam[userX].username) {
            typeaheadusers.push(users.notonteam[userX].username);
          } else {
            if (OPrime.debugMode) {
              OPrime.debug("This user is invalid", users.notonteam[userX]);
            }
          }
        }
        typeaheadusers = JSON.stringify(typeaheadusers);
        var potentialusers = users.allusers || [];

        var admins = new Users();
        self.add(new Permission({
          users: admins,
          role: "admin",
          typeaheadusers: typeaheadusers,
          potentialusers: potentialusers,
          pouchname: self.get("pouchname")
        }));

        var writers = new Users();
        self.add(new Permission({
          users: writers,
          role: "writer",
          typeaheadusers: typeaheadusers,
          potentialusers: potentialusers,
          pouchname: self.get("pouchname")
        }));

        var readers = new Users();
        self.add(new Permission({
          users: readers,
          role: "reader",
          typeaheadusers: typeaheadusers,
          potentialusers: potentialusers,
          pouchname: self.get("pouchname")
        }));

        var u;
        var user;
        if (users.admins && users.admins.length > 0) {
          for (u in users.admins) {
            if (!users.admins[u].username) {
              continue;
            }
            user = {
              "username": users.admins[u].username
            };
            if (users.admins[u].gravatar) {
              user.gravatar = users.admins[u].gravatar;
            }
            admins.models.push(new UserMask(user));
          }
        }
        if (users.writers && users.writers.length > 0) {
          for (u in users.writers) {
            if (!users.writers[u].username) {
              continue;
            }
            user = {
              "username": users.writers[u].username
            };
            if (users.writers[u].gravatar) {
              user.gravatar = users.writers[u].gravatar;
            }
            writers.models.push(new UserMask(user));
          }
        }
        if (users.readers && users.readers.length > 0) {
          for (u in users.readers) {
            if (!users.readers[u].username) {
              continue;
            }
            user = {
              "username": users.readers[u].username
            };
            if (users.readers[u].gravatar) {
              user.gravatar = users.readers[u].gravatar;
            }
            readers.models.push(new UserMask(user));
          }
        }
        //Set up the typeahead for the permissions edit

        if (typeof doneLoadingPermissions === "function") {
          doneLoadingPermissions();
        }
      });
    }
  },

  sanitizeStringForPrimaryKey: {
    value: function(value) {
      return value;
    }
  }

});

exports.Permissions = Permissions;
