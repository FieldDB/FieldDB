require(
    [],
    function() {

      /*
       * Helper class that will keep state for the async calls
       */
      var FakeServerConnection = function() {
        this.foo = 0;
        this.login = function() {
          var that = this;
          setTimeout(function() {
            that.foo++;
          }, 250);
        };
        this.loggedIn = function() {
          return this.foo == 2;
        };
      };

      /**
       * 
       * Some explanation of how this works.
       * 
       * https://github.com/pivotal/jasmine/wiki/Asynchronous-specs
       */
      describe(
          "Async Tests: as a developer I want to ensure async tests actually do fail",
          function() {
            it('should be able fail tests asyncronously if timeout',
                function() {
                  /*
                   * Don't fail this test unless you're actually a developer, in
                   * a chrome extension
                   */
                  if (!OPrime.isChromeApp()) {
                    expect(!OPrime.isChromeApp()).toBeTruthy();
                    return;
                  }

                  /*
                   * Declare an object and its functions which will be in scope
                   */
                  var serverResult = new FakeServerConnection();

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
//                    console.log("Waiting for faked login");
                    return serverResult.loggedIn();
                  }, "User never logged in successfully", 300);

                  /*
                   * Test the result
                   */
                  runs(function() {
                    console.log("Done waiting for user to login");
                    expect(serverResult.foo).toEqual(2);
                  });

                });

            it('should be able fail tests asyncronously', function() {

              /*
               * Don't fail this test unless you're actually a developer, in a
               * chrome extension
               */
              if (!OPrime.isChromeApp()) {
                expect(!OPrime.isChromeApp()).toBeTruthy();
                return;
              }

              /*
               * Declare an object and its functions which will be in scope
               */
              var serverResult = new FakeServerConnection();
              serverResult.loggedIn = function() {
                return this.foo == 1;
              };

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
//                console.log("Waiting for faked login");
                return serverResult.loggedIn();
              }, "User never logged in successfully", 3000);

              /*
               * Test the result
               */
              runs(function() {
                console.log("Done waiting for user to login");
                expect(serverResult.foo).toEqual(2);
              });

            });

            it('should be able pass tests asyncronously', function() {

              /*
               * Declare an object and its functions which will be in scope
               */
              var serverResult = new FakeServerConnection();
              serverResult.loggedIn = function() {
                return this.foo == 1;
              };

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
//                console.log("Waiting for faked login");
                return serverResult.loggedIn();
              }, "User never logged in successfully", 3000);

              /*
               * Test the result
               */
              runs(function() {
                console.log("Done waiting for user to login");
                expect(serverResult.foo).toEqual(1);
              });

            });
          });

    });