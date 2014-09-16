/* globals window */
var CORS = require("./CORS").CORS;
var Diacritics = require('diacritic');
var Q = require("q");

// var FieldDBDate = function FieldDBDate(options) {
//   // this.debug("In FieldDBDate ", options);
//   Object.apply(this, arguments);
//   if (options) {
//     this.timestamp = options;
//   }
// };

// FieldDBDate.prototype = Object.create(Object.prototype, /** @lends FieldDBDate.prototype */ {
//   constructor: {
//     value: FieldDBDate
//   },

//   timestamp: {
//     get: function() {
//       return this._timestamp || 0;
//     },
//     set: function(value) {
//       if (value === this._timestamp) {
//         return;
//       }
//       if (!value) {
//         delete this._timestamp;
//         return;
//       }
//       if (value.replace) {
//         try {
//           value = value.replace(/["\\]/g, '');
//           value = new Date(value);
//           /* Use date modified as a timestamp if it isnt one already */
//           value = value.getTime();
//         } catch (e) {
//           this.warn("Upgraded timestamp" + value);
//         }
//       }
//       this._timestamp = value;
//     }
//   },

//   toJSON: {
//     value: function(includeEvenEmptyAttributes, removeEmptyAttributes) {
//       var result = this._timestamp;

//       if (includeEvenEmptyAttributes) {
//         result = this._timestamp || 0;
//       }

//       if (removeEmptyAttributes && !this._timestamp) {
//         result = 0;
//       }
//       return result;
//     }
//   }
// });

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
  this.verbose("In parent an json", json);
  // Set the confidential first, so the rest of the fields can be encrypted
  if (json && json.confidential && this.INTERNAL_MODELS['confidential']) {
    this.confidential = new this.INTERNAL_MODELS['confidential'](json.confidential);
  }
  var simpleModels = [];
  for (var member in json) {
    if (!json.hasOwnProperty(member)) {
      continue;
    }
    this.debug("JSON: " + member, this.INTERNAL_MODELS);
    if (json[member] && this.INTERNAL_MODELS && this.INTERNAL_MODELS[member] && typeof this.INTERNAL_MODELS[member] === "function" && json[member].constructor !== this.INTERNAL_MODELS[member]) {
      this.debug("Parsing model: " + member);
      json[member] = new this.INTERNAL_MODELS[member](json[member]);
    } else {
      simpleModels.push(member);
    }
    this[member] = json[member];
  }
  if (simpleModels.length > 0) {
    this.debug("simpleModels", simpleModels.join(", "));
  }
  Object.apply(this, arguments);
  if (!this.id) {
    this.dateCreated = Date.now();
  }
};

FieldDBObject.DEFAULT_STRING = "";
FieldDBObject.DEFAULT_OBJECT = {};
FieldDBObject.DEFAULT_ARRAY = [];
FieldDBObject.DEFAULT_COLLECTION = [];
FieldDBObject.DEFAULT_VERSION = "v2.0.1";
FieldDBObject.DEFAULT_DATE = 0;


/**
 * The uuid generator uses a "GUID" like generation to create a unique string.
 *
 * @returns {String} a string which is likely unique, in the format of a
 *          Globally Unique ID (GUID)
 */
