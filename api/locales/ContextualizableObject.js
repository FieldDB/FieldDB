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
  // console.log("Constructing ContextualizableObject ", json);

  for (var member in json) {
    if (!json.hasOwnProperty(member)) {
      continue;
    }
    if (member === "contextualizer") {
      this.contextualizer = json.contextualizer;
      continue;
    }
    this.add(member, json[member]);
  }

  Object.apply(this, arguments);
};

ContextualizableObject.prototype = Object.create(Object.prototype, /** @lends ContextualizableObject.prototype */ {
  constructor: {
    value: ContextualizableObject
  },

  contextualize: {
    value: function(locale_string) {
      // console.log("requesting contextualization of " + locale_string);
      var contextualizedString = this.contextualizer.contextualize(locale_string);
      // console.log("::" + contextualizedString + "::");
      return contextualizedString;
    }
  },

  updateContextualization: {
    value: function(for_context, locale_string) {
      // console.log('updateContextualization' + for_context);
      return this.contextualizer.updateContextualization(for_context, locale_string);
    }
  },

  add: {
    value: function(for_context, locale_string) {
      var underscoreNotation = "_" + for_context;
      this[underscoreNotation] = locale_string;
      this.__defineGetter__(for_context, function() {
        // console.log("overidding getter");
        return this.contextualize(this[underscoreNotation]);
      });
      this.__defineSetter__(for_context, function(value) {
        // console.log("overidding setter "+ underscoreNotation, value);
        this.updateContextualization(this[underscoreNotation], value);
      });
    }
  },

  toJSON: {
    value: function(includeEvenEmptyAttributes, removeEmptyAttributes) {
      var json = {},
        aproperty,
        underscorelessProperty;

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
      return json;
    }
  }


});
exports.ContextualizableObject = ContextualizableObject;
