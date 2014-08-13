'use strict';
/* globals FieldDB */

/**
 * @ngdoc service
 * @name fielddbAngularApp.fielddbStorage
 * @description
 * # fielddbStorage
 * Service in the fielddbAngularApp.
 */
angular.module('fielddbAngularApp').factory('fielddbStorage', function fielddbStorage($rootScope) {
  var username = '';
  var dbname = 'testingphophlo-debugging';
  FieldDB.BASE_DB_URL = 'https://corpusdev.example.org';
  FieldDB.BASE_AUTH_URL = 'https://authdev.example.org';

  var db;
  var accessibleDBS = [];

  var getUserName = function(callbackForGettingUsername) {
    FieldDB.CORS.makeCORSRequest({
      type: 'GET',
      dataType: 'json',
      url: FieldDB.BASE_DB_URL + '/_session'
    }).then(function(sessionInfo) {
      console.log(sessionInfo);
      if (sessionInfo.ok) {
        username = sessionInfo.userCtx.name;
        $rootScope.authenticated = true;
        sessionInfo.userCtx.roles.map(function(role) {
          var dbname = role.substring(0, role.lastIndexOf('_'));
          if (role.indexOf('-') > -1 && role.indexOf('_reader') > -1 && accessibleDBS.indexOf(dbname) === -1) {
            accessibleDBS.push(dbname);
          }
        });
        console.log(accessibleDBS);
      }
      if (typeof callbackForGettingUsername === 'function') {
        callbackForGettingUsername();
      }
    });
  };

  return {
    getCollection: function(collectionType) {
      var deferred = FieldDB.Q.defer();

      var onceUsernameIsKnown = function() {
        db = db || new FieldDB.Database({
          username: username,
          dbname: dbname,
          url: FieldDB.BASE_DB_URL,
          authUrl: FieldDB.BASE_AUTH_URL
        });
        console.log('fetching docs for ', db.toJSON());
        db.fetchCollection(collectionType).then(function(result) {
          console.log('downloaded ', result);
          deferred.resolve(result.rows.map(function(doc) {
            return doc.value;
          }));
        }, function(reason) {
          console.log('No docs...', reason);
          deferred.reject(reason);
        });
      };

      if (!username) {
        getUserName(onceUsernameIsKnown);
      } else {
        onceUsernameIsKnown();
      }
      return deferred.promise;
    },

    // getId: function(id) {

    // },

    // put: function(documents) {

    // },
    dbUrl: function() {
      return FieldDB.BASE_DB_URL + '/' + dbname;
    }
  };
});
