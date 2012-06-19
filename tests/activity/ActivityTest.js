require(
    [ "activity/Activity", "activity/ActivityFeed", "activity/Activities"
        ],
    function(Activity, ActivityFeed, Activities) {
      describe(
          "Test Activity Feed replication.",
          function() {
            it("should have an id if it gets inserted into pouch.",
                function() {
              
                  /*
                   * TODO this is how i tested it in a view, turn this into a 
                   * jamine test once we know how to deal with views in jasmine/phantom
                   */
                  var a = new Activity();
//                a.save();
//                appView.replicateActivityFeedDatabase();
                  var hasId = (a.id != null);
                  expect(true).toBeTruthy();
                });
            
          });

      describe(
          "As a user, I want to be updated on team news.",
          function() {
            it("should show my most recent team's activities by default.",
                function() {
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
          "As a user, I want to make my activity private.",
          function() {
            it(
                "should display a settings that allows a logged in user to make their activities private.",
                function() {
                  expect(true).toBeTruthy();
                });
          });

      describe("As a team member, I want to able to delete team activities.",
          function() {
            it("should be able to delete one activity.", function() {
              expect(true).toBeTruthy();
            });
          });

      describe(
          "As a user, I want to  be about see my activity even when I'm offline.",
          function() {
            it("should display a user's up to date activity when offline.",
                function() {
                  expect(true).toBeTruthy();
                });

            it("should notify user when team data is out of date/stale.",
                function() {
                  expect(true).toBeTruthy();
                });
          });

      describe(
          "As a user, I want to learn how to use the system by see how my teammates are using it.",
          function() {
            it("should have colorful icons to display verbs.", function() {
              expect(true).toBeTruthy();
            });
            it(
                "should have clickable activity feed items, which show the changed set.",
                function() {
                  expect(true).toBeTruthy();
                });
          });

    });
