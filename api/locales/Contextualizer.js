/* globals window */
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
 * @property {String} defaultLocale The language/context to use if a translation/contextualization is missing.
 * @property {String} currentLocale The current locale to use (often the browsers default locale, or a corpus" default locale).
 *
 * @extends FieldDBObject
 * @constructs
 */
var Contextualizer = function Contextualizer(options) {
  this.debug("Constructing Contextualizer ", options);
  // this.debugMode = true;
  var localArguments = arguments;
  if (!options) {
    options = {};
    localArguments = [options];
  }
  if (!options.defaultLocale) {
    options.defaultLocale = "en";
  }
  if (!options.currentLocale) {
    options.currentLocale = options.defaultLocale;
  }
  if (!options.currentContext) {
    options.currentContext = "default";
  }
  if (!options.elanguages) {
    options.elanguages = elanguages;
  }
  FieldDBObject.apply(this, localArguments);
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
    value: {}
  },

  availableLanguages: {
    get: function() {
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

  contextualize: {
    value: function(message) {
      this.debug("Resolving localization in " + this.currentLocale);
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
      if (this.data[this.currentLocale] && this.data[this.currentLocale][result] && this.data[this.currentLocale][result].message !== undefined && this.data[this.currentLocale][result].message) {
        result = this.data[this.currentLocale][result].message;
        this.debug("Resolving localization using requested language: ", result);
        keepTrying = false;
      } else {
        if (typeof message === "object" && message.default) {
          if (this.data[this.currentLocale] && this.data[this.currentLocale][message.default] && this.data[this.currentLocale][message.default].message !== undefined && this.data[this.currentLocale][message.default].message) {
            result = this.data[this.currentLocale][message.default].message;
            this.warn("Resolving localization using default contextualization: ", message.default);
            keepTrying = false;
          } else if (this.data[this.defaultLocale] && this.data[this.defaultLocale][message.default] && this.data[this.defaultLocale][message.default].message !== undefined && this.data[this.defaultLocale][message.default].message) {
            result = this.data[this.defaultLocale][message.default].message;
            this.warn("Resolving localization using default contextualization and default locale: ", message.default);
            keepTrying = false;
          }
        }
        if (keepTrying && this.data[this.defaultLocale] && this.data[this.defaultLocale][result] && this.data[this.defaultLocale][result].message !== undefined && this.data[this.defaultLocale][result].message) {
          result = this.data[this.defaultLocale][result].message;
          this.warn("Resolving localization using default: ", result);
        }
      }

      if (keepTrying && !this.requestedCorpusSpecificLocalizations && FieldDBObject && FieldDBObject.application && FieldDBObject.application.corpus && FieldDBObject.application.corpus.loaded) {
        FieldDBObject.application.corpus.getCorpusSpecificLocalizations();
        this.requestedCorpusSpecificLocalizations = true;
      }
      return result;
    }
  },

  updateContextualization: {
    value: function(key, value) {
      this.data[this.currentLocale] = this.data[this.currentLocale] || {};
      if (this.data[this.currentLocale][key] && this.data[this.currentLocale][key].message === value) {
        return value; //no change
      }
      var previousMessage = "";
      var verb = "create ";
      if (this.data[this.currentLocale][key]) {
        previousMessage = this.data[this.currentLocale][key].message;
        verb = "update ";
      }
      var update = this.confirm("Do you also want to " + verb + key + " for other users? \n" + previousMessage + " -> " + value);
      if (update) {
        this.data[this.currentLocale][key] = this.data[this.currentLocale][key] || {};
        this.data[this.currentLocale][key].message = value;
        var newLocaleItem = {};
        newLocaleItem[key] = {
          message: value
        };
        this.addMessagesToContextualizedStrings(this.currentLocale, newLocaleItem);
      }
      return this.data[this.currentLocale][key].message;
    }
  },

  audio: {
    value: function(key) {
      this.debug("Resolving localization in " + this.currentLocale);
      var result = {};
      if (!this.data) {
        this.warn("No localizations available, resolving empty audio details");
        return result;
      }

      if (this.data[this.currentLocale] && this.data[this.currentLocale][key] && this.data[this.currentLocale][key].audio !== undefined && this.data[this.currentLocale][key].audio) {
        result = this.data[this.currentLocale][key].audio;
        this.debug("Resolving localization audio using requested language: ", result);
      } else {
        if (this.data[this.defaultLocale] && this.data[this.defaultLocale][key] && this.data[this.defaultLocale][key].audio !== undefined && this.data[this.defaultLocale][key].audio) {
          result = this.data[this.defaultLocale][key].audio;
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
        console.log("using corpus as base url");
        baseUrl = FieldDBObject.application.corpus.url;
      }

      if (file.indexOf("/messages.json" > -1)) {
        localeCode = file.replace("/messages.json", "");
        if (localeCode.indexOf("/") > -1) {
          localeCode = localeCode.substring(localeCode.lastIndexOf("/"));
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
            deferred.reject);
      }, function(error) {
        console.log("There werent any locales at this url" + baseUrl + " :( Maybe this database has no custom locale messages.", error);
      });

      return deferred.promise;
    }
  },

  addMessagesToContextualizedStrings: {
    value: function(localeCode, localeData) {
      var deferred = Q.defer(),
        self = this;

      // Q.nextTick(function() {

      if (!localeData) {
        deferred.reject("The locales data was empty!");
      }

      if (!localeCode && localeData._id) {
        localeCode = localeData._id.replace("/messages.json", "");
        if (localeCode.indexOf("/") > -1) {
          localeCode = localeCode.substring(localeCode.lastIndexOf("/"));
        }
        localeCode = localeCode.replace(/[^a-z-]/g, "").toLowerCase();
        if (!localeCode || localeCode.length < 2) {
          localeCode = "default";
        }
      }

      for (var message in localeData) {
        if (localeData.hasOwnProperty(message) && message.indexOf("_") !== 0) {
          self.data[localeCode] = self.data[localeCode] || {
            length: 0
          };
          self.data[localeCode][message] = localeData[message];
          self.data[localeCode].length++;
        }
      }
      deferred.resolve(self.data);

      // });
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
        this.debug(doc);
        if (this.email) {
          promises.push(FieldDBObject.prototype.saveToGit.apply(doc, [{
            email: this.email,
            message: "Updated locale messages"
          }]));
        } else {
          doc.id = locale + "/messages.json";
          promises.push(FieldDBObject.prototype.save.apply(doc));
        }

      }
      return Q.allSettled(promises);
    }
  }


});

exports.Contextualizer = Contextualizer;
