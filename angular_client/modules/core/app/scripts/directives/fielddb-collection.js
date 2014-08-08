'use strict';

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbParticipants
 * @description
 * # fielddbParticipants
 */
angular.module('fielddbAngularApp').directive('fielddbParticipants', function() {

  var db;
  var fetchParticipantsExponentialDecay = 2000;

  var controller = function($scope, $timeout) {
    var fetchParticipantsIfEmpty = function() {

      if (!FieldDB.BASE_DB_URL || !$scope.corpus) {
        fetchParticipantsExponentialDecay = fetchParticipantsExponentialDecay * 2;
        $timeout(function() {
          if ($scope.participants && $scope.participants.length > 0) {
            return;
          } else {
            fetchParticipantsIfEmpty();
          }
        }, fetchParticipantsExponentialDecay);
        console.log(' No URL specified, Waiting another ' + fetchParticipantsExponentialDecay + ' until trying to fetch participants again.');

        return;
      }

      db = db || new FieldDB.PsycholinguisticsDatabase({
        dbname: $scope.corpus.dbname,
        url: FieldDB.BASE_DB_URL,
        authUrl: FieldDB.BASE_AUTH_URL
      });
      // console.log('fetching docs for ', db.toJSON());
      db.fetchCollection('speakers').then(function(results) {

        console.log('downloaded participants', results);
        $scope.participants = $scope.participants || [];
        results.map(function(row) {
          $scope.participants.push(row);
        });
        $scope.$digest();

      }, function(reason) {

        console.log('No participants docs...', reason);
        fetchParticipantsExponentialDecay = fetchParticipantsExponentialDecay * 2;
        $scope.corpus.fetchParticipantsExponentialDecay = fetchParticipantsExponentialDecay;
        console.log(' No connetion, Waiting another ' + fetchParticipantsExponentialDecay + ' until trying to fetch participants again.');
        $scope.$digest();

        $timeout(function() {
          if ($scope.participants && $scope.participants.length > 0) {
            return;
          } else {
            fetchParticipantsIfEmpty();
          }
        }, fetchParticipantsExponentialDecay);

      });

    };

    fetchParticipantsIfEmpty();

  };
  controller.$inject = ['$scope', '$timeout'];

  var directiveDefinitionObject = {
    templateUrl: 'views/participants.html', // or // function(tElement, tAttrs) { ... },
    restrict: 'A',
    transclude: false,
    scope: {
      participants: '=json',
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
