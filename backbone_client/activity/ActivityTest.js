define([
  "backbone",
  "libs/FieldDBBackboneModel",
  "activity/Activity"
], function(
  Backbone,
  FieldDBBackboneModel,
  Activity
) {
  "use strict";

  function registerTests() {
    describe("Activities", function() {
      xit("should have an id if it gets inserted into pouch.", function(done) {
        var activity = new Activity();
        activity.save({
          success: function(model) {
            expect(model.get("id")).toBeDefined();
            expect(model.get("id").length).toBeGreaterThan(1);

            done();
          },
          error: function(err) {
            expect(err).toBeNull();

            done();
          }
        });
      });

      describe("As a user, I want to be updated on team news.", function() {
        it("should show my most recent team's activities by default.", function() {
          expect(Activity).toBeDefined();
        });
        it("should display a drop down box of my teams and members of my teams.", function() {
          expect(Activity).toBeDefined();
        });
        it("should let me enter anyone's user name to see their activity feed if its public.", function() {
          expect(Activity).toBeDefined();
        });

      });

      describe("As a user, I want to make my activity private.", function() {
        it("should display a settings that allows a logged in user to make their activities private.", function() {
          expect(Activity).toBeDefined();
        });
      });

      describe("As a team member, I want to able to delete team activities.", function() {
        it("should be able to delete one activity.", function() {
          expect(Activity).toBeDefined();
        });
      });

      describe("As a user, I want to  be about see my activity even when I'm offline.", function() {
        it("should display a user's up to date activity when offline.", function() {
          expect(Activity).toBeDefined();
        });

        it("should notify user when team data is out of date/stale.", function() {
          expect(Activity).toBeDefined();
        });
      });

      describe("As a user, I want to learn how to use the system by see how my teammates are using it.", function() {
        it("should have colorful icons to display verbs.", function() {
          expect(Activity).toBeDefined();
        });

        it("should have clickable activity feed items, which show the changed set.", function() {
          expect(Activity).toBeDefined();
        });
      });

      describe("deprecated", function() {
        it("should get dbname from the user if a personal actiivty.", function(done) {
          window.app = new FieldDBBackboneModel({
            authentication: new FieldDBBackboneModel({
              userPublic: new FieldDBBackboneModel({
                username: "tester",
                gravatar: "1234567ghjkwert"
              }),
              userPrivate: new FieldDBBackboneModel({
                username: "tester",
                gravatar: "1234567ghjkwert",
                activityConnection: {
                  dbname: "tester-special_activity_dbname"
                }
              })
            })
          });

          var activity = new Activity({
            teamOrPersonal: "personal",
            user: window.app.get("authentication").get("userPublic")
          });

          expect(Backbone.sync.pouch).toEqual(undefined);

          activity.changePouch(null, function() {
            expect(Backbone.sync.pouch).toEqual(undefined);
            expect(activity.get("dbname")).toEqual("tester-special_activity_dbname");
            done();
          });
        });

        it("should get dbname from the corpus if a team activity.", function(done) {
          window.app = new FieldDBBackboneModel({
            currentCorpusTeamActivityFeed: new FieldDBBackboneModel({
              connection: {
                dbname: "tester-kartuli"
              }
            })
          });

          var activity = new Activity({
            teamOrPersonal: "team"
          });

          expect(Backbone.sync.pouch).toEqual(undefined);

          activity.changePouch(null, function() {
            expect(Backbone.sync.pouch).toEqual(undefined);
            expect(activity.get("dbname")).toEqual("tester-kartuli");

            done();
          });
        });
      });
    });
  }

  return {
    describe: registerTests
  };
});
