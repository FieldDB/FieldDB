'use strict';

angular
  .module('corpuspagesApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'fielddbActivityHeatmap',
    'fielddbAngularApp'
  ])
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
