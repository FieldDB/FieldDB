/* globals console, window */

"use strict";

angular.module("fielddbAngular").controller("FieldDBController", function($scope, $rootScope) {

  if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application) {
    $scope.application = FieldDB.FieldDBObject.application;
    FieldDB.FieldDBObject.render = function() {
      // try {
      //   if (!$scope.$$phase) {
      //     $scope.$apply(); //$digest or $apply
      //   }
      // } catch (e) {
      //   console.warn("Rendering generated probably a digest erorr");
      // }
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
    if ($rootScope.corpus && $rootScope.corpus.dbname && FieldDB) {
      var url = $rootScope.corpus.url || FieldDB.Database.prototype.BASE_DB_URL + "/" + $rootScope.corpus.dbname;
      result = result
        .replace(/CORPUS_DB_URL/g, url)
        .replace(/CORPUS_PAGE_URL/g, "http://lingsync.org/" + $rootScope.corpus.dbname.replace("-", "/") + "/" + $rootScope.corpus.titleAsUrl);
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

  // FieldDB.FieldDBConnection.connect();


  $scope.FieldDBComponents = {};
  for (var klass in FieldDB) {
    if(! FieldDB.hasOwnProperty(klass)){
      continue;
    }
    $scope.FieldDBComponents[klass] = {
      fieldDBtype: klass,
      url: "http://opensourcefieldlinguistics.github.io/FieldDB/docs/javascript/" + klass + ".html"
    };
  }
  $scope.application.currentCorpusDashboard = ":team/:corpusidentifier/import/:importType";
  $scope.FieldDBComponents.Activity.route = $scope.application.currentCorpusDashboard ;//+ "/activityfeed/123";

  console.log("FieldDBController was loaded, this means almost everything in the corpus is available now");
});
