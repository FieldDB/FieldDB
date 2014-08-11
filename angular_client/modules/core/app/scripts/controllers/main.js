'use strict';
/* globals FieldDB */

angular.module('fielddbAngularApp').controller('FieldDBController', ['$scope', '$routeParams', '$rootScope',
  function($scope, $routeParams, $rootScope) {
    $scope.connection = {
      online: true,
      apiURL: 'https://localhost:3181/v2/',
      offlineCouchURL: 'https://localhost:6984'
    };
    FieldDB.FieldDBConnection.connection.localCouch.url = FieldDB.BASE_DB_URL;

    $scope.authentication = {
      // user: {
      //   authenticated: true
      // }
    };
    $scope.participantsList = new FieldDB.DataList({
      api: 'participants'
    });

    $scope.hasParticipants = function() {
      if (!$scope.participantsList || !$scope.participantsList.docs || !$scope.participantsList.docs.length) {
        return false;
      }
      return $scope.participantsList.docs.length > 0;
    };

    var processRouteParams = function() {
      if (!$routeParams || !$routeParams.team) {
        console.log('Route params are undefined, not loading anything');
        return;
      }
      $scope.loginDetails.username = $routeParams.team;
      $rootScope.currentCorpusDashboard = $routeParams.team + '/' + $routeParams.corpusid;

      var team = new FieldDB.UserMask({
        username: 'team',
      });
      team.dbname = team.validateUsername($routeParams.team).username + '-' + team.validateUsername($routeParams.corpusid).username;
      if (team.dbname.split('-').length < 2) {
        $scope.status = 'Please try another url of the form teamname/corpusname ' + team.dbname + ' is not valid.';
        return;
      }
      $scope.team = team;


      var corpus = new FieldDB.Corpus({
        dbname: team.dbname
      });
      console.log(corpus.toJSON());
      $scope.corpus = corpus;


      $scope.corpora = null;
      $scope.thisyear = (new Date()).getFullYear();

      // FieldDB.FieldDBConnection.connect().done(function(userroles) {
      // $scope.authentication.userroles = userroles;
      if (!$scope.team.gravatar) {
        $scope.status = 'Loading team details.';
        team.fetch(FieldDB.FieldDBConnection.connection.localCouch.url).then(function(result) {
          console.log('Suceeded to download team public details.', result);
          $rootScope.status = 'Loaded team details.';
          $scope.$apply();
        }, function(result) {
          console.log('Failed to download team public details.', result);
          $rootScope.status = 'Failed to download team public details.';
          $scope.$apply();
        });
      }
      if (!$scope.corpus.title) {
        $scope.status = 'Loading corpus details.';
        corpus.loadOrCreateCorpusByPouchName(corpus.dbname).then(function(result) {
          console.log('Suceeded to download corpus details.', result);
          $rootScope.status = 'Loaded corpus details.';

          $scope.$apply();
        }, function(result) {
          console.log('Failed to download corpus details.', result);
          $rootScope.status = 'Failed to download corpus details. Are you sure this is the corpus you wanted to see: ' + corpus.dbname;
          $scope.$apply();
        }).catch(function(error) {
          console.log(error);
        });
      }
    };
    processRouteParams();
    // FieldDB.FieldDBConnection.connect();

    console.log('In the FieldDBController', $scope.connection);
  }
]);
