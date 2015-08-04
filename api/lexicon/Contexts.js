var Collection = require("./../Collection").Collection;
var FieldDBObject = require("./../FieldDBObject").FieldDBObject;


var Context = function Context(options) {
  if (!this.fieldDBtype) {
    this.fieldDBtype = "Context";
  }
  if (typeof options === "string") {
    this.morphemes = options;
  } else {
    for (var member in options) {
      if (!options.hasOwnProperty(member)) {
        continue;
      }
      this[member] = options[member];
    }
  }
  Object.apply(this, arguments);
};

Context.prototype = Object.create(Object.prototype, /** @lends Context.prototype */ {
  constructor: {
    value: Context
  },

  id: {
    get: function() {
      var id = this._id || this.URL || this.context || this.morphemes || this.utterance || this.orthography;
      console.log("  id of context: " + id);
      return id;
    },
    set: function(value) {
      this._id = value;
    }
  },

  merge: {
    value: function(callOnSelf, anotherObject, optionalOverwriteOrAsk) {
      var anObject,
        resultObject,
        aproperty,
        targetPropertyIsEmpty,
        overwrite,
        localCallOnSelf,
        propertyList = {},
        json;

      if (arguments.length === 0) {
        this.warn("Invalid call to merge, there was no object provided to merge");
        return null;
      }

      if (!anotherObject && !optionalOverwriteOrAsk) {
        resultObject = anObject = this;
        anotherObject = FieldDBObject.convertDocIntoItsType(callOnSelf);
      } else if (callOnSelf === "self") {
        console.log("Merging properties into myself. ");
        anObject = this;
        resultObject = anObject;
      } else if (callOnSelf && anotherObject) {
        anObject = callOnSelf;
        resultObject = this;
      } else {
        this.warn("Invalid call to merge, invalid arguments were provided to merge", arguments);
        return null;
      }
      console.log("Merging contexts", anObject, anotherObject, "into", resultObject);

      for (aproperty in anObject) {
        if (!anObject.hasOwnProperty(aproperty) ||
          typeof anObject[aproperty] === "function") {
          continue;
        }
        console.log("merging " + aproperty);
        if (typeof anObject[aproperty] === "number") {
          resultObject[aproperty] = anObject[aproperty] + anotherObject[aproperty];
        }
      }
      return resultObject;
    }
  },

  isEmpty: {
    value: function() {
      return FieldDBObject.prototype.isEmpty.apply(this, arguments);
    }
  },

  toJSON: {
    value: function(includeEvenEmptyAttributes, removeEmptyAttributes, attributesToIgnore) {
      var json = FieldDBObject.prototype.toJSON.apply(this, [false, true, ["fieldDBtype", "dateCreated"]]);
      json.URL = json.URL || "";
      json._id = json._id || json.id;
      if (json._id === json.URL || json._id === json.context || json._id === json.morphemes || json._id === json.utterance || json._id === json.orthography) {
        delete json._id;
        delete json.id;
      }
      return json;
    }
  }
});


/**
 * @class The Contexts is a type of Collection with any additional fields or
 * metadata that a team might use to visually ground their data.
 *
 * @name  Contexts
 * @extends Collection
 * @constructs
 */
var Contexts = function Contexts(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "Contexts";
  }
  this.debug("Constructing Contexts length: ", options);
  Collection.apply(this, arguments);
};

Contexts.prototype = Object.create(Collection.prototype, /** @lends Contexts.prototype */ {
  constructor: {
    value: Contexts
  },

  api: {
    value: "contexts"
  },

  primaryKey: {
    value: "id"
  },

  INTERNAL_MODELS: {
    value: {
      item: Context
    }
  },

  // primaryKey: {
  //   get: function() {
  //     console.log(" getting primaryKey " + this._primaryKey);

  //     return this._primaryKey || "URL";
  //   },
  //   set: function(value) {
  //     console.log(" setting primaryKey " + value);
  //     this._primaryKey = value;
  //   }
  // },

  length: {
    get: function() {
      var sum = 0;
      if (this._collection && typeof this._collection.map === "function") {
        this._collection.map(function(context) {
          if (context.count) {
            sum += context.count;
          } else {
            sum += 1;
          }
        });
      }
      this.debug(" getting number of context lengths of " + this.id + " " + sum);
      return sum;
    },
    set: function(value) {
      this.debug(" cant set length of " + this.id + " " + value);
      // this._length = value;
    }
  },

  // length: {
  //   get: function() {
  //     if (this.collection) {
  //       return this.collection.length;
  //     } else {
  //       return 0;
  //     }
  //   }
  // },

  set: {
    value: function(searchingFor, originalValue, optionalKeyToIdentifyItem, optionalInverted) {
      if (!originalValue) {
        return;
      }
      if (typeof originalValue === "string") {
        var context = {
          URL: "",
          context: originalValue
        };
      }
      console.log("context count before" + originalValue.count);
      // this.debugMode = true;
      var matches = this.find(originalValue);
      console.log("matching contexts ", matches);
      var value;
      if (matches && matches.length) {
        value = matches[0];
        value.merge("self", originalValue);
      } else {
        value = Collection.prototype.set.apply(this, [searchingFor, originalValue, optionalKeyToIdentifyItem, optionalInverted]);
      }
      return value;
    }
  }

});

exports.Context = Context;
exports.Contexts = Contexts;
exports.Contexts.Context = Contexts.Context;
