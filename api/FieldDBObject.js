/* globals alert, confirm, navigator, Android */
var CORS = require("./CORS").CORS;
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
    if (json[member] && this.INTERNAL_MODELS && this.INTERNAL_MODELS[member] && typeof this.INTERNAL_MODELS[member] === "function" && json[member].constructor !== this.INTERNAL_MODELS[member]) {
      if (typeof json[member] === "string" && this.INTERNAL_MODELS[member].constructor && this.INTERNAL_MODELS[member].prototype.fieldDBtype === "ContextualizableObject") {
        this.warn("this member " + member + " is supposed to be a ContextualizableObject but it is a string, not converting it into a ContextualizableObject", json[member]);
        simpleModels.push(member);
      } else {
        this.debug("Parsing model: " + member);
        json[member] = new this.INTERNAL_MODELS[member](json[member]);
      }

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
  if (!this.id) {
    this.dateCreated = Date.now();
  }

  if (!this.render) {
    this.render = function(options) {
      this.warn("Rendering, but the render was not injected for this " + this.fieldDBtype, options);
    };
  }
};

FieldDBObject.software = {};
FieldDBObject.hardware = {};

FieldDBObject.DEFAULT_STRING = "";
FieldDBObject.DEFAULT_OBJECT = {};
FieldDBObject.DEFAULT_ARRAY = [];
FieldDBObject.DEFAULT_COLLECTION = [];
FieldDBObject.DEFAULT_VERSION = "v" + package.version;
FieldDBObject.DEFAULT_DATE = 0;

FieldDBObject.bug = function(message) {
  try {
    alert(message);
  } catch (e) {
    console.warn(this.fieldDBtype.toUpperCase() + " BUG: " + message);
  }
};

