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
      this._dateModified = Date.now();
      //TODO return a promise from server/offline save etc
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
          deffered.reject({error: "Cannot fetch if there is no id"});
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
    value: function toJSON() {
      var json = {},
        aproperty,
        underscorelessProperty;
      for (aproperty in this) {
        if (this.hasOwnProperty(aproperty) && typeof this[aproperty] !== "function") {
          underscorelessProperty = aproperty.replace(/^_/, "");
          json[underscorelessProperty] = this[aproperty];
        }
      }
      for (aproperty in this.defaults) {
        if (!json[aproperty]) {
          json[aproperty] = this.defaults[aproperty];
        }
      }
      return json;
    }
  }
});

exports.FieldDBObject = FieldDBObject;
