'use strict';

/**
 * @ngdoc function
 * @name spreadsheetApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the spreadsheetApp
 */
angular.module('spreadsheetApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
