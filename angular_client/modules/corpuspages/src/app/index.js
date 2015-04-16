"use strict";
/* globals FieldDB */
angular.module("fielddbCorpusPagesApp", [
  // "ngAnimate",
  // "ngCookies",
  // "ngTouch",
  // "ngSanitize",
  // "ui.router",
  // "ui.bootstrap",
  "fielddbAngular"
]).config(function($locationProvider, $stateProvider, $urlRouterProvider) {

  var fieldDBApp = FieldDB.FieldDBObject.application;

  /* https://docs.angularjs.org/error/$location/nobase */
  fieldDBApp.basePathname = "/";

  $locationProvider.html5Mode(true);

  fieldDBApp.debug("Loaded Corpus pages, ", $stateProvider, $urlRouterProvider, fieldDBApp);

  // if (FieldDB && FieldDB.Router) {
  //   for (var when in FieldDB.Router.routes) {
  //     FieldDB.Router.routes[when].angularRoute.controller = "FieldDBController";
  //     $routeProvider.when(FieldDB.Router.routes[when].path, FieldDB.Router.routes[when].angularRoute);
  //   }
  //   if (FieldDB.Router.otherwise) {
  //     $routeProvider.otherwise(FieldDB.Router.otherwise);
  //   }
  // }
});
