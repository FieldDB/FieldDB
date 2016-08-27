"use strict";
var Import = require("./import").Import;

var GitImport = function GitImport(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "GitImport";
  }
  this.debug(" new import ", options);
  Import.apply(this, arguments);
};

GitImport.prototype = Object.create(Import.prototype, /** @lends GitImport.prototype */ {
  constructor: {
    value: GitImport
  }
});

exports.GitImport = GitImport;
