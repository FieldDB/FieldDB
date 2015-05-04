"use strict";
var Datum;
try {
  /* globals FieldDB */
  if (FieldDB) {
    Datum = FieldDB.Datum;
  }
} catch (e) {}

Datum = Datum || require("./../../api/datum/Datum").Datum;

var sample_1_22_datum = require("./../../sample_data/datum_v1.22.1.json");
var SAMPLE_CORPUS = require("./../../api/corpus/corpus.json");

describe("Test Datum", function() {
  it("should load", function() {
    expect(Datum).toBeDefined();

    var datum = new Datum();
    expect(datum).toBeDefined();
    expect(datum.fields).toBeUndefined();
  });

  describe("popular fields", function() {
    var datum = new Datum({
      fields: JSON.parse(JSON.stringify(SAMPLE_CORPUS.datumFields)),
      session: {
        fields: JSON.parse(JSON.stringify(SAMPLE_CORPUS.sessionFields))
      }
    });

    it("should get the fields from the corpus", function() {
      expect(datum.fields.length).toEqual(16);
    });

    it("should set the utterance", function() {
      datum.fields.utterance.value = "Noqata";
      expect(datum.fields.utterance.value).toEqual("Noqata");
      expect(datum.fields.utterance.json).toEqual({
        writingSystem: {
          id: "",
          referenceLink: ""
        }
      });
    });

    it("should have a morphemes line ", function() {
      datum.fields.morphemes.value = "noqa-ta";
      expect(datum.fields.morphemes.value).toEqual("noqa-ta");
      expect(datum.fields.morphemes.json).toEqual({
        alternates: []
      });
    });

    it("should have a gloss line ", function() {
      datum.fields.gloss.value = "I-ACC";
      expect(datum.fields.gloss.value).toEqual("I-ACC");
      expect(datum.fields.gloss.json).toEqual({
        language: "",
        alternates: [],
        conventions: {
          id: "",
          tagSet: [],
          referenceLink: ""
        }
      });
    });

    it("should have a translation line ", function() {
      datum.fields.translation.value = "I";
      expect(datum.fields.translation.value).toEqual("I");
      expect(datum.fields.translation.json).toEqual({
        writingSystem: {
          id: "",
          referenceLink: ""
        },
        language: {
          ethnologueUrl: "",
          wikipediaUrl: "",
          iso: "",
          locale: "",
          englishName: "",
          nativeName: "",
          alternateNames: ""
        }
      });
    });

    it("should have grammatical judgement", function() {
      datum.fields.judgement.value = "*";
      expect(datum.fields.judgement.value).toEqual("*");
      expect(datum.fields.judgement.json).toEqual({
        "grammatical": true
      });
    });

    it("should have open ended tags", function() {
      datum.fields.tags.value = "Causative";
      expect(datum.fields.tags.value).toEqual("Causative");
      expect(datum.fields.tags.json).toEqual({
        tags: []
      });
    });

    it("should have a validation status of who checked the data", function() {
      datum.fields.validationStatus.value = "CheckedByPhylis, ToBeCheckedWithRejean";
      expect(datum.fields.validationStatus.value).toEqual("CheckedByPhylis, ToBeCheckedWithRejean");
      expect(datum.fields.validationStatus.json).toEqual({
        tags: []
      });
    });


  });



  describe("IGT support", function() {
    var datum;
    beforeEach(function() {
      datum = new Datum({
        fields: JSON.parse(JSON.stringify(SAMPLE_CORPUS.datumFields))
      });
    });

    it("should represent IGT data in tuples and parallel text", function() {
      datum.fields.orthography.value = "puppies";
      datum.fields.utterance.value = "pʌpiz";
      datum.fields.morphemes.value = "pʌpi-z";
      datum.fields.allomorphs.value = "pʌpi-z";
      datum.fields.gloss.value = "puppy-pl";

      datum.fields.translation.value = "Des chiens";

      // datum.debugMode = true;
      expect(datum.igt).toEqual({
        tuples: [{
          orthography: "puppies",
          utterance: "pʌpiz",
          allomorphs: "pʌpi-z",
          morphemes: "pʌpi-z",
          gloss: "puppy-pl",
          syntacticCategory: ""
        }],
        parallelText: {
          orthography: "puppies",
          utterance: "pʌpiz",
          translation: "Des chiens"
        }
      });
    });


    it("should tollerate slightly unaligned IGT data", function() {
      // datum.fields.orthography.value = "this field has many words";
      datum.fields.utterance.value = "this field has many words";
      datum.fields.morphemes.value = "this field has fewer";
      // datum.fields.allomorphs.value = "this field has many words";
      datum.fields.gloss.value = "this field has many words";

      datum.fields.translation.value = "totally different word count but its okay";

      // datum.debugMode = true;
      var igt = datum.igt;

      expect(igt.tuples[4]).toEqual({
        orthography: "",
        utterance: "words",
        allomorphs: "",
        morphemes: "",
        gloss: "words",
        syntacticCategory: ""
      });
    });


    it("should non-lossily tollerate drastically unaligned IGT data", function() {
      // datum.fields.orthography.value = "this field has many words";
      datum.fields.utterance.value = "this field has fewer";
      datum.fields.morphemes.value = "this field has many more segmentations than the utterance line and will dictate the length of the tuples so they are non-lossy";
      // datum.fields.allomorphs.value = "this field has many words";
      datum.fields.gloss.value = "this field has many words";

      datum.fields.translation.value = "totally different word count but its okay";

      // datum.debugMode = true;
      var igt = datum.igt;

      expect(igt.tuples[igt.tuples.length - 1]).toEqual({
        orthography: "",
        utterance: "",
        allomorphs: "",
        morphemes: "non-lossy",
        gloss: "",
        syntacticCategory: ""
      });
    });


    it("should tollerate abnormal/irregular whitespacing", function() {
      datum.fields.orthography.value = "this\tline\tis\t\"tabbed\"";
      datum.fields.utterance.value = "this line is spaced";
      datum.fields.morphemes.value = " this\t\tline is\na-combo";
      datum.fields.allomorphs.value = "this\nline\n\nis\nline-breaked";
      datum.fields.gloss.value = "this line (has punctuation)";

      datum.fields.translation.value = "Des chiens";

      var igt = datum.igt;
      // datum.debugMode = true;
      expect(igt.tuples[igt.tuples.length - 1]).toEqual({
        orthography: "\"tabbed\"",
        utterance: "spaced",
        allomorphs: "line-breaked",
        morphemes: "a-combo",
        gloss: "punctuation)",
        syntacticCategory: ""
      });
    });

  });

  describe("Primary data support", function() {

    it("should support any sort of file", function() {
      var datum = new Datum({
        fields: []
      });
      datum.addFile({
        "size": 1567249,
        "name": "Peace_Corps_Thailand_Green_Book.apkg",
        "type": "application/octet-stream",
        "mtime": "2015-04-03T04:56:27.267Z",
        "fileBaseName": "Peace_Corps_Thailand_Green_Book",
        "praatAudioExtension": ".mp3",
        "script": "Syllables",
        "dbname": "testingspreadsheet-firstcorpus",
        "checksum": "35c4b5ed8c78e8458b0bf595fabddb91770767bc",
        "uploadInfo": "new",
        "resultInfo": "File does not contain any audio stream",
        "resultStatus": 422,
        "textGridStatus": 422,
        "textGridInfo": "File “Peace_Corps_Thailand_Green_Book.apkg” contains no audio data. You can import any audio/video file which contains an audio track. Are you sure this file has an audio track?",
        "serviceVersion": "2.49.29",
        "filename": "Peace_Corps_Thailand_Green_Book.apkg",
        "URL": "https://localhost:3184/testingspreadsheet-firstcorpus/Peace_Corps_Thailand_Green_Book.apkg",
        "description": "File from import"
      });
      expect(datum.relatedData).toBeDefined();
      expect(datum.relatedData.length).toEqual(1);
      expect(datum.relatedData[0].filename).toEqual("Peace_Corps_Thailand_Green_Book.apkg");
    });

    it("should play any sort of audio", function() {
      var datum = new Datum();
      datum.addFile({
        "fieldDBtype": "AudioVideo",
        "size": 44203,
        "name": "iremi_tsxpvrobs_chrdiloetshi.mp3",
        "mtime": "2014-12-13T10:25:05.852Z",
        "fileBaseName": "iremi_tsxpvrobs_chrdiloetshi",
        "praatAudioExtension": ".mp3",
        "script": "Syllables",
        "dbname": "testingspreadsheet-firstcorpus",
        "checksum": "74428324536648e63321efac20a719f2a13d3a2b",
        "uploadInfo": "different",
        "uploadStatus": 304,
        "resultStatus": 304,
        "resultInfo": "different",
        "syllablesAndUtterances": {
          "fileBaseName": "iremi_tsxpvrobs_chrdiloetshi",
          "syllableCount": "7",
          "pauseCount": "0",
          "totalDuration": "2.74",
          "speakingTotalDuration": "2.74",
          "speakingRate": "2.55",
          "articulationRate": "2.55",
          "averageSylableDuration": "0.392",
          "scriptVersion": "v1.102.2",
          "minimum_duration": 0.6,
          "maximum_intensity": 59,
          "minimum_pitch": 100,
          "time_step": 0,
          "window_size": 20,
          "margin": 0.1
        },
        "textGridInfo": "regenerated",
        "textGridStatus": 200,
        "webResultStatus": 304,
        "webResultInfo": "matches",
        "serviceVersion": "v2.2.0",
        "textgrid": "File type = \"ooTextFile\"\nObject class = \"TextGrid\"\n\nxmin = 0 \nxmax = 2.7406349206349208 \ntiers? <exists> \nsize = 1 \nitem []: \n    item [1]:\n        class = \"IntervalTier\" \n        name = \"silences\" \n        xmin = 0 \n        xmax = 2.7406349206349208 \n        intervals: size = 1 \n        intervals [1]:\n            xmin = 0 \n            xmax = 2.7406349206349208 \n            text = \"utterance\" \n",
        "description": " Downloaded Praat TextGrid which contained a count of roughly 7 syllables and auto detected utterances for iremi_tsxpvrobs_chrdiloetshi The utterances were not automatically transcribed for you, you can either save the textgrid and transcribe them using Praat, or continue to import them and transcribe them after.",
        "filename": "iremi_tsxpvrobs_chrdiloetshi.mp3",
        "URL": "https://localhost:3184/testingspreadsheet-firstcorpus/iremi_tsxpvrobs_chrdiloetshi.mp3",
        "version": "v2.32.0",
        "type": "audio/mpeg",
        "pouchname": "testingspreadsheet-firstcorpus",
        "api": "speech"
      });
      expect(datum.audioVideo).toBeDefined();
      expect(datum.audioVideo.length).toEqual(1);
      expect(datum.audioVideo.collection[0].filename).toEqual("iremi_tsxpvrobs_chrdiloetshi.mp3");
    });


    it("should play any sort of video", function() {
      var datum = new Datum();
      datum.addFile({
        "fieldDBtype": "AudioVideo",
        "size": 44203,
        "name": "day2.mov",
        "mtime": "2014-12-13T10:25:05.852Z",
        "fileBaseName": "day2",
        "praatAudioExtension": ".mp3",
        "script": "Syllables",
        "dbname": "testingspreadsheet-firstcorpus",
        "checksum": "74428324536648e63321efac20a719f2a13d3a2b",
        "uploadInfo": "different",
        "uploadStatus": 304,
        "resultStatus": 304,
        "resultInfo": "different",
        "syllablesAndUtterances": {
          "fileBaseName": "day2",
          "syllableCount": "7",
          "pauseCount": "0",
          "totalDuration": "2.74",
          "speakingTotalDuration": "2.74",
          "speakingRate": "2.55",
          "articulationRate": "2.55",
          "averageSylableDuration": "0.392",
          "scriptVersion": "v1.102.2",
          "minimum_duration": 0.6,
          "maximum_intensity": 59,
          "minimum_pitch": 100,
          "time_step": 0,
          "window_size": 20,
          "margin": 0.1
        },
        "textGridInfo": "regenerated",
        "textGridStatus": 200,
        "webResultStatus": 304,
        "webResultInfo": "matches",
        "serviceVersion": "v2.2.0",
        "textgrid": "File type = \"ooTextFile\"\nObject class = \"TextGrid\"\n\nxmin = 0 \nxmax = 2.7406349206349208 \ntiers? <exists> \nsize = 1 \nitem []: \n    item [1]:\n        class = \"IntervalTier\" \n        name = \"silences\" \n        xmin = 0 \n        xmax = 2.7406349206349208 \n        intervals: size = 1 \n        intervals [1]:\n            xmin = 0 \n            xmax = 2.7406349206349208 \n            text = \"utterance\" \n",
        "description": " Downloaded Praat TextGrid which contained a count of roughly 7 syllables and auto detected utterances for day2 The utterances were not automatically transcribed for you, you can either save the textgrid and transcribe them using Praat, or continue to import them and transcribe them after.",
        "filename": "day2.mp3",
        "URL": "https://localhost:3184/testingspreadsheet-firstcorpus/day2.mp3",
        "version": "v2.32.0",
        "type": "audio/mpeg",
        "pouchname": "testingspreadsheet-firstcorpus",
        "api": "speech"
      });
      expect(datum.audioVideo).toBeDefined();
      expect(datum.audioVideo.length).toEqual(1);
      expect(datum.audioVideo.collection[0].filename).toEqual("day2.mp3");
    });

    it("should display any sort of image", function() {
      var datum = new Datum();
      datum.addFile({
        "fieldDBtype": "Image",
        "size": 1527713,
        "name": "Screen_Shot_2015-03-31_at_9.48.38_AM.png",
        "type": "image/png",
        "mtime": "2015-04-03T03:03:47.981Z",
        "fileBaseName": "Screen_Shot_2015-03-31_at_9_48_38_AM",
        "praatAudioExtension": ".mp3",
        "script": "Syllables",
        "dbname": "testingspreadsheet-firstcorpus",
        "checksum": "c1c9cc273f0023b906171837e2de7ea1903947e7",
        "uploadInfo": "matches",
        "uploadStatus": 304,
        "resultInfo": "File does not contain any audio stream",
        "resultStatus": 422,
        "textGridStatus": 422,
        "textGridInfo": "File “Screen_Shot_2015-03-31_at_9.48.38_AM.png” contains no audio data. You can import any audio/video file which contains an audio track. Are you sure this file has an audio track?",
        "serviceVersion": "2.49.29",
        "filename": "Screen_Shot_2015-03-31_at_9.48.38_AM.png",
        "URL": "https://localhost:3184/testingspreadsheet-firstcorpus/Screen_Shot_2015-03-31_at_9.48.38_AM.png",
        "description": "File from import",
        "version": "v2.49.1",
        "pouchname": "testingspreadsheet-firstcorpus",
        "api": "images"
      });
      expect(datum.images).toBeDefined();
      expect(datum.images.length).toEqual(1);
      expect(datum.images.collection[0].filename).toEqual("Screen_Shot_2015-03-31_at_9.48.38_AM.png");
    });

  });

  describe("Highlighted search results", function() {

    it("should match regular expressions", function() {
      var datum = new Datum(sample_1_22_datum[0]);
      var result = datum.search("a[mn]i");
      expect(result).toBeDefined();
      expect(datum.highlightedMatches).toEqual(["Jaunpa much'asq<span class='highlight'>ami</span> k<span class='highlight'>ani</span>."]);

      result = datum.search("not in this datum anywhere");
      expect(result).toBeUndefined();
      expect(datum.highlightedMatches).toBeUndefined();
    });

    it("should return null results", function() {
      var datum = new Datum(sample_1_22_datum[0]);
      var result = datum.search("not in this datum anywhere");
      expect(result).toBeUndefined();
      expect(datum.highlightedMatches).toBeUndefined();
    });

    it("should permit fieldlabel:value search", function() {
      var datum = new Datum(sample_1_22_datum[0]);
      datum.debugMode = true;

      var result = datum.search("utterance:much' && gloss:pass AND gloss:gen");
      expect(result).toBeDefined();
      expect(datum.highlightedMatches).toEqual([
        "Jaunpa <span class='highlight'>much'</span>asqami kani.",
        "Juan.gen kiss.<span class='highlight'>pass</span>.? be.1SG.",
        "Juan.<span class='highlight'>gen</span> kiss.pass.? be.1SG."
      ]);

      result = datum.search("gloss:gen OR gloss:pss ");
      expect(result).toBeDefined();
      expect(datum.highlightedMatches).toEqual(["Juan.<span class='highlight'>gen</span> kiss.pass.? be.1SG."]);


      result = datum.search("utterance:much' && gloss:pss AND gloss:gen");
      expect(result).toBeUndefined();
      expect(datum.highlightedMatches).toBeUndefined();

      result = datum.search("gloss:pss OR gloss:gen");
      expect(result).toBeDefined();
      expect(datum.highlightedMatches).toEqual(["Juan.<span class='highlight'>gen</span> kiss.pass.? be.1SG."]);

    });


    it("should allow callers to specify which fields to search", function() {
      var datum = new Datum(sample_1_22_datum[0]);

      var result = datum.search("much'", {
        utterance: "true",
        gloss: "true"
      });
      expect(result).toBeDefined();
      expect(result).toBe(datum.highlightedMatches);
      expect(datum.highlightedMatches).toEqual(["Jaunpa <span class='highlight'>much'</span>asqami kani."]);

      result = datum.search("a", {
        utterance: "true",
        gloss: "true"
      });
      expect(result).toBeDefined();
      expect(result).toBe(datum.highlightedMatches);
      expect(datum.highlightedMatches).toEqual([
        "J<span class='highlight'>a</span>unp<span class='highlight'>a</span> much'<span class='highlight'>a</span>sq<span class='highlight'>a</span>mi k<span class='highlight'>a</span>ni.",
        "Ju<span class='highlight'>a</span>n.gen kiss.p<span class='highlight'>a</span>ss.? be.1SG."
      ]);

    });


  });

  describe("Backward compatability with v1.22", function() {

    it("should load v1.22 datum", function() {
      var datum = new Datum(sample_1_22_datum[0]);
      expect(datum).toBeDefined();
      expect(datum.datumFields.length).toEqual(9);
      expect(datum.datumFields.fieldDBtype).toEqual("DatumFields");
      expect(datum.datumStates.length).toEqual(3);
      expect(datum.datumStates.fieldDBtype).toEqual("DatumStates");
      expect(datum.datumTags.length).toEqual(2);
      expect(datum.datumTags.fieldDBtype).toEqual("DatumTags");
      expect(datum.datumFields.utterance.value).toEqual("Jaunpa much'asqami kani.");
    });

  });

  describe("Syntactic sugar", function() {
    var datum = new Datum({
      fields: JSON.parse(JSON.stringify(SAMPLE_CORPUS.datumFields)),
      session: {
        fields: JSON.parse(JSON.stringify(SAMPLE_CORPUS.sessionFields))
      }
    });

    it("should be able to modify fields via a simple object", function() {
      datum.fields.utterance.value = "Jaunpa much'asqami kani.";

      expect(datum.fields.utterance.value).toEqual("Jaunpa much'asqami kani.");
      expect(datum.accessAsObject.utterance).toEqual(datum.fields.utterance.value);
      expect(datum.accessAsObject.utterance).toBe(datum.fields.utterance.value);

      datum.accessAsObject.utterance = "pʌpiz";
      expect(datum.accessAsObject.utterance).toEqual(datum.fields.utterance.value);
      expect(datum.accessAsObject.utterance).toBe(datum.fields.utterance.value);

      // expect(datum.accessAsObject.utterance).toEqual("");
      // expect(datum.fields.utterance.value).toEqual("");


    });

  });
});
