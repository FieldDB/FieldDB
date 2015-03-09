/* globals localStorage */
var FieldDBObject = require("./../FieldDBObject").FieldDBObject;
var Confidential = require("./../confidentiality_encryption/Confidential").Confidential;
var MD5 = require("MD5");

/**
 * @class A mask of a user which can be saved along with the corpus. It is
 *        generally just a username and gravatar but could be more depending
 *        on what the user allows to be public.
 *
 *
 * @extends FieldDBObject
 * @tutorial tests/UserTest.js
 */
var UserMask = function UserMask(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "UserMask";
  }
  /* Switch user to the new dev servers if they have the old ones prior to v1.38+ */
  if (options && options.appVersionWhenCreated) {
    var year = options.appVersionWhenCreated.split(".")[0];
    var week = options.appVersionWhenCreated.split(".")[1];
    // if (year === 1 && week <= 38) {
    if (options.authUrl) {
      options.authUrl = options.authUrl.replace(/.fieldlinguist.com:3183/g, ".lingsync.org");
    }
    if (options.corpuses) {
      options.corpuses.map(function(couchConnection) {
        if (couchConnection.authUrl) {
          couchConnection.authUrl = options.authUrl.replace(/.fieldlinguist.com:3183/g, ".lingsync.org");
        } else {
          couchConnection.authUrl = options.authUrl;
        }
        couchConnection.domain = couchConnection.domain.replace(/ifielddevs.iriscouch.com/g, "corpusdev.lingsync.org");
        return couchConnection;
      });
      // }
    }
  }

  this.debug("Constructing a UserMask " + options);
  FieldDBObject.apply(this, arguments);
};

