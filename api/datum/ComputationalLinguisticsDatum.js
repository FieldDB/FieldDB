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

  items.map(function(item) {
    if (!naiveFrequency[item]) {
      return naiveFrequency[item] = 1;
    }
    naiveFrequency[item] = naiveFrequency[item] + 1;
  });
  return naiveFrequency;
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

      this.stats = {
        characters: {
          unigrams: ComputationalLinguisticsDatum
            .naiveFrequency(text.split("")),
          bigrams: {}
        },
        words: {
          unigrams: ComputationalLinguisticsDatum
            .naiveFrequency(text.split(/\s+/)),
          bigrams: {}
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
