'use strict';

/**
 * @ngdoc function
 * @name visualizationApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the visualizationApp
 */
angular.module('visualizationApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
