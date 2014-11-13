var Import = require("./../../api/import/Import").Import;
var Corpus = require("./../../api/corpus/Corpus").Corpus;
var Q = require("q");
var fs = require("fs");

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
    var corpus = new Corpus(Corpus.prototype.defaults);
    expect(corpus).toBeDefined();
    corpus.debug(corpus);
    expect(corpus.dbname).toBeDefined();


    var importer = new Import({
      corpus: corpus
    });
    expect(importer).toBeDefined();
  });

  it("should be able to ask the corpus to create a datum", function() {
    var dbname = "testingcorpusinimport-firstcorpus";
    var corpus = new Corpus(Corpus.prototype.defaults);
    corpus.dbname = dbname;
    var datum = corpus.newDatum();
    corpus.debug(datum);
    expect(datum).toBeDefined();
  });


});

describe("Batch Import: as a morphologist I want to import directories of text files for machine learning", function() {
  var corpus,
    importer,
    localUri = "./sample_data/orthography.txt",
    remoteUri = "https://raw.githubusercontent.com/OpenSourceFieldlinguistics/FieldDB/master/sample_data/orthography.txt";

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
    var dbname = "testingbatchimport-rawtext";
    corpus = new Corpus(Corpus.prototype.defaults);
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

  it("should accept a read function and a read hook", function(done) {
    importer
      .readUri(defaultOptions)
      .then(function(result) {
        importer.debug("after read file", result);
        expect(result).toBeDefined();
        expect(result.rawText.substring(0, 20)).toEqual("Noqata qan qaparinay");
      })
      .then(done, done);
  }, specIsRunningTooLong);


  xit("should read a uri if no a read function is defined", function(done) {
    importer
      .readUri({
        uri: remoteUri
      })
      .then(function(result) {
        importer.debug("after read file", result);
        expect(result.datum.datumFields.orthography).toBeDefined();
      }).then(done, done);
  }, specIsRunningTooLong);

  it("should provide a preprocess hook", function(done) {
    expect(importer.preprocess).toBeDefined();
    defaultOptions.rawText = "placeholder text ";
    importer
      .preprocess(defaultOptions)
      .then(function(result) {
        importer.debug("after preprocess file");
        expect(result.datum.datumFields.utterance).toBeDefined();
        expect(result.preprocessedUrl).toEqual("./sample_data/orthography_preprocessed.json");

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

  it("should provide a import hook", function() {
    expect(importer.import).toBeDefined();
  });

  it("should process create a data list of imported documents", function() {
    expect(importer.datalist).toBeDefined();
  });

  xit("should be able to import from a uri", function(done) {

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
        importer.debug("Next middle ware placeholder");
      }
    }).then(function(result) {
      importer.debug("after add file", result);
      expect(result.rawText).toBeDefined();
    }).then(done, done);

  }, specIsRunningTooLong);

  xdescribe("lib/Import", function() {

    it("should be able to pause an import", function() {
      var importer = new Import();
      expect(importer.pause).toBeDefined();
    });

    it("should be able to resume an import with minimal duplication of effort", function() {
      var importer = new Import();
      expect(importer.resume).toBeDefined();
    });

  });

});
describe("Batch Import: as a Field Methods instructor or psycholinguistics experiment administrator I want to import a class list of users/informants/participants", function() {
  var importer;
  beforeEach(function() {
    importer = new Import({
      files: [{
        name: "sample_data/students.csv"
      }, {
        name: "sample_data/students2.csv"
      }],
      rawText: ""
    });
  });

  it("should read multiple files using an optionally injected read function", function(done) {
    expect(importer).toBeDefined();
    importer.readFiles({
      readOptions: {
        readFileFunction: function(options) {
          importer.debug("Reading file", options);
          var thisFileDeferred = Q.defer();
          Q.nextTick(function() {
            fs.readFile(options.file, {
              encoding: "utf8"
            }, function(err, data) {
              importer.debug("Finished reading this file", err, data);
              if (err) {
                thisFileDeferred.reject(err);
              } else {
                importer.debug("options", options);
                options.rawText = data;
                importer.rawText = importer.rawText + data;
                thisFileDeferred.resolve(options);
              }
            });
          });
          return thisFileDeferred.promise;
        }
      }
    }).then(function(success) {
      importer.debug("success", success);

      expect(importer.status).toEqual("undefined; sample_data/students.csv n/a -  bytes, last modified: n/a; sample_data/students2.csv n/a -  bytes, last modified: n/a");
      expect(importer.fileDetails).toEqual([{
        name: "sample_data/students.csv"
      }, {
        name: "sample_data/students2.csv"
      }]);

      // Ensure that the files are truely read by counting the length and the number of commas
      expect(importer.rawText.length).toEqual(1006);
      expect(importer.rawText.match(/,/g).length).toEqual(88);

    }, function(options) {
      expect(options).toEqual("It should not error");
    }).then(done, done);
  }, specIsRunningTooLong);

});


describe("Import: as a psycholinguist I want to import a list of participants from CSV", function() {
  it("should error if a options are not passed in", function(done) {
    var importer = new Import();

    importer.readFileIntoRawText().then(function(success) {
      importer.debug(success);
      expect(false).toBeTruthy();
    }, function(options) {
      importer.debug(options);
      expect(options.error).toEqual("Options must be defined for readFileIntoRawText");
    }).then(done, done);

  }, specIsRunningTooLong);

  it("should error if a file is not passed in", function(done) {
    var importer = new Import();

    importer.readFileIntoRawText({}).then(function(success) {
      importer.debug(success);
      expect(false).toBeTruthy();
    }, function(options) {
      importer.debug(options);
      expect(options.error).toEqual("Options: file must be defined for readFileIntoRawText");
    }).then(done, done);

  }, specIsRunningTooLong);

  it("should process csv participants", function(done) {
    var dbname = "testingcorpusinimport-firstcorpus";
    var corpus = new Corpus(Corpus.prototype.defaults_psycholinguistics);
    corpus.dbname = dbname;

    var importer = new Import({
      corpus: corpus,
      rawText: fs.readFileSync("sample_data/students.csv", "utf8"),
      importType: "participants"
    });

    // Step 1: import CSV
    importer.importCSV(importer.rawText, importer);
    expect(importer.extractedHeader).toEqual(["Code Permanent", "N° section", "Prénom", "Nom de famille", "Date de naissance"]);
    expect(importer.asCSV.length).toEqual(17);
    expect(importer.showImportSecondStep).toBeTruthy();

    // Step 2: build participants
    // importer.debugMode = true;
    importer.convertTableIntoDataList().then(function(results) {
      var headers = importer.discoveredHeaders;
      expect(headers[0].id).toEqual("anonymousCode");
      expect(headers[1].id).toEqual("courseNumber");
      expect(headers[2].id).toEqual("firstname");
      expect(headers[3].id).toEqual("lastname");
      expect(headers[4].id).toEqual("dateOfBirth");

      importer.documentCollection._collection[1].fields.decryptedMode = true;
      expect(importer.documentCollection._collection[1].fields.firstname.value).toEqual("Damiane");
      expect(importer.documentCollection._collection[1].fields.firstname.mask).toEqual("xxxxxxx");

      importer.documentCollection._collection[2].fields.decryptedMode = true;
      expect(importer.documentCollection._collection[2].fields.firstname.value).toEqual("Ariane");
      expect(importer.documentCollection._collection[2].fields.firstname.mask).toEqual("xxxxxx");

      importer.documentCollection._collection[3].fields.decryptedMode = true;
      expect(importer.documentCollection._collection[3].fields.firstname.value).toEqual("Michel");
      expect(importer.documentCollection._collection[3].fields.firstname.mask).toEqual("xxxxxx");

      expect(importer.progress.total).toEqual(17);
      expect(importer.progress.completed).toEqual(17);

      expect(results.length).toEqual(16);

      expect(importer.datalist).toBeDefined();
      expect(importer.datalist.title).toEqual("Import Data");
      expect(importer.datalist.description).toEqual("This is the data list which results from the import of the text typed/pasted in the import text area.");
      expect(importer.datalist.docs.length).toEqual(16);
      expect(importer.showImportThirdStep).toBeTruthy();

    }).then(done, done);

    // console.log(JSON.stringify(importer.importFields, null, 2));
  }, specIsRunningTooLong);


  it("should process csv participants which were created in a French edition of Microsoft Excel", function(done) {
    var dbname = "testingcorpusinimport-firstcorpus";
    var corpus = new Corpus(Corpus.prototype.defaults_psycholinguistics);
    corpus.dbname = dbname;

    var importer = new Import({
      corpus: corpus,
      rawText: fs.readFileSync("sample_data/students_point_vergule_msexcelfr.csv", "utf8"),
      importType: "participants"
    });

    // Step 1: import CSV
    importer.importCSV(importer.rawText, importer);
    expect(importer.extractedHeader).toEqual(["Code Permanent", "N° section", "Prénom", "Nom de famille", "Date de naissance"]);
    expect(importer.asCSV.length).toEqual(7);
    expect(importer.showImportSecondStep).toBeTruthy();

    // Step 2: build participants
    // importer.debugMode = true;
    importer.convertTableIntoDataList().then(function(results) {
      importer.discoveredHeaders;

      importer.documentCollection._collection[2].fields.decryptedMode = true;
      expect(importer.documentCollection._collection[2].fields.firstname.value).toEqual("Amelie");
      expect(importer.documentCollection._collection[2].fields.firstname.mask).toEqual("xxxxxx");

      expect(results.length).toEqual(6);

    }).then(done, done);

    // console.log(JSON.stringify(importer.importFields, null, 2));
  }, specIsRunningTooLong);


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
      importer.debug(success);
      expect(false).toBeTruthy();
    }, function(options) {
      importer.debug(options);
      expect(options.error).toEqual("Options: file must be defined for readFileIntoRawText");
    }).then(done, done);

  }, specIsRunningTooLong);

});

