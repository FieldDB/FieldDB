'use strict';

angular.module('corpuspagesApp').controller('FieldDBCorpusPagesController', ['$scope', '$routeParams', '$rootScope',
  function($scope, $routeParams, $rootScope) {
    console.log('In the FieldDBCorpusPagesController', $routeParams);

    if (!$routeParams || !$routeParams.team ) {
      console.log('Route params are undefined, not loading anything');
      return;
    }
    var team = new FieldDB.UserMask({
      username: 'team',
    });
    team.dbname = team.validateUsername($routeParams.team).username + '-' + team.validateUsername($routeParams.corpusid).username;
    if (team.dbname.split('-').length < 2) {
      $scope.status = 'Please try another url of the form teamname/corpusname ' + team.dbname + ' is not valid.';
      return;
    }
    $scope.team = team;


    var corpus = new FieldDB.CorpusMask({
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
        corpus.fetch(FieldDB.FieldDBConnection.connection.localCouch.url).then(function(result) {
          console.log('Suceeded to download corpus public details.', result);
          $rootScope.status = 'Loaded corpus details.';
          $scope.$apply();
        }, function(result) {
          console.log('Failed to download corpus public details.', result);
          $rootScope.status = 'Failed to download corpus details. Are you sure this is the corpus you wanted to see: ' + corpus.dbname;
          $scope.$apply();
        });
      }
    // });

  }
]);
