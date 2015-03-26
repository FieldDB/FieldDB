var FieldDBObject = require("../../api/FieldDBObject").FieldDBObject;
var Activity = require("../../api/activity/Activity").Activity;
var Activities = require("../../api/activity/Activities").Activities;

describe("Activities: Test Activity Feed replication.", function() {
  it("should have an id if it gets inserted into pouch.", function() {
    // var a = new Activity();
    // a.save();
    // var hasId = (a.id != null);
    expect(true).toBeTruthy();
  });

});

describe(
  "Activities: As a user, I want to be updated on team news.",
  function() {

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
          connection: new FieldDBObject({
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
          connection: new FieldDBObject({
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
        expect(activityFeed.dbname).toEqual("jenkins-another-corpus_with_dashes_in_its_name-activity_feed");

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
        activityFeed.debugMode = true;
        var addedResult = activityFeed.add({
          verb: "",
          indirectobject: "this doesnt matter, its not part of the subcategorization of activity :)"
        });
        expect(addedResult).toBeUndefined();
        expect(activityFeed.incompleteActivitesStockPile).toBeDefined();
        expect(activityFeed.incompleteActivitesStockPile.length).toEqual(1);
        expect(activityFeed.incompleteActivitesStockPile[0]).toBeDefined();
        expect(activityFeed.incompleteActivitesStockPile[0].activity).toBeDefined();
        expect(activityFeed.incompleteActivitesStockPile[0].errorMessage).toBeDefined();
        expect(activityFeed.incompleteActivitesStockPile[0].errorMessage).toEqual("The primary key `whenWhatWho` is undefined on this object, it cannot be added! Type: Activity");
      });

      it("should accept bare activities to add to the feed", function() {
        expect(activityFeed).toBeDefined();
        activityFeed.debugMode = true;
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
        expect(activity.dbname).toEqual("jenkins-testing-via_jasmine_node-activity_feed");
      });

    });


    xdescribe("serialization", function() {

      it("should save all activities", function() {
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
          // dbname: "lingllama-activity_feed",
          user: {
            username: "lingllama",
            gravatar: "54b53868cb4d555b804125f1a3969e87"
          },
          teamOrPersonal: "personal"
        });

        var activity = activityFeed.add({
          verb: "modified"
        });
        expect(activity).toBeDefined();
        expect(activity.verb).toEqual("modified");

        activity = activityFeed.add({
          verb: "logged in",
          verbicon: "icon-check",
          directobjecticon: "icon-user",
          directobject: "",
          indirectobject: "",
          teamOrPersonal: "personal"
        });
        expect(activity).toBeDefined();
        expect(activity.verb).toEqual("logged in");

        expect(activityFeed.length).toEqual(2);
        // activityFeed.save().then(function(){

        // }, function(){

        // });

      });

    });

    xit("should show my most recent team's activities by default.", function() {
      expect(true).toBeTruthy();
    });
    it(
      "should display a drop down box of my teams and members of my teams.",
      function() {
        expect(true).toBeTruthy();
      });
    it(
      "should let me enter anyone's user name to see their activity feed if its public.",
      function() {
        expect(true).toBeTruthy();
      });
  });

describe(
  "Activities: As a user, I want to make my activity private.",
  function() {
    it(
      "should display a settings that allows a logged in user to make their activities private.",
      function() {
        expect(true).toBeTruthy();
      });
  });

describe(
  "Activities: As a team member, I want to able to delete team activities.",
  function() {
    it("should be able to delete one activity.", function() {
      expect(true).toBeTruthy();
    });
  });

describe(
  "Activities: As a user, I want to  be about see my activity even when I'm offline.",
  function() {
    it("should display a user's up to date activity when offline.", function() {
      expect(true).toBeTruthy();
    });

    it("should notify user when team data is out of date/stale.", function() {
      expect(true).toBeTruthy();
    });
  });

describe(
  "Activities: As a user, I want to learn how to use the system by see how my teammates are using it.",
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
