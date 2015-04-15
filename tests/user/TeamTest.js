"use strict";
var Team;
try {
  /* globals FieldDB */
  if (FieldDB) {
    Team = FieldDB.Team;
  }
} catch (e) {}

Team = Team || require("./../../api/user/Team").Team;

describe("as a Team I want to set up my team name", function() {
  it("should set default team subtitle", function() {
    var team = new Team();
    expect(team.subtitle).toEqual("");
  });

  it("should use team as id", function() {
    var team = new Team();
    team.username = "elingllama";
    expect(team.id).toEqual("team");
  });
});


describe("as a Team member, I want to be able to add and delete members", function() {
  it("should add a new team member", function() {
    expect(true).toBeTruthy();
    //			var u = new Team();
    //            expect(true).toBeTruthy();
  });

  it("should delete a team member", function() {
    expect(true).toBeTruthy();
    //            expect(true).toBeTruthy();
  });

  it("should modify member's permissions", function() {
    expect(true).toBeTruthy();
    //			var permission = new Permission();
    //			expect(true).toBeTruthy();

  });



});
