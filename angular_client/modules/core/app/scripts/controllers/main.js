"use strict";
/* globals FieldDB */

angular.module("fielddbAngularApp").controller("FieldDBController", ["$scope", "$routeParams", "$rootScope",
  function($scope, $routeParams, $rootScope) {

    if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application) {
      $scope.application = FieldDB.FieldDBObject.application;
      FieldDB.FieldDBObject.render = function() {
        try {
          if (!$scope.$$phase) {
            $scope.$apply(); //$digest or $apply
          }
        } catch (e) {
          console.warn("Rendering generated an erorr", e);
        }
      };
    } else {
      console.warn("The fielddb application was never created, are you sure you did new FieldDB.APP() somewhere?");
      window.alert("The app cannot load, please report this. ");
    }
    $rootScope.contextualize = function(message) {
      if (!FieldDB || !FieldDB.FieldDBObject || !FieldDB.FieldDBObject.application || !FieldDB.FieldDBObject.application.contextualizer || !FieldDB.FieldDBObject.application.contextualizer.data) {
        return message;
      }
      var result = FieldDB.FieldDBObject.application.contextualize(message);
      if ($rootScope.corpus && $rootScope.corpus.pouchname && FieldDB) {
        var url = $rootScope.corpus.url || FieldDB.Database.prototype.BASE_DB_URL + "/" + $rootScope.corpus.pouchname;
        result = result
          .replace(/CORPUS_DB_URL/g, url)
          .replace(/CORPUS_PAGE_URL/g, "http://lingsync.org/" + $rootScope.corpus.pouchname.replace("-", "/") + "/" + $rootScope.corpus.titleAsUrl);
      }
      // if (!$scope.$$phase) {
      //   $scope.$digest(); //$digest or $apply
      // }
      return result;
    };

    $scope.loginDetails = $scope.loginDetails || {
      username: "",
      password: ""
    };
    $scope.application.debug($scope.application);
    if ($routeParams) {
      $scope.application.processRouteParams($routeParams);
    }
    // FieldDB.FieldDBConnection.connect();

    console.log("FieldDBController was loaded, this means almost everything in the corpus is available now");
  }
]);
