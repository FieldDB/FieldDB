"use strict";

var LanguageDatum = require("./LanguageDatum").LanguageDatum;

/**
 * @class The ComputationalLinguisticsDatum represents some text and statistics about that text
 *
 * @name  ComputationalLinguisticsDatum
 * @extends LanguageDatum
 * @constructs
 */
var ComputationalLinguisticsDatum = function ComputationalLinguisticsDatum(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "ComputationalLinguisticsDatum";
  }
  this.debug("Constructing ComputationalLinguisticsDatum: ", options);
  LanguageDatum.apply(this, [options]);
};


ComputationalLinguisticsDatum.naiveFrequency = function(items) {
  var naiveFrequency = {};
  var tokens = 0;
  var types = 0;

  items.map(function(item) {
    tokens++;

    if (!naiveFrequency[item]) {
      types = types + 1;
      return naiveFrequency[item] = 1;
    }
    naiveFrequency[item] = naiveFrequency[item] + 1;
  });

  return {
    tokens: tokens,
    types: types,
    frequencies: naiveFrequency
  };
};

ComputationalLinguisticsDatum.prototype = Object.create(LanguageDatum.prototype, /** @lends ComputationalLinguisticsDatum.prototype */ {
  constructor: {
    value: ComputationalLinguisticsDatum
  },

  extractStats: {
    value: function(options) {
      if (options) {
        this.warn("Options aren't used", options);
      }

      var text = this.utterance || this.orthography;

      var characters = ComputationalLinguisticsDatum
        .naiveFrequency(text.split(""));
      var words = ComputationalLinguisticsDatum
        .naiveFrequency(text.split(/\s+/));

      this.stats = {
        characters: {
          unigrams: characters.frequencies,
          bigrams: {}
        },
        words: {
          unigrams: words.frequencies,
          bigrams: {}
        },
        tokens: {
          characters: {
            unigrams: characters.tokens,
            bigrams: {}
          },
          words: {
            unigrams: words.tokens,
            bigrams: {}
          }
        },
        types: {
          characters: characters.types,
          words: words.types
        }
      };
      return this;
    }
  },

  stats: {
    get: function() {
      // this.debug("get stats", this._stats);
      return this._stats;
    },
    set: function(value) {
      this._stats = value;
    }
  }

});
exports.ComputationalLinguisticsDatum = ComputationalLinguisticsDatum;