describe("Import: as a morphologist I want to import my data from CSV", function() {
  var importer;
  beforeEach(function() {
    var dbname = "testingcorpusinimport-firstcorpus";
    var corpus = new Corpus(Corpus.prototype.defaults);
    corpus.dbname = dbname;

    importer = new Import({
      corpus: corpus,
      files: [{
        name: "sample_data/sample_filemaker.csv"
      }, {
        name: "sample_data/sample_filemaker.csv"
      }],
      rawText: ""
    });
  });

  it("should read IGT files and convert them into a table", function(done) {
    expect(importer).toBeDefined();
    importer.readFiles({
      readOptions: {
        readFileFunction: function(options) {
          importer.debug("Reading file", options);
          var thisFileDeferred = Q.defer();
          Q.nextTick(function() {
            fs.readFile(options.file, {
              encoding: "utf8"
            }, function(err, data) {
              importer.debug("Finished reading this file", err, data);
              if (err) {
                thisFileDeferred.reject(err);
              } else {
                importer.debug("options", options);
                options.rawText = data;
                importer.rawText = importer.rawText + data;
                thisFileDeferred.resolve(options);
              }
            });
          });
          return thisFileDeferred.promise;
        }
      }
    }).then(function(success) {
      importer.debug("success", success);

      expect(importer.status).toEqual("undefined; sample_data/sample_filemaker.csv n/a -  bytes, last modified: n/a; sample_data/sample_filemaker.csv n/a -  bytes, last modified: n/a");
      expect(importer.fileDetails).toEqual([{
        name: "sample_data/sample_filemaker.csv"
      }, {
        name: "sample_data/sample_filemaker.csv"
      }]);

      // Ensure that the files are truely read by counting the length and the number of commas
      expect(importer.rawText.length).toEqual(25324);
      expect(importer.rawText.match(/,/g).length).toEqual(1330);

      // Ensure the data is read into CSV format
      importer.guessFormatAndPreviewImport();
      expect(importer.asCSV.length).toEqual(147);
      expect(importer.asCSV[4]).toEqual(["5/7/2010", "*Payta suwanayan monikita", "Pay-ta suwa-naya-n moniki-ta", "he-ACC steal.naya.3SG little animal-ACC", "He feels like stealing the little animal", "", "", "Impulsative", "Seberina", "Cusco Quechua"]);

      // Build data
      expect(importer.extractedHeader).toEqual(["Date Elicited", "utterance", "morphemes", "gloss", "translation", "comments", "", "tags", "CheckedWithConsultant", "source/publication", "a.field-with*dangerous characters (for import)"]);
      importer.convertTableIntoDataList().then(function() {
        var headers = importer.discoveredHeaders;
        importer.debug(JSON.stringify(headers));
        expect(headers[0].id).toEqual("dateElicited");
        expect(headers[8].id).toEqual("validationStatus");
        expect(headers[9].id).toEqual("sourcePublication");
        expect(headers[10].id).toEqual("aFieldWithDangerousCharactersForImport");
        //TODO finish IGT import later

      });


    }, function(options) {
      expect(options).toEqual("It should not error");
    }).then(done, done);
  }, specIsRunningTooLong);


});


