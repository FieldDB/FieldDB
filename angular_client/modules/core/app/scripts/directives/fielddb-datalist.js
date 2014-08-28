'use strict';

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbDatalist
 * @description
 * # fielddbDatalist
 */
angular.module('fielddbAngularApp').directive('fielddbDatalist', function() {

  var fetchDatalistDocsExponentialDecay = 2000;

  var controller = function($scope, $timeout) {
    var fetchDatalistDocsIfEmpty = function() {

      if (!$scope.corpus || !$scope.corpus.confidential || !$scope.corpus.confidential.secretkey || !$scope.corpus.fetchCollection) {
        fetchDatalistDocsExponentialDecay = fetchDatalistDocsExponentialDecay * 2;
        $timeout(function() {
          if ($scope.datalist && $scope.datalist.docs && $scope.datalist.docs.length > 0) {
            return;
          } else {
            fetchDatalistDocsIfEmpty();
          }
        }, fetchDatalistDocsExponentialDecay);
        console.log(' No real corpus is available, waiting another ' + fetchDatalistDocsExponentialDecay + ' until trying to fetch docs again.');
        if ($scope.datalist) {
          $scope.datalist.fetchDatalistDocsExponentialDecay = fetchDatalistDocsExponentialDecay;
        }
        return;
      }

      $scope.corpus.authUrl = FieldDB.BASE_AUTH_URL;
      // $scope.corpus.debugMode = true;

      // console.log('fetching docs for ', $scope.corpus.toJSON());
      // $scope.datalist.title = '';
      var whatToFetch = $scope.datalist.api;
      if ($scope.datalist.docIds && $scope.datalist.docIds.length && $scope.datalist.docIds.length >= 0) {
        whatToFetch = $scope.datalist.docIds;
      }
      if (!whatToFetch || whatToFetch === []) {
        $scope.datalist.docs = [];
        $scope.$digest();
        return;
      }
      $scope.corpus.fetchCollection(whatToFetch).then(function(results) {
        // Reset the exponential decay to normal for subsequent requests
        fetchDatalistDocsExponentialDecay = 2000;

        console.log('downloaded docs', results);
        $scope.datalist.docs = $scope.datalist.docs || [];
        results.map(function(doc) {
          if (doc.type && FieldDB[doc.type]) {
            $scope.corpus.debug('Converting doc into type ' + doc.type);
            doc.confidential = $scope.corpus.confidential;
            doc = new FieldDB[doc.type](doc);
          } else {
            var guessedType = doc.jsonType || doc.collection || 'FieldDBObject';
            if ($scope.datalist.api) {
              guessedType = $scope.datalist.api[0].toUpperCase() + $scope.datalist.api.substring(1, $scope.datalist.api.length);
            }
            guessedType = guessedType.replace(/s$/, '');
            if (guessedType === 'Datalist') {
              guessedType = 'DataList';
            }
            if (FieldDB[guessedType]) {
              $scope.corpus.warn('Converting doc into guessed type ' + guessedType);
              doc.confidential = $scope.corpus.confidential;
              doc = new FieldDB[guessedType](doc);
            } else {
              $scope.corpus.warn('This doc does not have a type, it might display oddly ', doc);
            }
          }

          $scope.datalist.docs.add(doc);
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
    templateUrl: function(elem, attrs) {
      if (attrs.view === 'SubExperimentDataList') {
        return 'views/sub-experiment-datalist.html';
      } else if (attrs.view === 'Lesson') {
        return 'views/datalist.html';
      } else {
        return 'views/datalist.html';
      }
    },
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
