/* globals alert, confirm, navigator, Android, FieldDB */
var Diacritics = require("diacritic");
var Q = require("q");
var package;
try {
  package = require("./../package.json");
} catch (e) {
  console.log("failed to load package.json", e);
  package = {
    version: "2.2.0"
  };
}
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
//           value = value.replace(/["\\]/g, "");
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
  if (!this._fieldDBtype) {
    this._fieldDBtype = "FieldDBObject";
  }
  if (json && json.id) {
    this.useIdNotUnderscore = true;
  }
  this.verbose("In parent an json", json);
  // Set the confidential first, so the rest of the fields can be encrypted
  if (json && json.confidential && this.INTERNAL_MODELS["confidential"]) {
    this.confidential = new this.INTERNAL_MODELS["confidential"](json.confidential);
  }
  if (this.INTERNAL_MODELS) {
    this.debug("parsing with ", this.INTERNAL_MODELS);
  }
  var simpleModels = [];
  for (var member in json) {
    if (!json.hasOwnProperty(member)) {
      continue;
    }
    this.debug("JSON: " + member);
    if (json[member] &&
      this.INTERNAL_MODELS &&
      this.INTERNAL_MODELS[member] &&
      typeof this.INTERNAL_MODELS[member] === "function" &&
      !(json[member] instanceof this.INTERNAL_MODELS[member]) &&
      !(this.INTERNAL_MODELS[member].compatibleWithSimpleStrings && typeof json[member] === "string")) {

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
  // if (!this._rev) {
  if (!this.id && !this._dateCreated) {
    this.dateCreated = Date.now();
  }

};
FieldDBObject.internalAttributesToNotJSONify = [
  "temp",
  "saving",
  "fetching",
  "loaded",
  "loading",
  "unsaved",
  "_unsaved",
  "selected",
  "useIdNotUnderscore",
  "decryptedMode",
  "bugMessage",
  "warnMessage",
  "perObjectDebugMode",
  "perObjectAlwaysConfirmOkay",
  "application",
  "corpus",
  "_corpus",
  "db",
  "_db",
  "contextualizer",
  "perObjectDebugMode",
  "whenReady",
  "useIdNotUnderscore",
  "parent",
  "confirmMessage",
  "bugMessage",
  "fossil",
  "$$hashKey"
];

FieldDBObject.internalAttributesToAutoMerge = FieldDBObject.internalAttributesToNotJSONify.concat([
  "dateCreated",
  "_dateCreated",
  "_fieldDBtype",
  "version",
  "_version",
  "modifiedByUser",
  "_dateModified",
  "_fieldDBtype",
  "dateModified"
]);

FieldDBObject.software = {};
FieldDBObject.hardware = {};

FieldDBObject.DEFAULT_STRING = "";
FieldDBObject.DEFAULT_OBJECT = {};
FieldDBObject.DEFAULT_ARRAY = [];
FieldDBObject.DEFAULT_COLLECTION = [];
FieldDBObject.DEFAULT_VERSION = "v" + package.version;
FieldDBObject.DEFAULT_DATE = 0;

FieldDBObject.render = function(options) {
  this.debug("Rendering, but the render was not injected for this " + this.fieldDBtype, options);
};

FieldDBObject.verbose = function(message, message2, message3, message4) {
  try {
    if (navigator && navigator.appName === "Microsoft Internet Explorer") {
      return;
    }
  } catch (e) {
    //do nothing, we are in node or some non-friendly browser.
  }
  if (this.verboseMode) {
    var type = this.fieldDBtype || this._id || "UNKNOWNTYPE";
    console.log(type.toUpperCase() + " VERBOSE: " + message);

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
};
FieldDBObject.debugMode = false;
FieldDBObject.debug = function(message, message2, message3, message4) {
  try {
    if (navigator && navigator.appName === "Microsoft Internet Explorer") {
      return;
    }
  } catch (e) {
    //do nothing, we are in node or some non-friendly browser.
  }
  if (this.debugMode) {
    var type = this.fieldDBtype || this._id || "UNKNOWNTYPE";
    console.log(type.toUpperCase() + " DEBUG: " + message);

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
};

FieldDBObject.todo = function(message, message2, message3, message4) {
  var type = this.fieldDBtype || this._id || "UNKNOWNTYPE";
  console.warn(type.toUpperCase() + " TODO: " + message);
  if (message2) {
    console.warn(message2);
  }
  if (message3) {
    console.warn(message3);
  }
  if (message4) {
    console.warn(message4);
  }
};

FieldDBObject.bug = function(message) {
  try {
    alert(message);
  } catch (e) {
    this.warn(" Couldn't tell user about a bug: " + message);
    // console.log("Alert is not defined, this is strange.");
  }
  var type = this.fieldDBtype || this._id || "UNKNOWNTYPE";
  //outputing a stack trace
  console.error(type.toUpperCase() + " BUG: " + message);
};

FieldDBObject.warn = function(message, message2, message3, message4) {
  var type = this.fieldDBtype || this._id || "UNKNOWNTYPE";
  // putting out a stacktrace
  console.error(type.toUpperCase() + " WARN: " + message);
  if (message2) {
    console.warn(message2);
  }
  if (message3) {
    console.warn(message3);
  }
  if (message4) {
    console.warn(message4);
  }
};

FieldDBObject.confirm = function(message, optionalLocale) {
  var deferred = Q.defer(),
    self = this;

  Q.nextTick(function() {
    var response;

    if (self.alwaysConfirmOkay) {
      console.warn(self.fieldDBtype.toUpperCase() + " NOT ASKING USER: " + message + " \nThe code decided that they would probably yes and it wasnt worth asking.");
      response = self.alwaysConfirmOkay;
    }

    try {
      response = confirm(message);
    } catch (e) {
      console.warn(self.fieldDBtype.toUpperCase() + " ASKING USER: " + message + " pretending they said " + self.alwaysConfirmOkay);
      response = self.alwaysConfirmOkay;
    }

    if (response) {
      deferred.resolve({
        message: message,
        optionalLocale: optionalLocale,
        response: response
      });
    } else {
      deferred.reject({
        message: message,
        optionalLocale: optionalLocale,
        response: response
      });
    }

  });
  return deferred.promise;
};
/* set the application if you want global state (ie for checking if a user is authorized) */
// FieldDBObject.application = {}

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
FieldDBObject.getHumanReadableTimestamp = function() {
  var today = new Date();
  var year = today.getFullYear();
  var month = today.getMonth() + 1;
  var day = today.getDate();
  var hour = today.getHours();
  var minute = today.getMinutes();

  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (minute < 10) {
    minute = "0" + minute;
  }

  return year + "-" + month + "-" + day + "_" + hour + "." + minute;
};

FieldDBObject.guessType = function(doc) {
  if (!doc || JSON.stringify(doc) === {}) {
    return "FieldDBObject";
  }
  FieldDBObject.debug("Guessing type " + doc._id);
  var guessedType = doc.previousFieldDBtype || doc.jsonType || doc.collection || "FieldDBObject";
  if (doc.api && doc.api.length > 0) {
    FieldDBObject.debug("using api" + doc.api);
    guessedType = doc.api[0].toUpperCase() + doc.api.substring(1, doc.api.length);
  }
  guessedType = guessedType.replace(/s$/, "");
  guessedType = guessedType[0].toUpperCase() + guessedType.substring(1, guessedType.length);
  if (guessedType === "Datalist") {
    guessedType = "DataList";
  }
  if (guessedType === "FieldDBObject") {
    if (doc.session) {
      guessedType = "Datum";
    } else if (doc.datumFields && doc.sessionFields) {
      guessedType = "Corpus";
    } else if (doc.collection === "sessions" && doc.sessionFields) {
      guessedType = "Session";
    } else if (doc.text && doc.username && doc.timestamp && doc.gravatar) {
      guessedType = "Comment";
    }
  }

  FieldDBObject.debug("Guessed type " + doc._id + " is a " + guessedType);
  return guessedType;
};

FieldDBObject.convertDocIntoItsType = function(doc, clone) {
  // this.debugMode = true;
  var guessedType,
    typeofAnotherObjectsProperty = Object.prototype.toString.call(doc);

  if (clone) {
    // Return a clone of simple types, or a new clone of the json of this object
    if (typeofAnotherObjectsProperty === "[object String]") {
      return doc + "";
    } else if (typeofAnotherObjectsProperty === "[object Number]") {
      return doc + 0;
    } else if (typeofAnotherObjectsProperty === "[object Date]") {
      return new Date(doc);
    } else if (typeofAnotherObjectsProperty === "[object Array]") {
      return doc.concat([]);
    } else {
      doc = doc.toJSON ? doc.toJSON() : doc;
    }
  } else {
    // Return the doc if its a simple type
    if (typeofAnotherObjectsProperty === "[object String]") {
      return doc;
    } else if (typeofAnotherObjectsProperty === "[object Number]") {
      return doc;
    } else if (typeofAnotherObjectsProperty === "[object Date]") {
      return doc;
    } else if (typeofAnotherObjectsProperty === "[object Array]") {
      return doc;
    }
  }

  try {
    guessedType = doc.fieldDBtype;
    if (!guessedType || guessedType === "FieldDBObject") {
      FieldDBObject.debug(" requesting guess type ");
      guessedType = FieldDBObject.guessType(doc);
      FieldDBObject.debug("request complete");
    }
    FieldDBObject.debug("Converting doc into type " + guessedType);

    if (FieldDB && FieldDB[guessedType]) {
      if (doc instanceof FieldDB[guessedType]) {
        return doc;
      }
      doc = new FieldDB[guessedType](doc);
      // FieldDBObject.warn("Converting doc into guessed type " + guessedType);
    } else {
      if (doc instanceof FieldDBObject) {
        // wasnt able to make it what it should be, but it was at least some extension of FieldDBObject
        return doc;
      }
      doc = new FieldDBObject(doc);
      FieldDBObject.todo("This doc does not have a type than is known to the FieldDB system. It might display oddly ", doc);
    }
  } catch (e) {
    FieldDBObject.debug("Couldn't convert this doc to its type " + guessedType + ", it will be a base FieldDBObject: " + JSON.stringify(doc));
    FieldDBObject.debug(" error: ", e);
    var checkPreviousTypeWithoutS = doc.previousFieldDBtype ? doc.previousFieldDBtype.replace(/s$/, "") : "";
    if (guessedType !== "FieldDBObject" && guessedType !== checkPreviousTypeWithoutS) {
      doc.previousFieldDBtype = doc.previousFieldDBtype || "";
      doc.previousFieldDBtype = doc.previousFieldDBtype + guessedType;
    }
    if (doc instanceof FieldDBObject) {
      // wasnt able to make it what it should be, but it was at least some extension of FieldDBObject
      return doc;
    }
    doc = new FieldDBObject(doc);
  }
  return doc;
};


/** @lends FieldDBObject.prototype */
FieldDBObject.prototype = Object.create(Object.prototype, {
  constructor: {
    value: FieldDBObject
  },

  fieldDBtype: {
    configurable: true,
    get: function() {
      return this._fieldDBtype;
    },
    set: function(value) {
      if (value !== this.fieldDBtype) {
        this.debug("Using type " + this.fieldDBtype + " when the incoming object was " + value);
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
    value: function( /* message, message2, message3, message4 */ ) {
      if (this.debugMode) {
        FieldDBObject.debug.apply(this, arguments);
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
    value: function( /* message, message2, message3, message4 */ ) {
      if (this.verboseMode) {
        FieldDBObject.verbose.apply(this, arguments);
      }
    }
  },
  bug: {
    value: function(message) {
      if (this.bugMessage) {
        if (this.bugMessage.indexOf(message) > -1) {
          this.warn("Not repeating bug message: " + message);
          return;
        }
        this.bugMessage += ";;; ";
      } else {
        this.bugMessage = "";
      }

      this.bugMessage = this.bugMessage + message;
      FieldDBObject.bug.apply(this, arguments);
    }
  },
  alwaysConfirmOkay: {
    get: function() {
      if (this.perObjectAlwaysConfirmOkay === undefined) {
        return false;
      } else {
        return this.perObjectAlwaysConfirmOkay;
      }
    },
    set: function(value) {
      if (value === this.perObjectAlwaysConfirmOkay) {
        return;
      }
      if (value === null || value === undefined) {
        delete this.perObjectAlwaysConfirmOkay;
        return;
      }
      this.perObjectAlwaysConfirmOkay = value;
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

      return FieldDBObject.confirm.apply(this, arguments);
    }
  },
  warn: {
    value: function(message) {
      if (this.warnMessage) {
        this.warnMessage += ";;; ";
      } else {
        this.warnMessage = "";
      }
      this.warnMessage = this.warnMessage + message;
      FieldDBObject.warn.apply(this, arguments);
    }
  },

  todo: {
    value: function( /* message, message2, message3, message4 */ ) {
      FieldDBObject.todo.apply(this, arguments);
    }
  },

  render: {
    configurable: true,
    value: function(options) {
      this.debug("Calling render with options", options);
      FieldDBObject.render.apply(this, arguments);
    }
  },

  ensureSetViaAppropriateType: {
    value: function(propertyname, value, optionalInnerPropertyName) {
      if (!propertyname) {
        console.error("Invalid call to ensureSetViaAppropriateType", value);
        throw new Error("Invalid call to ensureSetViaAppropriateType");
      }

      optionalInnerPropertyName = optionalInnerPropertyName || "_" + propertyname;

      if (value === this[optionalInnerPropertyName]) {
        return this[optionalInnerPropertyName];
      }
      if (!value) {
        delete this[optionalInnerPropertyName];
        return;
      }

      if (this.INTERNAL_MODELS &&
        this.INTERNAL_MODELS[propertyname] &&
        typeof this.INTERNAL_MODELS[propertyname] === "function" &&
        !(value instanceof this.INTERNAL_MODELS[propertyname]) &&
        !(this.INTERNAL_MODELS[propertyname].compatibleWithSimpleStrings && typeof value === "string")) {

        this.debug("Converting this into its type.", value.constructor.toString());
        value = new this.INTERNAL_MODELS[propertyname](value);

      }

      // This trims all strings in the system...
      if (typeof value.trim === "function") {
        value = value.trim();
      }

      this[optionalInnerPropertyName] = value;
      return this[optionalInnerPropertyName];
    }
  },

  unsaved: {
    get: function() {
      return this._unsaved;
    },
    set: function(value) {
      this._unsaved = !!value;
    }
  },

  calculateUnsaved: {
    value: function() {
      if (!this.fossil) {
        this._unsaved = true;
        return;
      }

      var previous = new this.constructor(this.fossil);
      var current = new this.constructor(this.toJSON());

      current.debugMode = this.debugMode;
      if (previous.equals(current)) {
        this.warn("The " + this.id + " didnt actually change. Not marking as edited");
        this._unsaved = false;
      } else {
        this._unsaved = true;
      }
      return this._unsaved;
    }
  },

  createSaveSnapshot: {
    value: function(selfOrSnapshot, optionalUserWhoSaved) {
      var self = this;

      selfOrSnapshot = this;

      this.debug("    Running snapshot...");
      //update to selfOrSnapshot version
      selfOrSnapshot.version = FieldDBObject.DEFAULT_VERSION;

      try {
        FieldDBObject.software = FieldDBObject.software || {};
        FieldDBObject.software.appCodeName = navigator.appCodeName;
        FieldDBObject.software.appName = navigator.appName;
        FieldDBObject.software.appVersion = navigator.appVersion;
        FieldDBObject.software.cookieEnabled = navigator.cookieEnabled;
        FieldDBObject.software.doNotTrack = navigator.doNotTrack;
        FieldDBObject.software.hardwareConcurrency = navigator.hardwareConcurrency;
        FieldDBObject.software.language = navigator.language;
        FieldDBObject.software.languages = navigator.languages;
        FieldDBObject.software.maxTouchPoints = navigator.maxTouchPoints;
        FieldDBObject.software.onLine = navigator.onLine;
        FieldDBObject.software.platform = navigator.platform;
        FieldDBObject.software.product = navigator.product;
        FieldDBObject.software.productSub = navigator.productSub;
        FieldDBObject.software.userAgent = navigator.userAgent;
        FieldDBObject.software.vendor = navigator.vendor;
        FieldDBObject.software.vendorSub = navigator.vendorSub;
        if (navigator && navigator.geolocation && typeof navigator.geolocation.getCurrentPosition === "function") {
          navigator.geolocation.getCurrentPosition(function(position) {
            self.debug("recieved position information");
            FieldDBObject.software.location = position.coords;
          });
        }
      } catch (e) {
        this.debug("Error loading software ", e);
        FieldDBObject.software = FieldDBObject.software || {};
        FieldDBObject.software.version = process.version;
        FieldDBObject.software.appVersion = "PhantomJS unknown";

        try {
          var avoidmontagerequire = require;
          var os = avoidmontagerequire("os");
          FieldDBObject.hardware = FieldDBObject.hardware || {};
          FieldDBObject.hardware.endianness = os.endianness();
          FieldDBObject.hardware.platform = os.platform();
          FieldDBObject.hardware.hostname = os.hostname();
          FieldDBObject.hardware.type = os.type();
          FieldDBObject.hardware.arch = os.arch();
          FieldDBObject.hardware.release = os.release();
          FieldDBObject.hardware.totalmem = os.totalmem();
          FieldDBObject.hardware.cpus = os.cpus().length;
        } catch (e) {
          this.debug(" hardware is unknown.", e);
          FieldDBObject.hardware = FieldDBObject.hardware || {};
          FieldDBObject.software.appVersion = "Device unknown";
        }
      }
      if (!optionalUserWhoSaved) {
        optionalUserWhoSaved = {
          name: "",
          username: "unknown"
        };
        try {
          if (this.corpus && this.corpus.connectionInfo && this.corpus.connectionInfo.userCtx) {
            optionalUserWhoSaved.username = this.corpus.connectionInfo.userCtx.name;
          } else if (FieldDBObject.application && FieldDBObject.application.user && FieldDBObject.application.user.username) {
            optionalUserWhoSaved.username = optionalUserWhoSaved.username || FieldDBObject.application.user.username;
            optionalUserWhoSaved.gravatar = optionalUserWhoSaved.gravatar || FieldDBObject.application.user.gravatar;
          }
        } catch (e) {
          this.warn("Can't get the corpus connection info to guess who saved this.", e);
        }
      }
      // optionalUserWhoSaved._name = optionalUserWhoSaved.name || optionalUserWhoSaved.username || optionalUserWhoSaved.browserVersion;
      if (typeof optionalUserWhoSaved.toJSON === "function") {
        var asJson = optionalUserWhoSaved.toJSON();
        asJson.name = optionalUserWhoSaved.name;
        optionalUserWhoSaved = asJson;
      } else {
        optionalUserWhoSaved.name = optionalUserWhoSaved.name;
      }
      // optionalUserWhoSaved.browser = browser;

      this.debug("    Calculating userWhoSaved...");

      var userWhoSaved = {
        username: optionalUserWhoSaved.username,
        name: optionalUserWhoSaved.name,
        lastname: optionalUserWhoSaved.lastname,
        firstname: optionalUserWhoSaved.firstname,
        gravatar: optionalUserWhoSaved.gravatar
      };

      if (!selfOrSnapshot._rev) {
        selfOrSnapshot._dateCreated = Date.now();
        var enteredByUser = selfOrSnapshot.enteredByUser || {};
        if (selfOrSnapshot.fields && selfOrSnapshot.fields.enteredbyuser) {
          enteredByUser = selfOrSnapshot.fields.enteredbyuser;
        } else if (!selfOrSnapshot.enteredByUser) {
          selfOrSnapshot.enteredByUser = enteredByUser;
        }
        enteredByUser.value = userWhoSaved.name || userWhoSaved.username;
        enteredByUser.json = enteredByUser.json || {};
        enteredByUser.json.user = userWhoSaved;
        enteredByUser.json.software = FieldDBObject.software;
        try {
          enteredByUser.json.hardware = Android ? Android.deviceDetails : FieldDBObject.hardware;
        } catch (e) {
          this.debug("Cannot detect the hardware used for selfOrSnapshot save.", e);
          enteredByUser.json.hardware = FieldDBObject.hardware;
        }

      } else {
        selfOrSnapshot._dateModified = Date.now();

        var modifiedByUser = selfOrSnapshot.modifiedByUser || {};
        if (selfOrSnapshot.fields && selfOrSnapshot.fields.modifiedbyuser) {
          modifiedByUser = selfOrSnapshot.fields.modifiedbyuser;
        } else if (!selfOrSnapshot.modifiedByUser) {
          selfOrSnapshot.modifiedByUser = modifiedByUser;
        }
        if (selfOrSnapshot.modifiedByUsers) {
          modifiedByUser = {
            json: {
              users: selfOrSnapshot.modifiedByUsers
            }
          };
          delete selfOrSnapshot.modifiedByUsers;
        }

        modifiedByUser.value = modifiedByUser.value ? modifiedByUser.value + ", " : "";
        modifiedByUser.value += userWhoSaved.name || userWhoSaved.username;
        modifiedByUser.json = modifiedByUser.json || {};
        if (modifiedByUser.users) {
          modifiedByUser.json.users = modifiedByUser.users;
          delete modifiedByUser.users;
        }
        modifiedByUser.json.users = modifiedByUser.json.users || [];
        userWhoSaved.software = FieldDBObject.software;
        userWhoSaved.hardware = FieldDBObject.hardware;
        modifiedByUser.json.users.push(userWhoSaved);
      }

      if (FieldDBObject.software && FieldDBObject.software.location) {
        var location;
        if (selfOrSnapshot.location) {
          location = selfOrSnapshot.location;
        } else if (selfOrSnapshot.fields && selfOrSnapshot.fields.location) {
          location = selfOrSnapshot.fields.location;
        }
        if (location) {
          location.json = location.json || {};
          location.json.previousLocations = location.json.previousLocations || [];
          if (location.json && location.json.location && location.json.location.latitude) {
            location.json.previousLocations.push(location.json.location);
          }
          this.debug("overwriting location ", location);
          location.json.location = FieldDBObject.software.location;
          location.value = location.json.location.latitude + "," + location.json.location.longitude;
        }
      }

      this.debug("    Serializing to send object to selfOrSnapshotbase...");
      // this.debug("snapshot   ", selfOrSnapshot);

      return selfOrSnapshot.toJSON();

      // return selfOrSnapshot.toJSON ? selfOrSnapshot.toJSON() : selfOrSnapshot;
    }
  },

  save: {
    value: function(optionalUserWhoSaved, saveEvenIfSeemsUnchanged, optionalUrl) {
      var deferred = Q.defer(),
        self = this;

      if (this.fetching) {
        self.warn("Fetching is in process, can't save right now...");
        Q.nextTick(function() {
          deferred.reject("Fetching is in process, can't save right now...");
        });
        return deferred.promise;
      }
      if (this.saving) {
        self.warn("Save was already in process...");
        Q.nextTick(function() {
          deferred.reject("Fetching is in process, can't save right now...");
        });
        return deferred.promise;
      }

      if (saveEvenIfSeemsUnchanged) {
        this.debug("Not calculating if this object has changed, assuming it needs to be saved anyway.");
      } else {
        self.debug("    Checking to see if item needs to be saved.", saveEvenIfSeemsUnchanged, this.unsaved);

        if (!this.unsaved && !this.calculateUnsaved()) {
          self.warn("Item hasn't really changed, no need to save...");
          Q.nextTick(function() {
            deferred.resolve(self);
            return self;
          });
          return deferred.promise;
        }
      }
      if (!this.corpus || typeof this.corpus.set !== "function") {
        self.warn("The corpus for this doc isnt acessible, this is probably a bug.", this);
        Q.nextTick(function() {
          self.saving = false;
          deferred.reject({
            status: 406,
            userFriendlyErrors: ["This application has errored. Please notify its developers: Cannot save data, database is not currently opened."]
          });
        });
        return deferred.promise;
      }

      if (this.corpus.dbname !== this.dbname) {
        this.warn("This item belongs in the " + this.dbname + "database, not in the " + this.corpus.dbname + " database.");
        Q.nextTick(function() {
          self.saving = false;
          deferred.reject({
            status: 406,
            userFriendlyErrors: ["This item belongs in the " + self.dbname + "database, not in the " + self.corpus.dbname + " database."]
          });
        });
        return deferred.promise;
      }
      if (optionalUrl) {
        this.todo("Url for save was specified, but it is not being used. optionalUrl", optionalUrl);
      }

      var data = this.createSaveSnapshot();
      self.debug("    Requesting corpus to run save...");
      this.saving = true;
      this.whenReady = deferred.promise;
      this.corpus.set(data).then(function(result) {
          self.saving = false;
          self.debug("    Save completed...");
          self.debug("saved ", result);
          if (!result) {
            deferred.reject({
              status: 400,
              userFriendlyErrors: ["This application has errored. Please notify its developers: Cannot save data."]
            });
            return "self";
          }

          if (!result.id) {
            self.debug("    Rejecting promise, the id was not set by the database ..");
            deferred.reject({
              status: 500,
              userFriendlyErrors: ["This application has errored. Please notify its developers: Save operation returned abnormal results."],
              details: result
            });
            return self;
          }

          self.unsaved = false;

          self.id = result.id;
          self.rev = result.rev;

          self.debug("    Updating fossil...");
          self.fossil = self.toJSON();

          self.debug("    Resolving promise...", self);
          deferred.resolve(self);
          return self;
        },
        function(reason) {
          self.debug(reason);
          self.saving = false;
          deferred.reject(reason);
          return self;
        }).fail(
        function(error) {
          console.error(error.stack, self);
          deferred.reject(error);
        });

      return deferred.promise;
    }
  },

  delete: {
    value: function(reason) {
      return this.trash(reason);
    }
  },

  trash: {
    value: function(reason) {
      this.trashed = "deleted";
      if (reason) {
        this.trashedReason = reason;
      } else {
        this.todo("consider using a confirm to ask for a reason for deleting the item");
      }

      return this.save(null, "forcesavesinceweneedtopersistthischange");
    }
  },

  undelete: {
    value: function(reason) {
      this.trashed = "restored";
      if (reason) {
        this.untrashedReason = reason;
      } else {
        this.todo("consider using a confirm to ask for a reason for undeleting the item");
      }
      return this.save(null, "forcesavesinceweneedtopersistthischange");
    }
  },

  saveToGit: {
    value: function(commit, saveEvenIfSeemsUnchanged) {
      var deferred = Q.defer(),
        self = this;
      Q.nextTick(function() {
        self.todo("If in nodejs, write to file and do a git commit with optional user's email who modified the file and push ot a branch with that user's username", saveEvenIfSeemsUnchanged);
        self.debug("Commit to be used: ", commit);
        deferred.resolve(self);
      });
      return deferred.promise;
    }
  },

  equals: {
    value: function(anotherObject) {
      for (var aproperty in this) {
        if (!this.hasOwnProperty(aproperty) || typeof this[aproperty] === "function" || FieldDBObject.internalAttributesToAutoMerge.indexOf(aproperty) > -1) {
          this.debug("skipping equality of " + aproperty);
          continue;
        }
        if (!anotherObject) {
          return false;
        }

        if /* use fielddb equality function first */ (this[aproperty] && typeof this[aproperty].equals === "function") {
          if (!this[aproperty].equals(anotherObject[aproperty])) {
            this.debug("  " + aproperty + ": ", this[aproperty], " not equalivalent to ", anotherObject[aproperty]);
            if (this.debugMode) {
              console.error("objects are not equal stactrace");
            }
            return false;
          }
        } /* then try normal equality */
        else if (this[aproperty] === anotherObject[aproperty]) {
          this.debug(aproperty + ": " + this[aproperty] + " equals " + anotherObject[aproperty]);
          // return true;
        } /* then try stringification */
        else if (JSON.stringify(this[aproperty]) === JSON.stringify(anotherObject[aproperty])) {
          this.debug(aproperty + ": " + this[aproperty] + " equals " + anotherObject[aproperty]);
          // return true;
        } else if (anotherObject[aproperty] === undefined && (aproperty !== "_dateCreated" && aproperty !== "perObjectDebugMode")) {
          this.debug(aproperty + " is missing " + this[aproperty] + " on anotherObject " + anotherObject[aproperty]);
          if (this.debugMode) {
            console.error("objects are not equal stactrace");
          }
          return false;
        } else {
          if (aproperty !== "_dateCreated" && aproperty !== "perObjectDebugMode") {
            this.debug(aproperty + ": ", this[aproperty], " not equal ", anotherObject[aproperty]);
            if (this.debugMode) {
              console.error("objects are not equal stactrace");
            }
            return false;
          }
        }
      }
      if (typeof anotherObject.equals === "function") {
        if (this.dontRecurse === undefined) {
          this.dontRecurse = true;
          anotherObject.dontRecurse = true;
          if (!anotherObject.equals(this)) {
            if (this.debugMode) {
              console.error("objects are not equal stactrace");
            }
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
        localCallOnSelf,
        propertyList = {},
        json;

      // this.debugMode = true;

      if (arguments.length === 0) {
        this.warn("Invalid call to merge, there was no object provided to merge");
        return null;
      }

      if (!anotherObject && !optionalOverwriteOrAsk) {
        resultObject = anObject = this;
        anotherObject = callOnSelf;
      } else if (callOnSelf === "self") {
        this.debug("Merging properties into myself. ");
        anObject = this;
        resultObject = anObject;
      } else if (callOnSelf && anotherObject) {
        anObject = callOnSelf;
        resultObject = this;
      } else {
        this.warn("Invalid call to merge, invalid arguments were provided to merge", arguments);
        return null;
      }

      if (!optionalOverwriteOrAsk) {
        optionalOverwriteOrAsk = "";
      }

      if (anObject.id && anotherObject.id && anObject.id !== anotherObject.id) {
        this.warn("Refusing to merge these objects, they have different ids: " + anObject.id + "  and " + anotherObject.id);
        this.debug("Refusing to merge" + anObject.id + "  and " + anotherObject.id, anObject, anotherObject);
        return null;
      }
      if (anObject.dbname && anotherObject.dbname && anObject.dbname !== anotherObject.dbname) {
        if (optionalOverwriteOrAsk.indexOf("keepDBname") > -1) {
          this.warn("Permitting a merge of objects from different databases: " + anObject.dbname + "  and " + anotherObject.dbname);
          this.debug("Merging ", anObject, anotherObject);
        } else if (optionalOverwriteOrAsk.indexOf("changeDBname") === -1) {
          this.warn("Refusing to merge these objects, they come from different databases: " + anObject.dbname + "  and " + anotherObject.dbname);
          this.debug("Refusing to merge" + anObject.dbname + "  and " + anotherObject.dbname, anObject, anotherObject);
          return null;
        }
      }

      for (aproperty in anObject) {
        if (anObject.hasOwnProperty(aproperty) && typeof anObject[aproperty] !== "function") {
          propertyList[aproperty] = true;
        }
      }

      for (aproperty in anotherObject) {
        if (anotherObject.hasOwnProperty(aproperty) && typeof anotherObject[aproperty] !== "function") {
          propertyList[aproperty] = true;
        }
      }

      this.debug(" Merging properties: ", propertyList);

      var handleAsyncConfirmMerge = function(self, apropertylocal) {

        self.confirm("I found a conflict for " + apropertylocal + ", Do you want to overwrite it from " + JSON.stringify(anObject[apropertylocal]) + " -> " + JSON.stringify(anotherObject[apropertylocal]))
          .then(function() {
            if (apropertylocal === "_dbname" && optionalOverwriteOrAsk.indexOf("keepDBname") > -1) {
              // resultObject._dbname = self.dbname;
              self.warn(" Keeping _dbname of " + resultObject.dbname);
            } else {
              self.warn("Async Overwriting contents of " + apropertylocal + " (this may cause disconnection in listeners)");
              self.debug("Async Overwriting  ", anObject[apropertylocal], " ->", anotherObject[apropertylocal]);

              resultObject[apropertylocal] = anotherObject[apropertylocal];
            }
          }, function() {
            resultObject[apropertylocal] = anObject[apropertylocal];
          }).fail(function(error) {
            console.error(error.stack, self);
          });
      };

      for (aproperty in propertyList) {

        if (typeof anObject[aproperty] === "function" || typeof anotherObject[aproperty] === "function") {
          this.debug("  Ignoring ---" + aproperty + "----");
          continue;
        }
        if (this.debugMode) {
          this.debug("  Merging ---" + aproperty + "--- \n   :::" + JSON.stringify(resultObject[aproperty]) + ":::\n   :::" + JSON.stringify(anObject[aproperty]) + ":::\n   :::" + JSON.stringify(anotherObject[aproperty]) + ":::");
        }

        // if the result is missing the property, clone it from anObject or anotherObject
        if (resultObject[aproperty] === undefined || resultObject[aproperty] === null) {
          if (anObject[aproperty] !== undefined && anObject[aproperty] !== null) {
            if (typeof anObject[aproperty] !== "string" && typeof anObject[aproperty].constructor === "function") {
              json = anObject[aproperty].toJSON ? anObject[aproperty].toJSON() : anObject[aproperty];
              resultObject[aproperty] = new anObject[aproperty].constructor(json);
              this.debug(" " + aproperty + " resultObject will have anObject's Cloned contents because it was empty");
            } else {
              resultObject[aproperty] = anObject[aproperty];
              this.debug(" " + aproperty + " resultObject will have anObject's contents because it was empty");
            }
          } else if (anotherObject[aproperty] !== undefined && anotherObject[aproperty] !== null) {
            this.debug("Using a constructor");
            resultObject[aproperty] = FieldDBObject.convertDocIntoItsType(anotherObject[aproperty], "clone");
          }
          // dont continue, instead let the iffs run
        }
        if (this.debugMode) {
          this.debug("  Merging ---" + aproperty + "--- \n   :::" + JSON.stringify(resultObject[aproperty]) + ":::\n   :::" + JSON.stringify(anObject[aproperty]) + ":::\n   :::" + JSON.stringify(anotherObject[aproperty]) + ":::");
        }

        /* jshint eqeqeq:false */
        if (anObject[aproperty] == anotherObject[aproperty]) {
          this.debug(aproperty + " were equal or had no conflict.");
          if (resultObject[aproperty] != anObject[aproperty]) {
            resultObject[aproperty] = anObject[aproperty];
          }
          continue;
        }

        // Don't bother with equivalentcy, we will merge the internal elements recursively if they are not equivalent so this doesn't save time.
        // if (anObject[aproperty] && typeof anObject[aproperty].equals === "function" && anObject[aproperty].equals(anotherObject[aproperty])) {
        //   this.debug(aproperty + " were equivalent or had no conflict.");
        //   if (!anObject[aproperty].equals(resultObject[aproperty])) {
        //     resultObject[aproperty] = anObject[aproperty];
        //   }
        //   continue;
        // }

        if ((anotherObject[aproperty] === undefined || anotherObject[aproperty] === null) && resultObject[aproperty] != anObject[aproperty]) {
          this.debug(aproperty + " was missing in new object, using the original");
          resultObject[aproperty] = anObject[aproperty];
          continue;
        }

        if (anotherObject[aproperty] && (anObject[aproperty] === undefined || anObject[aproperty] === null || anObject[aproperty] === [] || anObject[aproperty].length === 0 || anObject[aproperty] === {})) {
          targetPropertyIsEmpty = true;
          this.debug(aproperty + " was previously empty, taking the new value");
          resultObject[aproperty] = anotherObject[aproperty];
          continue;
        }

        if ((anObject[aproperty] !== undefined || anObject[aproperty] !== null) && (anotherObject[aproperty] === undefined || anotherObject[aproperty] === null || anotherObject[aproperty] === [] || anotherObject[aproperty].length === 0 || anotherObject[aproperty] === {})) {
          targetPropertyIsEmpty = true;
          this.debug(aproperty + " target is empty, taking the old value");
          resultObject[aproperty] = anObject[aproperty];
          continue;
        }

        //  if two arrays: concat
        if (Object.prototype.toString.call(anObject[aproperty]) === "[object Array]" && Object.prototype.toString.call(anotherObject[aproperty]) === "[object Array]") {
          this.debug(aproperty + " was an array, concatinating with the new value", anObject[aproperty], " ->", anotherObject[aproperty]);
          resultObject[aproperty] = anObject[aproperty].concat([]);

          // only add the ones that were missing (dont remove any. merge wont remove stuff, only add.)
          /* jshint loopfunc:true */
          anotherObject[aproperty].map(function(item) {
            if (resultObject[aproperty].indexOf(item) === -1) {
              resultObject[aproperty].push(item);
            }
          });
          this.debug("  added members of anotherObject " + aproperty + " to anObject ", resultObject[aproperty]);
          continue;
        }

        // if two objects with merge function: recursively merge
        if (resultObject[aproperty] && typeof resultObject[aproperty].merge === "function") {
          if (callOnSelf === "self") {
            localCallOnSelf = callOnSelf;
          } else {
            localCallOnSelf = anObject[aproperty];
          }
          this.debug("Requesting recursive merge of internal property " + aproperty + " using method: " + localCallOnSelf);
          var result = resultObject[aproperty].merge(localCallOnSelf, anotherObject[aproperty], optionalOverwriteOrAsk);
          this.debug("after internal merge ", result);
          this.debug("after internal merge ", resultObject[aproperty]);
          continue;
        }

        overwrite = optionalOverwriteOrAsk;
        this.debug("Found conflict for " + aproperty + " Requested with " + optionalOverwriteOrAsk + " " + optionalOverwriteOrAsk.indexOf("overwrite"));
        if (optionalOverwriteOrAsk.indexOf("overwrite") === -1 && FieldDBObject.internalAttributesToAutoMerge.indexOf(aproperty) === -1) {
          handleAsyncConfirmMerge(this, aproperty);
        }
        if (overwrite || FieldDBObject.internalAttributesToAutoMerge.indexOf(aproperty) > -1) {
          if (aproperty === "_dbname" && optionalOverwriteOrAsk.indexOf("keepDBname") > -1) {
            // resultObject._dbname = this.dbname;
            this.warn(" Keeping _dbname of " + resultObject.dbname);
          } else {
            if (FieldDBObject.internalAttributesToAutoMerge.indexOf(aproperty) === -1) {
              this.warn("Overwriting contents of " + aproperty + " (this may cause disconnection in listeners)");
            }
            this.debug("Overwriting  ", anObject[aproperty], " ->", anotherObject[aproperty]);

            resultObject[aproperty] = anotherObject[aproperty];
          }
        } else {
          resultObject[aproperty] = anObject[aproperty];
        }
      }

      return resultObject;
    }
  },

  fetch: {
    value: function(optionalUrl) {
      var deferred = Q.defer(),
        self = this;

      if (!this.corpus || typeof this.corpus.get !== "function" || !this._id) {
        Q.nextTick(function() {
          self.fetching = self.loading = false;
          deferred.reject({
            status: 406,
            userFriendlyErrors: ["This application has errored. Please notify its developers: Cannot fetch data which has no id, or the if database is not currently opened."]
          });
        });
        return deferred.promise;
      }

      this.todo("Should probably call save before fetch to create a snapshot of the item regardless of whether the save is completeable, ");
      var oldRev = this.rev;

      this.fetching = this.loading = true;
      this.whenReady = self.corpus.get(self.id, optionalUrl).then(function(result) {
        self.fetching = self.loading = false;
        if (!result) {
          deferred.reject({
            status: 400,
            userFriendlyErrors: ["This application has errored. Please notify its developers: Cannot fetch data url."]
          });
          return self;
        }
        self.loaded = true;

        // If this had no revision number before, and it does now, then this is a good fossil point
        if (!oldRev && (result._rev || result.rev)) {
          self.warn(self.id + " was probabbly a placeholder (didnt have .rev before fetch, but now it does) which is now filled in, calling merge with overwrite from server.");

          self.merge("self", result, "overwrite");
          // Setting the fossil causes
          // A: the merge to count as something which needs to be seaved
          // B: the user's previous changes prior to fetch might get lost
          self.fossil = self.toJSON();
          self.unsaved = false;
        } else {
          self.warn("Cant tell if this was a placeholder, calling merge and asking user if there are merge conflicts.", result);
          self.merge("self", result);
          self.debug("After merge ", self.modifiedByUser);
        }

        deferred.resolve(self);
        return self;
      }, function(reason) {
        self.fetching = self.loading = false;
        self.loaded = false;
        self.debug(reason);
        deferred.reject(reason);
        return self;
      }).fail(function(error) {
        console.error(error.stack, self);
        deferred.reject(error);
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
    }
  },

  corpus: {
    get: function() {
      var db = null;
      // this.debugMode = true;
      if (this.resumeAuthenticationSession && typeof this.resumeAuthenticationSession === "function") {
        db = this;
        this.debug("this " + this._id + " has the functions of a corpus, using it.", db);
      } else if (this._corpus) {
        db = this._corpus;
        this.debug("this " + this._id + " has a _corpus hard coded inside it, using it.", db);
      } else if (FieldDBObject.application && FieldDBObject.application._corpus) {
        db = FieldDBObject.application._corpus;
        this.debug("this " + this._id + " is running in the context where FieldDBObject.application._corpus is defined, using it.", db);
      } else {

        try {
          if (FieldDB && FieldDB["Database"]) {
            db = FieldDB["Database"].prototype;
            this.warn("  using the Database.prototype to run db calls for " + this._id + ", this could be problematic " + this._id + " .", db);
          }
        } catch (e) {
          var message = e ? e.message : " unknown error in getting the corpus";
          if (message !== "FieldDB is not defined") {
            this.warn(this._id + "Cant get the corpus, cant find the Database class.", e);
            if (e) {
              this.warn("  stack trace" + e.stack);
            }
          }
        }
      }
      if (!db) {
        this.warn("Operations that need a database wont work for the " + this._id + " object");
      }

      return db;
    },
    set: function(value) {
      if (value && value.dbname && this.dbname && value.dbname !== this.dbname) {
        this.warn("The corpus " + value.db + " cant be set on this item, its db is different" + this.dbname);
        return;
      }
      this._corpus = value;
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
      //   this.bug("Invalid id, not using " + originalValue + " id remains as " + this._id);
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
      if (this._dbname && this._dbname !== "default" && this.rev) {
        throw new Error("This is the " + this._dbname + ". You cannot change the dbname of an object in this corpus, you must create a clone of the object first.");
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
      this.debug("Pouchname is deprecated, use dbname instead.");
      return this.dbname;
    },
    set: function(value) {
      this.debug("Pouchname is deprecated, please use dbname instead.");
      this.dbname = value;
    }
  },

  couchConnection: {
    get: function() {
      console.error("CouchConnection is deprecated, use connection instead");
      return this.connection;
    },
    set: function(value) {
      // console.error("CouchConnection is deprecated, use connection instead");
      this.connection = value;
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

  timestamp: {
    get: function() {
      return this._timestamp || this._dateCreated;
    },
    set: function(value) {
      if (value === this._timestamp) {
        return;
      }
      if (!value) {
        // delete this._timestamp;
        return;
      }
      if (value.replace) {
        try {
          value = value.replace(/["\\]/g, "");
          value = new Date(value);
          value = value.getTime();
        } catch (e) {
          this.warn("Upgraded timestamp" + value);
        }
      }
      this._timestamp = value;

      // Use timestamp as date created if there was none, or the timestamp is older.
      if (!this._dateCreated || this._dateCreated > value) {
        this._dateCreated = value;
      }
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
        // delete this._dateCreated;
        return;
      }
      if (value.replace) {
        try {
          value = value.replace(/["\\]/g, "");
          value = new Date(value);
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
          value = value.replace(/["\\]/g, "");
          value = new Date(value);
          value = value.getTime();
        } catch (e) {
          this.warn("Upgraded dateModified" + value);
        }
      }
      this._dateModified = value;
    }
  },

  /**
   * Shows the differences between revisions of two couchdb docs, TODO not working yet but someday when it becomes a priority..
   */
  showDiffs: function(oldrevision, newrevision) {

    this.todo("We haven't implemented the 'diff' tool yet" +
      " (ie, showing the changes, letting you undo changes etc)." +
      " We will do it eventually, when it becomes a priority. " +
      "<a target='blank'  href='https://github.com/OpenSourceFieldlinguistics/FieldDB/issues/124'>" +
      "You can vote for it in our issue tracker</a>.  " +
      "We use the " +
      "<a target='blank' href='" + this.url + "/" + oldrevision + "?rev=" + newrevision + "'>" + "Futon User Interface</a> directly to track revisions in the data, you can too (if your a power user type).", "alert", "Track Changes:");
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
        if (typeof this.INTERNAL_MODELS["comments"] === "function" && Object.prototype.toString.call(value) === "[object Array]") {
          value = new this.INTERNAL_MODELS["comments"](value);
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
      try {
        var json = {
            fieldDBtype: this.fieldDBtype
          },
          aproperty,
          underscorelessProperty;

        if (this.fetching) {
          this.warn("Cannot get json while " + this.id + " is fetching itself");
          this.debug(" this is the object", this);
          // return;
          // throw "Cannot get json while object is fetching itself";
        }
        /* this object has been updated to this version */
        this.version = this.version;
        /* force id to be set if possible */
        // this.id = this.id;

        if (this.useIdNotUnderscore) {
          json.id = this.id;
        }

        for (aproperty in this) {
          if (this.hasOwnProperty(aproperty) && typeof this[aproperty] !== "function" && FieldDBObject.internalAttributesToNotJSONify.indexOf(aproperty) === -1) {
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
        if (this.useIdNotUnderscore) {
          delete json._id;
        }

        if (!json._rev) {
          delete json._rev;
        }
        if (json.dbname) {
          json.pouchname = json.dbname;
          this.debug("Serializing Pouchname for backward compatability until prototype can handle dbname");
        }

        for (var uninterestingAttrib in FieldDBObject.internalAttributesToNotJSONify) {
          if (FieldDBObject.internalAttributesToNotJSONify.hasOwnProperty(uninterestingAttrib)) {
            delete json[FieldDBObject.internalAttributesToNotJSONify[uninterestingAttrib]];
          }
        }

        if (this.collection !== "private_corpora") {
          delete json.confidential;
          delete json.confidentialEncrypter;
        } else {
          this.warn("serializing confidential in this object " + this._collection);
        }
        if (this.api) {
          json.api = this.api;
        }

        if (json.previousFieldDBtype && json.fieldDBtype && json.previousFieldDBtype === json.fieldDBtype) {
          delete json.previousFieldDBtype;
        }

        return json;

      } catch (e) {
        console.warn(e);
        console.error(e.stack);
        this.bug("Unable to serialze " + this.id + ". Please report this.");
      }
    }
  },


  addRelatedData: {
    value: function(json) {
      var relatedData;
      if (this.datumFields && this.datumFields.relatedData) {
        relatedData = this.datumFields.relatedData.json.relatedData || [];
      } else if (this.relatedData) {
        relatedData = this.relatedData;
      } else {
        this.relatedData = relatedData = [];
      }

      json.relation = "associated file";
      relatedData.push(json);
    }
  },

  /**
   * Creates a deep copy of the object (not a reference)
   * @return {Object} a near-clone of the objcet
   */
  clone: {
    value: function(includeEvenEmptyAttributes) {
      var json = {},
        aproperty,
        underscorelessProperty;
      try {
        json = JSON.parse(JSON.stringify(this.toJSON(includeEvenEmptyAttributes)));
      } catch (e) {
        if (e) {
          console.warn(e);
          console.warn(e.stack);
          console.warn(e.message);
          console.warn(this);
          // throw e;
        }
      }
      // Use clone on internal properties which have a clone function
      for (aproperty in json) {
        underscorelessProperty = aproperty.replace(/^_/, "");
        if (this[aproperty] && typeof this[aproperty].clone === "function") {
          json[underscorelessProperty] = JSON.parse(JSON.stringify(this[aproperty].clone(includeEvenEmptyAttributes)));
        }
      }

      var relatedData;
      if (json.datumFields && json.datumFields.relatedData) {
        relatedData = json.datumFields.relatedData.json.relatedData || [];
      } else if (json.relatedData) {
        relatedData = json.relatedData;
      } else {
        json.relatedData = relatedData = [];
      }
      var source = this.id;
      if (this.rev) {
        source = source + "?rev=" + this.rev;
      } else {
        if (this.parent && this.parent._rev) {
          source = "parent" + this.parent._id + "?rev=" + this.parent._rev;
        }
      }
      relatedData.push({
        URI: source,
        relation: "clonedFrom"
      });

      /* Clear the current object's info which we shouldnt clone */
      delete json._id;
      delete json._rev;
      delete json.parent;
      delete json.dbname;
      delete json.pouchname;

      return json;
    }
  },

  contextualizer: {
    get: function() {
      if (this.application && this.application.contextualizer) {
        return this.application.contextualizer;
      }
    }
  },

  /**
   *  Cleans a value to become a primary key on an object (replaces punctuation and symbols with underscore)
   *  formerly: item.replace(/[-\""+=?.*&^%,\/\[\]{}() ]/g, "")
   *
   * @param  String value the potential primary key to be cleaned
   * @return String       the value cleaned and safe as a primary key
   */
  sanitizeStringForFileSystem: {
    value: function(value, optionalReplacementCharacter) {
      this.debug("sanitizeStringForPrimaryKey " + value);
      if (!value) {
        return null;
      }
      if (optionalReplacementCharacter === undefined || optionalReplacementCharacter === "-") {
        optionalReplacementCharacter = "_";
      }
      if (value.trim) {
        value = Diacritics.clean(value);
        this.debug("sanitizeStringForPrimaryKey " + value);

        value = value.trim().replace(/[^-a-zA-Z0-9]+/g, optionalReplacementCharacter).replace(/^_/, "").replace(/_$/, "");
        this.debug("sanitizeStringForPrimaryKey " + value);
        return value;
      } else if (typeof value === "number") {
        return parseInt(value, 10);
      } else {
        return null;
      }
    }
  },

  sanitizeStringForPrimaryKey: {
    value: function(value, optionalReplacementCharacter) {
      this.debug("sanitizeStringForPrimaryKey " + value);
      if (!value) {
        return null;
      }
      if (value.replace) {
        value = value.replace(/-/g, "_");
      }
      value = this.sanitizeStringForFileSystem(value, optionalReplacementCharacter);
      if (value && typeof value !== "number") {
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
exports.Document = FieldDBObject;
