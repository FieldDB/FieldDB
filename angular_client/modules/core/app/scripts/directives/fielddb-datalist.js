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
        console.log(' No URL or corpus specified, waiting another ' + $scope.datalist.fetchDatalistDocsExponentialDecay + ' until trying to fetch docs again.');
        if ($scope.datalist) {
          $scope.datalist.fetchDatalistDocsExponentialDecay = fetchDatalistDocsExponentialDecay;
        }
        return;
      }

      db = db || new FieldDB.Database({
        dbname: $scope.corpus.dbname,
        url: FieldDB.BASE_DB_URL,
        authUrl: FieldDB.BASE_AUTH_URL
      });
      db.debugMode = true;

      // console.log('fetching docs for ', db.toJSON());
      // $scope.datalist.title = '';
      var whatToFetch = $scope.datalist.api;
      if ($scope.datalist.docIds && $scope.datalist.docIds.length && $scope.datalist.docIds.length >= 0) {
        whatToFetch = $scope.datalist.docIds;
      }
      if (whatToFetch === []) {
        $scope.datalist.docs = [];
        $scope.$digest();
        return;
      }
      db.fetchCollection(whatToFetch).then(function(results) {
        // Reset the exponential decay to normal for subsequent requests
        fetchDatalistDocsExponentialDecay = 2000;

        console.log('downloaded docs', results);
        $scope.datalist.docs = $scope.datalist.docs || [];
        results.map(function(doc) {
          if (doc.type && FieldDB[doc.type]) {
            db.debug('Converting doc into type ' + doc.type);
            doc.confidential = $scope.corpus.confidential;
            doc = new FieldDB[doc.type](doc);
          } else {
            db.warn('This doc does not have a type, it might display oddly ', doc);
            var guessedType = doc.jsonType || 'FieldDBObject';
            if ($scope.datalist.api) {
              guessedType = $scope.datalist.api[0].toUpperCase() + $scope.datalist.api.substring(1, $scope.datalist.api.length);
              guessedType = guessedType.replace(/s$/, '');
            }
            if (guessedType === 'Datalist') {
              guessedType = 'DataList';
            }
            if (FieldDB[guessedType]) {
              db.warn('Converting doc into guessed type ' + guessedType);
              doc.confidential = $scope.corpus.confidential;
              doc = new FieldDB[guessedType](doc);
            }
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

    $scope.canAddNewItemsToDataList = function() {
      return false;
    };

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