describe("Import: as a synctactician I want to import my data from Word/text examples on three lines", function() {

  var importer;
  beforeEach(function() {
    importer = new Import();
    importer.rawText =
      "Noqata qan qaparinaywanki.\n" +
      "Noqa-ta qan qapari-nay-wanki\n" +
      "me-ACC you-NOM yell-DES-2SG.1OM\n" +
      "`I feel like yelling at you, I feel like yelling at all of you.’\n" +
    importer.guessFormatAndPreviewImport();
  });

  it("should detect handout style data", function() {
    expect(importer.importTypeConfidenceMeasures.mostLikely.id).toEqual("handout");
  });

});

describe("Import: as a phonetican/Fieldlinguist/Anthropoligest I want to import my data in ELAN XML", function() {

  var importer;
  beforeEach(function() {
    importer = new Import();
    importer.rawText =
      "<ANNOTATION_DOCUMENT AUTHOR=\"\" DATE=\"2012-05-13T20:23:00-08:00\" FORMAT=\"2.7\" VERSION=\"2.7\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:noNamespaceSchemaLocation=\"http://www.mpi.nl/tools/elan/EAFv2.7.xsd\">\n"+
      "<ANNOTATION>\n" +
      "      <ALIGNABLE_ANNOTATION ANNOTATION_ID=\"a48\" TIME_SLOT_REF1=\"ts49\" TIME_SLOT_REF2=\"ts50\">\n" +
      "          <ANNOTATION_VALUE></ANNOTATION_VALUE>\n" +
      "      </ALIGNABLE_ANNOTATION>\n" +
      "  </ANNOTATION>\n" +
      "  <ANNOTATION>\n" +
      "      <ALIGNABLE_ANNOTATION ANNOTATION_ID=\"a49\" TIME_SLOT_REF1=\"ts51\" TIME_SLOT_REF2=\"ts52\">\n" +
      "          <ANNOTATION_VALUE></ANNOTATION_VALUE>\n" +
      "      </ALIGNABLE_ANNOTATION>\n" +
      "  </ANNOTATION>";
    importer.guessFormatAndPreviewImport();
  });

  it("should detect elan style data", function() {
    expect(importer.importTypeConfidenceMeasures.mostLikely.id).toEqual("elanXML");
  });
});

