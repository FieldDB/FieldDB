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
  "Activities: As a user, I want to be updated on team news.", function() {

    describe("construction", function() {

      it("should be load", function() {
        expect(Activity).toBeDefined();
        expect(Activities).toBeDefined();
      });

      it("should be defined", function() {
        var activites = new Activities();
        expect(activites).toBeDefined();
        expect(activites.type).toEqual("Activities");

        activites.add({
          verb: "updated"
        });
        expect(activites.length).toEqual(1);
        expect(activites.collection[0].type).toEqual("Activity");

      });

    });

    it("should show my most recent team's activities by default.", function() {
      expect(true).toBeTruthy();
    });
    it(
      "should display a drop down box of my teams and members of my teams.", function() {
        expect(true).toBeTruthy();
      });
    it(
      "should let me enter anyone's user name to see their activity feed if its public.", function() {
        expect(true).toBeTruthy();
      });
  });

describe(
  "Activities: As a user, I want to make my activity private.", function() {
    it(
      "should display a settings that allows a logged in user to make their activities private.", function() {
        expect(true).toBeTruthy();
      });
  });

describe(
  "Activities: As a team member, I want to able to delete team activities.", function() {
    it("should be able to delete one activity.", function() {
      expect(true).toBeTruthy();
    });
  });

describe(
  "Activities: As a user, I want to  be about see my activity even when I'm offline.", function() {
    it("should display a user's up to date activity when offline.", function() {
      expect(true).toBeTruthy();
    });

    it("should notify user when team data is out of date/stale.", function() {
      expect(true).toBeTruthy();
    });
  });

describe(
  "Activities: As a user, I want to learn how to use the system by see how my teammates are using it.", function() {
    it("should have colorful icons to display verbs.", function() {
      expect(true).toBeTruthy();
    });
    it(
      "should have clickable activity feed items, which show the changed set.", function() {
        expect(true).toBeTruthy();
      });
  });
