var Import = require('../../api/import/Import').Import;
var fs = require('fs');

var specIsRunningTooLong = 5000;

describe("api/import/Import", function() {
  it("should load", function() {
    expect(Import).toBeDefined();
  });

  it("should be able to instantiate an object", function() {
    var importer = new Import();
    expect(importer).toBeDefined();
  });

});

describe("Batch Import: as a morphologist I want to import directories of text files for machine learning", function() {
  var corpus,
    importer,
    localUri = './sample_data/orthography.txt',
    remoteUri = 'https://raw.githubusercontent.com/OpenSourceFieldlinguistics/FieldDB/master/sample_data/orthography.txt';

  beforeEach(function() {
    corpus = {};
    importer = new Import({
      corpus: corpus
    });
  });

  it('should accept a read function and a read hook', function(done) {
    importer.addFileUri({
      uri: localUri,
      readOptions: {
        readFileFunction: function(callback) {
          fs.readFile(localUri, 'utf8', callback);
        }
      }
    }).then(function(result) {
      console.log('after add file', result);
      // expect(result).toBeDefined();
    }).then(done, done);
  }, specIsRunningTooLong);


  xit('should read a url if no a read function is defined', function(done) {
    importer.addFileUri({
      uri: remoteUri
    }).then(function(result) {
      console.log('after add file', result);
      expect(result).toBeDefined();
    }).then(done, done);
  }, specIsRunningTooLong);

  it('should provide a preprocess hook', function() {
    expect(importer.preprocess).toBeDefined();
  });

  it('should provide a import hook', function() {
    expect(importer.import).toBeDefined();
  });

  it('should process create a data list of imported documents', function() {
    expect(importer.datalist).toBeDefined();
  });

  it('should be able to import from a uri', function(done) {

    importer.addFileUri({
      uri: localUri,
      readOptions: {
        readFileFunction: function(callback) {
          fs.readFile(localUri, 'utf8', callback);
        }
      },
      preprocessOptions: {
        writePreprocessedFileFunction: function(filename, body, callback) {
          fs.writeFile(filename, body, 'utf8', callback);
        },
        transliterate: true,
        joinLines: true,
      },
      importOptions: {
        dryRun: true,
        fromPreprocessedFile: true
      },
      next: function() {
        console.log('Next middle ware placeholder');
      }
    }).then(function(result) {
      console.log('after add file', result);
      expect(result).toBeDefined();
    }).then(done, done);

  }, specIsRunningTooLong);

  describe('lib/Import', function() {

    it('should be able to pause an import', function() {
      var importer = new Import();
      expect(importer.pause).toBeDefined();
    });

    it('should be able to resume an import with minimal duplication of effort', function() {
      var importer = new Import();
      expect(importer.resume).toBeDefined();
    });

  });

});
describe("Batch Import: as a morphologist I want to import directories of text files for machine learning", function() {
  var importer;
  beforeEach(function() {
    importer = new Import();
  });

  it("should import raw text", function() {
    expect(importer).toBeDefined();
  });

});


describe("Import: as a morphologist I want to import my data from CSV", function() {
  it("should detect drag and drop", function() {
    expect(true).toBeTruthy();
  });

});

describe("Import: as a synctactician I want to import my data from Word/text examples on three lines", function() {

  it("should detect drag and drop", function() {
    expect(true).toBeTruthy();
  });

});

describe("Import: as a phonetican/Fieldlinguist/Anthropoligest I want to import my data in ELAN XML", function() {

  it("should detect drag and drop", function() {
    expect(true).toBeTruthy();
  });

});

describe("Import Template", function() {

  beforeEach(function() {
    // var d = document.createElement("div");
    // d.setAttribute("id", "status");
    // document.body.appendChild(d);
    // d.appendChild(this.view.render().el);
  });

  it("has more than one column", function() {
    expect(true).toBeTruthy();
  });

  it("has the filename as the title", function() {
    expect(true).toBeTruthy();
  });

});

// describe("Import routes", function() {
// beforeEach(function() {
// this.router = new ImportRouter;
// this.routeSpy = sinon.spy();
// try {
// Backbone.history.start({silent:true, pushState:true});
// } catch(e) {}
// this.router.navigate("elsewhere");
// });
//
// it("fires the index route with a blank hash", function() {
// this.router.bind("route:index", this.routeSpy);
// this.router.navigate("", true);
// expect(this.routeSpy).toHaveBeenCalledOnce();
// expect(this.routeSpy).toHaveBeenCalledWith();
// });
// });
