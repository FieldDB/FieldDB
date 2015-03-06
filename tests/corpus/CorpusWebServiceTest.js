/* globals runs, waitsFor */

var CouchDBConnection = require("./CouchDBConnection");
var FieldDBConnection = require("../../api/FieldDBConnection").FieldDBConnection;
var CORS = require("../../api/CORSNode").CORS;

var user = {
  username: "lingllama",
  password: "phoneme"
};
var runCORSTests = function(whichServer) {
  console.log("Running on target " + whichServer);
  /*
   * Declare an object and its functions which will be in scope
   */

  it("should be able asyncronously using CORS to login user ", function() {

    var serverResult = null;
    /*
     * Begin the async task
     */
    runs(function() {
      FieldDBConnection.setXMLHttpRequestLocal(CORS);
      FieldDBConnection.connection = {
        localCouch: {
          connected: false,
          url: "http://localhost:5984",
          couchUser: null
        },
        centralAPI: {
          connected: false,
          url: "http://localhost:3183",
          fieldDBUser: null
        }
      };
      FieldDBConnection.connect().then(function(result) {
        console.log("got a result runCORSTests");
        serverResult = result;
        console.log(serverResult);
      });
    });

    /*
     * Poll until success
     */
    waitsFor(function() {
      // console.log("Waiting for user " + user.name + " to login");
      return serverResult;
    }, "Severs never contacted successfully", 10000);

    /*
     * Test the result
     */
    runs(function() {
      console.log("Done waiting for serverResult to login");
      // serverResult.assertLoginSuccessful();
      expect(serverResult.localCouch.couchUser).toBeDefined();
      expect(serverResult.centralAPI.fieldDBUser).toBeDefined();

      expect(serverResult.localCouch.couchUser.name).toEqual(this.user.username);
      expect(serverResult.centralAPI.fieldDBUser.username).toEqual(this.user.username);
    });

  });

  xit("should be able asyncronously using CORS to upload a doc", function() {
    /*
     * Declare an object and its functions which will be in scope
     */
    var serverURL;

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
  xit("should be able asyncronously using CORS to update a doc", function() {
    /*
     * Declare an object and its functions which will be in scope
     */
    var serverURL;

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
