/* globals window, localStorage, navigator */
var FieldDBObject = require("./../FieldDBObject").FieldDBObject;
var ELanguages = require("./ELanguages").ELanguages;
var CORS = require("./../CORS").CORS;
var Q = require("q");

var english_texts = require("./en/messages.json");
var spanish_texts = require("./es/messages.json");
var elanguages = require("./elanguages.json");

/**
 * @class The contextualizer can resolves strings depending on context and locale of the user
 *  @name  Contextualizer
 *
 * @property {ELanguage} defaultLocale The language/context to use if a translation/contextualization is missing.
 * @property {ELanguage} currentLocale The current locale to use (often the browsers default locale, or a corpus" default locale).
 *
 * @extends FieldDBObject
 * @constructs
 */
var Contextualizer = function Contextualizer(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "Contextualizer";
  }
  this.debug("Constructing Contextualizer ", options);
  // this.debugMode = true;
  var localArguments = arguments;
  if (!options) {
    options = {};
    localArguments = [options];
  }
  if (!options.defaultLocale || !options.defaultLocale.iso) {
    options.defaultLocale = {
      iso: "en"
    };
  }
  // if (!options.currentLocale || !options.currentLocale.iso) {
  //   options.currentLocale = {
  //     iso: "en"
  //   };
  // }
  if (!options.currentContext) {
    options.currentContext = "default";
  }
  if (!options.elanguages) {
    options.elanguages = elanguages;
  }
  FieldDBObject.apply(this, localArguments);
  if (!options || options.alwaysConfirmOkay === undefined) {
    this.debug("By default it will be okay for users to modify global locale strings. IF they are saved this will affect other users.");
    this.alwaysConfirmOkay = true;
  }
  if (this.userOverridenLocalePreference) {
    this.currentLocale = this.userOverridenLocalePreference;
  } else {
    try {
      if (navigator.languages[0].indexOf(this.currentLocale.iso) === -1) {
        this.currentLocale = navigator.languages[0];
      }
    } catch (e) {
      this.debug("not using hte browser's language", e);
    }
  }
  return this;
};