FieldDBObject.uuidGenerator = function() {
  var S4 = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return Date.now() + (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
};

/** @lends FieldDBObject.prototype */
FieldDBObject.prototype = Object.create(Object.prototype, {
  constructor: {
    value: FieldDBObject
  },

  type: {
    get: function() {
      var funcNameRegex = /function (.{1,})\(/;
      var results = (funcNameRegex).exec((this).constructor.toString());
      return (results && results.length > 1) ? results[1] : "";
    },
    set: function(value) {
      if (value !== this.type) {
        this.warn('Using type ' + this.type + ' when the incoming object was ' + value);
      }
    }
  },

  /**
   * Can be set to true to debug all objects, or false to debug no objects and true only on the instances of objects which
   * you want to debug.
   *
   * @type {Boolean}
   */
  debugMode: {
    get: function() {
      if (this.perObjectDebugMode === undefined) {
        return false;
      } else {
        return this.perObjectDebugMode;
      }
    },
    set: function(value) {
      if (value === this.perObjectDebugMode) {
        return;
      }
      if (value === null || value === undefined) {
        delete this.perObjectDebugMode;
        return;
      }
      this.perObjectDebugMode = value;
    }
  },
  debug: {
    value: function(message, message2, message3, message4) {
      try {
        if (window.navigator && window.navigator.appName === 'Microsoft Internet Explorer') {
          return;
        }
      } catch (e) {
        //do nothing, we are in node or some non-friendly browser.
      }
      if (this.debugMode) {
        console.log(this.type.toUpperCase() + ' DEBUG: ' + message);

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
  },
  verboseMode: {
    get: function() {
      if (this.perObjectVerboseMode === undefined) {
        return false;
      } else {
        return this.perObjectVerboseMode;
      }
    },
    set: function(value) {
      if (value === this.perObjectVerboseMode) {
        return;
      }
      if (value === null || value === undefined) {
        delete this.perObjectVerboseMode;
        return;
      }
      this.perObjectVerboseMode = value;
    }
  },
  verbose: {
    value: function(message, message2, message3, message4) {
      if (this.verboseMode) {
        this.debug(message, message2, message3, message4);
      }
    }
  },
  bug: {
    value: function(message) {
      if (this.bugMessage) {
        this.bugMessage += ";;; ";
      } else {
        this.bugMessage = "";
      }
      this.bugMessage = this.bugMessage + message;
      try {
        window.alert(message);
      } catch (e) {
        console.warn(this.type.toUpperCase() + ' BUG: ' + message);
      }
    }
  },
  confirm: {
    value: function(message) {
      if (this.confirmMessage) {
        this.confirmMessage += "\n";
      } else {
        this.confirmMessage = "";
      }
      this.confirmMessage = this.confirmMessage + message;
      try {
        return window.confirm(message);
      } catch (e) {
        console.warn(this.type.toUpperCase() + ' ASKING USER: ' + message + ' pretending they said no.');
        return false;
      }
    }
  },
  warn: {
    value: function(message, message2, message3, message4) {
      if (this.warnMessage) {
        this.warnMessage += ";;; ";
      } else {
        this.warnMessage = "";
      }
      this.warnMessage = this.warnMessage + message;
      console.warn(this.type.toUpperCase() + ' WARN: ' + message);
      if (message2) {
        console.warn(message2);
      }
      if (message3) {
        console.warn(message3);
      }
      if (message4) {
        console.warn(message4);
      }
    }
  },
  todo: {
    value: function(message, message2, message3, message4) {
      console.warn(this.type.toUpperCase() + ' TODO: ' + message);
      if (message2) {
        console.warn(message2);
      }
      if (message3) {
        console.warn(message3);
      }
      if (message4) {
        console.warn(message4);
      }
    }
  },

  save: {
    value: function() {
      var deferred = Q.defer(),
        self = this;

      if (this.fetching) {
        self.warn("Fetching is in process, can't save right now...");
        return;
      }
      if (this.saving) {
        self.warn("Save was already in process...");
        return;
      }
      this.saving = true;

      //update to this version
      this.version = FieldDBObject.DEFAULT_VERSION;

      var browserVersion;
      try {
        browserVersion = window.navigator.appVersion;
      } catch (e) {
        browserVersion = 'PhantomJS unknown';
      }

      this._dateModified = Date.now();
      if (!this.id) {
        this._dateCreated = Date.now();
        this.enteredByUser = {
          browserVersion: browserVersion
        };
      } else {
        this.modifiedByUsers = this.modifiedByUsers || [];
        this.modifiedByUsers.push({
          browserVersion: browserVersion
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
          self.debug("saved ", result);
          self.saving = false;
          if (result.id) {
            self.id = result.id;
            self.rev = result.rev;
            deferred.resolve(self);
          } else {
            deferred.reject(result);
          }
        },
        function(reason) {
          self.debug(reason);
          self.saving = false;
          deferred.reject(reason);
        })
        .catch(function(reason) {
          self.debug(reason);
          self.saving = false;
          deferred.reject(reason);
        });

      return deferred.promise;
    }
  },

  saveToGit: {
    value: function(commit) {
      var deferred = Q.defer(),
        self = this;
      Q.nextTick(function() {
        self.todo("If in nodejs, write to file and do a git commit with optional user's email who modified the file and push ot a branch with that user's username");
        deferred.resolve(self);
      });
      return deferred.promise;
    }
  },

  equals: {
    value: function(anotherObject) {
      for (var aproperty in this) {
        if (!this.hasOwnProperty(aproperty)) {
          continue;
        }
        if (typeof this[aproperty].equals === "function") {
          if (!this[aproperty].equals(anotherObject[aproperty])) {
            this.debug("  " + aproperty + ": ", this[aproperty], " not equal ", anotherObject[aproperty]);
            return false;
          }
        } else if (this[aproperty] === anotherObject[aproperty]) {
          this.debug(aproperty + ": " + this[aproperty] + " equals " + anotherObject[aproperty]);
          // return true;
        } else if (anotherObject[aproperty] === undefined) {
          this.debug(aproperty + ": " + this[aproperty] + " not equal " + anotherObject[aproperty]);
          return false;
        } else {
          if (aproperty !== "_dateCreated" && aproperty !== "perObjectDebugMode") {
            this.debug(aproperty + ": ", this[aproperty], " not equal ", anotherObject[aproperty]);
            return false;
          }
        }
      }
      if (typeof anotherObject.equals === "function") {
        if (this.dontRecurse === undefined) {
          this.dontRecurse = true;
          anotherObject.dontRecurse = true;
          if (!anotherObject.equals(this)) {
            return false;
          }
        }
      }
      delete this.dontRecurse;
      delete anotherObject.dontRecurse;
      return true;
    }
  },

  merge: {
    value: function(callOnSelf, anotherObject, optionalOverwriteOrAsk) {
      var anObject,
        resultObject,
        aproperty,
        targetPropertyIsEmpty,
        overwrite,
        localCallOnSelf;

      if (callOnSelf === "self") {
        this.debug("Merging properties into myself. ");
        anObject = this;
      } else {
        anObject = callOnSelf;
      }
      resultObject = this;
      if (!optionalOverwriteOrAsk) {
        optionalOverwriteOrAsk = "";
      }

      if (anObject.id && anotherObject.id && anObject.id !== anotherObject.id) {
        this.warn("Refusing to merge these objects, they have different ids: " + anObject.id + "  and " + anotherObject.id, anObject, anotherObject);
        return null;
      }
      if (anObject.dbname && anotherObject.dbname && anObject.dbname !== anotherObject.dbname) {
        if (optionalOverwriteOrAsk.indexOf("keepDBname") > -1) {
          this.warn("Permitting a merge of objects from different databases: " + anObject.dbname + "  and " + anotherObject.dbname);
          this.debug("Merging ", anObject, anotherObject);
        } else if (optionalOverwriteOrAsk.indexOf("changeDBname") === -1) {
          this.warn("Refusing to merge these objects, they come from different databases: " + anObject.dbname + "  and " + anotherObject.dbname, anObject, anotherObject);
          return null;
        }
      }
      for (aproperty in anotherObject) {
        if (!anotherObject.hasOwnProperty(aproperty)) {
          continue;
        }

        if (anotherObject[aproperty] === undefined) {
          // no op, the new one isn't set
          this.debug(aproperty + " was missing in new object");
          resultObject[aproperty] = anObject[aproperty];
        } else if (anObject[aproperty] === anotherObject[aproperty]) {
          // no op, they are equal enough
          this.debug(aproperty + " were equal.");
          resultObject[aproperty] = anObject[aproperty];
        } else if (!anObject[aproperty] || anObject[aproperty] === [] || anObject[aproperty].length === 0 || anObject[aproperty] === {}) {
          targetPropertyIsEmpty = true;
          this.debug(aproperty + " was previously empty, taking the new value");
          resultObject[aproperty] = anotherObject[aproperty];
        } else {
          //  if two arrays: concat
          if (Object.prototype.toString.call(anObject[aproperty]) === '[object Array]' && Object.prototype.toString.call(anotherObject[aproperty]) === '[object Array]') {
            this.debug(aproperty + " was an array, concatinating with the new value", anObject[aproperty], " ->", anotherObject[aproperty]);
            resultObject[aproperty] = anObject[aproperty].concat(anotherObject[aproperty]);

            //TODO unique it?
            this.debug("  ", resultObject[aproperty]);
          } else {
            // if the result is missing the property, clone it from anObject
            if (!resultObject[aproperty] && typeof anObject[aproperty].constructor === "function") {
              var json = anObject[aproperty].toJSON ? anObject[aproperty].toJSON() : anObject[aproperty];
              resultObject[aproperty] = new anObject[aproperty].constructor(json);
            }
            // if two objects: recursively merge
            if (resultObject[aproperty] && typeof resultObject[aproperty].merge === "function") {
              if (callOnSelf === "self") {
                localCallOnSelf = callOnSelf;
              } else {
                localCallOnSelf = anObject[aproperty];
              }
              this.debug("Requesting merge of internal property " + aproperty + " using method: " + localCallOnSelf);
              var result = resultObject[aproperty].merge(localCallOnSelf, anotherObject[aproperty], optionalOverwriteOrAsk);
              this.debug("after internal merge ", result);
              this.debug("after internal merge ", resultObject[aproperty]);
            } else {
              overwrite = optionalOverwriteOrAsk;
              this.debug("Requested with " + optionalOverwriteOrAsk + " " + optionalOverwriteOrAsk.indexOf("overwrite"));
              if (optionalOverwriteOrAsk.indexOf("overwrite") === -1) {
                overwrite = this.confirm("I found a conflict for " + aproperty + ", Do you want to overwrite it from " + JSON.stringify(anObject[aproperty]) + " -> " + JSON.stringify(anotherObject[aproperty]));
              }
              if (overwrite) {
                if (aproperty === "_dbname" && optionalOverwriteOrAsk.indexOf("keepDBname") > -1) {
                  // resultObject._dbname = this.dbname;
                  this.warn(" Keeping _dbname of " + resultObject.dbname);
                } else {
                  this.warn("Overwriting contents of " + aproperty + " (this may cause disconnection in listeners)");
                  this.debug("Overwriting  ", anObject[aproperty], " ->", anotherObject[aproperty]);

                  resultObject[aproperty] = anotherObject[aproperty];
                }
              } else {
                resultObject[aproperty] = anObject[aproperty];
              }
            }
          }
        }
      }

      // for (aproperty in anObject) {
      //   if (!anObject.hasOwnProperty(aproperty)) {
      //     continue;
      //   }
      //   this.debug("todo merge this property " + aproperty + " backwards too");
      // }

      return resultObject;
    }
  },

  fetch: {
    value: function(optionalBaseUrl) {
      var deferred = Q.defer(),
        id,
        self = this;

      id = this.id;
      if (!id) {
        Q.nextTick(function() {
          deferred.reject({
            error: "Cannot fetch if there is no id"
          });
        });
        return deferred.promise;
      }

      this.fetching = true;
      CORS.makeCORSRequest({
        type: 'GET',
        dataType: "json",
        url: optionalBaseUrl + "/" + self.dbname + "/" + id
      }).then(function(result) {
          self.fetching = false;
          self.merge("self", result, "overwrite");
          deferred.resolve(self);
        },
        function(reason) {
          self.fetching = false;
          self.debug(reason);
          deferred.reject(reason);
        });

      return deferred.promise;
    }
  },

  INTERNAL_MODELS: {
    value: {
      _id: FieldDBObject.DEFAULT_STRING,
      _rev: FieldDBObject.DEFAULT_STRING,
      dbname: FieldDBObject.DEFAULT_STRING,
      version: FieldDBObject.DEFAULT_STRING,
      dateCreated: FieldDBObject.DEFAULT_DATE,
      dateModified: FieldDBObject.DEFAULT_DATE,
      comments: FieldDBObject.DEFAULT_COLLECTION
    }
  },

  application: {
    get: function() {
      return FieldDBObject.application;
    },
    set: function(value) {
      // FieldDBObject.application = value;
    }
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
      if (value.trim) {
        value = value.trim();
      }
      // var originalValue = value + "";
      // value = this.sanitizeStringForPrimaryKey(value); /*TODO dont do this on all objects */
      // if (value === null) {
      //   this.bug('Invalid id, not using ' + originalValue + ' id remains as ' + this._id);
      //   return;
      // }
      this._id = value;
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
      if (value.trim) {
        value = value.trim();
      }
      this._rev = value;
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
      if (this._dbname) {
        throw "This is the " + this._dbname + ". You cannot change the dbname of a corpus, you must create a new object first.";
      }
      if (!value) {
        delete this._dbname;
        return;
      }
      if (value.trim) {
        value = value.trim();
      }
      this._dbname = value;
    }
  },

  pouchname: {
    get: function() {
      this.warn("pouchname is deprecated, use dbname instead.");
      return this.dbname;
    },
    set: function(value) {
      this.warn("Pouchname is deprecated, please use dbname instead.");
      this.dbname = value;
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
      if (value.trim) {
        value = value.trim();
      }
      this._version = value;
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
          this.warn("Upgraded dateCreated" + value);
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
          this.warn("Upgraded dateModified" + value);
        }
      }
      this._dateModified = value;
    }
  },

  comments: {
    get: function() {
      return this._comments || FieldDBObject.DEFAULT_COLLECTION;
    },
    set: function(value) {
      if (value === this._comments) {
        return;
      }
      if (!value) {
        delete this._comments;
        return;
      } else {
        if (typeof this.INTERNAL_MODELS['comments'] === "function" && Object.prototype.toString.call(value) === '[object Array]') {
          value = new this.INTERNAL_MODELS['comments'](value);
        }
      }
      this._comments = value;
    }
  },

  isEmpty: {
    value: function(aproperty) {
      var empty = !this[aproperty] || this[aproperty] === FieldDBObject.DEFAULT_COLLECTION || this[aproperty] === FieldDBObject.DEFAULT_ARRAY || this[aproperty] === FieldDBObject.DEFAULT_OBJECT || this[aproperty] === FieldDBObject.DEFAULT_STRING || this[aproperty] === FieldDBObject.DEFAULT_DATE || (this[aproperty].length !== undefined && this[aproperty].length === 0) || this[aproperty] === {};
      /* TODO also return empty if it matches a default of any version of the model? */
      return empty;
    }
  },

  toJSON: {
    value: function(includeEvenEmptyAttributes, removeEmptyAttributes) {
      var json = {
          type: this.type
        },
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
      if (includeEvenEmptyAttributes) {
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

      if (!json._id) {
        delete json._id;
      }
      if (!json._rev) {
        delete json._rev;
      }
      if (json.dbname) {
        json.pouchname = json.dbname;
        this.todo("Serializing pouchname for backward compatability until prototype can handle dbname");
      }

      delete json.saving;
      delete json.decryptedMode;
      delete json.bugMessage;
      delete json.warnMessage;
      if (this._collection !== "private_corpuses") {
        delete json.confidential;
        delete json.confidentialEncrypter;
      } else {
        this.warn("serializing confidential in this object " + this._collection);
      }
      if (this.api) {
        json.api = this.api;
      }

      return json;
    }
  },


  /**
   * Creates a deep copy of the object (not a reference)
   * @return {Object} a near-clone of the objcet
   */
  clone: {
    value: function(includeEvenEmptyAttributes) {
      if (includeEvenEmptyAttributes) {
        this.warn(includeEvenEmptyAttributes + " TODO includeEvenEmptyAttributes is not used ");
      }
      var json = JSON.parse(JSON.stringify(this.toJSON()));

      var relatedData;
      if (json.datumFields && json.datumFields.relatedData) {
        relatedData = json.datumFields.relatedData.json.relatedData || [];
      } else if (json.relatedData) {
        relatedData = json.relatedData;
      } else {
        json.relatedData = relatedData = [];
      }
      var source = json._id;
      if (json._rev) {
        source = source + "?rev=" + json._rev;
      }
      relatedData.push({
        URI: source,
        relation: "clonedFrom"
      });

      /* Clear the current object's info which we shouldnt clone */
      delete json._id;
      delete json._rev;

      return json;
    }
  },

  /**
   *  Cleans a value to become a primary key on an object (replaces punctuation and symbols with underscore)
   *  formerly: item.replace(/[-\"'+=?.*&^%,\/\[\]{}() ]/g, "")
   *
   * @param  String value the potential primary key to be cleaned
   * @return String       the value cleaned and safe as a primary key
   */
  sanitizeStringForFileSystem: {
    value: function(value, optionalReplacementCharacter) {
      this.debug('sanitizeStringForPrimaryKey ' + value);
      if (!value) {
        return null;
      }
      if (optionalReplacementCharacter === undefined || optionalReplacementCharacter === "-") {
        optionalReplacementCharacter = '_';
      }
      if (value.trim) {
        value = Diacritics.clean(value);
        this.debug('sanitizeStringForPrimaryKey ' + value);

        value = value.trim().replace(/[^-a-zA-Z0-9]+/g, optionalReplacementCharacter).replace(/^_/, '').replace(/_$/, '');
        this.debug('sanitizeStringForPrimaryKey ' + value);
        return value;
      } else if (typeof value === 'number') {
        return parseInt(value, 10);
      } else {
        return null;
      }
    }
  },

  sanitizeStringForPrimaryKey: {
    value: function(value, optionalReplacementCharacter) {
      this.debug('sanitizeStringForPrimaryKey ' + value);
      if (!value) {
        return null;
      }
      if (value.replace) {
        value = value.replace(/-/g, "_");
      }
      value = this.sanitizeStringForFileSystem(value, optionalReplacementCharacter);
      if (value && typeof value !== 'number') {
        return this.camelCased(value);
      }
    }
  },

  camelCased: {
    value: function(value) {
      if (!value) {
        return null;
      }
      if (value.replace) {
        value = value.replace(/_([a-zA-Z])/g, function(word) {
          return word[1].toUpperCase();
        });
        value = value[0].toLowerCase() + value.substring(1, value.length);
      }
      return value;
    }
  }

});

exports.FieldDBObject = FieldDBObject;
