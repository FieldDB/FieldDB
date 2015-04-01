/* globals runs, waitsFor */

var AudioService = AudioService || require("../../api/audio_video/AudioService");
var Database = Database || require("../../api/corpus/Database").Database;

var runCORSTests = function(whichServer) {

  var corpusServerUrl;

  var serverURL = "https://audiodev.lingsync.org";
  if (whichServer === "Testing") {
    serverURL = "https://audiodev.lingsync.org";
    corpusServerUrl = "https://corpusdev.lingsync.org/_session";
  } else if (whichServer === "Stable") {
    serverURL = "https://audio.lingsync.org";
    corpusServerUrl = "https://corpus.lingsync.org/_session";
  } else if (whichServer === "McGill") {
    serverURL = "https://prosody.linguistics.mcgill.ca/corpus";
    corpusServerUrl = "https://corpusdev.lingsync.org/_session";
  } else if (whichServer === "Localhost") {
    serverURL = "http://localhost:3184";
    corpusServerUrl = "https://localhost:6984/_session";
  }
  console.log("Testing with: " + serverURL);
  var user = {
    name: "lingllama",
    password: "phoneme"
  };

  it(
    "should be able asyncronously retrieve a TextGrid, given that all has been already cached",
    function() {
      /*
       * Declare an object and its functions which will be in scope
       */
      var corpus = new Database({
        url: corpusServerUrl,
        user: user
      });
      corpus.dbname = "test-cors";
      var serverResult = new AudioService(serverURL, user, corpus,
        "sampleDatumWithMultipleAudio");
      /*
       * Begin the async task
       */
      runs(function() {
        serverResult.requestTextGrids();
      });

      /*
       * Poll until success
       */
      waitsFor(function() {
        // console.log("Waiting for user " + user.name + " to login");
        return serverResult.textGridsRetrieved();
      }, "Textgrids never retrieved in successfully", 3000);

      /*
       * Test the result
       */
      runs(function() {
        console.log("Done waiting for textgrids");
        serverResult.assertRetrievedTextGridsSuccessful();
      });

    });

  // it(
  // "should be able asyncronously retrieve a TextGrid, if audio files have not
  // yet been uploaded",
  // function() {
  // var corpus = new Database(corpusServerUrl, user);
  // corpus.dbname = "lingllama-firstcorpus";
  // var serverResult = new AudioService(serverURL, user, corpus,
  // "fakedatum" + Date.now());
  // /*
  // * Begin the async task
  // */
  // runs(function() {
  // serverResult.uploadAudioForAlignment();
  // });
  //
  // /*
  // * Poll until success
  // */
  // waitsFor(
  // function() {
  // // console.log("Waiting for user " + user.name + " to
  // // login");
  // return serverResult.audioUploaded();
  // },
  // "Uploaded audio and/or Textgrids never retrieved in successfully",
  // 4000);
  //
  // /*
  // * Test the result
  // */
  // runs(function() {
  // console.log("Done waiting to upload and get textgrids back");
  // serverResult.assertUploadSuccessful();
  // });
  //
  // });
  //
};

// describe("AudioWebService Testing: ", function() {
// runCORSTests("Testing");
// });

/* Turn this on if you want to test your localhost config */
xdescribe("AudioWebService Localhost: ", function() {
  runCORSTests("Localhost");
});
//
/* TODO Turn these on when the other servers support CORS too */
// describe("AudioWebService Stable: ", function() {
// runCORSTests("Stable");
// });
//
// describe("AudioWebService McGill: ", function() {
// runCORSTests("McGill");
// });
