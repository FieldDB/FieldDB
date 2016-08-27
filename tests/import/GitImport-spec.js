/* globals FieldDB */

var GitImport;
var Participant;
var Corpus;
var fs;
try {
  if (FieldDB) {
    GitImport = FieldDB.GitImport;
    Participant = FieldDB.Participant;
    Corpus = FieldDB.Corpus;
  }
} catch (e) {}

GitImport = GitImport || require("./../../api/import/GitImport").GitImport;
Participant = Participant || require("./../../api/user/Participant").Participant;
Corpus = Corpus || require("./../../api/corpus/Corpus").Corpus;
fs = fs || require("fs");

var specIsRunningTooLong = 10 * 1000;
describe("api/import/GitImport", function() {

  describe("construction", function() {

    it("should load", function() {
      expect(GitImport).toBeDefined();
    });

    it("should be able to instantiate an object", function() {
      var importer = new GitImport({
        // debugMode: true
      });
      expect(importer).toBeDefined();
    });
  });

  describe("GitImport: as a computational linugist I want to import git repositories containing of text files for machine learning", function() {
    var corpus,
      importer

    var defaultOptions = {
      localUri: "./sample_data/orthography.txt",
      remoteUri: "https://github.com/expressjs/express.git",
      readOptions: {
        readFileFunction: function(options, callback) {
          importer.debug("calling fs.readFile");
          fs.readFile(options.localUri, "utf8", callback);
        }
      },
      fileExtensions: ['.js'],
      preprocessOptions: {
        writePreprocessedFileFunction: function(options, callback) {
          fs.writeFile(options.filename, options.body, "utf8", callback);
        },
        transliterate: true,
        joinLines: true,
      },
      importOptions: {
        dryRun: true,
        fromPreprocessedFile: true
      },
      next: function(options, callback) {
        importer.debug("Next middleware placeholder");
        if (typeof callback === "function") {
          callback(options);
        }
      }
    };

    beforeEach(function() {
      // var dbname = "testingbatchimport-git";
      corpus = new Corpus(Corpus.prototype.defaults);
      // corpus.dbname = dbname;
      corpus.language = {
        "ethnologueUrl": "",
        "wikipediaUrl": "",
        "iso": "",
        "locale": "",
        "englishName": "JavaScript",
        "nativeName": "",
        "alternateNames": "JS"
      };
      importer = new GitImport({
        // dbname: dbname,
        corpus: corpus
      });
    });

    it("should be able to import from a git repo", function(done) {
      importer.debugMode = true;
      importer.clone(defaultOptions)
        .then(function(result) {
          importer.debug("result of clone", result);
          expect(result.dbname).toEqual("express");
          return importer.findFiles(defaultOptions);
        })
        .then(function(result) {
          importer.debug("result of find files", result.fileTree);
          expect(result.findFilesMessage).toBeDefined();
          return importer.addFileUri(defaultOptions);
        })
        .then(function(result) {
          importer.debug("after add file", result);
          expect(result.fileTree).toBeDefined();
          expect(result).toBeDefined();
          expect(result.rawText).toBeDefined();

          done();
        }, done)
        .fail(done);

    }, specIsRunningTooLong);

  });

});
