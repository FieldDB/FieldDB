/* globals FieldDB */

var GitImport;
var Participant;
var Corpus;
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


var specIsRunningTooLong = 5000;
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

  describe("Git GitImport: as a computational linugist I want to import git repositories containing of text files for machine learning", function() {
    var corpus,
      importer,
      localUri = "./sample_data/orthography.txt",
      remoteUri = "https://raw.githubusercontent.com/FieldDB/FieldDB/master/sample_data/orthography.txt";

    var defaultOptions = {
      uri: localUri,
      readOptions: {
        readFileFunction: function(callback) {
          fs.readFile(localUri, "utf8", callback);
        }
      },
      preprocessOptions: {
        writePreprocessedFileFunction: function(filename, body, callback) {
          fs.writeFile(filename, body, "utf8", callback);
        },
        transliterate: true,
        joinLines: true,
      },
      importOptions: {
        dryRun: true,
        fromPreprocessedFile: true
      }
    };

    beforeEach(function() {
      var dbname = "testingbatchimport-git";
      corpus = new Corpus(Corpus.prototype.defaults);
      corpus.dbname = dbname;
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
        dbname: dbname,
        corpus: corpus
      });
    });

    it("should be able to import from a uri", function(done) {
      importer.debugMode = true;
      importer.addFileUri({
        uri: localUri,
        readOptions: {
          readFileFunction: function(callback) {
            fs.readFile(localUri, "utf8", callback);
          }
        },
        preprocessOptions: {
          writePreprocessedFileFunction: function(filename, body, callback) {
            fs.writeFile(filename, body, "utf8", callback);
          },
          transliterate: true,
          joinLines: true,
        },
        importOptions: {
          dryRun: true,
          fromPreprocessedFile: true
        },
        next: function() {
          importer.debug("Next middleware placeholder");
        }
      })
      .then(function(result) {
        importer.debug("after add file", result);
        expect(result).toBeDefined();
        expect(result.rawText).toBeDefined();
      })
      .then(done, done)
      .fail(done);

    }, specIsRunningTooLong);

  });

});
