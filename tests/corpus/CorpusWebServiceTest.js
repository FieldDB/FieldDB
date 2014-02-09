var CouchDBConnection = require("./CouchDBConnection");
var OPrime = require('../../backbone_client/libs/OPrime.js');

var runCORSTests = function(whichServer) {
  /*
   * Turn off CORS alerts
   */
  OPrime.bug = function(message) {
    console.log(message);
    //      expect(false).toBeTruthy();
  };

  var serverURL = "https://corpusdev.lingsync.org/_session";
  if (whichServer == "Testing") {
    serverURL = "https://corpusdev.lingsync.org/_session";
  } else if (whichServer == "Stable") {
    serverURL = "https://corpus.lingsync.org/_session";
  } else if (whichServer == "McGill") {
    serverURL = "https://prosody.linguistics.mcgill.ca/corpus/_session/";
  } else if (whichServer == "Localhost") {
    serverURL = "https://localhost:6984/_session";
  }
  console.log("Testing with: " + serverURL);
  /*
   * Declare an object and its functions which will be in scope
   */
  var user = {
    name: "lingllama",
    password: "phoneme"
  };

  it('should be able asyncronously using CORS to login user ', function() {

    var serverResult = new CouchDBConnection(serverURL, user);
    /*
     * Begin the async task
     */
    runs(function() {
      serverResult.login();
    });

    /*
     * Poll until success
     */
    waitsFor(function() {
      // console.log("Waiting for user " + user.name + " to login");
      return serverResult.loggedIn();
    }, "User " + user.name + " never logged in successfully", 3000);

    /*
     * Test the result
     */
    runs(function() {
      console.log("Done waiting for user " + user.name + " to login");
      serverResult.assertLoginSuccessful();
    });

  });

  it('should be able asyncronously using CORS to upload a doc', function() {
    /*
     * Declare an object and its functions which will be in scope
     */

    var serverResult = new CouchDBConnection(serverURL, user);

    /*
     * Begin the async task
     */
    runs(function() {
      serverResult.uploadADocument({
        "stuff": "This is a test doc uploaded to see if CORS is working."
      }, "test-cors");
    });

    /*
     * Poll until success
     */
    waitsFor(function() {
      // console.log("Waiting for doc to upload");
      return serverResult.docUploaded();
    }, "Doc never uploaded successfully", 3000);

    /*
     * Test the result
     */
    runs(function() {
      console.log("Done waiting for doc to upload");
      serverResult.assertUploadSuccessful();
    });

  });
  it('should be able asyncronously using CORS to update a doc', function() {
    /*
     * Declare an object and its functions which will be in scope
     */

    var serverResult = new CouchDBConnection(serverURL, user);

    /*
     * Begin the async task
     */
    runs(function() {
      serverResult.uploadADocument({
        "_id": "" + Date.now(),
        "stuff": "This is a test doc uploaded to see if CORS is working."
      }, "test-cors");
    });

    /*
     * Poll until success
     */
    waitsFor(function() {
      // console.log("Waiting for doc to upload");
      return serverResult.docUploaded();
    }, "Doc never uploaded successfully", 3000);

    /*
     * Test the result
     */
    runs(function() {
      console.log("Done waiting for doc to upload");
      serverResult.assertUploadSuccessful();
    });

  });

};

xdescribe("CorpusWebService Testing: ", function() {
  runCORSTests("Testing");
});

/* Turn this on if you want to test your localhost config */
//   describe("CorpusWebService Localhost: ", function() {
//    runCORSTests("Localhost");
//  });
//   
/* TODO Turn these on when the other servers support CORS too */
// describe("CorpusWebService Stable: ", function() {
// runCORSTests("Stable");
// });
//
// describe("CorpusWebService McGill: ", function() {
// runCORSTests("McGill");
// });
