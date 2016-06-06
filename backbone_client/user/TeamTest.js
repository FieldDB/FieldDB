define(["user/Team"], function(Team) {
  "use strict";

  function registerTests() {

    //TODO @cesine Do we want to have a Team admin type of entity who can add and/delete team members and modify their permissions?
    //             Or every team member can do that?
    describe("Team", function() {
      describe("As a Team I want to set up my team name", function() {
        it("should set default team name", function() {
          var team = new Team();
          expect(team.get("teamname")).toEqual(undefined);
        });

      });

      describe("as a Team member, I want to be able to add and delete members", function() {
        it("should add a new team member", function() {
          var team = new Team();
          expect(team).toBeDefined();
        });

        it("should delete a team member", function() {
          expect(Team).toBeDefined();
        });

        it("should modify member's permissions", function() {
          expect(Team).toBeDefined();
        });
      });
    });
  }

  return {
    describe: registerTests
  };
});
