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

      if (!FieldDB.BASE_DB_URL || !$scope.corpus || !$scope.corpus.confidential || !$scope.corpus.confidential.secretkey) {
        fetchDatalistDocsExponentialDecay = fetchDatalistDocsExponentialDecay * 2;
        $timeout(function() {
          if ($scope.datalist && $scope.datalist.docs && $scope.datalist.docs.length > 0) {
            return;
          } else {
            fetchDatalistDocsIfEmpty();
          }
        }, fetchDatalistDocsExponentialDecay);
        console.log(' No URL or corpus specified, waiting another ' + fetchDatalistDocsExponentialDecay + ' until trying to fetch docs again.');

        return;
      }

      db = db || new FieldDB.PsycholinguisticsDatabase({
        dbname: $scope.corpus.dbname,
        url: FieldDB.BASE_DB_URL,
        authUrl: FieldDB.BASE_AUTH_URL
      });
      db.debugMode = true;

      // console.log('fetching docs for ', db.toJSON());
      $scope.datalist.title = '';
      db.fetchCollection($scope.datalist.api).then(function(results) {

        console.log('downloaded docs', results);
        $scope.datalist.docs = $scope.datalist.docs || [];
        results.map(function(doc) {
          if (doc.type && FieldDB[doc.type]) {
            db.debug('Converting doc into type ' + doc.type);
            doc.confidential = $scope.corpus.confidential;
            doc = new FieldDB[doc.type](doc);
          } else {
            db.warn('This doc does not have a type, it might display oddly ', doc);
          }
          $scope.datalist.docs.push(doc);
        });
        $scope.$digest();

      }, function(reason) {

        console.log('No docs docs...', reason);
        fetchDatalistDocsExponentialDecay = fetchDatalistDocsExponentialDecay * 2;
        $scope.datalist.fetchDatalistDocsExponentialDecay = fetchDatalistDocsExponentialDecay;
        console.log(' No connetion, Waiting another ' + fetchDatalistDocsExponentialDecay + ' until trying to fetch docs again.');
        $scope.$digest();

        $timeout(function() {
          if ($scope.datalist && $scope.datalist.docs && $scope.datalist.docs.length > 0) {
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
      datalist: '=json',
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
