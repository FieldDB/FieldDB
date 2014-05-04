'use strict';
// var angularFieldDB = angular.module('FieldDB', []);
// for (var modelName in FieldDB) {
//   if (!FieldDB.hasOwnProperty(modelName)) {
//     continue;
//   }
//   angularFieldDB.factory('FieldDB' + modelName + 'Factory',
//     function() {
//       return FieldDB[modelName];
//     });
// }
angular.module('fielddbAngularApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute'
]).config(function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'views/main.html',
      controller: 'FieldDBController'
    })
    .otherwise({
      redirectTo: '/'
    });
});
