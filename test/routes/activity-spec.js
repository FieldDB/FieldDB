var activityHeatMap = require("./../../routes/activity").activityHeatMap;
var specIsRunningTooLong = 5000;
var LINGLLAMA_ACTIVITY_SIZE = 41;
var CORS = require("fielddb/api/CORSNode").CORS;

var deploy_target = process.env.NODE_ENV || "local";
var node_config = require("./../../lib/nodeconfig_local"); //always use local node config
var couch_keys = require("./../../lib/couchkeys_" + deploy_target);


var corpusWebServiceUrl = node_config.corpusWebService.protocol +
  couch_keys.username + ":" +
  couch_keys.password + "@" +
  node_config.corpusWebService.domain +
  ":" + node_config.corpusWebService.port +
  node_config.corpusWebService.path;

var acceptSelfSignedCertificates = {
  strictSSL: false
};
if (deploy_target === "production") {
  acceptSelfSignedCertificates = {};
}
var nano = require("nano")({
  url: corpusWebServiceUrl,
  requestDefaults: acceptSelfSignedCertificates
});

var SERVICE_URL = "https://localhost:";
if (process.env.NODE_ENV === "production") {
  SERVICE_URL = "http://localhost:";
}
SERVICE_URL = SERVICE_URL + node_config.port;

describe("activity routes", function() {

  it("should load", function() {
    expect(activityHeatMap).toBeDefined();
  });

  describe("invalid requests", function() {

    it("should return empty data if dbname is not provided", function(done) {
      activityHeatMap().then(function(results) {
        expect(results).toBeDefined();
        expect(results.rows).toBeDefined();
        expect(results.rows.length).toEqual(0);
      }).done(done);
    }, specIsRunningTooLong);

    it("should return empty data if nano is not provided", function(done) {
      activityHeatMap("lingllama-communitycorpus").then(function(results) {
        expect(results).toBeDefined();
        expect(results.rows).toBeDefined();
        expect(results.rows.length).toEqual(0);
      }).done(done);
    }, specIsRunningTooLong);

  });

  xdescribe("normal requests", function() {

    it("should return heat map data from the sample activity feeds", function(done) {
      activityHeatMap("lingllama-communitycorpus", nano).then(function(results) {
        expect(results).toBeDefined();
        expect(results.rows).toBeDefined();
        expect(results.rows.length).toEqual(LINGLLAMA_ACTIVITY_SIZE);
      }).done(done);
    }, specIsRunningTooLong);

    it("should return heat map data from the community activity feeds", function(done) {
      activityHeatMap("community-georgian", nano).then(function(results) {
        expect(results).toBeDefined();
        expect(results.rows).toBeDefined();
        expect(results.rows.length).toEqual(213);
      }).done(done);
    }, specIsRunningTooLong);

  });

  xdescribe("normal requests via service", function() {

    it("should return heat map data from the sample activity feeds", function(done) {
      CORS.makeCORSRequest({
        dataType: "json",
        url: SERVICE_URL + "/activity/lingllama-communitycorpus"
      }).then(function(results) {
        expect(results).toBeDefined();
        expect(results.rows).toBeDefined();
        expect(results.rows.length).toEqual(LINGLLAMA_ACTIVITY_SIZE);
      }).fail(function(exception) {
        console.log(exception.stack);
        expect(false).toBeTruthy();
      }).done(done);
    }, specIsRunningTooLong);

    it("should return heat map data from the community activity feeds", function(done) {
      CORS.makeCORSRequest({
        dataType: "json",
        url: SERVICE_URL + "/activity/community-georgian"
      }).then(function(results) {
        expect(results).toBeDefined();
        expect(results.rows).toBeDefined();
        expect(results.rows.length).toEqual(213);
      }).fail(function(exception) {
        console.log(exception.stack);
        expect(false).toBeTruthy();
      }).done(done);
    }, specIsRunningTooLong);

  });

  xdescribe("close enough requests", function() {

    it("should use lowercase dbname", function(done) {
      activityHeatMap("LingLlama-communitycorpus", nano).then(function(results) {
        expect(results).toBeDefined();
        expect(results.rows).toBeDefined();
        expect(results.rows.length).toEqual(LINGLLAMA_ACTIVITY_SIZE);
      }).done(done);
    }, specIsRunningTooLong);

    it("should accept activity feed dbname", function(done) {
      activityHeatMap("lingllama-communitycorpus-activity_feed", nano).then(function(results) {
        expect(results).toBeDefined();
        expect(results.rows).toBeDefined();
        expect(results.rows.length).toEqual(LINGLLAMA_ACTIVITY_SIZE);
      }).done(done);
    }, specIsRunningTooLong);
  });

  describe("sanitize requests", function() {

    it("should return empty data if dbname is too short", function(done) {
      activityHeatMap("aa", nano).then(function(results) {
        expect(results).toBeDefined();
        expect(results.rows).toBeDefined();
        expect(results.rows.length).toEqual(0);
      }).done(done);
    }, specIsRunningTooLong);

    it("should return empty data if dbname is not a string", function(done) {
      activityHeatMap({
        "not": "astring"
      }, nano).then(function(results) {
        expect(results).toBeDefined();
        expect(results.rows).toBeDefined();
        expect(results.rows.length).toEqual(0);
      }).done(done);
    }, specIsRunningTooLong);

    it("should return empty data if dbname contains invalid characters", function(done) {
      activityHeatMap("a.*-haaha script injection attack attempt file:///some/try", nano).then(function(results) {
        expect(results).toBeDefined();
        expect(results.rows).toBeDefined();
        expect(results.rows.length).toEqual(0);
      }).done(done);
    }, specIsRunningTooLong);
  });


});
