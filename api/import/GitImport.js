"use strict";

var Import = require("./import").Import;
var shellPromise = require("./../shellPromise");
var Q = require("q");

/**
 * @class The git import class helps import data from a git repository into a corpus, or create a new corpus.
 *
 * @property {FileList} files These are the file(s) that were dragged in.
 * @property {String} dbname This is the corpusid wherej the data should be imported
 * @property {DatumFields} fields The fields array contains titles of the data columns.
 * @property {DataList} datalist The datalist imported, to hold the data before it is saved.
 * @property {Event} event The drag/drop event.
 *
 * @description The initialize serves to bind import to all drag and drop events.
 *
 * @extends FieldDBObject
 * @tutorial tests/CorpusTest.js
 */
var GitImport = function GitImport(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "GitImport";
  }
  this.debug(" new import ", options);
  Import.apply(this, arguments);
};

GitImport.DATA_DIR = "data";

GitImport.prototype = Object.create(Import.prototype, /** @lends GitImport.prototype */ {
  constructor: {
    value: GitImport
  },

  clone: {
    value: function(url) {
      var deferred = Q.defer();

      var cdCommand = "mkdir -p " + GitImport.DATA_DIR + "/" + this.dbname + "; cd " + GitImport.DATA_DIR + "; ";
      var cloneCommand = "git clone " + url;

      shellPromise(cdCommand + cloneCommand).then(function(result) {
        this.debug('result', result);
        deferred.resolve(result);
      }).fail(function(err) {
        this.debug('err', err);

        deferred.reject(err);
      });

      return deferred.promise;
    }
  }
});

exports.GitImport = GitImport;
