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
]).config(function($routeProvider, $sceDelegateProvider) {
  console.log($routeProvider);

  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from outer domain.
    'https://*.lingsync.org/**'
  ]);

  FieldDB.Database.prototype.BASE_DB_URL = 'https://corpusdev.lingsync.org';
  FieldDB.Database.prototype.BASE_AUTH_URL = 'https://authdev.lingsync.org';
  FieldDB.AudioVideo.prototype.BASE_SPEECH_URL = 'https://speechdev.lingsync.org';

});
