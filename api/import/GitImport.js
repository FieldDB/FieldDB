"use strict";

var Import = require("./Import").Import;
var shellPromise = require("./../shellPromise");
var Q = require("q");
var directoryTree = require("directory-tree");

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

GitImport.IMPORT_DIR = "imported_corpora";

GitImport.prototype = Object.create(Import.prototype, /** @lends GitImport.prototype */ {
  constructor: {
    value: GitImport
  },

  clone: {
    value: function(options) {
      var deferred = Q.defer();
      var self = this;

      var baseDir = [GitImport.IMPORT_DIR, self.corpus.id].join("/");

      var cdCommand = "mkdir -p " + baseDir + "; cd " + baseDir + "; cd ../; ";
      var cloneCommand = "echo \n | echo \n | git clone " + options.remoteUri;
      // var cloneCommand = " git clone " + options.remoteUri;

      self.debug("executing " + cdCommand + cloneCommand);
      shellPromise.execute(cdCommand + cloneCommand)
        .then(function(result) {
          self.debug("result", result);

          // TODO add a .fielddb.json file with metadata
          options.cloneMessage = result;
          deferred.resolve(options);
        }, function(err) {
          if (err.message.indexOf("already exists and is not an empty directory") > -1) {
            options.cloneMessage = err.message;
            return deferred.resolve(options);
          }
          if (err.message.indexOf("syntax error near unexpected token `|'") > -1) {
            options.cloneMessage = err.message;
            err.message = self.corpus.url + " not found";
            err.status = 404;
            return deferred.reject(err);
          }

          deferred.reject(err);
        })
        .fail(function(err) {
          self.debug("Error cloning", err);
          deferred.reject(err);
        });

      return deferred.promise;
    }
  },

  findFiles: {
    value: function(options) {
      var deferred = Q.defer();
      var self = this;

      var treeCommand = "tree -f " + GitImport.IMPORT_DIR + "/" + self.corpus.id;
      var grepCommand = "egrep \"(" + options.fileExtensions.join("$|").replace(/\./, "\\.") + "$)\"";

      self.debug("executing " + treeCommand + " | " + grepCommand);
      shellPromise.execute(treeCommand + " | " + grepCommand)
        .then(function(result) {
          self.debug("result", result);
          options.findFilesMessage = result;
          options.fileList = result.trim().split("\n").map(function(filePath) {
            return filePath.replace(new RegExp(".*" + GitImport.IMPORT_DIR), GitImport.IMPORT_DIR);
            // return filePath.replace(new RegExp(".*" + self.corpus.id + "/"), "");
          });
          options.fileTree = directoryTree(GitImport.IMPORT_DIR + "/" + self.corpus.id, options.fileExtensions);
          deferred.resolve(options);
        }, function(err) {
          options.findFilesMessage = err;
          deferred.reject(err);
        })
        .fail(function(err) {
          self.debug("Error cloning", err);
          deferred.reject(err);
        });
      return deferred.promise;
    }
  }
});

exports.GitImport = GitImport;
