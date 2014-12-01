'use strict';

/**
 * @ngdoc function
 * @name visualizationApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the visualizationApp
 */
angular.module('visualizationApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
