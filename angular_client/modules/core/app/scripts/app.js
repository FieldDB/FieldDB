'use strict';
console.log(FieldDB);
angular
  .module('fielddbAngularApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'FieldDBController'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
