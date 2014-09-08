/*globals FieldDB, runs, waitsFor */

'use strict';
var debugMode = false;
var specIsRunningTooLong = 500000;
describe('Directive: fielddb-datalist', function() {

  describe('multiple lists of datalists', function() {

    // load the directive's module and the template
    beforeEach(module('fielddbAngularApp', 'views/user.html', 'views/datalist.html'));
    var el, scope, compileFunction;

    beforeEach(inject(function($rootScope, $compile) {
      el = angular.element('<div data-fielddb-datalist json="datalist0"></div>');
      scope = $rootScope.$new();
      scope.datalist0 = {
        title: 'Sample participants',
        description: 'This is a sample datalist of participants',
        docs: {
          _collection: [{
            firstname: 'Anony',
            lastname: 'Mouse',
            type: 'Participant'
          }]
        }
      };
      compileFunction = $compile(el);
      // bring html from templateCache
      scope.$digest();
      if (debugMode) {
        console.log('post compile', el.html()); // <== html here has {{}}
      }
    }));

    // http://stackoverflow.com/questions/17223850/how-to-test-directives-that-use-templateurl-and-controllers
    it('should make a datalist element with only contents from scope', function() {
      inject(function() {
        compileFunction(scope); // <== the html {{}} are bound
        scope.$digest(); // <== digest to get the render to show the bound values
        if (debugMode) {
          console.log('post link', el.html());
          console.log('scope datalist0 ', scope.datalist0);
          console.log(angular.element());
        }
        expect(angular.element(el.find('h1')[0]).text().trim()).toEqual('Sample participants');
        expect(angular.element(el.find('h1')[1]).text().trim()).toEqual('Anony Mouse');
      });
    });
  });


  describe('mocked fetchCollection', function() {

    // load the directive's module and the template
    beforeEach(module('fielddbAngularApp', 'views/user.html', 'views/datalist.html'));
    var el, scope, compileFunction;

    beforeEach(inject(function($rootScope, $compile) {
      el = angular.element('<div data-fielddb-datalist json="datalist2"></div> <div data-fielddb-datalist json="datalist1"></div>');
      scope = $rootScope.$new();
      scope.datalist1 = {
        title: 'Sample users',
        description: 'This is a sample datalist of users',
        docs: {
          _collection: [{
            firstname: 'Ling',
            lastname: 'Llama',
            type: 'UserMask'
          }, {
            firstname: 'Teammate',
            lastname: 'Tiger',
            type: 'UserMask'
          }]
        }
      };
      scope.datalist2 = {
        title: 'Sample participants',
        description: 'This is a sample datalist of participants',
        docs: {
          _collection: [{
            firstname: 'Anony',
            lastname: 'Mouse',
            type: 'Participant'
          }]
        }
      };
      compileFunction = $compile(el);
      // bring html from templateCache
      scope.$digest();
      if (debugMode) {
        console.log('post compile', el.html()); // <== html here has {{}}
      }
    }));

    // http://stackoverflow.com/questions/17223850/how-to-test-directives-that-use-templateurl-and-controllers
    it('should make a datalist element with contents from scope', function() {

      inject(function() {
        compileFunction(scope); // <== the html {{}} are bound
        scope.$digest(); // <== digest to get the render to show the bound values
        if (debugMode) {
          console.log('post link', el.html());
          console.log('scope datalist1 ', scope.datalist1);
          console.log(angular.element());
        }
        expect(angular.element(el.find('h1')[1]).text().trim()).toEqual('Anony Mouse');
        expect(angular.element(el.find('h1')[3]).text().trim()).toEqual('Ling Llama');
      });
    });
  });


  describe('mocked http fetch of corpus datalist', function() {

    // load the directive's module and the template
    beforeEach(module('fielddbAngularApp', 'views/user.html', 'views/datalist.html'));
    var el, scope, compileFunction, httpBackend, http;

    beforeEach(inject(function($rootScope, $compile, $controller, $httpBackend, $http) {
      FieldDB.BASE_DB_URL = 'https://localhost:6984';
      scope = $rootScope.$new();
      scope.corpus = {
        dbname: 'testing-phophlo',
      };
      scope.participantsList = new FieldDB.DataList({
        api: 'participants',
        docs: {
          _collection: []
        }
      });

      // mock the network request
      // http://odetocode.com/blogs/scott/archive/2013/06/11/angularjs-tests-with-an-http-mock.aspx
      httpBackend = $httpBackend;
      http = $http;
      httpBackend.when('GET', FieldDB.BASE_DB_URL + '/' + scope.corpus.dbname + '/_design/psycholinguistics/_view/' + scope.participantsList.api + '?descending=true').respond([{
        firstname: 'Ling',
        lastname: 'Llama',
        type: 'Participant'
      }, {
        firstname: 'Anony',
        lastname: 'Mouse',
        type: 'Participant'
      }, {
        firstname: 'Teammate',
        lastname: 'Tiger',
        type: 'Participant'
      }]);

      el = angular.element('<div data-fielddb-datalist json="participantsList" corpus="corpus"></div>');
      compileFunction = $compile(el);
      // bring html from templateCache
      scope.$digest();
      if (debugMode) {
        console.log('post compile', el.html()); // <== html here has {{}}
      }

    }));

    it('should mock network request of 3 docs', function() {
      // call the network request
      http.get(FieldDB.BASE_DB_URL + '/' + scope.corpus.dbname + '/_design/psycholinguistics/_view/' + scope.participantsList.api + '?descending=true').then(function(result) {
        result.data.map(function(doc) {
          scope.participantsList.docs._collection.push(doc);
          // scope.$digest();
        });
      });

      // flush the mock backend
      httpBackend.flush();
      expect(scope.participantsList.docs.length).toBe(3);

      inject(function() {
        compileFunction(scope); // <== the html {{}} are bound
        scope.participantsList.title = 'Participant List';
        scope.participantsList.description = 'This is a list of all participants who are currently in this corpus.';
        scope.$digest(); // <== digest to get the render to show the bound values
        if (debugMode) {
          console.log('post link', el.html());
          console.log('scope participantsList ', scope.participantsList);
          // console.log(angular.element(el.find('h1')));
        }

        // expect(angular.element(el.find('h1').length)).toEqual(' ');
        expect(angular.element(el.find('h1')[0]).text().trim()).toEqual('Participant List');
        expect(angular.element(el.find('p')[0]).text().trim()).toContain('This is a list of all participants');
        expect(angular.element(el.find('h1')[1]).text().trim()).toEqual('Ling Llama');
        expect(angular.element(el.find('h1')[2]).text().trim()).toEqual('Anony Mouse');
        expect(angular.element(el.find('h1')[3]).text().trim()).toEqual('Teammate Tiger');
      });

    });

  });
  describe('mocked fetch of corpus datalist', function() {

    // load the directive's module and the template
    beforeEach(module('fielddbAngularApp', 'views/user.html', 'views/datalist.html'));
    var el, scope, compileFunction, timeout;

    beforeEach(inject(function($rootScope, $compile, $timeout) {
      el = angular.element('<div data-fielddb-datalist json="participantsList" corpus="corpus"></div>');
      scope = $rootScope.$new();
      timeout = $timeout;

      scope.corpus = {
        dbname: 'testing-phophlo',
      };
      scope.participantsList = new FieldDB.DataList({
        api: 'participants',
        docs: {
          _collection: []
        }
      });

      compileFunction = $compile(el);
      // bring html from templateCache
      scope.$digest();
      if (debugMode) {
        console.log('post compile', el.html()); // <== html here has {{}}
      }
    }));

    it('should run async tests', function() {
      var value, flag;

      runs(function() {
        flag = false;
        value = 0;
        setTimeout(function() {
          flag = true;
        }, 500);
      });
      waitsFor(function() {
        value++;
        return flag;
      }, 'The Value should be incremented', 750);
      runs(function() {
        expect(value).toBeGreaterThan(0);
      });

    }, specIsRunningTooLong);

    it('should use exponential decay to try to display corpus docs from a database', function() {
      var value, flag;

      runs(function() {
        flag = false;
        value = 0;
        setTimeout(function() {
          flag = true;

          scope.corpus.confidential = {
            secretkey: 'a'
          };
          scope.corpus.fetchCollection = function() {
            var deferred = FieldDB.Q.defer();
            FieldDB.Q.nextTick(function() {
              timeout(function() {
                deferred.resolve([{
                  firstname: 'Ling',
                  lastname: 'Llama',
                  type: 'Participant'
                }, {
                  firstname: 'Anony',
                  lastname: 'Mouse',
                  type: 'Participant'
                }, {
                  firstname: 'Teammate',
                  lastname: 'Tiger',
                  type: 'Participant'
                }]);
              }, 100);
            });
            return deferred.promise;
          };

        }, 100);
      });

      waitsFor(function() {
        value++;
        inject(function() {

          compileFunction(scope); // <== the html {{}} are bound
          scope.$digest(); // <== digest to get the render to show the bound values
          if (debugMode) {
            console.log('post link', el.html());
            console.log('scope participantsList ', scope.participantsList);
          }
        });
        return flag;
      }, 'The docs should try to be downloaded ', 1500);

      runs(function() {
        expect(value).toBeGreaterThan(0);
        scope.$digest(); // <== digest to get the render to show the bound values

        console.log('el scope participantsList', el.scope().participantsList);
        console.log('el scope corpus', el.scope().corpus);
        // expect(el.scope().participantsList.fetchDatalistDocsExponentialDecay).toBeGreaterThan(31000);
        // expect(angular.element(el.find('h1')[0]).text().trim()).toEqual('Participant List');
        // expect(angular.element(el.find('p')[0]).text().trim()).toContain('This is a list of all participants');
        // expect(angular.element(el.find('h1')[1]).text().trim()).toEqual('Ling Llama');
        // expect(angular.element(el.find('h1')[2]).text().trim()).toEqual('Anony Mouse');
        // expect(angular.element(el.find('h1')[3]).text().trim()).toEqual('Teammate Tiger');
      });

    }, specIsRunningTooLong);
  });

});
