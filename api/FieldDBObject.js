/**
 * @class An extendable object which can recieve new parameters on creation.
 *
 * @param {Object} options Optional json initialization object
 *
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
    value: function() {
      if (!this.id) {
        return; //TODO reject promise
      }
    }
  },

  defaultVersion: {
    value: "v2.0.1"
  },

  defaults: {
    value: {}
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
