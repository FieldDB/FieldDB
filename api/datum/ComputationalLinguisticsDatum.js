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

ComputationalLinguisticsDatum.prototype = Object.create(LanguageDatum.prototype, /** @lends ComputationalLinguisticsDatum.prototype */ {
  constructor: {
    value: ComputationalLinguisticsDatum
  },

  extractStats: {
    value: function(options) {
      if (options) {
        this.warn("Options aren't used", options);
      }
      this.stats = {
        unigrams: {},
        bigrams: {}
      };
      return this;
    }
  },

  stats: {
    get: function() {
      this.warn("get stats", this._stats);

      return this._stats;
    },
    set: function(value) {
      this._stats = value;
    }
  }

});
exports.ComputationalLinguisticsDatum = ComputationalLinguisticsDatum;
