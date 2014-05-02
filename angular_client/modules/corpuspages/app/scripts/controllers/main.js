'use strict';

angular.module('corpuspagesApp').controller('FieldDBCorpusPagesController', function($scope) {
  $scope.awesomeThings = [
    'HTML5 Boilerplate',
    'AngularJS',
    'Karma'
  ];
  $scope.team = null;
  $scope.corpus = {
    pouchname: 'glossersample-quechua'
  };
  $scope.corpora = null;
  $scope.thisyear = (new Date()).getFullYear();
});
