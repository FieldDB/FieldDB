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

    // $scope.dropSuccessHandler = function($event, index, array) {
    //   // array.splice(index, 1);
    //   // $scope.orphanedItem =
    //   console.log('removing ' + index);
    // };

    $scope.onDrop = function($event, $data, index) {
      console.log('inserting at ' + index, $data);
      if ($scope.datalist && $scope.datalist.docs) {
        if ($scope.datalist.docs.find($data).length === 0) {
          $scope.datalist.docs.add($data);
        }
        $scope.datalist.docs.reorder($data, index);
      }
    };

    $scope.removeItemFromList = function(item) {
      if ($scope.datalist && $scope.datalist.docs) {
        $scope.datalist.docs.remove(item);
      }
    };

    $scope.save = function() {
      $scope.datalist.save().then(function() {
        if (!$scope.$$phase) {
          $scope.$digest();
        }
      });
    };

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
        if (!$scope.$$phase) {
          $scope.$digest();
        }
        return;
      }
      $scope.corpus.fetchCollection(whatToFetch).then(function(results) {
        // Reset the exponential decay to normal for subsequent requests
        fetchDatalistDocsExponentialDecay = 2000;

        console.log('downloaded docs', results);
        $scope.datalist.confidential = $scope.corpus.confidential;
        $scope.datalist.populate(results.map(function(doc) {
          doc.url = FieldDB.Database.prototype.BASE_DB_URL + '/' + $scope.corpus.dbname;
          return doc;
        }));

        if (!$scope.$$phase) {
          $scope.$digest();
        }

      }, function(reason) {

        console.log('No docs docs...', reason);
        fetchDatalistDocsExponentialDecay = fetchDatalistDocsExponentialDecay * 2;
        $scope.datalist.fetchDatalistDocsExponentialDecay = fetchDatalistDocsExponentialDecay;
        console.log(' No connetion, Waiting another ' + fetchDatalistDocsExponentialDecay + ' until trying to fetch docs again.');
        if (!$scope.$$phase) {
          $scope.$digest();
        }

        $timeout(function() {
          if ($scope.datalist && $scope.datalist.docs && $scope.datalist.docs.length > 0) {
            return;
          } else {
            fetchDatalistDocsIfEmpty();
          }
        }, fetchDatalistDocsExponentialDecay);

      });

    };

    if (!$scope.datalist.docs || $scope.datalist.docs.length === 0) {
      fetchDatalistDocsIfEmpty();
    }

    $scope.undo = function() {
      var type = $scope.datalist.type;
      if (!type || !FieldDB[type]) {
        type = 'DataList';
      }
      $scope.datalist = new FieldDB[type]({
        id: $scope.datalist.id,
        dbname: $scope.datalist.dbname,
        url: $scope.datalist.url
      });
      $scope.datalist.fetch(FieldDB.Database.prototype.BASE_DB_URL).then(function() {
        fetchDatalistDocsIfEmpty();
      });
    };

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