describe("Import: as a documentry linguist I want to import my data from SIL Toolbox", function() {
  var importer;
  beforeEach(function() {
    importer = new Import();
    importer.rawText =
      "\\ge appear before him/her; apparent\n" +
      "to him/her\n" +
      "\\egads_uid x002176\n" +
      "\\status done sent 3-4-09\n" +
      "\\Root tee1";
    importer.guessFormatAndPreviewImport();
  });

  //http://search.cpan.org/~sburke/Text-Shoebox-1.02/lib/Text/Shoebox/Entry.pm
  it("should detect toolbox style data", function() {
    expect(importer.importTypeConfidenceMeasures.mostLikely.id).toEqual("toolbox");
  });

});

xdescribe("Import: as a child language investigator I want to import my data from CHILDES chat format", function() {

  it("should detect chat style data", function() {
    expect(true).toBeTruthy();
  });

});

describe("Import: as a phonetican I want to import my data in Praat TextGrid ", function() {
  var importer;
  beforeEach(function() {
    importer = new Import();
    importer.rawText =
      "File type = \"ooTextFile\"\n"+
      "Object class = \"TextGrid\"\n"+
      "\n"+
      "xmin = 0 \n"+
      "xmax = 2.2413151927437642 \n"+
      "tiers? <exists> \n"+
      "size = 6 \n"+
      "item []: \n"+
      "    item [1]:\n"+
      "        class = \"IntervalTier\" \n"+
      "        name = \"phones\" \n"+
      "        xmin = 0 \n"+
      "        xmax = 2.2413151927437642 \n"+
      "        intervals: size = 19 \n"+
      "         intervals [112]\n"+
      "                xmin = 185.0\n"+
      "                xmax = 186.23\n"+
      "                text = \"maxtyota' añ  kartera che'\"\n"+
      "            intervals [113]\n"+
      "                xmin = 186.23\n"+
      "                xmax = 186.58\n"+
      "                text = \"\"\n"+
      "            intervals [114]\n"+
      "                xmin = 186.58\n"+
      "                xmax = 188.3\n"+
      "                text = \"puru tyi bijta' mi xiñob che'\"";
    importer.guessFormatAndPreviewImport();
  });

  it("should detect praat textgrid data", function() {
    expect(importer.importTypeConfidenceMeasures.mostLikely.id).toEqual("praatTextgrid");
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
