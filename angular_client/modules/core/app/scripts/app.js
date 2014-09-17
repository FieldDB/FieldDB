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
  // console.log($routeProvider);

  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from outer domain.
    'https://*.example.org/**'
  ]);

  new FieldDB.PsycholinguisticsApp({
    authentication: {
      user: new FieldDB.User({
        authenticated: false
      })
    },
    online: true,
    apiURL: 'https://localhost:3181/v2/',
    offlineCouchURL: 'https://localhost:6984',
    brand: 'LingSync',
    website: 'http://example.org'
  });

  FieldDB.Database.prototype.BASE_DB_URL = 'https://corpusdev.example.org';
  FieldDB.Database.prototype.BASE_AUTH_URL = 'https://authdev.example.org';
  FieldDB.AudioVideo.prototype.BASE_SPEECH_URL = 'https://speechdev.example.org';

});
