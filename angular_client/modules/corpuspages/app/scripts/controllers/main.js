'use strict';

angular.module('corpuspagesApp').controller('FieldDBCorpusPagesController', ['$scope', 'Servers',
  function($scope, Servers) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    var team =  new FieldDB.UserMask({
      username: 'team',
      dbname: 'glossersample-quechua'
    });
    $scope.team = team;

    if (!$scope.team.gravatar) {
      $scope.status = 'Loading team details.';
      team.fetch(Servers.getServiceUrl(null, 'corpus')).then(function(result) {
        console.log('Suceeded to download team public details.', result);
        $scope.status = 'Loaded team details.';
        $scope.$apply();
      }, function(result) {
        console.log('Failed to download team public details.', result);
        $scope.status = 'Failed to download team public details.';
      });
    }
    var corpus = new FieldDB.CorpusMask({
      dbname: 'glossersample-quechua'
    });
    console.log(corpus.toJSON());
    $scope.corpus = corpus;
    if (!$scope.corpus.title) {
      $scope.status = 'Loading corpus details.';
      corpus.fetch(Servers.getServiceUrl(null, 'corpus')).then(function(result) {
        console.log('Suceeded to download corpus public details.', result);
        $scope.status = 'Loaded corpus details.';
        $scope.$apply();
      }, function(result) {
        console.log('Failed to download corpus public details.', result);
        $scope.status = 'Failed to download corpus public details.';
      });
    }

    $scope.corpora = null;
    $scope.thisyear = (new Date()).getFullYear();
  }
]);