Contextualizer.prototype = Object.create(FieldDBObject.prototype, /** @lends Contextualizer.prototype */ {
  constructor: {
    value: Contextualizer
  },

  INTERNAL_MODELS: {
    value: {
      elanguages: ELanguages
    }
  },

  _require: {
    value: (typeof global !== "undefined") ? global.require : (typeof window !== "undefined") ? window.require : null
  },

  data: {
    get: function() {
      return this._data;
    },
    set: function(value) {
      this._data = value;
    }
  },

  currentLocale: {
    get: function() {
      if (this._currentLocale) {
        return this._currentLocale;
      }
      if (this._mostAvailableLanguage) {
        return this._mostAvailableLanguage;
      }
      return this.defaultLocale;
    },
    set: function(value) {
      if (value === this._currentLocale) {
        return;
      }

      if (value && value.toLowerCase && typeof value === "string") {
        value = value.toLowerCase().replace(/[^a-z-]/g, "");
        if (this.elanguages && this.elanguages[value]) {
          value = this.elanguages[value];
        } else {
          value = {
            iso: value
          };
        }
      }

      this.warn("SETTING LOCALE FROM " + this._currentLocale + " to ", value, this.data);
      this._currentLocale = value;
    }
  },

  userOverridenLocalePreference: {
    get: function() {
      var userOverridenLocalePreference;
      try {
        userOverridenLocalePreference = JSON.parse(localStorage.getItem("_userOverridenLocalePreference"));
      } catch (e) {
        this.debug("Localstorage is not available, using the object there will be no persistance across loads", e, this._userOverridenLocalePreference);
        userOverridenLocalePreference = this._userOverridenLocalePreference;
      }
      if (!userOverridenLocalePreference) {
        return;
      }
      return userOverridenLocalePreference;
    },
    set: function(value) {
      if (value) {
        try {
          localStorage.setItem("_userOverridenLocalePreference", JSON.stringify(value));
        } catch (e) {
          this._userOverridenLocalePreference = value;
          this.debug("Localstorage is not available, using the object there will be no persistance across loads", e, this._userOverridenLocalePreference);
        }
      } else {
        try {
          localStorage.removeItem("_userOverridenLocalePreference");
        } catch (e) {
          this.debug("Localstorage is not available, using the object there will be no persistance across loads", e, this._userOverridenLocalePreference);
          delete this._userOverridenLocalePreference;
        }
      }
    }
  },

  availableLanguages: {
    get: function() {
      this.data = this.data || {};
      if (this._availableLanguages && this.data[this._availableLanguages._collection[0].iso] && this._availableLanguages._collection[0].length === this.data[this._availableLanguages._collection[0].iso].length) {
        return this._availableLanguages;
      }
      var availLanguages = new ELanguages(),
        bestAvailabilityCount = 0;

      for (var code in this.data) {
        if (this.data.hasOwnProperty(code)) {
          this.elanguages[code].length = this.data[code].length;
          if (this.elanguages[code].length > bestAvailabilityCount) {
            availLanguages.unshift(this.elanguages[code]);
            bestAvailabilityCount = this.elanguages[code].length;
          } else {
            availLanguages.push(this.elanguages[code]);
          }
        }
      }
      if (bestAvailabilityCount === 0 || availLanguages.length === 0) {
        this.todo("Ensuring that at least english is an available language, not sure if this is a good idea.");
        availLanguages.unshift(this.elanguages.en);
      } else {
        availLanguages._collection.map(function(language) {
          language.percentageOfAvailability = Math.round(language.length / bestAvailabilityCount * 100);
          return language;
        });
      }
      this.todo("test whether setting the currentLocale to the most complete locale has adverse affects.");
      this._mostAvailableLanguage = availLanguages._collection[0];
      this._availableLanguages = availLanguages;
      return availLanguages;
    }
  },

  defaults: {
    get: function() {
      return {
        en: JSON.parse(JSON.stringify(english_texts)),
        es: JSON.parse(JSON.stringify(spanish_texts))
      };
    }
  },

  loadDefaults: {
    value: function() {
      if (this.defaults.en) {
        this.addMessagesToContextualizedStrings("en", this.defaults.en);
      } else {
        this.debug("English Locales did not load.");
      }
      if (this.defaults.es) {
        this.addMessagesToContextualizedStrings("es", this.defaults.es);
      } else {
        this.debug("English Locales did not load.");
      }
      return this;
    }
  },

  localize: {
    value: function(message, optionalLocaleForThisCall) {
      return this.contextualize(message, optionalLocaleForThisCall);
    }
  },

  contextualize: {
    value: function(message, optionalLocaleForThisCall) {
      if (!optionalLocaleForThisCall) {
        optionalLocaleForThisCall = this.currentLocale.iso;
      }
      if (optionalLocaleForThisCall && optionalLocaleForThisCall.iso) {
        optionalLocaleForThisCall = optionalLocaleForThisCall.iso;
      }
      this.debug("Resolving localization in " + optionalLocaleForThisCall);
      var result = message,
        aproperty;

      // Use the current context if the caller is requesting localization of an object
      if (typeof message === "object") {
        var foundAContext = false;
        for (aproperty in message) {
          if (!message.hasOwnProperty(aproperty)) {
            continue;
          }
          if (aproperty.indexOf(this.currentContext) > -1 || ((this.currentContext === "child" || this.currentContext === "game") && aproperty.indexOf("gamified") > -1)) {
            result = message[aproperty];
            foundAContext = true;
            this.debug("Using " + aproperty + " for this contxtualization.");
            break;
          }
        }
        if (!foundAContext && message.default) {
          this.debug("Using default for this contxtualization. ", message);
          result = message.default;
        }
      }

      if (!this.data) {
        this.warn("No localizations available, resolving the key itself: ", result);
        return result;
      }

      var keepTrying = true;
      if (this.data[optionalLocaleForThisCall] && this.data[optionalLocaleForThisCall][result] && this.data[optionalLocaleForThisCall][result].message !== undefined && this.data[optionalLocaleForThisCall][result].message) {
        result = this.data[optionalLocaleForThisCall][result].message;
        this.debug("Resolving localization using requested language: ", result);
        keepTrying = false;
      } else {
        if (typeof message === "object" && message.default) {
          if (this.data[optionalLocaleForThisCall] && this.data[optionalLocaleForThisCall][message.default] && this.data[optionalLocaleForThisCall][message.default].message !== undefined && this.data[optionalLocaleForThisCall][message.default].message) {
            result = this.data[optionalLocaleForThisCall][message.default].message;
            this.debug("Resolving localization using default contextualization: ", message.default);
            keepTrying = false;
          } else if (this.data[this.defaultLocale.iso] && this.data[this.defaultLocale.iso][message.default] && this.data[this.defaultLocale.iso][message.default].message !== undefined && this.data[this.defaultLocale.iso][message.default].message) {
            result = this.data[this.defaultLocale.iso][message.default].message;
            this.debug("Resolving localization using default contextualization and default locale: ", message.default);
            keepTrying = false;
          }
        }
        if (keepTrying && this.data[this.defaultLocale.iso] && this.data[this.defaultLocale.iso][result] && this.data[this.defaultLocale.iso][result].message !== undefined && this.data[this.defaultLocale.iso][result].message) {
          result = this.data[this.defaultLocale.iso][result].message;
          this.debug("Resolving localization using default: ", result);
        }
      }

      if (keepTrying && !this.requestedCorpusSpecificLocalizations && FieldDBObject && FieldDBObject.application && FieldDBObject.application.corpus && FieldDBObject.application.corpus.loaded) {
        FieldDBObject.application.corpus.getCorpusSpecificLocalizations();
        this.requestedCorpusSpecificLocalizations = true;
      }
      result = result.replace(/^locale_/, "");
      return result;
    }
  },

  /**
   *
   * @param  {String} key   A locale to save the message to
   * @param  {String} value a message which should replace the existing localization
   * @return {Promise}       A promise for whether or not the update was confirmed and executed
   */
  updateContextualization: {
    value: function(key, value) {
      var deferred = Q.defer(),
        self = this,
        previousMessage = "",
        verb = "create ";

      this.whenReadys = this.whenReadys || [];

      this.data[this.currentLocale.iso] = this.data[this.currentLocale.iso] || {};
      if (this.data[this.currentLocale.iso][key] && this.data[this.currentLocale.iso][key].message === value) {
        Q.nextTick(function() {
          deferred.resolve(value);
        });
        return deferred.promise; //no change
      }

      if (this.data[this.currentLocale.iso][key]) {
        previousMessage = this.data[this.currentLocale.iso][key].message;
        verb = "update ";
      }

      var addTheUsersMessage = function(addkey, addvalue) {
        self.debug("Adding the user's message. ", addkey, addvalue);
        self.data[self.currentLocale.iso][addkey] = self.data[self.currentLocale.iso][addkey] || {};
        self.data[self.currentLocale.iso][addkey].message = addvalue;

        if (!self.fossil) {
          self.fossil = self.toJSON();
        }
        self.unsaved = true;
        var newLocaleItem = {};
        newLocaleItem[key] = {
          message: addvalue
        };
        self.addMessagesToContextualizedStrings(self.currentLocale.iso, newLocaleItem);
        Q.nextTick(function() {
          deferred.resolve(addvalue);
        });
      };

      if (!this.testingAsyncConfirm && this.alwaysConfirmOkay /* run synchonosuly whenever possible */ ) {
        self.debug("  Running synchonosuly. ", key, value);
        addTheUsersMessage(key, value);
        return deferred.promise;
      }

      this.todo("Test async updateContextualization");
      this.whenReadys.push(deferred.promise);

      self.debug("     Running asynchonosuly. ", key, value);
      this.confirm("Do you also want to " + verb + key + " for other users? \n" + previousMessage + " -> " + value)
        .then(function(response) {
            self.debug("Recieved confirmation ,", response);
            addTheUsersMessage(key, value);
          },
          function(reason) {
            self.debug("Not updating , user clicked cancel", reason);
            deferred.reject(reason);
          })
        .fail(
          function(error) {
            console.error(error.stack, self);
            deferred.reject(error);
          });

      return deferred.promise;
    }
  },

  audio: {
    value: function(key) {
      this.debug("Resolving localization in " + this.currentLocale.iso);
      var result = {};
      if (!this.data) {
        this.warn("No localizations available, resolving empty audio details");
        return result;
      }

      if (this.data[this.currentLocale.iso] && this.data[this.currentLocale.iso][key] && this.data[this.currentLocale.iso][key].audio !== undefined && this.data[this.currentLocale.iso][key].audio) {
        result = this.data[this.currentLocale.iso][key].audio;
        this.debug("Resolving localization audio using requested language: ", result);
      } else {
        if (this.data[this.defaultLocale.iso] && this.data[this.defaultLocale.iso][key] && this.data[this.defaultLocale.iso][key].audio !== undefined && this.data[this.defaultLocale.iso][key].audio) {
          result = this.data[this.defaultLocale.iso][key].audio;
          this.warn("Resolving localization audio using default: ", result);
        }
      }
      return result;
    }
  },

  addUrls: {
    value: function(files, baseUrl) {
      var promises = [],
        f;

      for (f = 0; f < files.length; f++) {
        promises.push(this.addUrl(files[f], baseUrl));
      }
      return Q.all(promises);
    }
  },

  addUrl: {
    value: function(file, baseUrl) {
      var deferred = Q.defer(),
        localeCode,
        self = this;

      if (!baseUrl && FieldDBObject && FieldDBObject.application && FieldDBObject.application.corpus && FieldDBObject.application.corpus.url) {
        this.debug("using corpus as base url");
        baseUrl = FieldDBObject.application.corpus.url;
      }

      if (file.indexOf("/messages.json" > -1)) {
        localeCode = file.replace("/messages.json", "");
        if (localeCode.indexOf("/") > -1) {
          localeCode = localeCode.substring(localeCode.lastIndexOf("/"));
        }
        localeCode = localeCode.replace(/[^a-zA-Z-]/g, "").toLowerCase();
        if (!localeCode || localeCode.length < 2) {
          localeCode = "default";
        }
      } else {
        localeCode = "en";
      }

      CORS.makeCORSRequest({
        method: "GET",
        url: baseUrl + "/" + file,
        dataType: "json"
      }).then(function(localeMessages) {
        self.originalDocs = self.originalDocs || [];
        self.originalDocs.push(file);
        self.addMessagesToContextualizedStrings(localeCode, localeMessages)
          .then(deferred.resolve,
            deferred.reject)
          .fail(function(error) {
            console.error(error.stack, self);
            deferred.reject(error);
          });
      }, function(error) {
        self.warn("There werent any locales at this url" + baseUrl + " :( Maybe this database has no custom locale messages.", error);
      }).fail(function(error) {
        console.error(error.stack, self);
        deferred.reject(error);
      });

      return deferred.promise;
    }
  },

  addMessagesToContextualizedStrings: {
    value: function(localeCode, localeData) {
      var deferred = Q.defer(),
        self = this;


      if (!localeData) {
        Q.nextTick(function() {
          deferred.reject("The locales data was empty!");
        });
        return deferred.promise;
      }

      if (!localeCode && localeData._id) {
        localeCode = localeData._id.replace("/messages.json", "");
        if (localeCode.indexOf("/") > -1) {
          localeCode = localeCode.substring(localeCode.lastIndexOf("/"));
        }
        localeCode = localeCode.replace(/[^a-zA-Z-]/g, "").toLowerCase();
        if (!localeCode || localeCode.length < 2) {
          localeCode = "default";
        }
      }
      self.originalDocs = self.originalDocs || [];
      self.originalDocs.push(localeData);

      self.data = self.data || {};
      for (var message in localeData) {
        if (localeData.hasOwnProperty(message) && message.indexOf("_") !== 0) {
          self.data[localeCode] = self.data[localeCode] || {
            length: 0
          };
          self.data[localeCode][message] = localeData[message];
          self.data[localeCode].length++;
        }
      }

      Q.nextTick(function() {
        deferred.resolve(self.data);
      });
      return deferred.promise;
    }
  },

  save: {
    value: function() {
      var promises = [];
      for (var locale in this.data) {
        if (!this.data.hasOwnProperty(locale)) {
          continue;
        }

        this.debug("Requsting save of " + locale);
        var doc = new FieldDBObject(this.data[locale]);
        doc.dbname = this.dbname;
        this.debug("Will save locale save of ", doc);

        var userHasModifiedContexualizations = !!this.fossil;

        if (this.email) {
          this.debug(" via Git ", doc);
          promises.push(doc.saveToGit({
            email: this.email,
            message: "Updated locale messages"
          }, userHasModifiedContexualizations));
        } else {
          doc.id = locale + "/messages.json";
          // doc.debugMode = true;
          this.debug("   via REST ", doc);
          promises.push(doc.save(null, userHasModifiedContexualizations));
        }

      }
      return Q.allSettled(promises);
    }
  }


});

exports.Contextualizer = Contextualizer;
