var FieldDBObject = require("./../FieldDBObject").FieldDBObject;
var DatumFields = require("./../datum/DatumFields").DatumFields;
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

  this.debug("Constructing a UserMask " + options);
  FieldDBObject.apply(this, arguments);
};

UserMask.prototype = Object.create(FieldDBObject.prototype, /** @lends UserMask.prototype */ {
  constructor: {
    value: UserMask
  },

  api: {
    value: "users"
  },

  INTERNAL_MODELS: {
    value: {
      username: FieldDBObject.DEFAULT_STRING,
      firstname: FieldDBObject.DEFAULT_STRING,
      lastname: FieldDBObject.DEFAULT_STRING,
      gravatar: FieldDBObject.DEFAULT_STRING,
      researchInterest: FieldDBObject.DEFAULT_STRING,
      affiliation: FieldDBObject.DEFAULT_STRING,
      description: FieldDBObject.DEFAULT_STRING,
      fields: DatumFields
    }
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
      researchInterest: "",
      affiliation: "",
      description: ""
    }
  },

  id: {
    get: function() {
      if (!this._username) {
        this._username = "";
      }
      return this._username || this._id;
    },
    set: function(value) {
      if (value === this._username) {
        return;
      }
      if (!value) {
        value = "";
      }
      this._username = this._id = value.trim();
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

  fields: {
    configurable: true,
    get: function() {
      if (this._fields) {
        // this.debug("setting speaker fields confidential in the Speaker.fields get function.");

        // this._fields.encrypted = true;
        // this._fields.decryptedMode = true;
        this._fields.confidential = this.confidential;
      }
      return this._fields;
    },
    set: function(value) {
      if (value === this._fields) {
        return;
      }
      if (!value) {
        delete this._fields;
        return;
      } else {
        if (Object.prototype.toString.call(value) === "[object Array]") {
          value = new this.INTERNAL_MODELS["fields"](value);
        }
      }
      this._fields = value;
    }
  }


});

exports.UserMask = UserMask;
