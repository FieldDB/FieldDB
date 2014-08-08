'use strict';

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbDatalist
 * @description
 * # fielddbDatalist
 */
angular.module('fielddbAngularApp').directive('fielddbDatalist', function() {

  var db;
  var fetchDatalistDocsExponentialDecay = 2000;

  var controller = function($scope, $timeout) {
    var fetchDatalistDocsIfEmpty = function() {

      if (!FieldDB.BASE_DB_URL || !$scope.corpus) {
        fetchDatalistDocsExponentialDecay = fetchDatalistDocsExponentialDecay * 2;
        $timeout(function() {
          if ($scope.docs && $scope.docs.length > 0) {
            return;
          } else {
            fetchDatalistDocsIfEmpty();
          }
        }, fetchDatalistDocsExponentialDecay);
        console.log(' No URL specified, Waiting another ' + fetchDatalistDocsExponentialDecay + ' until trying to fetch docs again.');

        return;
      }

      db = db || new FieldDB.PsycholinguisticsDatabase({
        dbname: $scope.corpus.dbname,
        url: FieldDB.BASE_DB_URL,
        authUrl: FieldDB.BASE_AUTH_URL
      });
      db.debugMode = true;

      // console.log('fetching docs for ', db.toJSON());
      db.fetchCollection('speakers').then(function(results) {

        console.log('downloaded docs', results);
        $scope.docs = $scope.docs || [];
        results.map(function(doc) {
          if (doc.type && FieldDB[doc.type]) {
            db.debug("Converting doc into type " + doc.type);
            doc.confidential = $scope.corpus.confidential;
            doc = new FieldDB[doc.type](doc);
          } else {
            db.warn("This doc does not have a type, it might display oddly ", doc);
          }
          $scope.docs.push(doc);
        });
        $scope.$digest();

      }, function(reason) {

        console.log('No docs docs...', reason);
        fetchDatalistDocsExponentialDecay = fetchDatalistDocsExponentialDecay * 2;
        $scope.corpus.fetchDatalistDocsExponentialDecay = fetchDatalistDocsExponentialDecay;
        console.log(' No connetion, Waiting another ' + fetchDatalistDocsExponentialDecay + ' until trying to fetch docs again.');
        $scope.$digest();

        $timeout(function() {
          if ($scope.docs && $scope.docs.length > 0) {
            return;
          } else {
            fetchDatalistDocsIfEmpty();
          }
        }, fetchDatalistDocsExponentialDecay);

      });

    };

    fetchDatalistDocsIfEmpty();

  };
  controller.$inject = ['$scope', '$timeout'];

  var directiveDefinitionObject = {
    templateUrl: 'views/datalist.html', // or // function(tElement, tAttrs) { ... },
    restrict: 'A',
    transclude: false,
    scope: {
      docs: '=json',
      corpus: '=corpus'
    },
    controller: controller,
    link: function postLink() {},
    priority: 0,
    replace: false,
    controllerAs: 'stringAlias'
  };
  return directiveDefinitionObject;
});
