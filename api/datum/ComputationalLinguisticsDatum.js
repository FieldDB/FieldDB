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

  stats: {
    get: function() {
      return this._stats;
    },
    set: function(value) {
      this._stats = value;
    }
  }

});
exports.ComputationalLinguisticsDatum = ComputationalLinguisticsDatum;
