"use strict";

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbCollection
 * @description
 * # fielddbCollection
 */
angular.module("fielddbAngularApp").directive("fielddbCollection", function() {


  var controller = function($scope, $timeout) {
    var fetchCollectionDocsExponentialDecay = 2000;

    // $scope.dropSuccessHandler = function($event, index, array) {
    //   // array.splice(index, 1);
    //   // $scope.orphanedItem =
    //   console.log("removing " + index);
    // };

    $scope.onDrop = function($event, $data, index) {
      console.log("inserting at " + index, $data);
      if ($scope.collection && $scope.collection.docs) {
        if ($scope.collection.docs.find($data).length === 0) {
          $scope.collection.docs.add($data);
        }
        $scope.collection.docs.reorder($data, index);
      }
    };

    $scope.removeItemFromList = function(item) {
      if ($scope.collection && $scope.collection.docs) {
        $scope.collection.docs.remove(item);
      }
    };

    $scope.save = function() {
      $scope.collection.save().then(function() {
        if (!$scope.$$phase) {
          $scope.$digest(); //$digest or $apply
        }
      });
    };

    var fetchCollectionDocsIfEmpty = function() {

      if (!$scope.corpus || !$scope.corpus.confidential || !$scope.corpus.confidential.secretkey || !$scope.corpus.fetchCollection) {
        fetchCollectionDocsExponentialDecay = fetchCollectionDocsExponentialDecay * 2;
        if (fetchCollectionDocsExponentialDecay >= Infinity) {
          console.log(" Giving up on getting a real corpus. Already at " + fetchCollectionDocsExponentialDecay + ".");
          return;
        }
        $timeout(function() {
          if ($scope.collection && $scope.collection.docs && $scope.collection.docs.length > 0) {
            return;
          } else {
            fetchCollectionDocsIfEmpty();
          }
        }, fetchCollectionDocsExponentialDecay);
        console.log(" No real corpus is available, waiting another " + fetchCollectionDocsExponentialDecay + " until trying to fetch docs again.");
        if ($scope.collection) {
          $scope.collection.fetchCollectionDocsExponentialDecay = fetchCollectionDocsExponentialDecay;
        }
        return;
      }
      if (FieldDB && FieldDB.Database) {
        $scope.corpus.authUrl = FieldDB.Database.prototype.BASE_AUTH_URL;
      }
      // $scope.corpus.debugMode = true;

      // console.log("fetching docs for ", $scope.corpus.toJSON());
      // $scope.collection.title = "";
      var whatToFetch = $scope.collection.api;
      if ($scope.collection.docIds && $scope.collection.docIds.length && $scope.collection.docIds.length >= 0) {
        whatToFetch = $scope.collection.docIds;
      }
      if (!whatToFetch || whatToFetch === []) {
        // $scope.collection.docs = {
        //   _collection: []
        // };
        if (!$scope.$$phase) {
          $scope.$digest(); //$digest or $apply
        }
        return;
      }
      $scope.corpus.fetchCollection(whatToFetch).then(function(results) {
        // Reset the exponential decay to normal for subsequent requests
        fetchCollectionDocsExponentialDecay = 2000;

        console.log("downloaded docs", results);
        $scope.collection.confidential = $scope.corpus.confidential;
        $scope.collection.populate(results.map(function(doc) {
          doc.url = FieldDB.Database.prototype.BASE_DB_URL + "/" + $scope.corpus.dbname;
          return doc;
        }));

        if (!$scope.$$phase) {
          $scope.$digest(); //$digest or $apply
        }

      }, function(reason) {

        console.log("No docs docs...", reason);
        fetchCollectionDocsExponentialDecay = fetchCollectionDocsExponentialDecay * 2;
        $scope.collection.fetchCollectionDocsExponentialDecay = fetchCollectionDocsExponentialDecay;
        console.log(" No connetion, Waiting another " + fetchCollectionDocsExponentialDecay + " until trying to fetch docs again.");
        if (!$scope.$$phase) {
          $scope.$digest(); //$digest or $apply
        }

        $timeout(function() {
          if ($scope.collection && $scope.collection.docs && $scope.collection.docs.length > 0) {
            return;
          } else {
            fetchCollectionDocsIfEmpty();
          }
        }, fetchCollectionDocsExponentialDecay);

      });

    };

    fetchCollectionDocsIfEmpty();

    $scope.undo = function() {
      var type = $scope.collection.fieldDBtype;
      if (!type || !FieldDB[type]) {
        type = "Collection";
      }
      $scope.collection = new FieldDB[type]({
        id: $scope.collection.id,
        dbname: $scope.collection.dbname,
        url: $scope.collection.url
      });
      $scope.collection.fetch(FieldDB.Database.prototype.BASE_DB_URL).then(function() {
        fetchCollectionDocsIfEmpty();
      });
    };

    $scope.canAddNewItemsToCollection = function() {
      return false;
    };

  };
  controller.$inject = ["$scope", "$timeout"];

  var directiveDefinitionObject = {
    templateUrl: function(elem, attrs) {
      if (attrs.view === "SubExperimentCollection") {
        return "views/sub-experiment-collection.html";
      } else if (attrs.view === "Lesson") {
        return "views/collection.html";
      } else {
        return "views/collection.html";
      }
    },
    restrict: "A",
    transclude: false,
    scope: {
      collection: "=json",
      corpus: "=corpus"
    },
    controller: controller,
    link: function postLink() {},
    priority: 0,
    replace: false,
    controllerAs: "stringAlias"
  };
  return directiveDefinitionObject;
});