FieldDBObject.warn = function(message, message2, message3, message4) {
  console.warn(this.fieldDBtype.toUpperCase() + " WARN: " + message);
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

/** @lends FieldDBObject.prototype */
FieldDBObject.prototype = Object.create(Object.prototype, {
  constructor: {
    value: FieldDBObject
  },

  fieldDBtype: {
    configurable: true,
    get: function() {
      var funcNameRegex = /function (.{1,})\(/;
      var results = (funcNameRegex).exec((this).constructor.toString());
      return (results && results.length > 1) ? results[1] : "";
    },
    set: function(value) {
      if (value !== this.fieldDBtype) {
        this.warn("Using type " + this.fieldDBtype + " when the incoming object was " + value);
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
        if (navigator && navigator.appName === "Microsoft Internet Explorer") {
          return;
        }
      } catch (e) {
        //do nothing, we are in node or some non-friendly browser.
      }
      if (this.debugMode) {
        console.log(this.fieldDBtype.toUpperCase() + " DEBUG: " + message);

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
    value: function(message, message2, message3, message4) {
      console.warn(this.fieldDBtype.toUpperCase() + " TODO: " + message);
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
    value: function(optionalUserWhoSaved) {
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
            console.warn("recieved position information");
            FieldDBObject.software.location = position.coords;
          });
        }
      } catch (e) {
        console.warn("Error loading software ", e);
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
          console.warn(" hardware is unknown.", e);
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
          if (FieldDBObject.application && FieldDBObject.application.corpus && FieldDBObject.application.corpus.connectionInfo) {
            var connectionInfo = FieldDBObject.application.corpus.connectionInfo;
            optionalUserWhoSaved.username = connectionInfo.userCtx.name;
          }
        } catch (e) {
          console.log("Can't get the corpus connection info", e);
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

      if (!this._rev) {
        this._dateCreated = Date.now();
        var enteredByUser = this.enteredByUser || {};
        if (this.fields && this.fields.enteredbyuser) {
          enteredByUser = this.fields.enteredbyuser;
        } else if (!this.enteredByUser) {
          this.enteredByUser = enteredByUser;
        }
        enteredByUser.value = optionalUserWhoSaved.name || optionalUserWhoSaved.username;
        enteredByUser.json = enteredByUser.json || {};
        enteredByUser.json.user = optionalUserWhoSaved;
        enteredByUser.json.software = FieldDBObject.software;
        try {
          enteredByUser.json.hardware = Android ? Android.deviceDetails : FieldDBObject.hardware;
        } catch (e) {
          console.warn("Cannot detect the hardware used for this save.");
          enteredByUser.json.hardware = FieldDBObject.hardware;
        }

      } else {
        this._dateModified = Date.now();

        var modifiedByUser = this.modifiedByUser || {};
        if (this.fields && this.fields.modifiedbyuser) {
          modifiedByUser = this.fields.modifiedbyuser;
        } else if (!this.modifiedByUser) {
          this.modifiedByUser = modifiedByUser;
        }
        if (this.modifiedByUsers) {
          modifiedByUser = {
            json: {
              users: this.modifiedByUsers
            }
          };
          delete this.modifiedByUsers;
        }

        modifiedByUser.value = modifiedByUser.value ? modifiedByUser.value + ", " : "";
        modifiedByUser.value += optionalUserWhoSaved.name || optionalUserWhoSaved.username;
        modifiedByUser.json = modifiedByUser.json || {};
        if (modifiedByUser.users) {
          modifiedByUser.json.users = modifiedByUser.users;
          delete modifiedByUser.users;
        }
        modifiedByUser.json.users = modifiedByUser.json.users || [];
        optionalUserWhoSaved.software = FieldDBObject.software;
        optionalUserWhoSaved.hardware = FieldDBObject.hardware;
        modifiedByUser.json.users.push(optionalUserWhoSaved);
      }

      if (FieldDBObject.software && FieldDBObject.software.location) {
        var location;
        if (this.location) {
          location = this.location;
        } else if (this.fields && this.fields.location) {
          location = this.fields.location;
        }
        if (location) {
          location.json = location.json || {};
          location.json.previousLocations = location.json.previousLocations || [];
          if (location.json && location.json.location && location.json.location.latitude) {
            location.json.previousLocations.push(location.json.location);
          }
          console.log("overwriting location ", location);
          location.json.location = FieldDBObject.software.location;
          location.value = location.json.location.latitude + "," + location.json.location.longitude;
        }
      }

      console.log("saving   ", this);

      var url = this.id ? "/" + this.id : "";
      url = this.url + url;
      var data = this.toJSON();
      CORS.makeCORSRequest({
        type: this.id ? "PUT" : "POST",
        dataType: "json",
        url: url,
        data: data
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
      }
      this.todo("consider using a confirm to ask for a reason for deleting the item");
      return this.save();
    }
  },

  undelete: {
    value: function(reason) {
      this.trashed = "restored";
      if (reason) {
        this.untrashedReason = reason;
      }
      this.todo("consider using a confirm to ask for a reason for undeleting the item");
      return this.save();
    }
  },

  saveToGit: {
    value: function(commit) {
      var deferred = Q.defer(),
        self = this;
      Q.nextTick(function() {
        self.todo("If in nodejs, write to file and do a git commit with optional user's email who modified the file and push ot a branch with that user's username");
        self.debug("Commit to be used: ", commit);
        deferred.resolve(self);
      });
      return deferred.promise;
    }
  },

  equals: {
    value: function(anotherObject) {
      for (var aproperty in this) {
        if (!this.hasOwnProperty(aproperty) || typeof this[aproperty] === "function") {
          this.debug("skipping equality of " + aproperty);
          continue;
        }
        if (this[aproperty] && typeof this[aproperty].equals === "function") {
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
          });
      };

      for (aproperty in anotherObject) {
        if (!anotherObject.hasOwnProperty(aproperty) || typeof anObject[aproperty] === "function") {
          this.debug("  merge: ignoring " + aproperty);
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
          if (Object.prototype.toString.call(anObject[aproperty]) === "[object Array]" && Object.prototype.toString.call(anotherObject[aproperty]) === "[object Array]") {
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
                handleAsyncConfirmMerge(this, aproperty);
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
        type: "GET",
        dataType: "json",
        url: optionalBaseUrl + "/" + self.dbname + "/" + id
      }).then(function(result) {
          self.fetching = false;
          self.loaded = true;
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
          value = value.replace(/["\\]/g, "");
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
          value = value.replace(/["\\]/g, "");
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
      var json = {
          fieldDBtype: this.fieldDBtype
        },
        aproperty,
        underscorelessProperty;

      if (this.fetching) {
        throw "Cannot get json while object is fetching itself";
      }
      /* this object has been updated to this version */
      this.version = this.version;
      /* force id to be set if possible */
      // this.id = this.id;

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
      delete json.fetching;
      delete json.loaded;
      delete json.decryptedMode;
      delete json.bugMessage;
      delete json.warnMessage;
      delete json.perObjectDebugMode;
      delete json.perObjectAlwaysConfirmOkay;
      delete json.application;
      delete json.contextualizer;
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
