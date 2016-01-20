/* globals console, window */

"use strict";

angular.module("fielddbAngular").controller("FieldDBController", function($scope, $rootScope, $modal) {
  /* Overriding bug and warn messages to use angular UI components
   TODO use angular modal for bugs */
  FieldDB.FieldDBObject.bug = function(message, optionalLocale) {
    var deferred = FieldDB.Q.defer();
    console.warn(message);
    $modal.open({
      templateUrl: "app/components/popup/prompt.html",
      backdrop: false,
      controller: function($scope, $modalInstance) {
        $scope.okay = function(response) {
          $modalInstance.dismiss();
          deferred.resolve({
            message: $scope.message,
            optionalLocale: optionalLocale,
            response: response
          });
        };
        $scope.cancel = function() {
          $modalInstance.dismiss();
          deferred.reject({
            message: $scope.message,
            optionalLocale: optionalLocale,
            response: null
          });
        };
        $scope.message = message;
        $scope.showCancelButton = false;
        $scope.isBug = true;
        console.log("$modalInstance", $modalInstance);
      }
    });
    return deferred.promise;
  };
  FieldDB.FieldDBObject.popup = function(message, optionalLocale) {
    var deferred = FieldDB.Q.defer();
    console.warn(message);
    $modal.open({
      templateUrl: "app/components/popup/prompt.html",
      controller: function($scope, $modalInstance) {
        $scope.okay = function(response) {
          $modalInstance.dismiss();
          deferred.resolve({
            message: $scope.message,
            optionalLocale: optionalLocale,
            response: response
          });
        };
        $scope.cancel = function() {
          $modalInstance.dismiss();
          deferred.reject({
            message: $scope.message,
            optionalLocale: optionalLocale,
            response: null
          });
        };
        $scope.message = message;
        $scope.showCancelButton = false;
        $scope.isPopup = true;
        console.log("$modalInstance", $modalInstance);
      }
    });
    return deferred.promise;
  };
  FieldDB.FieldDBObject.confirm = function(message, optionalLocale) {
    var deferred = FieldDB.Q.defer();
    console.warn(message);
    $modal.open({
      templateUrl: "app/components/popup/prompt.html",
      controller: function($scope, $modalInstance) {
        $scope.okay = function(response) {
          $modalInstance.dismiss();
          deferred.resolve({
            message: $scope.message,
            optionalLocale: optionalLocale,
            response: response
          });
        };
        $scope.cancel = function() {
          $modalInstance.dismiss();
          deferred.reject({
            message: $scope.message,
            optionalLocale: optionalLocale,
            response: null
          });
        };
        $scope.message = message;
        $scope.showCancelButton = true;
        $scope.isConfirm = true;
        console.log("$modalInstance", $modalInstance);
      }
    });
    return deferred.promise;
  };
  FieldDB.FieldDBObject.prompt = function(message, optionalLocale, providedInput) {
    var deferred = FieldDB.Q.defer();
    console.warn(message);

    $modal.open({
      templateUrl: "app/components/popup/prompt.html",
      controller: function($scope, $modalInstance) {
        $scope.okay = function(response) {

          // Let the user enter info, even JSON
          if (response === "yes" || $scope.userInput === JSON.stringify(providedInput)) {
            response = providedInput;
          } else {
            if (typeof providedInput !== "string" && typeof providedInput !== "number") {
              try {
                var parsed = JSON.parse(response);
                response = parsed;
                console.log("Using ", parsed);
              } catch (e) {
                FieldDB.FieldDBObject.bug("There was a problem parsing your input.").then(function() {
                  FieldDB.FieldDBObject.prompt(message, optionalLocale, providedInput);
                });
              }
            } else if (typeof response !== "number" && parseFloat(response, 10) === response) {
              response = parseFloat(response, 10);
            }
          }

          $modalInstance.dismiss();
          deferred.resolve({
            message: $scope.message,
            optionalLocale: optionalLocale,
            response: response
          });
        };
        $scope.cancel = function() {
          $modalInstance.dismiss();
          deferred.reject({
            message: $scope.message,
            optionalLocale: optionalLocale,
            response: null
          });
        };
        $scope.message = message;
        $scope.userInput = providedInput || "";
        if (message.toLowerCase().indexOf("password") > -1 || message.toLowerCase().indexOf("confirm your identity") > -1 || message.toLowerCase().indexOf("mot de passe") > -1 ) {
          $scope.inputType = "password";
        } else if (message.toLowerCase().indexOf("date") > -1) {
          $scope.inputType = "date";
        } else if (message.toLowerCase().indexOf("number") > -1) {
          $scope.inputType = "number";
        } else {
          $scope.inputType = "text";
        }
        $scope.showCancelButton = true;
        $scope.isPrompt = true;
        console.log("$modalInstance", $modalInstance);
      }
    });
    return deferred.promise;
  };
  // FieldDB.FieldDBObject.warn = function(message) {
  //   console.warn(message);
  // };
  FieldDB.FieldDBObject.render = function() {
    // try {
    //   if (!$scope.$$phase) {
    //     $scope.$apply(); //$digest or $apply
    //   }
    // } catch (e) {
    //   console.warn("Rendering generated probably a digest erorr");
    // }
  };

  if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application) {
    $scope.application = FieldDB.FieldDBObject.application;

    FieldDB.FieldDBObject.application.router.navigate = function(route, options) {
      if (!route) {
        console.warn("Not navigating to an empty route.");
        return;
      }
      // $location.route(route);
      // $location.path(FieldDB.FieldDBObject.application.basePathname + route, false);

      // TODO routeparams and location are not being triggered, so manually looking for a search term and rendering it
      if (route.indexOf(FieldDB.FieldDBObject.application.basePathname) !== 0) {
        route = FieldDB.FieldDBObject.application.basePathname + route;
      }
      window.location.href = route;
      var searchQuery = route.substring(route.lastIndexOf("/") + 1);
      if (searchQuery) {
        console.log("Navigating to show a search " + searchQuery, options);
        FieldDB.FieldDBObject.application.search.searchQuery = searchQuery;
        FieldDB.FieldDBObject.application.search.search(FieldDB.FieldDBObject.application.search.searchQuery);
        if (!$scope.$$phase) {
          $scope.$digest();
        }
      }
    };

  } else {
    console.warn("The fielddb application was never created, are you sure you did new FieldDB.APP() somewhere?");
    FieldDB.FieldDBObject.bug("The app cannot load, please report this. ");
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
    if (!FieldDB.hasOwnProperty(klass)) {
      continue;
    }
    $scope.FieldDBComponents[klass] = {
      fieldDBtype: klass,
      url: "http://fielddb.github.io/FieldDB/docs/javascript/" + klass + ".html"
    };
  }
  // $scope.application.currentCorpusDashboard = ":team/:corpusidentifier/import/:importType";
  $scope.FieldDBComponents.Activity.route = "/lingllama/communitycorpus/activityfeed"; //+ "/activityfeed/123";

  console.log("FieldDBController was loaded, this means almost everything in the corpus is available now");
});
