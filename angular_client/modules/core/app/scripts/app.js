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
  'ngRoute',
  'angularFileUpload'
]).config(function($routeProvider) {
  console.log($routeProvider);
});
