'use strict';

angular
  .module('corpuspagesApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'fielddbActivityHeatmap',
    'fielddbAngularApp',
    'fielddbLexiconAngularApp'
  ])
  .config(function($routeProvider) {
    if (FieldDB && FieldDB.Router) {
      for (var when in FieldDB.Router.routes) {
        FieldDB.Router.routes[when].angularRoute.controller = 'FieldDBCorpusPagesController';
        $routeProvider.when(FieldDB.Router.routes[when].path, FieldDB.Router.routes[when].angularRoute);
      }
      if (FieldDB.Router.otherwise) {
        $routeProvider.otherwise(FieldDB.Router.otherwise);
      }
    }
  });
