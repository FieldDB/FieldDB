/* globals window */
var Q = require("q");
var CORS = require("./CORS").CORS;

/**
 * @class An extendable object which can recieve new parameters on creation.
 *
 * @param {Object} options Optional json initialization object
 * @property {String} dbname This is the identifier of the corpus, it is set when
 *           a corpus is created. It must be a file save name, and be a permitted
 *           name in CouchDB which means it is [a-z] with no uppercase letters or
 *           symbols, by convention it cannot contain -, but _ is acceptable.

 * @extends Object
 * @tutorial tests/FieldDBObjectTest.js
 */
var FieldDBObject = function FieldDBObject(json) {
  // console.log("In parent an json", json);
  Object.apply(this, arguments);
  for (var member in json) {
    if (!json.hasOwnProperty(member)) {
      continue;
    }
    // console.log("JSON: " + member);
    this[member] = json[member];
  }
  if (!this.id) {
    this.dateCreated = Date.now();
  }
};

FieldDBObject.DEFAULT_STRING = "";
FieldDBObject.DEFAULT_OBJECT = "";
FieldDBObject.DEFAULT_ARRAY = [];
FieldDBObject.DEFAULT_COLLECTION = [];
FieldDBObject.DEFAULT_VERSION = "v2.0.1";
FieldDBObject.DEFAULT_DATE = 0;

/** @lends FieldDBObject.prototype */
FieldDBObject.prototype = Object.create(Object.prototype, {
  constructor: {
    value: FieldDBObject
  },

  save: {
    value: function() {
      var deffered = Q.defer(),
        self = this;
      if (this.fetching) {
        console.warn("Fetching is in process, can't save right now...");
        return;
      }
      if (this.saving) {
        console.warn("Save is in process...");
        return;
      }
      this.saving = true;

      //update to this version
      this.version = FieldDBObject.DEFAULT_VERSION;

      this._dateModified = Date.now();
      if (!this.id) {
        this._dateCreated = Date.now();
        this.enteredByUser = {
          browserVersion: window.navigator.appVersion
        };
      } else {
        this.modifiedByUsers = this.modifiedByUsers || [];
        this.modifiedByUsers.push({
          browserVersion: window.navigator.appVersion
        });
      }

      var url = this.id ? '/' + this.id : '';
      url = this.url + url;
      CORS.makeCORSRequest({
        type: this.id ? 'PUT' : 'POST',
        dataType: "json",
        url: url,
        data: this.toJSON()
      }).then(function(result) {
          console.log(result);
          self.saving = false;
          if (result.id) {
            self.id = result.id;
            self.rev = result.rev;
            deffered.resolve(self);
          } else {
            deffered.reject();
          }
        },
        function(reason) {
          console.log(reason);
          self.saving = false;
          deffered.reject(reason);
        });

      return deffered.promise;
    }
  },

  fetch: {
    value: function(optionalBaseUrl) {
      var deffered = Q.defer(),
        id,
        self;

      id = this.id;
      if (!id) {
        Q.nextTick(function() {
          deffered.reject({
            error: "Cannot fetch if there is no id"
          });
        });
        return deffered.promise;
      }
      self = this;

      this.fetching = true;
      CORS.makeCORSRequest({
        type: 'GET',
        dataType: "json",
        url: optionalBaseUrl + "/" + this.dbname + "/" + id
      }).then(function(result) {
          self.fetching = false;

          for (var aproperty in result) {
            if (!result.hasOwnProperty(aproperty)) {
              continue;
            }
            if (self[aproperty] !== result[aproperty]) {
              console.warn("Overwriting " + aproperty + " : ", self[aproperty], " ->", result[aproperty]);
            }
            self[aproperty] = result[aproperty];
          }
          deffered.resolve(self);
        },
        function(reason) {
          self.fetching = false;
          console.log(reason);
          deffered.reject(reason);
        });

      return deffered.promise;
    }
  },


  defaults: {
    value: {}
  },

  id: {
    get: function() {
      return this._id || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      if (value === this._id) {
        return;
      }
      if (!value) {
        delete this._id;
        return;
      }
      this._id = value.trim();
    }
  },

  rev: {
    get: function() {
      return this._rev || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      if (value === this._rev) {
        return;
      }
      if (!value) {
        delete this._rev;
        return;
      }
      this._rev = value.trim();
    }
  },

  dbname: {
    get: function() {
      return this._dbname || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      if (value === this._dbname) {
        return;
      }
      if (!value) {
        delete this._dbname;
        return;
      }
      this._dbname = value.trim();
    }
  },

  pouchname: {
    get: function() {
      return this.dbname;
    },
    set: function() {
      console.warn("Pouchname is deprecated, please use dbname instead.");
    }
  },

  version: {
    get: function() {
      return this._version || FieldDBObject.DEFAULT_VERSION;
    },
    set: function(value) {
      if (value === this._version) {
        return;
      }
      if (!value) {
        value = FieldDBObject.DEFAULT_VERSION;
      }
      this._version = value.trim();
    }
  },

  dateCreated: {
    get: function() {
      return this._dateCreated || FieldDBObject.DEFAULT_DATE;
    },
    set: function(value) {
      if (value === this._dateCreated) {
        return;
      }
      if (!value) {
        delete this._dateCreated;
        return;
      }
      if (value.replace) {
        try {
          value = value.replace(/["\\]/g, '');
          value = new Date(value);
          /* Use date modified as a timestamp if it isnt one already */
          value = value.getTime();
        } catch (e) {
          console.warn("Upgraded dateCreated" + value);
        }
      }
      this._dateCreated = value;
    }
  },

  dateModified: {
    get: function() {
      return this._dateModified || FieldDBObject.DEFAULT_DATE;
    },
    set: function(value) {
      if (value === this._dateModified) {
        return;
      }
      if (!value) {
        delete this._dateModified;
        return;
      }
      if (value.replace) {
        try {
          value = value.replace(/["\\]/g, '');
          value = new Date(value);
          /* Use date modified as a timestamp if it isnt one already */
          value = value.getTime();
        } catch (e) {
          console.warn("Upgraded dateCreated" + value);
        }
      }
      this._dateModified = value;
    }
  },

  toJSON: {
    value: function() {
      var json = {},
        aproperty,
        underscorelessProperty;

      /* this object has been updated to this version */
      this.version = this.version;

      for (aproperty in this) {
        if (this.hasOwnProperty(aproperty) && typeof this[aproperty] !== "function") {
          underscorelessProperty = aproperty.replace(/^_/, "");
          if (underscorelessProperty === "id" || underscorelessProperty === "rev") {
            underscorelessProperty = "_" + underscorelessProperty;
          }
          json[underscorelessProperty] = this[aproperty];
        }
      }
      for (aproperty in this.defaults) {
        if (!json[aproperty]) {
          json[aproperty] = this.defaults[aproperty];
        }
      }
      if (!json._id) {
        delete json._id;
      }
      if (!json._rev) {
        delete json._rev;
      }

      return json;
    }
  },


  /**
   * Creates a deep copy of the object (not a reference)
   * @return {[type]} a near-clone of the objcet
   */
  clone: {
    value: function() {
      var json = JSON.parse(JSON.stringify(this.toJSON()));

      json.linkedData = json.linkedData || [];
      var source = json._id;
      if (json._rev) {
        source = source + "?rev=" + json._rev;
      }
      json.linkedData.push({
        uri: source,
        relation: "clonedFrom"
      });

      /* Clear the current object's info which we shouldnt clone */
      delete json._id;
      delete json._rev;

      return json;
    }
  }

});

exports.FieldDBObject = FieldDBObject;