UserMask.prototype = Object.create(FieldDBObject.prototype, /** @lends UserMask.prototype */ {
  constructor: {
    value: UserMask
  },

  api: {
    value: "/users"
  },

  buildGravatar: {
    value: function(email) {
      var existingGravatar = this._gravatar;
      if (existingGravatar.indexOf("gravatar.com") > -1) {
        existingGravatar = existingGravatar.replace("https://secure.gravatar.com/avatar/", "");
        this._gravatar = existingGravatar;
      } else if (existingGravatar.indexOf("user_gravatar.png") > -1) {
        existingGravatar = "";
      }
      if (!existingGravatar) {
        if (email) {
          this._gravatar = MD5(email);
        } else {
          this._gravatar = "0df69960706112e38332395a4f2e7542";
        }
      }
      return this._gravatar;
    }
  },

  defaults: {
    value: {
      username: "",
      firstname: "",
      lastname: "",
      email: "",
      gravatar: "",
      researchInterests: "",
      affiliation: "",
      description: "",
      corpuses: ""
    }
  },

  id: {
    get: function() {
      if (!this._username) {
        this._username = "";
      }
      return this._username;
    },
    set: function(value) {
      if (value === this._username) {
        return;
      }
      if (!value) {
        value = "";
      }
      this._username = value.trim();
    }
  },

  corpora: {
    get: function() {
      return this.corpuses;
    },
    set: function(value) {
      this.corpuses = value;
    }
  },

  username: {
    get: function() {
      if (!this._username) {
        this._username = "";
      }
      return this._username;
    },
    set: function(value) {
      if (value === this._username) {
        return;
      }
      if (!value) {
        value = "";
      }
      this._username = value.trim();
    }
  },

  firstname: {
    configurable: true,
    get: function() {
      if (!this._firstname) {
        this._firstname = "";
      }
      return this._firstname;
    },
    set: function(value) {
      if (value === this._firstname) {
        return;
      }
      if (!value) {
        value = "";
      }
      this._firstname = value.trim();
    }
  },

  lastname: {
    configurable: true,
    get: function() {
      if (!this._lastname) {
        this._lastname = "";
      }
      return this._lastname;
    },
    set: function(value) {
      if (value === this._lastname) {
        return;
      }
      if (!value) {
        value = "";
      }
      this._lastname = value.trim();
    }
  },

  gravatar: {
    get: function() {
      if (!this._gravatar) {
        this._gravatar = "";
      }
      return this._gravatar;
    },
    set: function(value) {
      if (value === this._gravatar) {
        return;
      }
      if (!value) {
        value = "";
      }
      this._gravatar = value.trim();
    }
  },

  email: {
    get: function() {
      if (!this._email) {
        this._email = "";
      }
      return this._email;
    },
    set: function(value) {
      if (value === this._email) {
        return;
      }
      if (!value) {
        value = "";
      }
      var validEmailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (validEmailRegEx.test(value)) {
        this._email = value.trim();
      }
    }
  },

  affiliation: {
    get: function() {
      if (!this._affiliation) {
        this._affiliation = "";
      }
      return this._affiliation;
    },
    set: function(value) {
      if (value === this._affiliation) {
        return;
      }
      if (!value) {
        value = "";
      }
      this._affiliation = value.trim();
    }
  },

  researchInterest: {
    get: function() {
      if (!this._researchInterest) {
        this._researchInterest = "";
      }
      return this._researchInterest;
    },
    set: function(value) {
      if (value === this._researchInterest) {
        return;
      }
      if (!value) {
        value = "";
      }
      this._researchInterest = value.trim();
    }
  },

  description: {
    get: function() {
      if (!this._description) {
        this._description = "";
      }
      return this._description;
    },
    set: function(value) {
      if (value === this._description) {
        return;
      }
      if (!value) {
        value = "";
      }
      this._description = value.trim();
    }
  },

  name: {
    configurable: true,
    get: function() {
      this.firstname = this.firstname || "";
      this.lastname = this.lastname || "";
      var name = (this.firstname + " " + this.lastname).trim();
      if (name) {
        return name;
      }
      return this.anonymousCode || this.username;
    },
    set: function(value) {
      if (!value) {
        return;
      }
      if (value.indexOf(" ") > -1) {
        var pieces = value.replace(/ +/g, " ").split(" ");
        if (pieces[0]) {
          this._firstname = pieces[0];
        }
        if (pieces[1]) {
          this._lastname = pieces[1];
        }
      }
    }
  },
  validateUsername: {
    value: function(value) {
      if (!value) {
        return {
          valid: false,
          username: null,
          original: null,
          suggestion: null
        };
      }
      var safeName = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
      var validation = {
        valid: true,
        username: value,
        original: value
      };
      if (safeName !== value) {
        validation.valid = false;
        validation.suggestion = safeName;
        validation.username = safeName;
      }
      return validation;
    }
  },


  save: {
    value: function(options) {
      this.debug("Customizing save ", options);
      var key,
        userKey,
        encryptedUserPreferences;

      if (!this._rev) {
        this.warn("Refusing to save a user doc which is incomplete, and doesn't have a rev");
        return;
      }

      try {
        // save the user's preferences encrypted in local storage so they can work without by connecting only to their corpus
        key = localStorage.getItem("X09qKvcQn8DnANzGdrZFqCRUutIi2C");
        if (!key) {
          key = Confidential.secretKeyGenerator();
          localStorage.setItem("X09qKvcQn8DnANzGdrZFqCRUutIi2C", key);
        }
      } catch (e) {
        this.constructor.prototype.temp = this.constructor.prototype.temp || {};
        key = this.constructor.prototype.temp.X09qKvcQn8DnANzGdrZFqCRUutIi2C;
        if (!key) {
          key = Confidential.secretKeyGenerator();
          this.constructor.prototype.temp.X09qKvcQn8DnANzGdrZFqCRUutIi2C = key;
        }
        this.warn("unable to use local storage, this app wont be very usable offline ", e);
      }
      userKey = key + this.username;
      encryptedUserPreferences = new Confidential({
        secretkey: userKey
      }).encrypt(this.toJSON());

      try {
        localStorage.setItem(userKey, encryptedUserPreferences);
      } catch (e) {
        this.constructor.prototype.temp = this.constructor.prototype.temp || {};
        this.constructor.prototype.temp[userKey] = encryptedUserPreferences;
        this.warn("unable to use local storage, this app wont be very usable offline ", e);
      }
      // return FieldDBObject.prototype.save.apply(this, arguments);
    }
  },

  fetch: {
    value: function(options) {
      this.debug("Customizing fetch ", options);
      var key,
        userKey,
        encryptedUserPreferences,
        decryptedUser = {};
      try {
        // fetch the user's preferences encrypted in local storage so they can work without by connecting only to their corpus
        key = localStorage.getItem("X09qKvcQn8DnANzGdrZFqCRUutIi2C");
      } catch (e) {
        this.constructor.prototype.temp = this.constructor.prototype.temp || {};
        key = this.constructor.prototype.temp.X09qKvcQn8DnANzGdrZFqCRUutIi2C;
        this.warn("unable to use local storage, this app wont be very usable offline ", e);
      }
      if (!key) {
        this.warn("cannot fetch user locally");
        return;
      }
      userKey = key + this.username;
      try {
        encryptedUserPreferences = localStorage.getItem(userKey);

      } catch (e) {
        if (!this.constructor.prototype.temp) {
          this.warn("no local users have been saved");
          return;
        }
        encryptedUserPreferences = this.constructor.prototype.temp[userKey];
      }
      decryptedUser = {};
      if (encryptedUserPreferences) {
        this.warn("This user hasnt used this device before, need to request their prefs when they login.");
        return;
      }
      decryptedUser = new Confidential({
        secretkey: userKey
      }).decrypt(encryptedUserPreferences);

      this.debug(" Opening user prefs from previous session on this device", decryptedUser);
      this.merge(decryptedUser);
      // FieldDBObject.prototype.fetch.apply(this, arguments);
      return this;
    }
  }

});

exports.UserMask = UserMask;
