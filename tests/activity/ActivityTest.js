"use strict";
var Activity;
var Activities;
var Connection;
try {
  /* globals FieldDB*/
  if (FieldDB) {
    Activity = FieldDB.Activity;
    Activities = FieldDB.Activities;
    Connection = FieldDB.Connection;
  }
} catch (e) {}
Activity = Activity || require("./../../api/activity/Activity").Activity;
Activities = Activities || require("./../../api/activity/Activities").Activities;
Connection = Connection || require("./../../api/corpus/Connection").Connection;

var mockDatabase = require("./../corpus/DatabaseMock").mockDatabase;
var specIsRunningTooLong = 5000;

describe("Activities", function() {

  describe("construction", function() {

    it("should be load", function() {
      expect(Activity).toBeDefined();
      expect(Activities).toBeDefined();
    });

    it("should have some set defaults for updating the list", function() {
      var activityFeed = new Activities();

      expect(activityFeed.primaryKey).toEqual("whenWhatWho");

      expect(activityFeed.api).toEqual("activities");
      activityFeed.api = "cantchagnetehapiurlsorry";
      expect(activityFeed.api).toEqual("activities");
    });

    it("should construct a corpus activity feed based on a corpus", function() {
      var activityFeed = new Activities();

      expect(activityFeed).toBeDefined();
      expect(activityFeed.fieldDBtype).toEqual("Activities");
      expect(activityFeed.dbname).toBeUndefined();
      expect(activityFeed.url).toBeUndefined();

      activityFeed.parent = {
        fieldDBtype: "LanguageLearningCorpus",
        dbname: "community-georgian",
        connection: new Connection({
          protocol: "https://",
          domain: "localhost",
          port: "6984",
          dbname: "community-georgian",
          path: "",
          serverLabel: "localhost",
          authUrls: ["https://localhost:3183"],
          // corpusUrls: ["https://localhost:6984"],
          userFriendlyServerName: "Localhost"
        })
      };

      expect(activityFeed.dbname).toEqual("community-georgian-activity_feed");

      var serializedForParenttoJSON = activityFeed.toJSON();
      expect(serializedForParenttoJSON).toBeDefined();
      expect(serializedForParenttoJSON.dbname).toEqual("community-georgian-activity_feed");
    });


    it("should construct a user activity feed based on a user", function() {
      var activityFeed = new Activities();

      expect(activityFeed).toBeDefined();
      expect(activityFeed.fieldDBtype).toEqual("Activities");
      expect(activityFeed.dbname).toBeUndefined();
      expect(activityFeed.url).toBeUndefined();

      activityFeed.parent = {
        fieldDBtype: "User",
        username: "jenkins",
        connection: new Connection({
          protocol: "https://",
          domain: "localhost",
          port: "6984",
          dbname: "jenkins-activity_feed",
          path: "",
          serverLabel: "localhost",
          authUrls: ["https://localhost:3183"],
          // corpusUrls: ["https://localhost:6984"],
          userFriendlyServerName: "Localhost"
        })
      };

      expect(activityFeed.dbname).toEqual("jenkins-activity_feed");

      var serializedForParenttoJSON = activityFeed.toJSON();
      expect(serializedForParenttoJSON).toBeDefined();
      expect(serializedForParenttoJSON.dbname).toEqual("jenkins-activity_feed");
    });

    it("should construct using only a connection ", function() {
      var activityFeed = new Activities({
        protocol: "https://",
        domain: "localhost",
        port: "6984",
        dbname: "jenkins-firstcorpus-activity_feed",
        path: "",
        serverLabel: "localhost",
        authUrls: ["https://localhost:3183"],
        // corpusUrls: ["https://localhost:6984"],
        userFriendlyServerName: "Localhost"
      });
      expect(activityFeed).toBeDefined();
      expect(activityFeed.fieldDBtype).toEqual("Activities");

      expect(activityFeed.connection.userFriendlyServerName).toEqual("Localhost");
      expect(activityFeed.connection.fieldDBtype).toEqual("Connection");
      expect(activityFeed.connection.corpusUrl).toEqual("https://localhost:6984/jenkins-firstcorpus-activity_feed");
      expect(activityFeed.url).toEqual("https://localhost:6984/jenkins-firstcorpus-activity_feed");

      expect(activityFeed.teamOrPersonal).toEqual("team");
      expect(activityFeed.dbname).toEqual("jenkins-firstcorpus-activity_feed");
    });


    it("should deduce database form invalid databases ", function() {
      var activityFeed = new Activities({
        protocol: "https://",
        domain: "localhost",
        port: "6984",
        dbname: "Jenkins-Another Corpus-activity_feed",
        path: "",
        serverLabel: "localhost",
        authUrls: ["https://localhost:3183"],
        // corpusUrls: ["https://localhost:6984"],
        userFriendlyServerName: "Localhost"
      });
      expect(activityFeed).toBeDefined();
      expect(activityFeed.dbname).toEqual("jenkins-another_corpus-activity_feed");

      activityFeed = new Activities({
        protocol: "https://",
        domain: "localhost",
        port: "6984",
        dbname: "Jenkins-Another-Corpus-with-dashes-in-its-name-activity_feed",
        path: "",
        serverLabel: "localhost",
        authUrls: ["https://localhost:3183"],
        // corpusUrls: ["https://localhost:6984"],
        userFriendlyServerName: "Localhost"
      });
      expect(activityFeed).toBeDefined();
      expect(activityFeed.dbname).toEqual("jenkins-another-corpus-with-dashes-in-its-name-activity_feed");

    });

    it("should construct using a object ", function() {
      var activityFeed = new Activities({
        connection: {
          protocol: "https://",
          domain: "localhost",
          port: "6984",
          dbname: "default",
          path: "",
          serverLabel: "localhost",
          authUrls: ["https://localhost:3183"],
          // corpusUrls: ["https://localhost:6984"],
          userFriendlyServerName: "Localhost"
        },
        parent: {
          fieldDBtype: "User",
          username: "teammatetiger"
        }
      });
      expect(activityFeed).toBeDefined();
      expect(activityFeed.fieldDBtype).toEqual("Activities");
      expect(activityFeed.dbname).toEqual("teammatetiger-activity_feed");
      expect(activityFeed.teamOrPersonal).toEqual("personal");
    });

  });

  describe("persistance", function() {
    var activityFeed;
    beforeEach(function() {
      activityFeed = new Activities({
        protocol: "https://",
        domain: "localhost",
        port: "6984",
        dbname: "jenkins-testing-via-jasmine-node-activity_feed",
        path: "",
        serverLabel: "localhost",
        authUrls: ["https://localhost:3183"],
        // corpusUrls: ["https://localhost:6984"],
        userFriendlyServerName: "Localhost"
      });
    });

    it("should refuse to add incomplete activities to add to the feed", function() {
      expect(activityFeed).toBeDefined();
      // activityFeed.debugMode = true;
      var addedResult = activityFeed.add({
        verb: "",
        indirectobject: "this doesnt matter, its not part of the subcategorization of activity :)"
      });
      expect(addedResult).toBeUndefined();
      expect(activityFeed.incompleteActivitesStockPile).toBeDefined();
      expect(activityFeed.incompleteActivitesStockPile.length).toEqual(1);
      expect(activityFeed.incompleteActivitesStockPile[0]).toBeDefined();
      expect(activityFeed.incompleteActivitesStockPile[0].activity).toBeDefined();
      expect(activityFeed.incompleteActivitesStockPile[0].activity.indirectobject).toEqual("this doesnt matter, its not part of the subcategorization of activity :)");
      expect(activityFeed.incompleteActivitesStockPile[0].errorMessage).toBeDefined();
      expect(activityFeed.incompleteActivitesStockPile[0].errorMessage).toEqual("Activity was not added.");
    });

    it("should accept bare activities to add to the feed", function() {
      expect(activityFeed).toBeDefined();
      // activityFeed.debugMode = true;
      activityFeed.add({
        verb: "modified",
        directobject: "tusunaywanmi"
      });
      expect(activityFeed.length).toEqual(1);
      // // expect(activityFeed.docs._collection[0].fieldDBtype).toEqual("Activity");
    });

    it("should validate activityFeed' dbname & user information when adding to the feed", function() {
      var activity = activityFeed.add({
        verb: "logged in",
        verbicon: "icon-check",
        directobjecticon: "icon-user",
        directobject: "",
        indirectobject: "",
        teamOrPersonal: "personal"
      });
      expect(activityFeed.length).toEqual(1);
      expect(activity.dbname).toEqual("jenkins-testing-via-jasmine-node-activity_feed");
    });

  });


  describe("serialization", function() {


    it("should refuse to save an item hasn't changed", function(done) {
      var activity = new Activity({
        user: {
          username: "hi",
          gravatar: "yo"
        },
        verb: "modified",
        directobject: "noqata"
      });
      activity.save().then(function(result) {
        expect(result).toBe(activity);
        expect(result.warnMessage).toContain("Item hasn't really changed, no need to save...");
      }, function(error) {
        expect(error.userFriendlyErrors).toEqual(["This application has errored. Please notify its developers: Cannot save data, database is not currently opened."]);
      }).done(done);
    }, specIsRunningTooLong);


    it("should save an item which has changed if the right database is defined", function(done) {
      var activity = new Activity({
        user: {
          username: "hi",
          gravatar: "yo"
        },
        verb: "modified",
        directobject: "noqata",
        dbname: "jenkins-testingdb"
      });

      // add a mock database
      activity.corpus = mockDatabase;
      activity.corpus.dbname = "jenkins-testingdb";
      expect(activity.corpus).toBeDefined();
      expect(activity._database).toBeDefined();
      expect(activity.corpus).toBe(activity._database);
      expect(activity.corpus.set).toBeDefined();

      activity.fossil = {};
      activity.save().then(function(result) {
        expect(result).toBe(activity);
        expect(activity.rev).toBeDefined();
        expect(activity.rev.length).toBeGreaterThan(14);
        expect(activity.warnMessage).toBeUndefined();
      }, function(error) {
        console.log(error);
        expect(false).toBeTruthy();
      }).done(done);
    }, specIsRunningTooLong);


    it("should refuse to save if there is no database to save an item which has changed", function(done) {
      var activity = new Activity({
        user: {
          username: "hi",
          gravatar: "yo"
        },
        verb: "modified",
        directobject: "noqata"
      });
      activity.fossil = {};
      activity.save().then(function(result) {
        console.log(result);
        expect(true).toBeFalsy();
      }, function(error) {
        expect(error.userFriendlyErrors).toEqual(["This application has errored. Please notify its developers: Cannot save data, database is not currently opened."]);
      }).done(done);
    }, specIsRunningTooLong);

    it("should not complain about saving an empty feed", function(done) {
      var activityFeed = new Activities({
        parent: mockDatabase,
        connection: {
          protocol: "https://",
          domain: "localhost",
          port: "6984",
          dbname: "jenkins-testingcorpus",
          path: "",
          serverLabel: "localhost",
          authUrls: ["https://localhost:3183"],
          // corpusUrls: ["https://localhost:6984"],
          userFriendlyServerName: "Localhost"
        }
      });

      expect(activityFeed.length).toEqual(0);
      activityFeed.save().then(function(result) {
        expect(result).toBe(activityFeed);

        expect(activityFeed.saving).toEqual(false);
        expect(activityFeed.warnMessage).toContain("Save was unncessary, the activity feed was empty...");
      }, function(error) {
        expect(error.userFriendlyErrors).toEqual(["This application has errored. Please notify its developers: Cannot save data, database is not currently opened."]);
      }).done(done);

      expect(activityFeed.whenReady).toBeDefined();
      expect(activityFeed.saving).toEqual(true);

    }, specIsRunningTooLong);


    it("should save all activities", function(done) {
      mockDatabase.dbname = "jenkins-activity_feed";
      var activityFeed = new Activities({
        connection: {
          protocol: "https://",
          domain: "localhost",
          port: "6984",
          dbname: "jenkins-activity_feed",
          path: "",
          serverLabel: "localhost",
          authUrls: ["https://localhost:3183"],
          // corpusUrls: ["https://localhost:6984"],
          userFriendlyServerName: "Localhost"
        },
        // dbname: "jenkins-activity_feed",
        parent: {
          username: "jenkins",
          gravatar: "54b53868cb4d555b804125f1a3969e87"
        },
        teamOrPersonal: "personal"
      });
      activityFeed._database = mockDatabase;
      expect(activityFeed.dbname).toEqual("jenkins-activity_feed");

      var activity = activityFeed.add({
        verb: "logged in",
        verbicon: "icon-check",
        directobjecticon: "icon-user",
        directobject: "noqata tusu",
        indirectobject: "",
        teamOrPersonal: "personal"
      });
      expect(activity).toBeDefined();
      expect(activity.dbname).toEqual(activityFeed.dbname);
      expect(activity.user.toJSON()).toEqual({
        fieldDBtype: "UserMask",
        username: "unknown",
        version: activity.user.version,
        api: activity.user.api
      });
      expect(activity.verb).toEqual("logged in");

      expect(activityFeed.length).toEqual(1);
      activityFeed.save().then(function(result) {
        expect(result).toBe(activityFeed);
        expect(activityFeed.saving).toEqual(false);

        expect(activityFeed.docs._collection[0].id).toBeDefined();
        expect(activityFeed.docs._collection[0].rev).toBeDefined();
        expect(activityFeed.docs._collection[0].dbname).toEqual("jenkins-activity_feed");
        expect(activityFeed.docs._collection[0].teamOrPersonal).toEqual("personal");
        expect(activityFeed.docs._collection[0].user).toBeDefined();
        expect(activityFeed.docs._collection[0].user.username).toBeDefined();
        expect(activityFeed.docs._collection[0].fossil._rev).toEqual(activityFeed.docs._collection[0].rev);
        expect(activityFeed.docs._collection[0].fossil.api).toEqual(activityFeed.docs._collection[0].api);
        expect(activityFeed.docs._collection[0].unsaved).toEqual(false);
        expect(activityFeed.docs._collection[0].saving).toEqual(false);
        expect(activityFeed.docs._collection[0].whenReady).toBeDefined();

      }, function(error) {
        expect(error.userFriendlyErrors).toEqual(["This application has errored. Please notify its developers: Cannot save data, database is not currently opened."]);
      }).done(done);

      expect(activityFeed.whenReady).toBeDefined();
      expect(activityFeed.saving).toEqual(true);

    }, specIsRunningTooLong);
  });

  it("should show my most recent team's activities by default.", function() {
    expect(true).toBeTruthy();
  });

  it("should display a drop down box of my teams and members of my teams.", function() {
    expect(true).toBeTruthy();
  });

  it("should let me enter anyone's user name to see their activity feed if its public.", function() {
    expect(true).toBeTruthy();
  });


  describe("replication.", function() {
    it("should have an id if it gets inserted into pouch.", function() {
      // var a = new Activity();
      // a.save();
      // var hasId = (a.id != null);
      expect(true).toBeTruthy();
    });

  });

  describe(
    "As a user, I want to make my activity private.",
    function() {
      it(
        "should display a settings that allows a logged in user to make their activities private.",
        function() {
          expect(true).toBeTruthy();
        });
    });

  describe(
    "As a team member, I want to able to delete team activities.",
    function() {
      it("should be able to delete one activity.", function() {
        expect(true).toBeTruthy();
      });
    });

  describe(
    "As a user, I want to  be about see my activity even when I'm offline.",
    function() {
      it("should display a user's up to date activity when offline.", function() {
        expect(true).toBeTruthy();
      });

      it("should notify user when team data is out of date/stale.", function() {
        expect(true).toBeTruthy();
      });
    });

  describe(
    "As a user, I want to learn how to use the system by see how my teammates are using it.",
    function() {

      it("should have colorful icons to display verbs.", function() {
        var activity = new Activity({
          verb: "modified"
        });
        expect(activity.verbicon).toEqual(Activity.prototype.defaults.verb.modify.verbicon);
      });

      it("should have clickable activity feed items, which show the changed set.", function() {
        expect(true).toBeTruthy();
      });
    });

});
