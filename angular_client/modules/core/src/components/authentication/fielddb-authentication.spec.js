/* globals FieldDB, localStorage, setTimeout */
"use strict";
var debugMode = false;
var specIsRunningTooLong = 5000;

localStorage.clear();

describe("Directive: fielddb-authentication", function() {

  // load the directive's module and the template
  beforeEach(module("fielddbAngular"));

  var el,
    scope,
    rootScope,
    compileFunction;

  beforeEach(inject(function($rootScope, $compile) {

    if (FieldDB && FieldDB.FieldDBObject) {
      FieldDB.FieldDBObject.bug = FieldDB.FieldDBObject.warn;
      FieldDB.FieldDBObject.alwaysConfirmOkay = true;
    }

    el = angular.element("<div data-fielddb-authentication json='authentication'></div>");
    rootScope = $rootScope;
    scope = $rootScope.$new();
    if (debugMode) {
      console.log("scope.application", scope.application);
    }
    scope.application = {
      authentication: new FieldDB.Authentication({
        user: new FieldDB.User({
          authenticated: false
        })
      })
    };
    compileFunction = $compile(el);
    // bring html from templateCache
    scope.$digest();
    if (debugMode) {
      console.log("post compile", el.html()); // <== html here has {{}}
    }
  }));

  // http://stackoverflow.com/questions/17223850/how-to-test-directives-that-use-templateurl-and-controllers
  it("should show login form if no one is logged in", function() {

    inject(function() {
      compileFunction(scope); // <== the html {{}} are bound
      scope.$digest(); // <== digest to get the render to show the bound values
      if (debugMode) {
        console.log("post link", el.html());
        console.log("scope authentication ", scope.application.authentication);
      }
      expect(angular.element(el.find("button")[0]).text().trim()).toEqual("Login");
    });
  });

  it("should show logout button if someone is logged in", function() {

    inject(function() {
      scope.application.authentication.user.authenticated = true;
      compileFunction(scope); // <== the html {{}} are bound
      scope.$digest(); // <== digest to get the render to show the bound values
      if (debugMode) {
        console.log("post link", el.html());
        console.log("scope authentication ", scope.application.authentication);
      }
      expect(angular.element(el.find("div")[0]).attr("class")).toContain("ng-hide");
      expect(angular.element(el.find("button")[1]).text().trim()).toEqual("Logout");

    });
  });

  it("should be able to use encryption for client side user storage in karma in phantom js", function(done) {

    var previousClientSideLogin = new FieldDB.Authentication({
      // debugMode: true
    });
    expect(previousClientSideLogin).toBeDefined();
    console.log("trying to set the user");
    previousClientSideLogin.user = {
      _id: "jenkins",
      username: "jenkins",
      debugMode: true
    };
    expect(previousClientSideLogin.user.fieldDBtype).toEqual("User");
    expect(previousClientSideLogin.userMask).toBeUndefined();

    previousClientSideLogin.user = {
      _rev: "2-need_a_rev_to_cause_save",
      username: "jenkins",
      anotherfield: "hi",
      researchInterest: "Test automation",
      prefs: {
        numVisibleDatum: 2
      }
    };
    expect(previousClientSideLogin).toBeDefined();
    expect(previousClientSideLogin.user).toBeDefined();
    expect(previousClientSideLogin.user.researchInterest).toContain("Test automation");

    var whatWeExpect = function() {
      /* should be saved */
      var clientSideUserKey = localStorage.getItem("X09qKvcQn8DnANzGdrZFqCRUutIi2C");
      expect(clientSideUserKey).toBeDefined();

      clientSideUserKey = clientSideUserKey + "jenkins";
      var clientSideUser = localStorage.getItem(clientSideUserKey);
      expect(clientSideUser).toBeDefined();
      expect(clientSideUser).toContain("confidential");

    };


    if (previousClientSideLogin.user.savingPromise) {
      console.log("savingPromise");
      previousClientSideLogin.user.savingPromise.then(function(promisedUser) {
        whatWeExpect(promisedUser);
      }, function(error) {
        console.log("Error running auth test", error);
        expect(false).toBeTruthy();
      }).done(done);
    } else if (previousClientSideLogin.user.whenReady) {
      console.log("whenReady");

      previousClientSideLogin.user.whenReady.then(function(promisedUser) {
        whatWeExpect(promisedUser);
      }, function(error) {
        console.log("Error running auth test", error);
        expect(false).toBeTruthy();
      }).done(done);
    } else if (previousClientSideLogin.resumingSessionPromise) {
      console.log("resumingSessionPromise");
      previousClientSideLogin.resumingSessionPromise.then(function(promisedUser) {
        whatWeExpect(promisedUser);
      }, function(error) {
        console.log("Error running auth test", error);
        expect(false).toBeTruthy();
      }).done(done);
    } else {
      console.log("Nothing happened. ");
      expect(false).toBeTruthy();
      done();
    }


  }, specIsRunningTooLong);

  it("should run async tests", function(done) {
    var promiseResult;

    setTimeout(function() {
      promiseResult = "ran async";
      expect(promiseResult).toEqual("ran async");
      done();
    }, 500);

  }, specIsRunningTooLong);


  it("should register users", function(done) {

    compileFunction(scope); // <== the html {{}} are bound
    scope.application.authentication.debugMode = true;

    expect(rootScope.register).toBeDefined();
    rootScope.register({
      username: "testangularcoreregister",
      password: "test",
      confirmPassword: "tes"
    }).then(function(resultScope) {
      expect(resultScope).toBeDefined();
      expect(resultScope.application).toBeDefined();
      expect(resultScope.application.authentication).toEqual(scope.application.authentication);
      if (resultScope.application.authentication.error.indexOf("offline") === -1) {
        expect(resultScope.application.authentication.error).toEqual("Passwords don't match, please double check your password.");
      }
    }, function(error) {
      expect(error).toBeFalsy();
    }).fail(function(error) {
      console.log("error", error);
      expect(error).toBeFalsy();
    }).done(done);

  }, specIsRunningTooLong);

  it("should login users", function(done) {
    //https://egghead.io/lessons/angularjs-unit-testing-directive-scope
    compileFunction(scope); // <== the html {{}} are bound
    expect(el.scope().login).toBeDefined();
    el.scope().login({
      username: "jenkins",
      password: "phoneme"
    }).then(function(resultScope) {
      console.log("success");
      expect(resultScope).toEqual(scope);
      expect(resultScope.application.authentication.error).toEqual("Unable to contact the server, are you sure you're not offline?");
    }, function(error) {
      console.log("fail", error);
      expect(error).toBeFalsy();
    }).fail(function(error) {
      console.log("error", error);
      expect(error).toBeFalsy();
    }).done(done);

  }, specIsRunningTooLong);

  it("should indirectly cause the user to be saved locally by setting the user ", function(done) {

    var anotherAuthLoad = new FieldDB.Authentication({
      user: {
        username: "jenkins"
      }
    });
    expect(anotherAuthLoad.user.researchInterest).toEqual("");

    expect(anotherAuthLoad.user.warnMessage).toContain("Refusing to save a user doc which is incomplete");
    anotherAuthLoad.user.warnMessage = "";

    // user has default prefs for now
    expect(anotherAuthLoad.user.prefs).toBeUndefined();
    expect(anotherAuthLoad.user.fieldDBtype).toEqual("User");

    anotherAuthLoad.user.fetch().then(function(userFetchResult) {

      expect(userFetchResult).toEqual(anotherAuthLoad.user);
      expect(anotherAuthLoad.user.researchInterest).toContain("Test automation");
      // expect(anotherAuthLoad.user.prefs.unicodes.length).toEqual(22);
      expect(anotherAuthLoad.user.prefs.numVisibleDatum).toEqual(2);

    }, function(error) {
      console.log("fail", error);
      expect(error).toBeFalsy();
    }).fail(function(error) {
      console.log("error", error);
      expect(error).toBeFalsy();
    }).done(done);

  }, specIsRunningTooLong);


  it("should logout users", function(done) {
    compileFunction(scope); // <== the html {{}} are bound
    expect(el.scope().logout).toBeDefined();

    scope.application.authentication.user = {
      username: "jenkins"
    };

    scope.application.authentication.user.fetch().then(function(resultOfFetch) {
      console.log(resultOfFetch);
      // expect(scope.application.authentication.user).toEqual(" ");
      expect(scope.application.authentication.user.researchInterest).toContain("Test automation");
      expect(scope.application.authentication.user.username).toEqual("jenkins");


      el.scope().logout().then(function(resultScope) {
        expect(resultScope.application.authentication).toEqual(scope.application.authentication);
        expect(resultScope.application.authentication.error).toEqual("Unable to contact the server, are you sure you're not offline?");
      }, function(errorLoggingOut) {
        console.log("fail", errorLoggingOut);
        expect(errorLoggingOut).toBeFalsy();
      }).fail(function(errorLoggingOut) {
        console.log("errorLoggingOut", errorLoggingOut);
        expect(errorLoggingOut).toBeFalsy();
      });

    }, function(errorFetching) {
      console.log("fail", errorFetching);
      expect(errorFetching).toBeFalsy();
    }).fail(function(errorFetching) {
      console.log("errorFetching", errorFetching);
      expect(errorFetching).toBeFalsy();
    }).done(done);

  }, specIsRunningTooLong);

});
