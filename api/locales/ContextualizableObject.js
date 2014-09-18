var FieldDBObject = require("./../FieldDBObject").FieldDBObject;

/**
 * @class The ContextualizableObject allows the user to label data with grammatical tags
 *        i.e. passive, causative. This is useful for searches.
 *
 * @name  ContextualizableObject
 * @description The initialize function brings up a field in which the user
 *              can enter tags.@class Object of Datum validation states
 * @extends Object
 * @constructs
 */
var ContextualizableObject = function ContextualizableObject(json) {
  this.debug("Constructing ContextualizableObject ", json);
  if (json && typeof json === "string") {
    if (!ContextualizableObject.updateAllToContextualizableObjects) {
      // Dont localize this, return what you received to be backward compatible
      console.warn("ContextualizableObject: should not converting this deprecated string in to a ContextualizableObject " + json);
      // this.protoype = Object.create(String.prototype);
      String.apply(this, arguments);
      // String.call(json);
      // this.prototype = String.prototype;
      // this.__proto__ = String.call(json);
      // json = new String(json);
      console.warn("string should not be an object: " + this);
      // this.toString = function() {
      //   return json;
      // }
      return;
    }
    var stringAsKey = "locale_" + json.replace(/[^a-zA-Z0-9-]/g, "_");
    var value = json;
    json = {
      default: stringAsKey
    };
    this.originalString = value;
    this.data = this.data || {};
    this.data[stringAsKey] = {
      "message": value
    };
    this.add(stringAsKey, value);

    // if (this.contextualizer && this.contextualizer.contextualize(for_context) === for_context) {
    //   this.contextualizer.updateContextualization(for_context, locale_string)
    //   this.debug("added to contextualizer "+ this.contextualizer.contextualize(for_context));
    // }
  }
  for (var member in json) {
    if (!json.hasOwnProperty(member) || member === "contextualizer") {
      continue;
    }
    this.add(member, json[member]);
  }

  Object.apply(this, arguments);
};
var forcedebug = false;

ContextualizableObject.updateAllToContextualizableObjects = false;
ContextualizableObject.prototype = Object.create(Object.prototype, /** @lends ContextualizableObject.prototype */ {
  constructor: {
    value: ContextualizableObject
  },

  type: {
    value: "ContextualizableObject"
  },

  contextualizer: {
    get: function() {
      return FieldDBObject.prototype.contextualizer;
    }
  },

  debug: {
    value: function(message, message2, message3, message4) {
      if (FieldDBObject.application && FieldDBObject.application.contextualizer) {
        // console.log("using  FieldDBObject.application.contextualizer.debug " +  FieldDBObject.application.contextualizer.debugMode);
        return FieldDBObject.application.contextualizer.debug;
      } else {
        if (forcedebug) {
          console.log(this.type.toUpperCase() + "-DEBUG FORCED: " + message);

          if (message2) {
            console.log(message2);
          }
          if (message3) {
            console.log(message3);
          }
          if (message4) {
            console.log(message4);
          }
        }
      }
    }
  },

  contextualize: {
    value: function(locale_string) {
      this.debug("requesting contextualization of " + locale_string);
      var contextualizedString;
      if (this.contextualizer) {
        contextualizedString = this.contextualizer.contextualize(locale_string);
      }
      if (!contextualizedString || contextualizedString === locale_string) {
        if (this.data && this.data[locale_string]) {
          contextualizedString = this.data[locale_string].message;
        } else {
          contextualizedString = locale_string;
        }
      }
      this.debug("::" + contextualizedString + "::");
      return contextualizedString;
    }
  },

  updateContextualization: {
    value: function(for_context, locale_string) {
      this.debug("updateContextualization" + for_context);
      var updated;
      if (this.contextualizer) {
        this.debug(this.contextualizer.data);
        updated = this.contextualizer.updateContextualization(for_context, locale_string);
      }
      if ((!updated || updated === for_context) && this.data) {
        this.data[for_context] = this.data[for_context] || {
          message: ""
        };
        this.data[for_context].message = locale_string;
      }
      // this.data = this.data || {};
      // this.data[for_context] = {
      //   message: locale_string
      // };

      if (this._default === for_context) {
        this.originalString = locale_string;
      }
      return updated;
    }
  },

  add: {
    value: function(for_context, locale_string) {
      var underscoreNotation = "_" + for_context;
      this[underscoreNotation] = locale_string;
      this.__defineGetter__(for_context, function() {
        this.debug("overidding getter");
        return this.contextualize(this[underscoreNotation]);
      });
      this.__defineSetter__(for_context, function(value) {
        this.debug("overidding setter " + underscoreNotation, value);
        this.updateContextualization(this[underscoreNotation], value);
      });
      this.debug("adding string to ContextualizableObject's own data " + for_context);
      //if there is no contextualizer, add this to the local data
      this.data = this.data || {};
      this.data[for_context] = {
        "message": locale_string
      };
      if (for_context.indexOf("locale_") === 0 || for_context.indexOf("localized_") === 0) {
        this.debug("intializing the data in this ContextualizableObject");
        this.debug(" for_context " + for_context);
        this.debug(" locale_string " + locale_string);
        // If the contextualizer doesnt have a value for this string, add it to the contextualizations... (this could introduce a lot of data into the localizations)
        if (this.contextualizer) {
          this.debug(" adding to contextualizer: " + for_context + " as " + locale_string);
          this.contextualizer.updateContextualization(for_context, locale_string);
          this.debug("added to contextualizer " + this.contextualizer.contextualize(for_context));
        }
      }
      this.debug("data", this.data);
    }
  },

  toJSON: {
    value: function(includeEvenEmptyAttributes, removeEmptyAttributes) {
      var json = {},
        aproperty,
        underscorelessProperty;

      if (ContextualizableObject.updateAllToContextualizableObjects && this.originalString) {
        return this.originalString;
      }

      for (aproperty in this) {
        if (this.hasOwnProperty(aproperty) && typeof this[aproperty] !== "function" && aproperty !== "contextualizer" && aproperty.indexOf("_") === 0) {
          underscorelessProperty = aproperty.replace(/^_/, "");
          if (!removeEmptyAttributes || (removeEmptyAttributes && !this.isEmpty(aproperty))) {
            if (this[aproperty] && typeof this[aproperty].toJSON === "function") {
              json[underscorelessProperty] = this[aproperty].toJSON(includeEvenEmptyAttributes, removeEmptyAttributes);
            } else {
              json[underscorelessProperty] = this[aproperty];
            }
          }
        }
      }

      /* if the caller requests a complete object include the default for all defauls by calling get on them */
      if (includeEvenEmptyAttributes && this.INTERNAL_MODELS) {
        for (aproperty in this.INTERNAL_MODELS) {
          if (!json[aproperty] && this.INTERNAL_MODELS) {
            if (this.INTERNAL_MODELS[aproperty] && typeof this.INTERNAL_MODELS[aproperty] === "function" && typeof new this.INTERNAL_MODELS[aproperty]().toJSON === "function") {
              json[aproperty] = new this.INTERNAL_MODELS[aproperty]().toJSON(includeEvenEmptyAttributes, removeEmptyAttributes);
            } else {
              json[aproperty] = this.INTERNAL_MODELS[aproperty];
            }
          }
        }
      }
      // Preseve the original string in this mini-contextualizer if it was originally a string
      if (json.default && this.originalString) {
        json[json.default] = this.originalString;
        delete json.originalString;
      }

      return json;
    }
  }


});
exports.ContextualizableObject = ContextualizableObject;
