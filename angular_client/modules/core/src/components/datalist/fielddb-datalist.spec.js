/*globals FieldDB */

"use strict";
var debugMode = false;
var specIsRunningTooLong = 500000;
describe("Directive: fielddb-datalist", function() {

  describe("multiple lists of datalists", function() {

    // load the directive's module and the template
    beforeEach(module("fielddbAngular"));
    var el, scope, compileFunction;

    beforeEach(inject(function($rootScope, $compile) {
      el = angular.element("<div data-fielddb-datalist json='datalist0'></div>");
      scope = $rootScope.$new();
      scope.datalist0 = {
        title: {
          default: "Sample participants"
        },
        description: {
          default: "This is a sample datalist of participants"
        },
        docs: {
          _collection: [new FieldDB.Participant({
            fields: [{
              id: "firstname",
              labelExperimenters: "Prénom",
              value: "Annony"
            }, {
              id: "lastname",
              value: "Mouse"
            }],
            fieldDBtype: "Participant"
          })]
        }
      };
      compileFunction = $compile(el);
      // bring html from templateCache
      scope.$digest();
      if (debugMode) {
        console.log("post compile", el.html()); // <== html here has {{}}
      }
    }));

    // http://stackoverflow.com/questions/17223850/how-to-test-directives-that-use-templateurl-and-controllers
    it("should make a datalist element with only contents from scope", function() {
      inject(function() {
        compileFunction(scope); // <== the html {{}} are bound
        if (!scope.$$phase) {
          scope.$digest(); // <== digest to get the render to show the bound values
        }
        if (debugMode) {
          console.log("post link", el.html());
          console.log("scope datalist0 ", scope.datalist0);
          console.log(angular.element());
        }
        expect(angular.element(el.find("h1")[0]).text().trim()).toEqual("Sample participants");
        expect(angular.element(el.find("li")[0]).text().replace(/\W\W+/g, " ").trim()).toEqual("Prénom Annony");
        expect(angular.element(el.find("li")[1]).text().replace(/\W\W+/g, " ").trim()).toEqual("lastname Mouse");
      });
    });
  });


  describe("mocked fetchCollection", function() {

    // load the directive's module and the template
    beforeEach(module("fielddbAngular"));
    var el, scope, compileFunction;

    beforeEach(inject(function($rootScope, $compile) {
      // el = angular.element("<div data-fielddb-datalist json='datalist1'></div>");
      el = angular.element("<div data-fielddb-datalist json='datalist2'></div> <div data-fielddb-datalist json='datalist1'></div>");
      scope = $rootScope.$new();
      scope.datalist1 = {
        // debugMode: true,
        title: {
          default: "Community corpus team"
        },
        description: {
          default: "This is a sample datalist of users"
        },
        docs: new FieldDB.Users([{
          username: "lingllama",
          firstname: "Ling",
          lastname: "Llama",
          fieldDBtype: "UserMask"
        }, {
          username: "teammatetiger",
          firstname: "Teammate",
          lastname: "Tiger",
          fieldDBtype: "UserMask"
        }])
      };
      scope.datalist2 = {
        title: {
          default: "Sample participants"
        },
        description: {
          default: "This is a sample datalist of participants"
        },
        docs: new FieldDB.Users([new FieldDB.Participant({
          _id: "AM02",
          fields: [{
            id: "firstname",
            labelExperimenters: "Prénom",
            value: "Anony"
          }, {
            id: "lastname",
            value: "Mouse"
          }],
          fieldDBtype: "Participant"
        })])
      };
      compileFunction = $compile(el);
      // bring html from templateCache
      scope.$digest();
      if (debugMode) {
        console.log("post compile", el.html()); // <== html here has {{}}
      }
    }));

    // http://stackoverflow.com/questions/17223850/how-to-test-directives-that-use-templateurl-and-controllers
    it("should make a datalist element with contents from scope", function() {

      inject(function() {
        compileFunction(scope); // <== the html {{}} are bound
        try {
          if (!scope.$$phase) {
            scope.$digest(); // <== digest to get the render to show the bound values
          }
        } catch (e) {
          console.log("data list digest threw errors");
        }
        if (debugMode) {
          console.log("post link", el.html());
          console.log("scope datalist1 ", scope.datalist1);
          console.log(angular.element());
        }
        expect(angular.element(el.find("h1")[0]).text().trim()).toEqual("Sample participants");
        expect(angular.element(el.find("li")[0]).text().replace(/\W\W+/g, " ").trim()).toEqual("Prénom Anony");
        expect(angular.element(el.find("li")[1]).text().replace(/\W\W+/g, " ").trim()).toEqual("lastname Mouse");

        expect(angular.element(el.find("h1")[1]).text().trim()).toEqual("Community corpus team");
        expect(angular.element(el.find("h1")[2]).text().trim()).toEqual("Ling Llama");
        expect(angular.element(el.find("h1")[3]).text().trim()).toEqual("Teammate Tiger");
      });

    });
  });


  describe("mocked http fetch of corpus datalist", function() {

    // load the directive's module and the template
    beforeEach(module("fielddbAngular"));
    var el, scope, compileFunction, httpBackend, http;

    beforeEach(inject(function($rootScope, $compile, $controller, $httpBackend, $http) {
      FieldDB.BASE_DB_URL = "https://localhost:6984";
      scope = $rootScope.$new();
      scope.corpus = {
        dbname: "testing-phophlo",
      };
      scope.participantsList = new FieldDB.DataList({
        api: "participants",
        docs: {
          _collection: []
        }
      });

      // mock the network request
      // http://odetocode.com/blogs/scott/archive/2013/06/11/angularjs-tests-with-an-http-mock.aspx
      httpBackend = $httpBackend;
      http = $http;
      httpBackend.when("GET", FieldDB.BASE_DB_URL + "/" + scope.corpus.dbname + "/_design/psycholinguistics/_view/" + scope.participantsList.api + "?descending=true").respond([{
        _id: "lingllama",
        fields: [{
          id: "firstname",
          value: "Ling"
        }, {
          id: "lastname",
          value: "Llama"
        }],
        fieldDBtype: "Participant"
      }, {
        _id: "AM04",
        fields: [{
          id: "firstname",
          value: "Anony"
        }, {
          id: "lastname",
          value: "Mouse"
        }],
        fieldDBtype: "Participant"
      }, {
        _id: "teammatetiger",
        fields: [{
          id: "firstname",
          value: "Teammate"
        }, {
          id: "lastname",
          value: "Tiger"
        }],
        fieldDBtype: "Participant"
      }]);

      el = angular.element("<div data-fielddb-datalist json='participantsList' corpus='corpus'></div>");
      compileFunction = $compile(el);
      // bring html from templateCache
      scope.$digest();
      if (debugMode) {
        console.log("post compile", el.html()); // <== html here has {{}}
      }

    }));

    it("should mock network request of 3 docs", function() {
      // call the network request
      http.get(FieldDB.BASE_DB_URL + "/" + scope.corpus.dbname + "/_design/psycholinguistics/_view/" + scope.participantsList.api + "?descending=true").then(function(result) {
        // scope.participantsList.debugMode = true;
        scope.participantsList.populate(result.data);
        // result.data.map(function(doc) {
        //   scope.participantsList.docs._collection.push(new FieldDB.Document(doc));
        //   // scope.$digest();
        // });
      });

      // flush the mock backend
      httpBackend.flush();
      expect(scope.participantsList.docs.length).toBe(3);

      inject(function() {
        try {
          compileFunction(scope); // <== the html {{}} are bound
        } catch (e) {
          console.warn("couldnt bind scope html", e);
        }
        scope.participantsList.title = {
          default: "Participant List"
        };
        scope.participantsList.description = {
          default: "This is a list of all participants who are currently in this corpus."
        };
        try {
          if (!scope.$$phase) {
            scope.$digest(); // <== digest to get the render to show the bound values
          }
        } catch (e) {
          console.warn("couldnt/didn't need to digest scope to show the bound values");
        }
        if (debugMode) {
          console.log("post link", el.html());
          console.log("scope participantsList ", scope.participantsList);
          // console.log(angular.element(el.find("h1")));
        }
        // console.log(angular.element(el.find("li")));
        expect(angular.element(el.find("li")[0]).text().replace(/\W\W+/g, " ").trim()).toEqual("firstname Ling");
        expect(angular.element(el.find("li")[1]).text().replace(/\W\W+/g, " ").trim()).toEqual("lastname Llama");

        expect(angular.element(el.find("li")[6]).text().replace(/\W\W+/g, " ").trim()).toEqual("firstname Anony");
        expect(angular.element(el.find("li")[7]).text().replace(/\W\W+/g, " ").trim()).toEqual("lastname Mouse");

        expect(angular.element(el.find("li")[12]).text().replace(/\W\W+/g, " ").trim()).toEqual("firstname Teammate");
        expect(angular.element(el.find("li")[13]).text().replace(/\W\W+/g, " ").trim()).toEqual("lastname Tiger");

      });

    });

  });
  describe("mocked fetch of corpus datalist", function() {

    // load the directive's module and the template
    beforeEach(module("fielddbAngular"));
    var el, scope, compileFunction, timeout;

    beforeEach(inject(function($rootScope, $compile, $timeout) {
      el = angular.element("<div data-fielddb-datalist json='participantsList' corpus='corpus'></div>");
      scope = $rootScope.$new();
      timeout = $timeout;

      scope.corpus = {
        dbname: "testing-phophlo",
      };
      scope.participantsList = new FieldDB.DataList({
        api: "participants",
        docs: {
          _collection: []
        }
      });

      compileFunction = $compile(el);
      // bring html from templateCache
      scope.$digest();
      if (debugMode) {
        console.log("post compile", el.html()); // <== html here has {{}}
      }
    }));

    it("should use exponential decay to try to display corpus docs from a database", function(done) {


      scope.corpus.confidential = {
        secretkey: "a"
      };
      scope.corpus.fetchCollection = function() {
        var deferred = FieldDB.Q.defer();
        FieldDB.Q.nextTick(function() {
          deferred.resolve([{
            _id: "lingllama",
            fields: [{
              id: "firstname",
              value: "Ling"
            }, {
              id: "lastname",
              value: "Llama"
            }],
            fieldDBtype: "UserMask"
          }, {
            _id: "AM04",
            fields: [{
              id: "firstname",
              value: "Anony"
            }, {
              id: "lastname",
              value: "Mouse"
            }],
            fieldDBtype: "UserMask"
          }, {
            _id: "teammatetiger",
            fields: [{
              id: "firstname",
              value: "Teammate"
            }, {
              id: "lastname",
              value: "Tiger"
            }],
            fieldDBtype: "UserMask"
          }]);
        });
        return deferred.promise;
      };

      // inject(function() {

      //   compileFunction(scope); // <== the html {{}} are bound
      //   if (!scope.$$phase) {
      //     scope.$digest(); // <== digest to get the render to show the bound values
      //   }
      //   if (debugMode) {
      //     console.log("post link", el.html());
      //     console.log("scope participantsList ", scope.participantsList);
      //   }
      // });


      compileFunction(scope); // <== the html {{}} are bound
      if (!scope.$$phase) {
        scope.$digest(); // <== digest to get the render to show the bound values
      }

      if (debugMode) {
        console.log("el scope participantsList", el.scope().participantsList);
        console.log("el scope corpus", el.scope().corpus);
      }

      scope.corpus.fetchCollection().then(function(fetchresult) {
        console.log(fetchresult);
        expect(fetchresult.length).toEqual(3);
        // expect(el.scope().participantsList.docs).toEqual(" ");
        console.log("TODO populate the list with the mocked fetch.");
        if (!scope.$$phase) {
          scope.$digest(); // <== digest to get the render to show the bound values
        }
        console.log(el.html());


        // expect(el.scope().participantsList.fetchDatalistDocsExponentialDecay).toBeGreaterThan(31000);
        // expect(angular.element(el.find("h1")[0]).text().trim()).toEqual("Participant List");
        // expect(angular.element(el.find("p")[0]).text().trim()).toContain("This is a list of all participants");
        // expect(angular.element(el.find("h1")[1]).text().trim()).toEqual("Ling Llama");
        // expect(angular.element(el.find("h1")[2]).text().trim()).toEqual("Anony Mouse");
        // expect(angular.element(el.find("h1")[3]).text().trim()).toEqual("Teammate Tiger");

      }, function(error) {
        console.log("fail", error);
        expect(error).toBeFalsy();
      }).fail(function(error) {
        console.log("error", error);
        expect(error).toBeFalsy();
      }).done(done);


    }, specIsRunningTooLong);
  });

});
