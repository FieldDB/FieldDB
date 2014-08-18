/*globals FieldDB, runs, waitsFor */

'use strict';
var debug = false;
var specIsRunningTooLong = 500000;
describe('Directive: fielddb-datalist', function() {

  describe('multiple lists of datalists', function() {

    // load the directive's module and the template
    beforeEach(module('fielddbAngularApp', 'views/user.html', 'views/datalist.html'));
    var el, scope, compileFunction;

    beforeEach(inject(function($rootScope, $compile) {
      el = angular.element('<div data-fielddb-datalist json="datalist2"></div> <div data-fielddb-datalist json="datalist1"></div>');
      scope = $rootScope.$new();
      scope.datalist1 = {
        title: 'Sample users',
        description: 'This is a sample datalist of users',
        docs: [{
          firstname: 'Ling',
          lastname: 'Llama',
          type: 'UserMask'
        }, {
          firstname: 'Teammate',
          lastname: 'Tiger',
          type: 'UserMask'
        }]
      };
      scope.datalist2 = {
        title: 'Sample participants',
        description: 'This is a sample datalist of participants',
        docs: [{
          firstname: 'Anony',
          lastname: 'Mouse',
          type: 'Participant'
        }]
      };
      compileFunction = $compile(el);
      // bring html from templateCache
      scope.$digest();
      if (debug) {
        console.log('post compile', el.html()); // <== html here has {{}}
      }
    }));

    // http://stackoverflow.com/questions/17223850/how-to-test-directives-that-use-templateurl-and-controllers
    it('should make a datalist element with contents from scope', function() {

      inject(function() {
        compileFunction(scope); // <== the html {{}} are bound
        scope.$digest(); // <== digest to get the render to show the bound values
        if (debug) {
          console.log('post link', el.html());
          console.log('scope team ', scope.team);
          console.log('scope datalist1 ', scope.datalist1);
          console.log(angular.element());
        }
        expect(angular.element(el.find('h1')[1]).text().trim()).toEqual('Anony Mouse');
        expect(angular.element(el.find('h1')[3]).text().trim()).toEqual('Ling Llama');
      });
    });
  });


  describe('fetch of corpus datalist', function() {

    // load the directive's module and the template
    beforeEach(module('fielddbAngularApp', 'views/user.html', 'views/datalist.html'));
    var el, scope, compileFunction, httpBackend, http;

    beforeEach(inject(function($rootScope, $compile, $controller, $httpBackend, $http) {
      FieldDB.BASE_DB_URL = 'https://localhost:6984';

      scope = $rootScope.$new();
      scope.corpus = {
        dbname: 'testing-phophlo',
        confidential: {
          secretkey: 'a'
        }
      };
      scope.participantsList = {
        api: 'participants',
        docs: []
      };

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
      if (debug) {
        console.log('post compile', el.html()); // <== html here has {{}}
      }

    }));

    it('should mock network request of 3 docs', function() {
      // call the network request
      http.get(FieldDB.BASE_DB_URL + '/' + scope.corpus.dbname + '/_design/psycholinguistics/_view/' + scope.participantsList.api + '?descending=true').then(function(result) {
        result.data.map(function(doc) {
          scope.participantsList.docs.push(doc);
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
        if (debug) {
          console.log('post link', el.html());
          console.log('scope team ', scope.team);
          console.log('scope docs ', scope.docs);
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

    it('should try to display corpus docs from a database using CORS', function() {
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
        inject(function() {
          compileFunction(scope); // <== the html {{}} are bound
          scope.$digest(); // <== digest to get the render to show the bound values
          if (debug) {
            console.log('post link', el.html());
            console.log('scope team ', scope.team);
            console.log('scope docs ', scope.docs);
          }
        });
        return flag;
      }, 'The docs should try to be downloaded ', 1000);

      runs(function() {
        expect(value).toBeGreaterThan(0);
        console.log('el scope participantsList', el.scope().participantsList);
        expect(el.scope().participantsList.fetchDatalistDocsExponentialDecay).toBeGreaterThan(31000);
      });

    }, specIsRunningTooLong);
  });

});
