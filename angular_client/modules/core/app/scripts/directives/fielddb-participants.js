'use strict';

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbParticipants
 * @description
 * # fielddbParticipants
 */
angular.module('fielddbAngularApp').directive('fielddbParticipants', function() {

  var db;
  var controller = function($scope) {

    var fetchParticipants = function() {
      if (!FieldDB.BASE_DB_URL || !$scope.authentication ) {
        return;
      }
      db = db || new FieldDB.PsycholinguisticsDatabase({
        // username: $scope.authentication.user.username,
        dbname: $scope.corpus.dbname,
        url: FieldDB.BASE_DB_URL,
        authUrl: FieldDB.BASE_AUTH_URL
      });
      console.log('fetching docs for ', db.toJSON());
      db.fetchCollection('speakers').then(function(results) {
        console.log('downloaded ', results);

        $scope.participants = $scope.participants || [];
        results.map(function(row) {
          $scope.participants.push(row);
        });

        $scope.$digest();

      }, function(reason) {
        console.log('No docs...', reason);
      });

    };

    // $scope.$watch('authentication.user', function(newValue) {
    //   if (newValue) {
    //     console.log('user is authenticated.');
    //     fetchParticipants();
    //   }
    // });

    window.setTimeout(function() {
      fetchParticipants();
    }, 2000);

  };
  controller.$inject = ['$scope'];

  var directiveDefinitionObject = {
    templateUrl: 'views/participants.html', // or // function(tElement, tAttrs) { ... },
    restrict: 'A',
    transclude: false,
    // scope: {
    //   participants: '=json'
    // },
    controller: controller,
    link: function postLink() {},
    priority: 0,
    replace: false,
    controllerAs: 'stringAlias'
  };
  return directiveDefinitionObject;
});
