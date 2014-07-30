var Import = require('./../../api/import/Import').Import;
var Corpus = require('./../../api/corpus/Corpus').Corpus;
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

  it("should be able to use a corpus", function() {
    var dbname = "testingcorpusinimport-firstcorpus";
    var corpus = new Corpus(Corpus.defaults);
    expect(corpus).toBeDefined();
    // console.log(corpus);
    expect(corpus.dbname).toBeDefined();


    var importer = new Import({
      corpus: corpus
    });
    expect(importer).toBeDefined();
  });

  it("should be able to ask the corpus to create a datum", function() {
    var dbname = "testingcorpusinimport-firstcorpus";
    var corpus = new Corpus(Corpus.defaults);
    corpus.dbname = dbname;
    var datum = corpus.newDatum();
    console.log(datum);
    expect(datum).toBeDefined();
  });


});

describe("Batch Import: as a morphologist I want to import directories of text files for machine learning", function() {
  var corpus,
    importer,
    localUri = './sample_data/orthography.txt',
    remoteUri = 'https://raw.githubusercontent.com/OpenSourceFieldlinguistics/FieldDB/master/sample_data/orthography.txt';

  var defaultOptions = {
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
    }
  };

  beforeEach(function() {
    var dbname = "testingbatchimport-rawtext"
    corpus = new Corpus(Corpus.defaults);
    corpus.dbname = dbname;
    corpus.language = {
      "ethnologueUrl": "",
      "wikipediaUrl": "",
      "iso": "ka",
      "locale": "",
      "englishName": "",
      "nativeName": "",
      "alternateNames": ""
    };
    importer = new Import({
      dbname: dbname,
      corpus: corpus
    });
  });

  it('should accept a read function and a read hook', function(done) {
    importer
      .readUri(defaultOptions)
      .then(function(result) {
        console.log('after read file', result);
        expect(result).toBeDefined();
        expect(result.rawText.substring(0, 20)).toEqual('Noqata qan qaparinay');
      })
      .then(done, done);
  }, specIsRunningTooLong);


  xit('should read a uri if no a read function is defined', function(done) {
    importer
      .readUri({
        uri: remoteUri
      })
      .then(function(result) {
        console.log('after read file', result);
        expect(result.datum.datumFields.orthography).toBeDefined();
      }).then(done, done);
  }, specIsRunningTooLong);

  it('should provide a preprocess hook', function(done) {
    expect(importer.preprocess).toBeDefined();
    defaultOptions.rawText = "placeholder text ";
    importer
      .preprocess(defaultOptions)
      .then(function(result) {
        console.log('after preprocess file');
        expect(result.datum.datumFields.utterance).toBeDefined();
        expect(result.preprocessedUrl).toEqual('./sample_data/orthography_preprocessed.json');

        if (result.datum.datumFields.orthography.value !== result.rawText.trim()) {
          expect(result.datum.datumFields.originalText.value)
            .toEqual(result.rawText.trim());
        } else {
          expect(result.datum.datumFields.orthography.value)
            .toEqual(result.rawText.trim());
        }
      })
      .then(done, done);

  }, specIsRunningTooLong);

  it('should provide a import hook', function() {
    expect(importer.import).toBeDefined();
  });

  it('should process create a data list of imported documents', function() {
    expect(importer.datalist).toBeDefined();
  });

  xit('should be able to import from a uri', function(done) {

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
      expect(result.rawText).toBeDefined();
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
xdescribe("Batch Import: as a morphologist I want to import directories of text files for machine learning", function() {
  var importer;
  beforeEach(function() {
    importer = new Import();
  });

  it("should import raw text", function() {
    expect(importer).toBeDefined();
  });

});


describe("Import: as a psycholinguist I want to import a list of participants from CSV", function() {
  it("should error if a options are not passed in", function(done) {
    var importer = new Import();

    importer.readFileIntoRawText().then(function(success) {
      console.log(success);
      expect(false).toBeTruthy();
    }, function(options) {
      console.log(options);
      expect(options.error).toEqual('Options must be defined for readFileIntoRawText');
    }).then(done, done);

  }, specIsRunningTooLong);

  it("should error if a file is not passed in", function(done) {
    var importer = new Import();

    importer.readFileIntoRawText({}).then(function(success) {
      console.log(success);
      expect(false).toBeTruthy();
    }, function(options) {
      console.log(options);
      expect(options.error).toEqual('Options: file must be defined for readFileIntoRawText');
    }).then(done, done);

  }, specIsRunningTooLong);

  it("should process csv participants", function() {
    var importer = new Import({
      rawText: fs.readFileSync('sample_data/students.csv', 'utf8')
    });

    importer.importCSV(importer.rawText, importer);
    expect(importer.extractedHeader).toEqual(['studentid', 'coursenumber', 'firstname', 'lastname', 'dateofbirth']);
    expect(importer.asCSV).toEqual([
      ['StudentID', 'CourseNumber', 'FirstName', 'LastName', 'DateOfBirth'],
      ['13245654', '210', 'Damiane', 'Alexandre', '2010-02-02'],
      ['13245655', '210', 'Ariane', 'Ardouin', '2010-02-01'],
      ['13245656', '210', 'Michel', 'Barbot', '2010-04-22'],
      ['13245657', '210', 'Abeau', 'Burban', '2010-04-24'],
      ['13245658', '210', 'Marylene', 'Collomb', '2010-01-14'],
      ['13245659', '210', 'Mathea', 'Cotton', '2009-12-15'],
      ['13245660', '210', 'Jade', 'Dray', '2010-06-10'],
      ['13245661', '211', 'Etienne', 'Gaborit', '2010-05-11'],
      ['13245662', '211', 'Emilien', 'Grosset', '2010-05-10'],
      ['13245663', '211', 'Adrienne', 'Hainaut', '2010-07-29'],
      ['13245664', '211', 'Humbert', 'Henin', '2010-07-31'],
      ['13245665', '211', 'Renate', 'Lafargue', '2010-04-22'],
      ['13245666', '211', 'Jean-Joël', 'Lalande', '2010-03-23'],
      ['13245667', '211', 'Lothaire', 'Le Blanc', '2010-03-22'],
      ['13245668', '211', 'Benedicte', 'Le Breton', '2010-06-10'],
      ['']
    ]);

  });


  xit("should read a file when in a browser", function(done) {
    var importer = new Import();

    importer.readFileIntoRawText({
      file: {
        "webkitRelativePath": "",
        "lastModifiedDate": "2014-07-29T21:38:44.000Z",
        "name": "students.csv",
        "type": "text/csv",
        "size": 651
      }
    }).then(function(success) {
      console.log(success);
      expect(false).toBeTruthy();
    }, function(options) {
      console.log(options);
      expect(options.error).toEqual('Options: file must be defined for readFileIntoRawText');
    }).then(done, done);

  }, specIsRunningTooLong);

});

xdescribe("Import: as a morphologist I want to import my data from CSV", function() {
  it("should detect drag and drop", function() {
    expect(true).toBeTruthy();
  });

});

xdescribe("Import: as a synctactician I want to import my data from Word/text examples on three lines", function() {

  it("should detect drag and drop", function() {
    expect(true).toBeTruthy();
  });

});

xdescribe("Import: as a phonetican/Fieldlinguist/Anthropoligest I want to import my data in ELAN XML", function() {

  it("should detect drag and drop", function() {
    expect(true).toBeTruthy();
  });

});

xdescribe("Import Template", function() {

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
