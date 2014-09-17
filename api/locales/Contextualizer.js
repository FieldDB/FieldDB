var FieldDBObject = require("./../FieldDBObject").FieldDBObject;
var Q = require("q");

var english_texts = require("./en/messages.json");
var spanish_texts = require("./es/messages.json");

/**
 * @class The contextualizer can resolves strings depending on context and locale of the user
 *  @name  Contextualizer
 *
 * @property {String} defaultLocale The language/context to use if a translation/contextualization is missing.
 * @property {String} currentLocale The current locale to use (often the browsers default locale, or a corpus' default locale).
 *
 * @extends FieldDBObject
 * @constructs
 */
var Contextualizer = function Contextualizer(options) {
  this.debug("Constructing Contextualizer ", options);
  if (!options) {
    options = {};
    arguments = [options];
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
  FieldDBObject.apply(this, arguments);
};

Contextualizer.prototype = Object.create(FieldDBObject.prototype, /** @lends Contextualizer.prototype */ {
  constructor: {
    value: Contextualizer
  },

  _require: {
    value: (typeof global !== "undefined") ? global.require : (typeof window !== "undefined") ? window.require : null
  },

  data: {
    value: {}
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
      var result = message;

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

      if (this.data[this.currentLocale] && this.data[this.currentLocale][result] && this.data[this.currentLocale][result].message !== undefined && this.data[this.currentLocale][result].message) {
        result = this.data[this.currentLocale][result].message;
        this.debug("Resolving localization using requested language: ", result);
      } else {
        var keepTrying = true;
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
      return result;
    }
  },

  updateContextualization: {
    value: function(key, value) {
      if (this.data[this.currentLocale] && this.data[this.currentLocale][key]) {
        if (this.data[this.currentLocale][key].message === value) {
          return;
        }
        this.data[this.currentLocale][key].message = value;
      }
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
  /*
  TODO this doesnt work in a chrome app sandbox, so use the addMessagesToContextualizedStrings instead
   */
  addFiles: {
    value: function(files) {
      var allDone = [],
        self = this,
        promise;

      var processJSON = function(localeCode) {
        promise.then(function(contents) {
          contents = JSON.parse(contents);
          return self.addMessagesToContextualizedStrings(contents, localeCode);
        });
      };
      for (var f = 0; f < files.length; f++) {
        this.data[files[f].localeCode] = this.data[files[f].localeCode] || {};

        this.debug("Loading " + files[f].path);
        promise = this._require.read(files[f].path);
        processJSON(files[f].localeCode); //TODO test this
        allDone.push(promise);
      }
      return Q.all(allDone);
    }
  },

  addMessagesToContextualizedStrings: {
    value: function(localeCode, localeData) {
      if (!localeData) {
        return;
      }

      for (var message in localeData) {
        if (localeData.hasOwnProperty(message)) {
          this.data[localeCode] = this.data[localeCode] || {};
          this.data[localeCode][message] = localeData[message];
        }
      }
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
