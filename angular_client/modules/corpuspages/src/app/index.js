'use strict';

angular.module('fielddbCorpusPagesApp', [
  'ngAnimate',
  'ngCookies',
  'ngTouch',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap'
]).config(function($locationProvider, $stateProvider, $urlRouterProvider) {
  $locationProvider.html5Mode(true);

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'app/main/main.html',
      controller: 'FieldDBCorpusPagesController'
    });

  $urlRouterProvider.otherwise('/');

  // if (FieldDB && FieldDB.Router) {
  //   for (var when in FieldDB.Router.routes) {
  //     FieldDB.Router.routes[when].angularRoute.controller = 'FieldDBController';
  //     $routeProvider.when(FieldDB.Router.routes[when].path, FieldDB.Router.routes[when].angularRoute);
  //   }
  //   if (FieldDB.Router.otherwise) {
  //     $routeProvider.otherwise(FieldDB.Router.otherwise);
  //   }
  // }
});
