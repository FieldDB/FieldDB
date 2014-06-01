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
  for (var member in json) {
    if (!json.hasOwnProperty(member)) {
      continue;
    }
    this[member] = json[member];
  }
  //force version to be set if it wasn't pre-set
  if (!this.version) {
    this.version = "";
  }
  Object.apply(this, arguments);
};

/** @lends FieldDBObject.prototype */
FieldDBObject.prototype = Object.create(Object.prototype, {
  constructor: {
    value: FieldDBObject
  },

  save: {
    value: function() {
      var deffered = Q.defer(),
        self = this;
      if (this.saving) {
        console.warn("Save is in process....");
        return;
      }
      this.saving = true;

      this._dateModified = Date.now();
      if (!this.id) {
        this._dateCreated = Date.now();
        this.enteredByUser = {
          browserVersion: navigator.appVersion
        };
      } else {
        this.modifiedByUsers = this.modifiedByUsers || [];
        this.modifiedByUsers.push({
          browserVersion: navigator.appVersion
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
      CORS.makeCORSRequest({
        type: 'GET',
        dataType: "json",
        url: optionalBaseUrl + "/" + this.dbname + "/" + id
      }).then(function(result) {
        for (var aproperty in result) {
          if (!result.hasOwnProperty(aproperty)) {
            continue;
          }
          self[aproperty] = result[aproperty];
        }
        deffered.resolve(self);
      }, function(reason) {
        console.log(reason);
        deffered.reject(reason);
      }).fail(function(reason) {
        console.log(reason);
        deffered.reject(reason);
      });

      return deffered.promise;
    }
  },

  defaultVersion: {
    value: "v2.0.1"
  },

  defaults: {
    value: {}
  },

  id: {
    get: function() {
      if (!this._id) {
        this._id = "";
      }
      return this._id;
    },
    set: function(value) {
      if (value === this._id) {
        return;
      }
      if (!value) {
        value = "";
      }
      this._id = value.trim();
    }
  },

  rev: {
    get: function() {
      if (!this._rev) {
        this._rev = "";
      }
      return this._rev;
    },
    set: function(value) {
      if (value === this._rev) {
        return;
      }
      if (!value) {
        value = "";
      }
      this._rev = value.trim();
    }
  },

  dbname: {
    get: function() {
      if (!this._dbname) {
        this._dbname = "";
      }
      return this._dbname;
    },
    set: function(value) {
      if (value === this._dbname) {
        return;
      }
      if (!value) {
        value = "";
      }
      this._dbname = value.trim();
    }
  },

  version: {
    get: function() {
      if (!this._version) {
        this._version = this.defaultVersion;
      }
      return this._version;
    },
    set: function(value) {
      if (value === this._version) {
        return;
      }
      if (!value) {
        value = this.defaultVersion;
      }
      this._version = value.trim();
    }
  },

  toJSON: {
    value: function() {
      var json = {},
        aproperty,
        underscorelessProperty;
      for (aproperty in this) {
        if (this.hasOwnProperty(aproperty) && typeof this[aproperty] !== "function") {
          underscorelessProperty = aproperty.replace(/^_/, "");
          if (underscorelessProperty === 'id' || underscorelessProperty === 'rev') {
            underscorelessProperty = '_' + underscorelessProperty;
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
  }
});

exports.FieldDBObject = FieldDBObject;
