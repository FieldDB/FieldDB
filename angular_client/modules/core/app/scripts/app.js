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
  'ngAnimate',
  'ngCookies',
  'ngResource',
  'ngRoute',
  'ngSanitize',
  'ngTouch',
  'angularFileUpload',
  'contenteditable',
  'ngDragDrop'
]).config(function($routeProvider) {
  console.log($routeProvider);
});
