"use strict";

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbCollection
 * @description
 * # fielddbCollection
 */
angular.module("fielddbAngularApp").directive("fielddbCollection", function() {


  var controller = function($scope) {
    // $scope.dropSuccessHandler = function($event, index, array) {
    //   // array.splice(index, 1);
    //   // $scope.orphanedItem =
    //   console.log("removing " + index);
    // };

    $scope.onDrop = function($event, $data, index) {
      console.log("inserting at " + index, $data);
      if ($scope.collection && $scope.collection) {
        if ($scope.collection.find($data).length === 0) {
          $scope.collection.add($data);
        }
        $scope.collection.reorder($data, index);
      }
    };

    $scope.removeItemFromList = function(item) {
      if ($scope.collection && $scope.collection) {
        $scope.collection.remove(item);
      }
    };

    $scope.save = function() {
      $scope.collection.save().then(function() {
         try {
          if (!$scope.$$phase) {
            $scope.$digest(); //$digest or $apply
          }
        } catch (e) {
          console.warn("render threw errors");
        }
      });
    };
    $scope.undo = function() {
      var type = $scope.collection.fieldDBtype;
      if (!type || !FieldDB[type]) {
        type = "Collection";
      }
      console.log("TODO add undo functionality");
    };

    $scope.canAddNewItemsToCollection = function() {
      return false;
    };

  };
  controller.$inject = ["$scope", "$timeout"];

  var directiveDefinitionObject = {
    templateUrl: function() {
      return "views/collection.html";
    },
    restrict: "A",
    transclude: false,
    scope: {
      collection: "=json"
    },
    controller: controller,
    link: function postLink() {},
    priority: 0,
    replace: false,
    controllerAs: "stringAlias"
  };
  return directiveDefinitionObject;
});
