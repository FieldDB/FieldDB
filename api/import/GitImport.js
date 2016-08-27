"use strict";

var Import = require("./import").Import;
var shellPromise = require("./../shellPromise");
var Q = require("q");
var directoryTree = require('directory-tree');

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
      var cdCommand = "mkdir -p " + GitImport.IMPORT_DIR + "; cd " + GitImport.IMPORT_DIR + "; ";
      var cloneCommand = "git clone " + options.remoteUri;

      self.debug("executing " + cdCommand + cloneCommand);
      shellPromise.execute(cdCommand + cloneCommand)
        .then(function(result) {
          self.debug("result", result);

          // TODO add a .fielddb.json file with metadata
          options.dbname = options.remoteUri.substring(options.remoteUri.lastIndexOf("/") + 1).replace(".git", "");
          options.cloneMessage = result;
          deferred.resolve(options);
        }, function(err) {
          if (err.indexOf("already exists and is not an empty directory") > -1) {
            options.cloneMessage = err;
            options.dbname = options.remoteUri.substring(options.remoteUri.lastIndexOf("/") + 1).replace(".git", "");
            return deferred.resolve(options);
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
      var treeCommand = "tree -f " + GitImport.IMPORT_DIR + "/" + options.dbname + " | egrep \"(" + options.fileExtensions.join("$|").replace(/\./,"\\.") + "$)\"";

      self.debug("executing " + treeCommand);
      shellPromise.execute(treeCommand)
        .then(function(result) {
          self.debug("result", result);
          options.findFilesMessage = result;
          options.fileList = result.trim().split("\n").map(function(filePath) {
            return filePath.replace(new RegExp(".*" + options.dbname + "/"), "");
          });
          options.fileTree = directoryTree(GitImport.IMPORT_DIR + "/" + options.dbname, options.fileExtensions);
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
