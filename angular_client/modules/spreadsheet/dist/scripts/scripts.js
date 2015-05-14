/* globals FieldDB */
'use strict';
console.log("Declaring the SpreadsheetDatum.");

var convertFieldDBDatumIntoSpreadSheetDatum = function(spreadsheetDatum, fieldDBDatum, guessedAudioUrl, $scope) {
  var j,
    fieldKeyName = "label";

  fieldDBDatum.dbname = fieldDBDatum.dbname || fieldDBDatum.pouchname;
  spreadsheetDatum.dbname = fieldDBDatum.dbname;
  spreadsheetDatum.id = fieldDBDatum._id;
  spreadsheetDatum.rev = fieldDBDatum._rev;

  for (j in fieldDBDatum.datumFields) {
    if (fieldDBDatum.datumFields[j].id && fieldDBDatum.datumFields[j].id.length > 0) {
      fieldKeyName = "id";
    } else {
      fieldKeyName = "label";
    }
    // Get enteredByUser object
    if (fieldDBDatum.datumFields[j][fieldKeyName] === "enteredByUser") {
      spreadsheetDatum.enteredByUser = fieldDBDatum.datumFields[j].user;
    } else if (fieldDBDatum.datumFields[j][fieldKeyName] === "modifiedByUser") {
      spreadsheetDatum.modifiedByUser = {
        users: fieldDBDatum.datumFields[j].users
      };
    } else if (fieldDBDatum.datumFields[j][fieldKeyName] === "comments") {
      // if their corpus has comments datum field, dont overwrite the comments with it ...
      console.log("This datum had a comments datum field... :( ", fieldDBDatum.datumFields[j], fieldDBDatum.comments);
    } else {
      spreadsheetDatum[fieldDBDatum.datumFields[j][fieldKeyName]] = fieldDBDatum.datumFields[j].mask;
    }
  }

  // Update enteredByUser for older records
  if (fieldDBDatum.enteredByUser && typeof fieldDBDatum.enteredByUser === "string") {
    spreadsheetDatum.enteredByUser = {
      username: fieldDBDatum.enteredByUser
    };
  }

  // Update to add a dateEntered to all datums (oversight in original spreadsheet code; needed so that datums are ordered properly)
  if (!fieldDBDatum.dateEntered || fieldDBDatum.dateEntered === "" || fieldDBDatum.dateEntered === "N/A") {
    spreadsheetDatum.dateEntered = "2000-09-06T16:31:30.988Z";
  } else {
    spreadsheetDatum.dateEntered = fieldDBDatum.dateEntered;
  }

  if (fieldDBDatum.dateModified) {
    spreadsheetDatum.dateModified = fieldDBDatum.dateModified;
  }

  // spreadsheetDatum.datumTags = fieldDBDatum.datumTags;
  spreadsheetDatum.comments = fieldDBDatum.comments;
  if (fieldDBDatum.session) {
    // spreadsheetDatum.sessionID = fieldDBDatum.session._id;
    spreadsheetDatum.session = fieldDBDatum.session;
  } else {
    window.alert("This record is missing a session, please report this to support@lingsync.org " + fieldDBDatum._id);
  }

  // upgrade to v1.90
  spreadsheetDatum.audioVideo = fieldDBDatum.audioVideo || [];
  if (!Array.isArray(spreadsheetDatum.audioVideo)) {
    // console.log("Upgrading audioVideo to a collection", spreadsheetDatum.audioVideo);
    var audioVideoArray = [];
    if (spreadsheetDatum.audioVideo.URL) {
      var audioVideoURL = spreadsheetDatum.audioVideo.URL;
      var fileFromUrl = audioVideoURL.substring(audioVideoURL.lastIndexOf("/"));
      audioVideoArray.push({
        "filename": fileFromUrl,
        "description": fileFromUrl,
        "URL": audioVideoURL,
        "type": "audio"
      });
    }
    spreadsheetDatum.audioVideo = audioVideoArray;
  }
  if (spreadsheetDatum.audioVideo.length === 0) {
    for (var key in fieldDBDatum._attachments) {
      var reconstructedAudioVideoItem = {
        "filename": key,
        "URL": guessedAudioUrl + spreadsheetDatum.id + "/" + key,
        "type": "audio",
        "description": ""
      };
      // if in the old spot pre v1.90 :
      if (fieldDBDatum.attachmentInfo && fieldDBDatum.attachmentInfo[key]) {
        reconstructedAudioVideoItem.description = fieldDBDatum.attachmentInfo[key].description;
      }
      spreadsheetDatum.audioVideo.push(reconstructedAudioVideoItem);
    }
  }

  // upgrade to 2.32+ use a fielddb audio video collection
  if (FieldDB && FieldDB.AudioVideos && Object.prototype.toString.call(spreadsheetDatum.audioVideo) === "[object Array]") {
    spreadsheetDatum.audioVideo = new FieldDB.AudioVideos(spreadsheetDatum.audioVideo);
  }

  // upgrade to v2.0+
  spreadsheetDatum.images = fieldDBDatum.images || [];
  fieldDBDatum.datumFields.map(function(datumField) {
    if (datumField[fieldKeyName] === "relatedData") {
      spreadsheetDatum.relatedData = datumField.json;
    }
  });
  spreadsheetDatum.relatedData = spreadsheetDatum.relatedData || [];

  // upgrade to v1.92
  var upgradedTags = spreadsheetDatum.tags ? spreadsheetDatum.tags.split(",") : [];
  if (fieldDBDatum.datumTags && fieldDBDatum.datumTags.length > 0) {
    console.log("Upgrading datumTags to a datumField", fieldDBDatum.datumTags);
    fieldDBDatum.datumTags.map(function(datumTag) {
      if (datumTag.tag) {
        upgradedTags.push(datumTag.tag.trim());
      } else {
        console.warn("This datum had datumTags but they were missing a tag inside", fieldDBDatum);
      }
    });
  }
  if (upgradedTags && upgradedTags.length > 0) {
    spreadsheetDatum.tags = [];
    upgradedTags.map(function(tag) {
      if (spreadsheetDatum.tags.indexOf(tag.trim()) === -1) {
        spreadsheetDatum.tags.push(tag.trim());
      }
    });
    spreadsheetDatum.tags = spreadsheetDatum.tags.join(", ");
  }
  spreadsheetDatum.datumTags = [];

  //TODO do we really need this flag?, yes we need it because the audio might be flagged as deleted
  spreadsheetDatum.hasAudio = false;
  if (spreadsheetDatum.audioVideo.length > 0) {
    spreadsheetDatum.audioVideo.map(function(audioVideo) {
      if (audioVideo.trashed !== "deleted") {
        spreadsheetDatum.hasAudio = true;
      }
    });
  }
  spreadsheetDatum.hasImages = false;
  if (spreadsheetDatum.images.length > 0) {
    spreadsheetDatum.images.map(function(image) {
      if (image.trashed !== "deleted") {
        spreadsheetDatum.hasImages = true;
      }
    });
  }
  spreadsheetDatum.hasRelatedData = false;
  if (spreadsheetDatum.relatedData.length > 0) {
    spreadsheetDatum.relatedData.map(function(relatedItem) {
      if (relatedItem.trashed !== "deleted") {
        spreadsheetDatum.hasRelatedData = true;
      }
    });
  }

  spreadsheetDatum.saved = "fresh";
  spreadsheetDatum.fossil = JSON.parse(JSON.stringify(spreadsheetDatum));
  spreadsheetDatum.markAsNeedsToBeSaved = function() {
    this.saved = "no";
    $scope.saved = "no";
    try {
      if (!$scope.$$phase) {
        $scope.$digest(); //$digest or $apply
      }
    } catch (e) {
      console.warn("Digest errored", e);
    }
  };
  return spreadsheetDatum;
};

var convertSpreadSheetDatumIntoFieldDBDatum = function(spreadsheetDatum, fieldDBDatum) {
  var key,
    hasModifiedByUser,
    spreadsheetKeyWasInDatumFields,
    i;
  if (!(fieldDBDatum instanceof FieldDB.Datum)) {
    fieldDBDatum = new FieldDB.Datum(fieldDBDatum);
  }

  if (fieldDBDatum._id && fieldDBDatum.dbname !== spreadsheetDatum.dbname) {
    throw ("This record belongs to another corpus.");
  }
  console.log(fieldDBDatum);
  for (key in spreadsheetDatum) {
    spreadsheetKeyWasInDatumFields = false;

    /* find the datum field that corresponds to this key in the spreadsheetDatum */
    for (i = 0; i < fieldDBDatum.datumFields.collection.length; i++) {

      if (fieldDBDatum.datumFields.collection[i].id === key) {
        spreadsheetKeyWasInDatumFields = true;
        // Check for (existing) modifiedByUser field in original record and update correctly
        if (key === "modifiedByUser") {
          hasModifiedByUser = true;
          fieldDBDatum.datumFields.collection[i].users = spreadsheetDatum.modifiedByUser.users;
          // fieldDBDatum.datumFields.collection[i].mask = spreadsheetDatum.modifiedByUser.users; /TODO
          // fieldDBDatum.datumFields.collection[i].value = spreadsheetDatum.modifiedByUser.users; /TODO
          fieldDBDatum.datumFields.collection[i].readonly = true;
        } else if (key === "enteredByUser") {
          fieldDBDatum.datumFields.collection[i].user = spreadsheetDatum.enteredByUser;
          fieldDBDatum.datumFields.collection[i].mask = spreadsheetDatum.enteredByUser.username;
          fieldDBDatum.datumFields.collection[i].value = spreadsheetDatum.enteredByUser.username;
          fieldDBDatum.datumFields.collection[i].readonly = true;
        } else if (key === "comments") {
          //dont put the comments into the comments datum field if their corpus has one...
          if (typeof fieldDBDatum.datumFields.collection[i].value !== "string") {
            fieldDBDatum.datumFields.collection[i].value = "";
            fieldDBDatum.datumFields.collection[i].mask = "";
          }
        } else {
          fieldDBDatum.datumFields.collection[i].value = spreadsheetDatum[key];
          fieldDBDatum.datumFields.collection[i].mask = spreadsheetDatum[key];
        }
      }
    }

    /* If the key isnt empty, and it wasnt in the existing datum fields, and its not a spreadsheet internal thing, create a datum field */
    if (spreadsheetDatum[key] !== undefined && !spreadsheetKeyWasInDatumFields && key !== "hasAudio" && key !== "hasImages" && key !== "hasRelatedData" && key !== "markAsNeedsToBeSaved" && key !== "saved" && key !== "fossil" && key !== "checked" && key !== "session" && key !== "dbname" && key !== "$$hashKey" && key !== "audioVideo" && key !== "images" && key !== "relatedData" && key !== "comments" && key !== "sessionID" && key !== "modifiedByUser" && key !== "enteredByUser" && key !== "id" && key !== "rev" && key !== "dateEntered" && key !== "datumTags" && key !== "timestamp" && key !== "dateModified" && key !== "lastModifiedBy") {

      fieldDBDatum.datumFields.collection.push({
        "label": key,
        "value": spreadsheetDatum[key] || "",
        "mask": spreadsheetDatum[key] || "",
        "encrypted": "",
        "shouldBeEncrypted": "checked",
        "help": "Entered by user in Field Methods App, conventions are not known.",
        "showToUserTypes": "linguist",
        "userchooseable": "disabled"
      });
    }
  }

  /* Add modifiedByUser field if not present */
  if (hasModifiedByUser === false) {
    console.log("Adding modifiedByUser field to older record.");
    var modifiedByUserField = {
      "label": "modifiedByUser",
      "mask": "",
      "value": "",
      "users": spreadsheetDatum.modifiedByUser.users,
      "encrypted": "",
      "shouldBeEncrypted": "",
      "help": "An array of users who modified the datum",
      "showToUserTypes": "all",
      "readonly": true,
      "userchooseable": "disabled"
    };
    fieldDBDatum.datumFields.collection.push(modifiedByUserField);
  }

  // Save date info
  fieldDBDatum.dateModified = spreadsheetDatum.dateModified;
  // fieldDBDatum.lastModifiedBy = spreadsheetDatum.lastModifiedBy;
  fieldDBDatum.timestamp = spreadsheetDatum.timestamp;
  fieldDBDatum.session = spreadsheetDatum.session;
  fieldDBDatum.dbname = spreadsheetDatum.dbname;
  fieldDBDatum.dateEntered = spreadsheetDatum.dateEntered;


  /* TODO tags shouldn't be in the datum they were deprecated in v40ish before the spreadsheet was created... */
  // if (spreadsheetDatum.datumTags && spreadsheetDatum.datumTags.length > 0) {
  // }
  fieldDBDatum.datumTags = spreadsheetDatum.datumTags;
  // Save comments TODO what if someone else modified it? need to merge the info...
  if (spreadsheetDatum.comments && spreadsheetDatum.comments.length > 0) {
    fieldDBDatum.comments = spreadsheetDatum.comments;
  }
  // Save audioVideo TODO what if someone else modified it? need to merge the info...
  if (spreadsheetDatum.audioVideo && spreadsheetDatum.audioVideo.length > 0) {
    fieldDBDatum.audioVideo = spreadsheetDatum.audioVideo.toJSON();
  }
  // Save images TODO what if someone else modified it? need to merge the info...
  if (spreadsheetDatum.images && spreadsheetDatum.images.length > 0) {
    fieldDBDatum.images = spreadsheetDatum.images;
  }
  // Save relatedData TODO what if someone else modified it? need to merge the info...
  if (spreadsheetDatum.relatedData && spreadsheetDatum.relatedData.length > 0) {
    fieldDBDatum.datumFields.collection.map(function(datumField) {
      if (datumField.id === "relatedData") {
        datumField.json = spreadsheetDatum.relatedData;
        datumField.value = spreadsheetDatum.relatedData.map(function(json) {
          return json.filename;
        });
        datumField.mask = datumField.value;
      }
    });
  }
  // Save attachments TODO what if someone else modified it? need to merge the info...
  if (spreadsheetDatum._attachments && spreadsheetDatum._attachments !== {}) {
    fieldDBDatum._attachments = spreadsheetDatum._attachments;
  }

  // upgrade to v1.90
  if (fieldDBDatum.attachmentInfo) {
    delete fieldDBDatum.attachmentInfo;
  }

  return fieldDBDatum.toJSON();
};
console.log("Loaded the SpreadsheetDatum.");

var SpreadsheetDatum = {
  convertSpreadSheetDatumIntoFieldDBDatum: convertSpreadSheetDatumIntoFieldDBDatum,
  convertFieldDBDatumIntoSpreadSheetDatum: convertFieldDBDatumIntoSpreadSheetDatum
};
console.log("SpreadsheetDatum", SpreadsheetDatum);

'use strict';

/**
 * @ngdoc overview
 * @name spreadsheetApp
 * @description
 * # spreadsheetApp
 *
 * Main module of the application.
 */
angular
  .module('spreadsheetApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'angular-md5',
    'fielddbAngularApp',
    'ui.bootstrap'
  ])
  .config(function($routeProvider) {

    $routeProvider.when('/corpora_list', {
      templateUrl: 'views/main.html'
    }).when('/settings', {
      templateUrl: 'views/settings.html',
      controller: 'SpreadsheetStyleDataEntrySettingsController'
    }).when('/corpussettings', {
      templateUrl: 'views/corpussettings.html'
    }).when('/register', {
      templateUrl: 'views/register.html'
    }).when('/faq', {
      templateUrl: 'views/faq.html'
    }).when('/spreadsheet/compacttemplate', {
      // templateUrl: 'views/compacttemplate.html'
      redirectTo: '/spreadsheet/fulltemplate'
    }).when('/spreadsheet/fulltemplate', {
      templateUrl: 'views/fulltemplate.html'
    }).when('/spreadsheet/yalefieldmethodsspring2014template', {
      // templateUrl: 'views/yalefieldmethodsspring2014template.html'
      redirectTo: '/spreadsheet/fulltemplate'
    }).when('/spreadsheet/mcgillfieldmethodsfall2014template', {
      // templateUrl: 'views/mcgillfieldmethodsfall2014template.html'
      redirectTo: '/spreadsheet/fulltemplate'
    }).when('/spreadsheet/mcgillfieldmethodsspring2014template', {
      // templateUrl: 'views/mcgillfieldmethodsspring2014template.html'
      redirectTo: '/spreadsheet/fulltemplate'
    }).when('/spreadsheet', {
      // templateUrl: 'views/mcgillfieldmethodsspring2014template.html'
      redirectTo: '/spreadsheet/fulltemplate'
    }).otherwise({
      redirectTo: '/corpora_list'
    });

    console.warn("removing old lexicons to reduce storage use, and force fresh");
    for (var i = 0; i < localStorage.length; i++) {
      var localStorageKey = localStorage.key(i);
      if (localStorageKey.indexOf("lexiconResults") > -1 || localStorageKey.indexOf("precendenceRules") > -1 || localStorageKey.indexOf("reducedRules") > -1) {
        localStorage.removeItem(localStorageKey);
        console.log("cleaned " + localStorageKey);
      }
    }

  });


/* globals  Q, sjcl, SpreadsheetDatum */
'use strict';
console.log("Declaring the SpreadsheetStyleDataEntryServices.");

angular.module('spreadsheetApp')
  .factory('Data', function($http, $rootScope, $q, Servers, md5) {

    var getDocFromCouchDB = function(DB, UUID) {
      if (!$rootScope.serverCode) {
        console.log("Sever code is undefined");
        window.location.assign("#/corpora_list");
        return;
      }
      var promise,
        config;

      if (UUID !== undefined) {
        config = {
          method: "GET",
          url: Servers.getServiceUrl($rootScope.serverCode, "corpus") + "/" + DB + "/" + UUID,
          withCredentials: true
        };

        console.log("Contacting the DB to get   record data " + config.url);
        promise = $http(config).then(function(response) {
          console.log("Receiving data results ");
          return response.data;
        });
        return promise;
      } else {
        config = {
          method: "GET",
          url: Servers.getServiceUrl($rootScope.serverCode, "corpus") + "/" + DB + "/_design/pages/_view/datums_chronological",
          withCredentials: true
        };
        console.log("Contacting the DB to get all corpus data for " + DB);
        promise = $http(config).then(function(response) {
          console.log("Receiving data results ");
          return response.data.rows;
        });
        return promise;
      }
    };

    var saveCouchDoc = function(DB, newRecord) {
      if (!$rootScope.serverCode) {
        console.log("Sever code is undefined");
        window.location.assign("#/corpora_list");
        return;
      }
      var config = {
        method: "POST",
        url: Servers.getServiceUrl($rootScope.serverCode, "corpus") + "/" + DB,
        data: newRecord,
        withCredentials: true
      };

      if (newRecord._rev) {
        config.method = "PUT";
        config.url = config.url + "/" + newRecord._id + "?rev=" + newRecord._rev;
      }

      console.log("Contacting the DB to save record. " + config.url);
      var promise = $http(config).then(function(response) {
        return response;
      });
      return promise;
    };

    var getBlankDataTemplateFromCorpus = function(fieldsType) {
      if (!fieldsType) {
        throw "You must specify a type of fields: datumFields or sessionFields or participantFields etc";
      }
      var newDoc = {
        "session": {},
        "audioVideo": [],
        "images": [],
        "comments": [],
        "dateEntered": "",
        "dateModified": "",
        "timestamp": 0,
        "jsonType": "Datum",
        "collection": "datums"
      };
      if (fieldsType === "sessionFields") {
        newDoc = {
          "comments": [],
          "collection": "sessions",
          "dateCreated": "",
          "dateModified": ""
        };
      }
      if ($rootScope.corpus && $rootScope.corpus[fieldsType]) {
        if ($rootScope.corpus[fieldsType].clone) {
          newDoc[fieldsType] = $rootScope.corpus[fieldsType].clone();
        } else {
          newDoc[fieldsType] = JSON.parse(JSON.stringify($rootScope.corpus[fieldsType]));
        }
        return newDoc;
      } else {
        console.warn("Corpus is not ready.");
        throw "Corpus is not ready.";
      }
    };

    var datumFields = function(DB) {
      if (!$rootScope.serverCode) {
        console.log("Sever code is undefined");
        window.location.assign("#/corpora_list");
        return;
      }
      var config = {
        method: "GET",
        url: Servers.getServiceUrl($rootScope.serverCode, "corpus") + "/" + DB + "/_design/pages/_view/get_datum_fields",
        withCredentials: true
      };

      console.log("Contacting the DB to get   datum fields for " + config.url);
      var promise = $http(config).then(function(response) {
        console.log("Receiving   datum fields ");
        return response.data.rows;
      });
      return promise;
    };

    var sessions = function(DB) {
      if (!$rootScope.serverCode) {
        console.log("Sever code is undefined");
        window.location.assign("#/corpora_list");
        return;
      }
      var config = {
        method: "GET",
        url: Servers.getServiceUrl($rootScope.serverCode, "corpus") + "/" + DB + "/_design/pages/_view/sessions",
        withCredentials: true
      };

      console.log("Contacting the DB to get sessions for " + config.url);
      var promise = $http(config).then(function(response) {
        console.log("Receiving sessions ");
        return response.data.rows;
      });
      return promise;
    };

    var glosser = function(DB) {
      if (!$rootScope.serverCode) {
        console.log("Sever code is undefined");
        window.location.assign("#/corpora_list");
        return;
      }
      var config = {
        method: "GET",
        url: Servers.getServiceUrl($rootScope.serverCode, "corpus") + "/" + DB + "/_design/pages/_view/precedence_rules?group=true",
        withCredentials: true
      };

      console
        .log("Contacting the DB to get glosser precedence rules for " + config.url);
      var promise = $http(config).then(function(response) {
        console.log("Receiving precedence rules ");
        return response.data.rows;
      });
      return promise;
    };

    var lexicon = function(DB) {
      if (!$rootScope.serverCode) {
        console.log("Sever code is undefined");
        window.location.assign("#/corpora_list");
        return;
      }
      var config = {
        method: "GET",
        url: Servers.getServiceUrl($rootScope.serverCode, "corpus") + "/" + DB + "/_design/pages/_view/lexicon_create_tuples?group=true",
        withCredentials: true
      };

      console.log("Contacting the DB to get lexicon for " + config.url);
      var promise = $http(config).then(function(response) {
        console.log("Receiving lexicon ");
        return response.data.rows;
      });
      return promise;
    };

    var getallusers = function(loginInfo) {
      if (!$rootScope.serverCode) {
        console.log("Sever code is undefined");
        window.location.assign("#/corpora_list");
        return;
      }
      var config = {
        method: "POST",
        url: Servers.getServiceUrl($rootScope.serverCode, "auth") + "/corpusteam",
        data: loginInfo,
        withCredentials: true
      };

      console.log("Contacting the DB to get all users for " + config.url);
      var promise = $http(config).then(function(response) {
        console.log("Receiving all users");
        return response.data.users;
      });
      return promise;
    };

    var login = function(user, password) {
      if (!$rootScope.serverCode) {
        console.log("Sever code is undefined");
        window.location.assign("#/corpora_list");
        return;
      }
      var deferred = $q.defer();

      var authConfig = {
        method: "POST",
        url: Servers.getServiceUrl($rootScope.serverCode, "auth") + "/login",
        data: {
          username: user,
          password: password
        },
        withCredentials: true
      };
      var corpusConfig = {
        method: "POST",
        url: Servers.getServiceUrl($rootScope.serverCode, "corpus") + "/_session",
        data: {
          name: user,
          password: password
        },
        withCredentials: true
      };

      var userIsAuthenticated = function(user) {
        user.name = user.firstname || user.lastname || user.username;
        if (!user.gravatar || user.gravatar.indexOf("gravatar") > -1) {
          user.gravatar = md5.createHash(user.email);
        }
        $rootScope.user = user;
        $http(corpusConfig).then(
          function(corpusResponse) {
            console.log("Logging in to corpus server.");
            deferred.resolve(corpusResponse);
          },
          function(err) {
            console.warn(err);
            var message = "";
            if (err.status === 0) {
              message = "are you offline?";
              if ($rootScope.serverCode === "mcgill" || $rootScope.serverCode === "concordia") {
                message = "Cannot contact " + $rootScope.serverCode + " server, have you accepted the server's security certificate? (please refer to your registration email)";
              }
            }
            if (err && err.status >= 400 && err.data && err.data.reason) {
              message = err.data.reason;
            } else {
              message = "Cannot contact " + $rootScope.serverCode + " server, please report this.";
            }
            deferred.reject(message);
          });
      };

      $http(authConfig).then(
        function(response) {
          if (response.data.userFriendlyErrors) {
            deferred.reject(response.data.userFriendlyErrors.join(" "));
          } else {
            userIsAuthenticated(response.data.user);
          }

        },
        function(err) {
          console.warn(err);
          var message = "";
          if (err.status === 0) {
            message = "are you offline?";
            if ($rootScope.serverCode === "mcgill" || $rootScope.serverCode === "concordia") {
              message = "Cannot contact " + $rootScope.serverCode + " server, have you accepted the server's security certificate? (please refer to your registration email)";
            }
          }
          if (err && err.status >= 400 && err.data && err.data.userFriendlyErrors) {
            message = err.data.userFriendlyErrors;
          } else {
            message = "Cannot contact " + $rootScope.serverCode + " server, please report this.";
          }
          deferred.reject(message);

        });
      return deferred.promise;
    };

    var register = function(newLoginInfo) {

      var config = {
        method: "POST",
        url: newLoginInfo.authUrl + "/register",
        data: newLoginInfo,
        withCredentials: true
      };
      var promise = $http(config).then(
        function(response) {
          console.log("Registered new user.");
          if (response.data.userFriendlyErrors) {
            $rootScope.notificationMessage = response.data.userFriendlyErrors[0];
            $rootScope.openNotification();
          } else {
            $rootScope.notificationMessage = "Welcome! Your usenamme is " + response.data.user.username + "\nYou may now play with your Practice Corpus or browse some sample data in LingLlama's community corpus of Quechua data. You can also find a tutorial by clicking on the FAQ.";
            $rootScope.openNotification();

            login(response.data.user.username, newLoginInfo.password).then(function() {

              // Update saved state in Preferences and reload the page to the corpora list.
              var preferences = window.defaultPreferences;
              preferences.savedState.server = $rootScope.serverCode;
              preferences.savedState.username = $rootScope.user.username;
              preferences.savedState.password = sjcl.encrypt("password", newLoginInfo.password);
              localStorage.setItem('SpreadsheetPreferences', JSON.stringify(preferences));
              window.setTimeout(function() {
                if (window.location.hash.indexOf("register") > -1) {
                  window.location.assign("#/corpora_list");
                }
              }, 500);
            });
          }
          return response;
        },
        function(err) {
          console.warn(err);
          var message = "";
          if (err.status === 0) {
            message = "are you offline?";
            if ($rootScope.serverCode === "mcgill" || $rootScope.serverCode === "concordia") {
              message = "Cannot contact " + $rootScope.serverCode + " server, have you accepted the server's security certificate? (please refer to your registration email)";
            }
          }
          if (err && err.status >= 400 && err.data.userFriendlyErrors) {
            message = err.data.userFriendlyErrors.join(" ");
          } else {
            message = "Cannot contact " + $rootScope.serverCode + " server, please report this.";
          }

          $rootScope.notificationMessage = message;
          $rootScope.openNotification();
          $rootScope.loading = false;
          window.setTimeout(function() {
            window.open("https://docs.google.com/forms/d/18KcT_SO8YxG8QNlHValEztGmFpEc4-ZrjWO76lm0mUQ/viewform");
          }, 1500);

        });
      return promise;
    };

    var createcorpus = function(newCorpusInfo) {
      if (!$rootScope.serverCode) {
        console.log("Sever code is undefined");
        window.location.assign("#/corpora_list");
        return;
      }
      var config = {
        method: "POST",
        url: Servers.getServiceUrl($rootScope.serverCode, "auth") + "/newcorpus",
        data: newCorpusInfo,
        withCredentials: true
      };

      var promise = $http(config)
        .then(
          function(response) {
            console.log("Created new corpus.");
            console.log(JSON.stringify(response));
            if (response.data.userFriendlyErrors) {
              $rootScope.notificationMessage = response.data.userFriendlyErrors[0];
              $rootScope.openNotification();
            } else {
              $rootScope.notificationMessage = response.data.info.join(" ") + "\nYou may now select this corpus.";
              $rootScope.openNotification();
            }
            return response.data;
          },
          function(err) {

            console.warn(err);
            var message = "";
            if (err.status === 0) {
              message = "are you offline?";
              if ($rootScope.serverCode === "mcgill" || $rootScope.serverCode === "concordia") {
                message = "Cannot contact " + $rootScope.serverCode + " server, have you accepted the server's security certificate? (please refer to your registration email)";
              }
            }
            if (err && err.status >= 400 && err.data.userFriendlyErrors) {
              message = err.data.userFriendlyErrors.join(" ");
            } else {
              message = "Cannot contact " + $rootScope.serverCode + " server, please report this.";
            }

            $rootScope.notificationMessage = message;
            $rootScope.openNotification();
            $rootScope.loading = false;
          });
      return promise;
    };

    var updateroles = function(newRoleInfo) {
      if (!$rootScope.serverCode) {
        console.log("Sever code is undefined");
        window.location.assign("#/corpora_list");
        return;
      }
      var config = {
        method: "POST",
        url: Servers.getServiceUrl($rootScope.serverCode, "auth") + "/updateroles",
        data: newRoleInfo,
        withCredentials: true
      };

      var promise = $http(config)
        .then(
          function(response) {
            console.log("Updated user roles.");
            if (response.data.userFriendlyErrors) {
              if (response.data.userFriendlyErrors[0] === null) {
                $rootScope.notificationMessage = "Error adding user. Please make sure that user exists.";
                $rootScope.openNotification();
              } else {
                $rootScope.notificationMessage = response.data.userFriendlyErrors[0];
                $rootScope.openNotification();
              }
            } else {
              $rootScope.notificationMessage = response.data.info.join(" ");
              $rootScope.openNotification();
            }
            return response;
          },
          function(err) {
            console.warn(err);
            var message = "";
            if (err.status === 0) {
              message = "are you offline?";
              if ($rootScope.serverCode === "mcgill" || $rootScope.serverCode === "concordia") {
                message = "Cannot contact " + $rootScope.serverCode + " server, have you accepted the server's security certificate? (please refer to your registration email)";
              }
            }
            if (err && err.status >= 400 && err.data.userFriendlyErrors) {
              message = err.data.userFriendlyErrors.join(" ");
            } else {
              message = "Cannot contact " + $rootScope.serverCode + " server, please report this.";
            }

            $rootScope.notificationMessage = message;
            $rootScope.openNotification();
            $rootScope.loading = false;
          });
      return promise;
    };

    var removeroles = function(newRoleInfo) {
      if (!$rootScope.serverCode) {
        console.log("Sever code is undefined");
        window.location.assign("#/corpora_list");
        return;
      }
      var config = {
        method: "POST",
        url: Servers.getServiceUrl($rootScope.serverCode, "auth") + "/updateroles",
        data: newRoleInfo,
        withCredentials: true
      };

      var promise = $http(config)
        .then(
          function(response) {
            console.log("Removed user roles.", response);
            $rootScope.notificationMessage = response.data.info.join(" ");
            $rootScope.openNotification();
            return response;
          },
          function(err) {
            console.warn(err);
            var message = "";
            if (err.status === 0) {
              message = "are you offline?";
              if ($rootScope.serverCode === "mcgill" || $rootScope.serverCode === "concordia") {
                message = "Cannot contact " + $rootScope.serverCode + " server, have you accepted the server's security certificate? (please refer to your registration email)";
              }
            }
            if (err && err.status >= 400 && err.data.userFriendlyErrors) {
              message = err.data.userFriendlyErrors.join(" ");
            } else {
              message = "Cannot contact " + $rootScope.serverCode + " server, please report this.";
            }

            $rootScope.notificationMessage = message;
            $rootScope.openNotification();
            $rootScope.loading = false;
          });
      return promise;
    };

    var saveSpreadsheetDatum = function(spreadsheetDatumToBeSaved) {
      var deferred = Q.defer();

      Q.nextTick(function() {
        // spreadsheetDatumToBeSaved.timestamp = Date.now();
        // spreadsheetDatumToBeSaved.dateModified = JSON.parse(JSON.stringify(new Date())); //These were done in the edit functions because the data might get saved an hour after it was modified... or more...
        var convertAndSaveAsFieldDBDatum = function(fieldDBDatumDocOrTemplate) {
          var fieldDBDatum;
          try {
            fieldDBDatum = SpreadsheetDatum.convertSpreadSheetDatumIntoFieldDBDatum(spreadsheetDatumToBeSaved, fieldDBDatumDocOrTemplate);
          } catch (e) {
            deferred.reject("Error saving datum: " + JSON.stringify(e));
            return;
          }
          saveCouchDoc(fieldDBDatum.dbname, fieldDBDatum).then(function(response) {
            console.log(response);
            if (response.status >= 400) {
              deferred.reject("Error saving datum " + response.status);
              return;
            }
            if (!spreadsheetDatumToBeSaved.id) {
              spreadsheetDatumToBeSaved.id = response.data.id;
              spreadsheetDatumToBeSaved.rev = response.data.rev;
            }
            deferred.resolve(spreadsheetDatumToBeSaved);
          }, function(e) {
            var reason = "Error saving datum. Maybe you're offline?";
            if (e.data && e.data.reason) {
              reason = e.data.reason;
            } else if (e.status) {
              reason = "Error saving datum: " + e.status;
            }
            console.log(reason, fieldDBDatum, e);
            deferred.reject(reason);
          });
        };

        if (spreadsheetDatumToBeSaved.id) {
          getDocFromCouchDB(spreadsheetDatumToBeSaved.dbname, spreadsheetDatumToBeSaved.id).then(convertAndSaveAsFieldDBDatum, function(e) {
            var reason = "Error getting the most recent version of the datum. Maybe you're offline?";
            if (e.data && e.data.reason) {
              if (e.data.reason === "missing") {
                e.data.reason = e.data.reason + " Please report this.";
              }
              reason = e.data.reason;
            } else if (e.status) {
              reason = "Error getting the most recent version of the datum: " + e.status;
            }
            console.log(reason, spreadsheetDatumToBeSaved, e);
            deferred.reject(reason);
          });
        } else {
          convertAndSaveAsFieldDBDatum(getBlankDataTemplateFromCorpus("datumFields"));
        }

      });
      return deferred.promise;
    };

    var blankDatumTemplate = function() {
      return getBlankDataTemplateFromCorpus("datumFields");
    };

    var blankSessionTemplate = function() {
      return getBlankDataTemplateFromCorpus("sessionFields");
    };

    var blankActivityTemplate = function() {
      var promise = $http
        .get('data/blank_activity_template.json').then(
          function(response) {
            return response.data;
          });
      return promise;
    };

    var removeRecord = function(DB, UUID, rev) {
      if (!$rootScope.serverCode) {
        console.log("Sever code is undefined");
        window.location.assign("#/corpora_list");
        return;
      }
      console.log("You cannot delete items from the corpus.", rev);
      return;

      // var config = {
      //   method: "DELETE",
      //   url: Servers.getServiceUrl($rootScope.serverCode, "corpus") + "/" + DB + "/" + UUID + "?rev=" + rev,
      //   withCredentials: true
      // };

      // console.log("Contacting the DB to delete record. " + config.url);
      // var promise = $http(config).then(function(response) {
      //   return response;
      // });
      // return promise;
    };

    var forgotPassword = function(forgotPasswordInfo) {
      if (!$rootScope.serverCode) {
        console.log("Sever code is undefined");
        window.location.assign("#/corpora_list");
        return;
      }
      var config = {
        method: "POST",
        data: forgotPasswordInfo,
        url: Servers.getServiceUrl($rootScope.serverCode, "auth") + "/forgotpassword",
        withCredentials: true
      };

      console.log("Contacting the server to forgot password. " + config.url);
      var promise = $http(config).then(function(response) {
        return response;
      });
      return promise;
    };

    var changePassword = function(changePasswordInfo) {
      if (!$rootScope.serverCode) {
        console.log("Sever code is undefined");
        window.location.assign("#/corpora_list");
        return;
      }
      var config = {
        method: "POST",
        data: changePasswordInfo,
        url: Servers.getServiceUrl($rootScope.serverCode, "auth") + "/changepassword",
        withCredentials: true
      };

      console.log("Contacting the server to change password. " + config.url);
      var promise = $http(config).then(function(response) {
        return response;
      });
      return promise;
    };


    return {
      async: getDocFromCouchDB,
      datumFields: datumFields,
      sessions: sessions,
      glosser: glosser,
      lexicon: lexicon,
      getallusers: getallusers,
      login: login,
      register: register,
      createcorpus: createcorpus,
      updateroles: updateroles,
      removeroles: removeroles,
      saveCouchDoc: saveCouchDoc,
      saveSpreadsheetDatum: saveSpreadsheetDatum,
      blankDatumTemplate: blankDatumTemplate,
      blankSessionTemplate: blankSessionTemplate,
      blankActivityTemplate: blankActivityTemplate,
      removeRecord: removeRecord,
      forgotPassword: forgotPassword,
      changePassword: changePassword
    };
  });

'use strict';
console.log("Declaring the SpreadsheetStyleDataEntryFilters.");

angular.module('spreadsheetApp')
  .filter('startFrom', function() {
    return function(input, start) {
      if (input === undefined) {
        return;
      } else {
        start = +start; // parse to int
        return input.slice(start);
      }
    };
  })
  .filter('standardDate', function() {
    return function(input) {
      if (!input) {
        return "--";
      } else if (input === "2000-09-06T16:31:30.988Z") {
        return "N/A";
      } else {
        if (typeof input.replace === "function") {
          input = input.replace(/\"/g, "");
        }
        var d = new Date(input);
        var t = new Date(input);
        var minutes = t.getMinutes();
        if (minutes < 10) {
          minutes = "0" + minutes;
        }
        return d.toLocaleDateString() + " " + t.getHours() + ":" + minutes;
      }
    };
  })
  .filter('standardDateFromTimestamp', function() {
    return function(input) {
      if (!input) {
        return "--";
      } else if (input === "2000-09-06T16:31:30.988Z") {
        return "N/A";
      } else {
        var newDate = input;
        var d = new Date(newDate);
        var t = new Date(newDate);
        var minutes = t.getMinutes();
        if (minutes < 10) {
          minutes = "0" + minutes;
        }
        return d.toLocaleDateString() + " " + t.getHours() + ":" + minutes;
      }
    };
  })
  .filter('shortDate', function() {
    return function(input) {
      if (!input) {
        return "--";
      } else if (input === "2000-09-06T16:31:30.988Z") {
        return "N/A";
      } else {
        if (typeof input.replace === "function") {
          input = input.replace(/\"/g, "");
        }
        var d = new Date(input);
        return d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
      }
    };
  })
  .filter('neverEmpty', function() {
    return function(input) {
      if (input === "" || input === undefined || input === " ") {
        return "--";
      } else {
        return input;
      }
    };
  })
  .filter('checkDatumTags', function() {
    return function(input) {
      if (input === "Tags") {
        return "--";
      } else {
        return input;
      }
    };
  });

'use strict';
console.log("Declaring the SpreadsheetStyleDataEntryDirectives.");

angular.module('spreadsheetApp')
  .directive('selectFieldFromDefaultCompactTemplate', function() {
    return function(scope, element, attrs) {
      var Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
      if (scope.field.label === Preferences.compacttemplate[attrs.selectFieldFromDefaultCompactTemplate].label) {
        element[0].selected = true;
      }
    };
  })
  .directive('selectFieldFromDefaultFullTemplate', function() {
    return function(scope, element, attrs) {
      var Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
      if (scope.field.label === Preferences.fulltemplate[attrs.selectFieldFromDefaultFullTemplate].label) {
        element[0].selected = true;
      }
    };
  })
  .directive('selectFieldFromYaleFieldMethodsSpring2014Template', function() {
    return function(scope, element, attrs) {
      var Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
      if (scope.field.label === Preferences.yalefieldmethodsspring2014template[attrs.selectFieldFromYaleFieldMethodsSpring2014Template].label) {
        element[0].selected = true;
      }
    };
  })
  .directive('selectDropdownSession', function() {
    return function(scope, element) {
      scope.$watch('activeSessionID', function() {
        if (scope.session._id === scope.activeSessionID) {
          element[0].selected = true;
        }
      });
    };
  })
  .directive('spreadsheetCatchArrowKey', function($rootScope) {
    return function(scope, element) {
      element.bind('keyup', function(e) {
        if (e.keyCode !== 40 && e.keyCode !== 38) {
          return;
        }
        scope.$apply(function() {
          if (!scope.allData) {
            return;
          }
          // NOTE: scope.$index represents the the scope index of the record when an arrow key is pressed
          console.log("calculating arrows and requesting numberOfResultPages");
          var lastPage = scope.numberOfResultPages(scope.allData.length);
          var resultSize = $rootScope.resultSize;
          if (resultSize === "all") {
            resultSize = scope.allData.length;
          }
          var scopeIndexOfLastRecordOnLastPage = resultSize - ((resultSize * lastPage) - scope.allData.length) - 1;
          var currentRecordIsLastRecord = false;
          var currentRecordIsFirstRecordOnNonFirstPage = false;
          if ($rootScope.currentPage === (lastPage - 1) && scopeIndexOfLastRecordOnLastPage === scope.$index) {
            currentRecordIsLastRecord = true;
          }
          if ($rootScope.currentPage > 0 && 0 === scope.$index) {
            currentRecordIsFirstRecordOnNonFirstPage = true;
          }

          if (e.keyCode === 40) {
            element[0].scrollIntoView(true);
          }

          if (e.keyCode === 38) {
            element[0].scrollIntoView(false);
          }

          if (e.keyCode === 40 && scope.$index === undefined) {
            // Select first record on next page if arrowing down from new record
            // $rootScope.currentPage = $rootScope.currentPage + 1;
            // scope.selectRow(0);
            //do nothing if it was the newEntry
          } else if (e.keyCode === 40 && currentRecordIsLastRecord === true) {
            // Do not go past very last record
            scope.selectRow('newEntry');
            return;
          } else if (e.keyCode === 40) {
            if (scope.$index + 2 > resultSize) {
              // If the next record down is on another page, change to that page and select the first record
              $rootScope.currentPage = $rootScope.currentPage + 1;
              scope.selectRow(0);
            } else {
              scope.selectRow(scope.$index + 1);
            }
          } else if (e.keyCode === 38 && scope.$index === undefined) {
            // Select new entry if coming from most recent record
            // scope.selectRow(scopeIndexOfLastRecordOnLastPage);
          } else if (e.keyCode === 38 && $rootScope.currentPage === 0 && (scope.$index === 0 || scope.$index === undefined)) {
            // Select new entry if coming from most recent record
            // scope.selectRow('newEntry');
          } else if (e.keyCode === 38 && scope.$index === 0) {
            // Go back one page and select last record
            $rootScope.currentPage = $rootScope.currentPage - 1;
            scope.selectRow(resultSize - 1);
          } else if (e.keyCode === 38) {
            scope.selectRow(scope.$index - 1);
          } else {
            return;
          }
        });
      });
    };
  })
  .directive('spreadsheetCatchFocusOnArrowPress', function($timeout) {
    return function(scope, element) {
      var selfElement = element;
      scope.$watch('activeDatumIndex', function(newIndex, oldIndex) {
        // element.bind('blur', function(e) {

        if (newIndex === oldIndex) {
          console.log('spreadsheetCatchFocusOnArrowPress hasnt changed');
          // return; //cant return, it makes it so you cant go to the next page
        }

        if (scope.activeDatumIndex === 'newEntry' || scope.activeDatumIndex === scope.$index) {
          $timeout(function() {

            if (document.activeElement !== selfElement.find("input")[0] && selfElement.find("input")[0]) {
              // console.log("arrow old focus", document.activeElement);
              // element[0].focus();
              selfElement.find("input")[0].focus();
              // document.getElementById("firstFieldOfEditingEntry").focus();
              // console.log("arrow new focus", document.activeElement);
            }

          }, 0);
        }
      });
    };
  });
// .directive('loadPaginatedDataOnPageChange', function() {
//   return function(scope) {
//     scope.$watch('currentPage', function() {
//       scope.loadPaginatedData();
//     });
//   };
// });

/* globals confirm */
'use strict';
console.log("Declaring the SpreadsheetStyleDataEntry SettingsController.");

/**
 * @ngdoc function
 * @name spreadsheetApp.controller:SpreadsheetStyleDataEntrySettingsController
 * @description
 * # SpreadsheetStyleDataEntrySettingsController
 * Controller of the spreadsheetApp
 */

var SpreadsheetStyleDataEntrySettingsController = function($scope, $rootScope, $resource, Data) {

  console.log(" Loading the SpreadsheetStyleDataEntry SettingsController.");
  var debugging = false;
  var todo = function(message) {
    console.warn("TODO SETTINGS CONTROLLER: " + message);
  };
  if (debugging) {
    console.log($scope, $rootScope, $resource, Data);
  }

  $scope.scopePreferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));

  if ($scope.appReloaded !== true) {
    todo("$scope.appReloaded is not true, sending to url # and not loading the SettingsController completely");
    window.location.assign("#/");
    return;
  }
  todo("$scope.appReloaded is true, loading the SettingsController completely");


  $scope.removeFieldFromCorpus = function(field) {
    console.log("TODO remove the field.", field);
  };

  // $scope.availableFields = $scope.scopePreferences.availableFields;
  // console.log($scope.availableFields );
  $scope.changeTagToEdit = function(tag) {
    $scope.tagToEdit = tag;
  };

  $scope.changeFieldToEdit = function(field) {
    todo("what is changeFieldToEdit for");
    $scope.fieldToEdit = field;
  };


  $scope.editFieldTitle = function(field, newFieldTitle) {
    var Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
    for (var key in Preferences.availableFields) {
      if (key === field.label) {
        Preferences.availableFields[key].title = newFieldTitle;
      }
    }
    localStorage.setItem('SpreadsheetPreferences', JSON.stringify(Preferences));
    $scope.scopePreferences = Preferences;
    $scope.availableFields = Preferences.availableFields;
  };

  $scope.editTagInfo = function(oldTag, newTag) {
    var r = confirm("Are you sure you want to change all '" + oldTag + "' to '" + newTag + "'?\nThis may take a while.");
    if (r === true) {
      var changeThisRecord;
      var doSomethingToSomething = function(indexi) {
        var UUID = $scope.dataCopy[indexi].id;
        for (var j = 0; j < $scope.dataCopy[indexi].value.datumTags.length; j++) {
          if ($scope.dataCopy[indexi].value.datumTags[j].tag === oldTag) {
            changeThisRecord = true;
          }
        }
        if (changeThisRecord === true) {
          $rootScope.loading = true;
          Data.async($rootScope.corpus.dbname, UUID)
            .then(
              function(editedRecord) {
                // Edit record with updated tag data
                var editRecordWithUpdatedTagData = function(indexk) {
                  if (editedRecord.datumTags[indexk].tag === oldTag) {
                    editedRecord.datumTags[indexk].tag = newTag;
                  }
                };
                for (var k = 0; k < editedRecord.datumTags.length; k++) {
                  editRecordWithUpdatedTagData(k);
                }
                // Save edited record
                Data.saveEditedCouchDoc($rootScope.corpus.dbname, UUID, editedRecord, editedRecord._rev)
                  .then(
                    function() {
                      console.log("Changed " + oldTag + " to " + newTag + " in " + UUID);
                      $rootScope.loading = false;
                    },
                    function() {
                      window
                        .alert("There was an error saving the record. Please try again.");
                    });
              },
              function() {
                window
                  .alert("There was an error retrieving the record. Please try again.");
              });
        }
      };
      for (var i = 0; i < $scope.dataCopy.length; i++) {
        changeThisRecord = false;
        doSomethingToSomething(i);
      }
      for (var j in $scope.tags) {
        if ($scope.tags[j] === oldTag) {
          $scope.tags[j] = newTag;
        }
      }
    }
  };

  $scope.deleteDuplicateTags = function() {
    window.alert("Coming soon.");
    var changeThisRecord;
    var doSomethingLIkeDeletingDuplicateTags = function(indexi) {
      var tagsArray = $scope.dataCopy[indexi].value.datumTags;
      if (tagsArray.length > 1) {
        for (var j = 0; j < tagsArray.length; j++) {
          for (var k = 0; k < tagsArray.length; k++) {
            if (tagsArray[j].tag === tagsArray[k].tag) {
              console.log(tagsArray[j].tag + " = " + tagsArray[k].tag);
            }
          }
        }
        console.log(JSON.stringify(tagsArray));
      }
    };
    for (var i = 0; i < $scope.dataCopy.length; i++) {
      changeThisRecord = false;
      doSomethingLIkeDeletingDuplicateTags(i);
    }
  };

  // Get all tags
  $scope.getTags = function() {
    Data.async($rootScope.corpus.dbname)
      .then(
        function(dataFromServer) {
          var tags = {};
          // While getting tags, make a copy of all datums so other
          // editing won't have to query the server again
          var dataCopy = [];
          for (var i = 0; i < dataFromServer.length; i++) {
            if (dataFromServer[i].value.datumFields) {
              dataCopy.push(dataFromServer[i]);
            }
            if (dataFromServer[i].value.datumTags) {
              for (var j in dataFromServer[i].value.datumTags) {
                if (tags[dataFromServer[i].value.datumTags[j].tag] === undefined && dataFromServer[i].value.datumTags[j].tag !== undefined) {
                  tags[dataFromServer[i].value.datumTags[j].tag] = dataFromServer[i].value.datumTags[j].tag;
                }
              }
            }
          }
          $scope.dataCopy = dataCopy;
          $scope.tags = tags;
        });
  };
  // $scope.getTags();



  $scope.saveNewPreferences = function(templateId, newFieldPreferences, fullTemplateDefaultNumberOfColumns, fullTemplateDefaultNumberOfFieldsPerColumn) {
    if ($rootScope.corpus && $rootScope.corpus.preferredTemplate && $rootScope.corpus.preferredTemplate !== templateId) {
      // window.alert("Sorry, you can't use a different template. Your team has decided to use the " + $rootScope.corpus.preferredTemplate + " for " + $rootScope.corpus.title);
      // return;
    }

    var prefs = localStorage.getItem('SpreadsheetPreferences');
    var Preferences = JSON.parse(prefs || "{}");
    for (var availableField in $scope.availableFields) {
      for (var newField in newFieldPreferences) {
        if (newFieldPreferences[newField] === "") {
          Preferences[templateId][newField].title = "";
          Preferences[templateId][newField].label = "";
        } else if ($scope.availableFields[availableField].label === newFieldPreferences[newField]) {
          if (!Preferences[templateId]) {
            //hack for #1290 until we refactor the app into something more MVC
            Preferences[templateId] = window.defaultPreferences[templateId];
          }
          Preferences[templateId][newField].title = $scope.availableFields[availableField].title;
          Preferences[templateId][newField].label = $scope.availableFields[availableField].label;
        }
      }
    }
    if (fullTemplateDefaultNumberOfColumns) {
      Preferences.fullTemplateDefaultNumberOfColumns = fullTemplateDefaultNumberOfColumns;
    }
    if (fullTemplateDefaultNumberOfFieldsPerColumn) {
      Preferences.fullTemplateDefaultNumberOfFieldsPerColumn = fullTemplateDefaultNumberOfFieldsPerColumn;
      $rootScope.fullTemplateDefaultNumberOfFieldsPerColumn = fullTemplateDefaultNumberOfFieldsPerColumn;
    }
    Preferences.userChosenTemplateId = templateId;
    $scope.scopePreferences = Preferences;
    $rootScope.templateId = Preferences.userChosenTemplateId;
    $rootScope.setTemplateUsingCorpusPreferedTemplate($rootScope.corpus);
    // $rootScope.fields = Preferences[Preferences.userChosenTemplateId];
    // $rootScope.fieldsInColumns = $rootScope.getAvailableFieldsInColumns(Preferences[Preferences.userChosenTemplateId]);

    localStorage.setItem('SpreadsheetPreferences', JSON.stringify(Preferences));
    window.alert("Settings saved.");
  };

  $scope.saveNumberOfRecordsToDisplay = function(numberOfRecordsToDisplay) {
    var Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
    if (numberOfRecordsToDisplay) {
      Preferences.resultSize = numberOfRecordsToDisplay;
      localStorage.setItem('SpreadsheetPreferences', JSON.stringify(Preferences));
      $rootScope.resultSize = numberOfRecordsToDisplay;
      window.alert("Settings saved.\nYou may need to reload for the new settings to take effect.");
    } else {
      window.alert("Please select a value from the dropdown.");
    }
  };

};

SpreadsheetStyleDataEntrySettingsController.$inject = ['$scope', '$rootScope', '$resource', 'Data'];
angular.module('spreadsheetApp').controller('SpreadsheetStyleDataEntrySettingsController', SpreadsheetStyleDataEntrySettingsController);

/* globals  FieldDB, Q, sjcl, SpreadsheetDatum, _, confirm, alert, prompt */
'use strict';
console.log("Declaring Loading the SpreadsheetStyleDataEntryController.");

/**
 * @ngdoc function
 * @name spreadsheetApp.controller:SpreadsheetStyleDataEntryController
 * @description
 * # SpreadsheetStyleDataEntryController
 * Controller of the spreadsheetApp
 */

var SpreadsheetStyleDataEntryController = function($scope, $rootScope, $resource, $filter, $document, Data, Servers, md5, $timeout, $modal, $log, $http) {
  console.log(" Loading the SpreadsheetStyleDataEntryController.");
  var debugging = false;
  if (debugging) {
    console.log($scope, $rootScope, $resource, $filter, $document, Data, Servers, md5, $timeout, $modal, $log, $http);
  }
  $rootScope.fullTemplateDefaultNumberOfFieldsPerColumn = null;

  if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application) {
    FieldDB.FieldDBObject.application.alwaysReplyToPrompt = "notpromptinguserforpasswordtheywillremaininencryptedmode";
  }

  if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application && $rootScope.contextualize) {
    if ($rootScope.contextualize("locale_faq") === "FAQ") {
      console.log("Locales already loaded.");
    } else {
      FieldDB.FieldDBObject.application.contextualizer.addMessagesToContextualizedStrings("ka", {
        "locale_settings": {
          "message": "პარამეტრები"
        }
      });

      $http.get("locales/en/messages.json").then(function(result) {
        var locales = result.data;
        console.log("Retrieving english localization", locales);
        FieldDB.FieldDBObject.application.contextualizer.addMessagesToContextualizedStrings("en", locales);
        /* jshint camelcase: false */
        // $rootScope.locales.locale_settings = $rootScope.contextualize("locale_settings");
      });
      $http.get("locales/es/messages.json").then(function(result) {
        var locales = result.data;
        console.log("Retrieving spanish localization", locales);
        FieldDB.FieldDBObject.application.contextualizer.addMessagesToContextualizedStrings("es", locales);
        /* jshint camelcase: false */
        // $rootScope.locales.locale_settings = $rootScope.contextualize("locale_settings");
      });
      $http.get("locales/fr/messages.json").then(function(result) {
        var locales = result.data;
        console.log("Retrieving french localization", locales);
        FieldDB.FieldDBObject.application.contextualizer.addMessagesToContextualizedStrings("fr", locales);
        /* jshint camelcase: false */
        // $rootScope.locales.locale_settings = $rootScope.contextualize("locale_settings");
      });
    }
  }

  $rootScope.appVersion = "2.45.05ss";

  // Functions to open/close generic notification modal
  $rootScope.openNotification = function(size, showForgotPasswordInstructions) {
    if (showForgotPasswordInstructions) {
      $rootScope.showForgotPasswordInstructions = showForgotPasswordInstructions;
    } else {
      $rootScope.showForgotPasswordInstructions = false;
    }
    var modalInstance = $modal.open({
      templateUrl: 'views/notification-modal.html',
      controller: 'SpreadsheetNotificationController',
      size: size,
      resolve: {
        details: function() {
          return {};
        }
      }
    });

    modalInstance.result.then(function(any, stuff) {
      if (any || stuff) {
        console.warn("Some parameters were passed by the modal closing, ", any, stuff);
      }
    }, function() {
      $log.info('Export Modal dismissed at: ' + new Date());
    });
  };

  if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application) {
    FieldDB.FieldDBObject.bug = function(message) {
      $rootScope.notificationMessage = message;
      $rootScope.openNotification();
    };
  }
  // Functions to open/close welcome notification modal
  $rootScope.openWelcomeNotificationDeprecated = function() {
    // $scope.welcomeNotificationShouldBeOpen = false; //never show this damn modal.
  };


  // TEST FOR CHROME BROWSER
  var isChrome = window.navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  if (!isChrome) {
    $scope.notChrome = window.navigator.userAgent;
  }

  $scope.useAutoGlosser = true;
  try {
    var previousValue = localStorage.getItem("useAutoGlosser");
    if (previousValue === "false") {
      $scope.useAutoGlosser = false;
    }
  } catch (e) {
    console.log("Use autoglosser was not previously set.");
  }


  $scope.$watch('useAutoGlosser', function(newvalue, oldvalue) {
    console.log("useAutoGlosser", oldvalue);
    localStorage.setItem("useAutoGlosser", newvalue);
  });

  /*
   * Create an array of servers which the user may use
   */
  $rootScope.servers = Servers.getAvailable();
  $rootScope.selectedServer = $rootScope.servers[0];
  $rootScope.serverCode = $rootScope.selectedServer.serverCode;


  // Set/get/update user preferences
  var defaultPreferences = {
    "userChosenTemplateId": "fulltemplate",
    "resultSize": 10,
    "version": $rootScope.appVersion,
    "savedState": {
      "server": "",
      "username": "",
      "password": "",
      "DB": "",
      "sessionID": ""
    },
    "availableFields": {
      "judgement": {
        "label": "judgement",
        "title": "Grammaticality Judgement",
        "hint": "Grammaticality/acceptability judgement (*,#,?,1-3 etc). Leaving it blank usually means grammatical/acceptable, or your team can choose any symbol for this meaning."
      },
      "utterance": {
        "label": "utterance",
        "title": "Utterance",
        "hint": "Unparsed utterance in the language, in orthography or transcription. Line 1 in your LaTeXed examples for handouts. Sample entry: amigas"
      },
      "morphemes": {
        "label": "morphemes",
        "title": "Morphemes",
        "hint": "Morpheme-segmented utterance in the language. Used by the system to help generate glosses (below). Can optionally appear below (or instead of) the first line in your LaTeXed examples. Sample entry: amig-a-s"
      },
      "gloss": {
        "label": "gloss",
        "title": "Gloss",
        "hint": "Metalanguage glosses of each individual morpheme (above). Used by the system to help gloss, in combination with morphemes (above). It is Line 2 in your LaTeXed examples. We recommend Leipzig conventions (. for fusional morphemes, - for morpheme boundaries etc)  Sample entry: friend-fem-pl"
      },
      "translation": {
        "label": "translation",
        "title": "Translation",
        "hint": "The team's primary translation. It might not be English, just a language the team is comfortable with (in which case you should change the lable to the language you are using). There may also be additional translations in the other fields."
      },
      // "comments": {
      //   "label": "comments",
      //   "title": "Comments"
      // },
      "refs": {
        "label": "refs",
        "title": "References"
      },
      "goal": {
        "label": "goal",
        "title": "Goal"
      },
      "consultants": {
        "label": "consultants",
        "title": "Consultants"
      },
      "dialect": {
        "label": "dialect",
        "title": "Dialect"
      },
      "language": {
        "label": "language",
        "title": "language"
      },
      // "dateElicited": {
      //   "label": "dateElicited",
      //   "title": "Date Elicited"
      // },
      // "user": {
      //   "label": "user",
      //   "title": "User"
      // },
      // "dateSEntered": {
      //   "label": "dateSEntered",
      //   "title": "Date entered"
      // },
      "tags": {
        "label": "tags",
        "title": "Tags"
      },
      "validationStatus": {
        "label": "validationStatus",
        "title": "validationStatus"
      },
      "syntacticCategory": {
        "label": "syntacticCategory",
        "title": "syntacticCategory",
        "hint": "This optional field is used by the machine to help with search and data cleaning, in combination with morphemes and gloss (above). If you want to use it, you can choose to use any sort of syntactic category tagging you wish. It could be very theoretical like Distributed Morphology (Sample entry: √-GEN-NUM), or very a-theroretical like the Penn Tree Bank Tag Set. (Sample entry: NNS) http://www.ims.uni-stuttgart.de/projekte/CorpusWorkbench/CQP-HTMLDemo/PennTreebankTS.html"
      },
      "allomorphs": {
        "label": "allomorphs",
        "title": "Allomorphs"
      },
      "phonetic": {
        "label": "phonetic",
        "title": "Phonetic"
      },
      "housekeeping": {
        "label": "housekeeping",
        "title": "Housekeeping"
      },
      "spanish": {
        "label": "spanish",
        "title": "Spanish"
      },
      "orthography": {
        "label": "orthography",
        "title": "Orthography",
        "hint": "Many teams will only use the utterance line. However if your team needs to distinguish between utterance and orthography this is the unparsed word/sentence/dialog/paragraph/document in the language, in its native orthography which speakers can read. If there are more than one orthography an additional orthography field can be added to the corpus. This is Line 0 in your LaTeXed examples for handouts (if you distinguish the orthography from the utterance line and you choose to display the orthography for your language consultants and/or native speaker linguists). Sample entry: amigas"
      }
    },
    "compacttemplate": {
      "field1": {
        "label": "utterance",
        "title": "Utterance"
      },
      "field2": {
        "label": "morphemes",
        "title": "Morphemes"
      },
      "field3": {
        "label": "gloss",
        "title": "Gloss"
      },
      "field4": {
        "label": "translation",
        "title": "Translation"
      }
    },
    "fulltemplate": {
      "field1": {
        "label": "utterance",
        "title": "Utterance"
      },
      "field2": {
        "label": "morphemes",
        "title": "Morphemes"
      },
      "field3": {
        "label": "gloss",
        "title": "Gloss"
      },
      "field4": {
        "label": "translation",
        "title": "Translation"
      },
      "field5": {
        "label": "validationStatus",
        "title": "Status"
      },
      "field6": {
        "label": "tags",
        "title": "Tags"
      }
    },
    "mcgillfieldmethodsspring2014template": {
      "field1": {
        "label": "utterance",
        "title": "Utterance"
      },
      "field2": {
        "label": "morphemes",
        "title": "Morphemes"
      },
      "field3": {
        "label": "gloss",
        "title": "Gloss"
      },
      "field4": {
        "label": "translation",
        "title": "Translation"
      },
      "field5": {
        "label": "judgement",
        "title": "Grammaticality Judgement"
      },
      "field6": {
        "label": "tags",
        "title": "Tags"
      }
    },
    "mcgillfieldmethodsfall2014template": {
      "field1": {
        "label": "utterance",
        "title": "Utterance"
      },
      "field2": {
        "label": "morphemes",
        "title": "Morphemes"
      },
      "field3": {
        "label": "gloss",
        "title": "Gloss"
      },
      "field4": {
        "label": "translation",
        "title": "Translation"
      },
      "field5": {
        "label": "phonetic",
        "title": "IPA"
      },
      "field6": {
        "label": "notes",
        "title": "Notes"
      }
    },
    "yalefieldmethodsspring2014template": {
      "field1": {
        "label": "orthography",
        "title": "Orthography"
      },
      "field2": {
        "label": "utterance",
        "title": "Utterance"
      },
      "field3": {
        "label": "morphemes",
        "title": "Morphemes"
      },
      "field4": {
        "label": "gloss",
        "title": "Gloss"
      },
      "field5": {
        "label": "translation",
        "title": "Translation"
      },
      "field6": {
        "label": "spanish",
        "title": "Spanish"
      },
      "field7": {
        "label": "housekeeping",
        "title": "Housekeeping"
      },
      "field8": {
        "label": "tags",
        "title": "Tags"
      }
    }
  };

  //TODO move the default preferences somewher the SettingsController can access them. for now here is a hack for #1290
  window.defaultPreferences = defaultPreferences;


  $rootScope.getAvailableFieldsInColumns = function(incomingFields, numberOfColumns) {
    if (!incomingFields || !$rootScope.corpus) {
      return {};
    }
    incomingFields = $rootScope.availableFieldsInCurrentCorpus;
    if (!numberOfColumns) {
      numberOfColumns = $rootScope.fullTemplateDefaultNumberOfColumns || 2;
    }
    numberOfColumns = parseInt(numberOfColumns, 10);
    var fields = [];
    if (incomingFields && typeof incomingFields.splice !== "function") {
      for (var field in incomingFields) {
        if (incomingFields.hasOwnProperty(field)) {
          if (!incomingFields[field].hint && defaultPreferences.availableFields[incomingFields[field].label]) {
            incomingFields[field].hint = defaultPreferences.availableFields[incomingFields[field].label].hint;
          }
          // add only unique fields
          if (fields.indexOf() === -1) {
            fields.push(incomingFields[field]);
          }
        }
      }
    } else {
      fields = incomingFields;
    }
    try {
      $scope.judgementHelpText = $rootScope.availableFieldsInCurrentCorpus[0].help;
    } catch (e) {
      console.warn("couldnt get the judgemetn help text for htis corpus for hte data entry hints");
    }
    var columnHeight = $rootScope.fullTemplateDefaultNumberOfFieldsPerColumn;
    if ($rootScope.corpus && $rootScope.corpus.prefs && $rootScope.corpus.prefs.fullTemplateDefaultNumberOfFieldsPerColumn) {
      columnHeight = $rootScope.corpus.prefs.fullTemplateDefaultNumberOfFieldsPerColumn;
    }
    if (columnHeight > fields.length - 1) {
      columnHeight = columnHeight || Math.ceil(fields.length / numberOfColumns);
    }
    if ($rootScope.corpus.datumFields.indexOf("syntacticTreeLatex") < 6) {
      $rootScope.corpus.upgradeCorpusFieldsToMatchDatumTemplate("fulltemplate");
    }

    var columns = {};

    if (numberOfColumns === 1) {
      columns.first = fields.slice(1, columnHeight + 1);
      columns.second = [];
      columns.third = [];
      $scope.fieldSpanWidthClassName = "span10";
      $scope.columnWidthClass = "span10";
    } else if (numberOfColumns === 2) {
      columns.first = fields.slice(1, columnHeight + 1);
      columns.second = fields.slice(columnHeight + 1, columnHeight * 2 + 1);
      columns.third = [];
      $scope.fieldSpanWidthClassName = "span5";
      $scope.columnWidthClass = "span5";
    } else if (numberOfColumns === 3) {
      columns.first = fields.slice(1, columnHeight + 1);
      columns.second = fields.slice(columnHeight + 1, columnHeight * 2 + 1);
      columns.third = fields.slice(columnHeight * 2 + 1, columnHeight * 3 + 1);
      $scope.fieldSpanWidthClassName = "span3";
      $scope.columnWidthClass = "span3";
    }
    return columns;
  };

  $rootScope.overrideTemplateSetting = function(templateId, newFieldPreferences, notUserInitited) {
    $rootScope.templateId = "fulltemplate"; // templateId;
    if ($rootScope.templateId !== templateId) {
      console.warn("Not using users prefered template " + templateId);
    }
    // $rootScope.fields = newFieldPreferences; //TODO doesnt seem right...
    $rootScope.fieldsInColumns = $rootScope.getAvailableFieldsInColumns($rootScope.availableFieldsInCurrentCorpus);

    console.log("notUserInitited", notUserInitited);
    try {
      if (!$scope.$$phase) {
        $scope.$digest(); //$digest or $apply
      }
    } catch (e) {
      console.warn(e);
    }
  };

  $rootScope.setAsDefaultCorpusTemplate = function(templateId) {
    console.log(templateId);
    if (!$rootScope.admin) {
      alert("You're not an admin on this corpus, please ask an admin to set this template as default for you.");
      return;
    }
    if ($rootScope.corpus.description) {
      $rootScope.corpus.preferredTemplate = templateId;
      Data.saveCouchDoc($rootScope.corpus.dbname, $rootScope.corpus)
        .then(function(result) {
          console.log("Saved corpus template preferences ", result);
        }, function(reason) {
          console.log("Error saving corpus template.", reason);
          alert("Error saving corpus template.");
        });
    } else {
      alert("The corpus doc was never fetched. So I cant save the preferences... Please report this if you think you should be able to save the preferences.");
    }
  };

  $rootScope.mcgillOnly = false;
  if (window.location.origin.indexOf("mcgill") > -1) {
    $rootScope.mcgillOnly = true;
  }
  var overwiteAndUpdatePreferencesToCurrentVersion = function() {

    var existingPreferences = localStorage.getItem('SpreadsheetPreferences');
    if (!existingPreferences) {
      console.log("No preferences. Setting default preferences in localStorage.");
      // localStorage.clear(); //why?? left over from debugging?
      localStorage.setItem('SpreadsheetPreferences', JSON.stringify(defaultPreferences));
      existingPreferences = JSON.stringify(defaultPreferences);
      // return defaultPreferences;
    }

    // console.log("Loaded Preferences from localStorage. TODO test this",JSON.stringify(existingPreferences));
    try {
      existingPreferences = JSON.parse(existingPreferences);
    } catch (e) {
      console.warn("cant set existingPreferences, might have already been an object", e);
    }

    /** Prior to 1.37 wipe personalization and use current defaults */
    if (!existingPreferences.version) {
      alert("Welcome to the Spring Field Methods session!\n\n We have introduced a new data entry template in this version. \nYou might want to review your settings to change the order and number of fields in the data entry template. Current defaults are set to 2 columns, with 3 rows each.");
      // localStorage.clear(); //why?? left over from debugging?
      localStorage.setItem('SpreadsheetPreferences', JSON.stringify(defaultPreferences));
      // return defaultPreferences;
    }

    var updatedPreferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
    /* Always get the most recent fields for field methods groups */
    updatedPreferences.mcgillfieldmethodsspring2014template = defaultPreferences.mcgillfieldmethodsspring2014template;
    updatedPreferences.mcgillfieldmethodsfall2014template = defaultPreferences.mcgillfieldmethodsfall2014template;
    updatedPreferences.yalefieldmethodsspring2014template = defaultPreferences.yalefieldmethodsspring2014template;

    /* Always get the most recent available fields */
    updatedPreferences.availableFields = defaultPreferences.availableFields;

    /* update the variable for user choosen template to 2.23+ */
    if (!updatedPreferences.userChosenTemplateId && updatedPreferences.userTemplate) {
      updatedPreferences.userChosenTemplateId = updatedPreferences.userTemplate;
      delete updatedPreferences.userTemplate;
    }

    /* upgrade fulltemplate to v1.923ss instead update to 2.22+ */
    if (existingPreferences.fulltemplate && existingPreferences.fulltemplate.field7) {
      updatedPreferences.fulltemplate = defaultPreferences.fulltemplate;
    }
    if (existingPreferences.fulltemplate && existingPreferences.fulltemplate.field6.label === 'judgement') {
      updatedPreferences.fulltemplate = defaultPreferences.fulltemplate;
    }

    /* set the number of columns to use  to 2.23+ */
    if (!existingPreferences.fullTemplateDefaultNumberOfColumns) {
      updatedPreferences.fullTemplateDefaultNumberOfColumns = $rootScope.fullTemplateDefaultNumberOfColumns || 2;
    }
    $rootScope.fullTemplateDefaultNumberOfColumns = updatedPreferences.fullTemplateDefaultNumberOfColumns;
    if (!existingPreferences.fullTemplateDefaultNumberOfFieldsPerColumn) {
      updatedPreferences.fullTemplateDefaultNumberOfFieldsPerColumn = $rootScope.fullTemplateDefaultNumberOfFieldsPerColumn || 3;
    }
    $rootScope.fullTemplateDefaultNumberOfFieldsPerColumn = updatedPreferences.fullTemplateDefaultNumberOfFieldsPerColumn;
    // If this is the mcgillOnly deploy, overwrite the user's data entry view
    if ($rootScope.mcgillOnly) {
      updatedPreferences.fulltemplate = defaultPreferences.fulltemplate;
      updatedPreferences.userChosenTemplateId = 'mcgillfieldmethodsfall2014template';
      defaultPreferences.userChosenTemplateId = 'mcgillfieldmethodsfall2014template';
      $rootScope.overrideTemplateSetting('mcgillfieldmethodsfall2014template', defaultPreferences.mcgillfieldmethodsfall2014template, true);
    }

    localStorage.setItem('SpreadsheetPreferences', JSON.stringify(updatedPreferences));
    return updatedPreferences;
  };
  $scope.scopePreferences = overwiteAndUpdatePreferencesToCurrentVersion();


  // console.log(Preferences.availableFields);
  // Set scope variables
  $scope.documentReady = false;
  $rootScope.templateId = $scope.scopePreferences.userChosenTemplateId;
  $rootScope.fields = []; //$scope.scopePreferences[$scope.scopePreferences.userChosenTemplateId];
  $rootScope.fieldsInColumns = {}; //$rootScope.getAvailableFieldsInColumns($scope.scopePreferences[$scope.scopePreferences.userChosenTemplateId]);
  $rootScope.availableFields = []; //defaultPreferences.availableFields;
  $scope.orderProp = "dateEntered";
  $rootScope.currentPage = 0;
  $scope.reverse = true;
  // $scope.activeDatumIndex = 'newEntry';
  $rootScope.authenticated = false;
  $rootScope.developer = false;
  $scope.dataentry = false;
  $scope.searching = false;
  $rootScope.activeSubMenu = 'none';
  $scope.activeSessionID = undefined;
  $scope.currentSessionName = "All Sessions";
  $scope.showCreateSessionDiv = false;
  $scope.editSessionDetails = false;
  $scope.createNewSessionDropdown = false;
  $scope.currentDate = JSON.parse(JSON.stringify(new Date()));
  $scope.activities = {};
  $rootScope.corpusSelected = false;
  $scope.newFieldData = {};
  $rootScope.newRecordHasBeenEdited = false;

  $rootScope.serverLabels = Servers.getHumanFriendlyLabels();

  // Set data size for pagination
  $rootScope.resultSize = $scope.scopePreferences.resultSize;


  $scope.changeActiveSubMenu = function(subMenu) {
    if ($rootScope.activeSubMenu === subMenu) {
      $rootScope.activeSubMenu = 'none';
    } else if (subMenu === 'none' && $scope.searching === true) {
      return;
    } else {
      $rootScope.activeSubMenu = subMenu;
    }
  };

  $scope.navigateVerifySaved = function(itemToDisplay) {
    if ($scope.saved === 'no') {
      $rootScope.notificationMessage = "Please save changes before continuing.";
      $rootScope.openNotification();
    } else if ($scope.saved === "saving") {
      $rootScope.notificationMessage = "Changes are currently being saved.\nPlease wait until this operation is done.";
      $rootScope.openNotification();
    } else if ($rootScope.newRecordHasBeenEdited === true) {
      $rootScope.notificationMessage = "Please click \'Create New\' and then save your changes before continuing.";
      $rootScope.openNotification();
    } else {

      $scope.appReloaded = true;

      if ($rootScope.corpus) {
        $rootScope.corpusSelected = true;
      }

      $rootScope.loading = false;

      $scope.activeMenu = itemToDisplay;

      switch (itemToDisplay) {
        case "settings":
          $scope.dataentry = false;
          $scope.searching = false;
          $scope.changeActiveSubMenu('none');
          window.location.assign("#/settings");
          break;
        case "corpusSettings":
          $scope.dataentry = false;
          $scope.searching = false;
          $scope.changeActiveSubMenu('none');
          window.location.assign("#/corpussettings");
          break;
        case "home":
          $scope.dataentry = false;
          $scope.searching = false;
          $scope.changeActiveSubMenu('none');
          window.location.assign("#/corpora_list");
          break;
        case "searchMenu":
          $scope.changeActiveSubMenu(itemToDisplay);
          $scope.searching = true;
          $scope.activeDatumIndex = null;
          window.location.assign("#/spreadsheet/" + $rootScope.templateId);
          break;
        case "faq":
          $scope.dataentry = false;
          $scope.searching = false;
          $scope.changeActiveSubMenu('none');
          window.location.assign("#/faq");
          break;
        case "none":
          $scope.dataentry = true;
          $scope.searching = false;
          $scope.changeActiveSubMenu('none');
          window.location.assign("#/spreadsheet/" + $rootScope.templateId);
          break;
        case "register":
          window.location.assign("#/register");
          break;
        default:
          window.location.assign("#/spreadsheet/" + $rootScope.templateId);
          $scope.changeActiveSubMenu(itemToDisplay);
      }
    }
  };


  // Get sessions for dbname; select specific session on saved state load
  $scope.loadSessions = function(sessionID) {
    var scopeSessions = [];
    Data.sessions($rootScope.corpus.dbname)
      .then(function(response) {
        for (var k in response) {
          scopeSessions.push(response[k].value);
        }
        scopeSessions.push({
          dateAndGoalSnippet: $rootScope.contextualize('locale_view_all_sessions_dropdown') || "All",
          _id: "none"
        });

        for (var i in scopeSessions) {
          if (scopeSessions[i]._id !== "none") {
            scopeSessions[i] = new FieldDB.Session(scopeSessions[i]);
          }
        }
        $scope.sessions = scopeSessions;
        if (sessionID) {
          $scope.selectSession(sessionID);
        } else {
          $scope.fullCurrentSession = $scope.sessions[scopeSessions.length - 2];
        }
        $scope.documentReady = true;
      }, function(error) {
        $scope.documentReady = true;
        console.log("Error loading sessions.", error);
        $rootScope.notificationMessage = "Error loading corpus, please try loading page again.";
        $rootScope.openNotification();
        $rootScope.loading = false;
      });
  };

  // Fetch data from server and put into template scope
  $scope.loadData = function(sessionID) {
    console.warn("Clearing search terms");
    $scope.searchHistory = "";

    $scope.appReloaded = true;
    $rootScope.loading = true;
    Data.async($rootScope.corpus.dbname)
      .then(function(dataFromServer) {
        var scopeData = [];
        for (var i = 0; i < dataFromServer.length; i++) {
          if (dataFromServer[i].value.datumFields && dataFromServer[i].value.session) {
            var newDatumFromServer = SpreadsheetDatum.convertFieldDBDatumIntoSpreadSheetDatum({}, dataFromServer[i].value, $rootScope.server + "/" + $rootScope.corpus.dbname + "/", $scope);

            // Load data from current session into scope
            if (!sessionID || sessionID === "none") {
              scopeData.push(newDatumFromServer);
            } else if (dataFromServer[i].value.session._id === sessionID) {
              scopeData.push(newDatumFromServer);
            }
          } else {
            console.warn("This is a strange datum, it will not be loadable in this app", dataFromServer[i].value);
          }
        }

        // TODO dont sort the data here, its being sorted by the templates too...?
        // scopeData.sort(function(a, b) {
        //   // return a[$scope.orderProp] - b[$scope.orderProp];

        //   if (a[$scope.orderProp] > b[$scope.orderProp])
        //     return -1;
        //   if (a[$scope.orderProp] < b[$scope.orderProp])
        //     return 1;
        //   return 0;
        // });

        $scope.allData = scopeData;
        var resultSize = $rootScope.resultSize;
        if (resultSize === "all") {
          resultSize = $scope.allData.length;
        }
        $scope.data = scopeData.slice(0, resultSize);
        $rootScope.currentPage = 0;

        $scope.loadAutoGlosserRules();
        $scope.loadUsersAndRoles();

        $scope.saved = "yes";
        $rootScope.loading = false;

        $scope.activeDatumIndex = "newEntry";


      }, function(error) {
        console.log("error loading the data", error);
        // On error loading data, reset saved state
        // Update saved state in Preferences
        $scope.scopePreferences = overwiteAndUpdatePreferencesToCurrentVersion();
        $scope.scopePreferences.savedState = {};
        localStorage.setItem('SpreadsheetPreferences', JSON.stringify($scope.scopePreferences));
        $scope.documentReady = true;
        $rootScope.notificationMessage = "There was an error loading the data. Please reload and log in.";
        $rootScope.openNotification();
        $rootScope.loading = false;
      });
  };

  $scope.loadAutoGlosserRules = function() {
    // Get precedence rules for Glosser
    Data.glosser($rootScope.corpus.dbname)
      .then(function(rules) {
        localStorage.setItem($rootScope.corpus.dbname + "precedenceRules", JSON.stringify(rules));

        // Reduce the rules such that rules which are found in multiple
        // source words are only used/included once.
        var reducedRules = _.chain(rules).groupBy(function(rule) {
          return rule.key.x + "-" + rule.key.y;
        }).value();

        // Save the reduced precedence rules in localStorage
        localStorage.setItem($rootScope.corpus.dbname + "reducedRules",
          JSON.stringify(reducedRules));
      }, function(error) {
        console.log("Error retrieving precedence rules.", error);
      });

    // Get lexicon for Glosser and organize based on frequency
    Data.lexicon($rootScope.corpus.dbname).then(function(lexicon) {
      var sortedLexicon = {};
      for (var i in lexicon) {
        if (lexicon[i].key.gloss) {
          if (sortedLexicon[lexicon[i].key.morpheme]) {
            sortedLexicon[lexicon[i].key.morpheme].push({
              gloss: lexicon[i].key.gloss,
              value: lexicon[i].value
            });
          } else {
            sortedLexicon[lexicon[i].key.morpheme] = [{
              gloss: lexicon[i].key.gloss,
              value: lexicon[i].value
            }];
          }
        }
      }
      var sorter = function(a, b) {
        return b.value - a.value;
      };
      // Sort each morpheme array by descending value
      for (var key in sortedLexicon) {
        sortedLexicon[key].sort(sorter);
      }
      localStorage.setItem(
        $rootScope.corpus.dbname + "lexiconResults", JSON.stringify(sortedLexicon));
    }, function(error) {
      console.log("Error retrieving lexicon.", error);
    });
  };


  $scope.loginUser = function(auth, chosenServer) {
    if (chosenServer) {
      auth.server = chosenServer;
    }

    if (!auth || !auth.server) {
      $rootScope.notificationMessage = "Please choose a server.";
      $rootScope.openNotification();
    } else {
      $rootScope.clickSuccess = true;
      $rootScope.loginInfo = {
        "username": auth.user.trim().toLowerCase().replace(/[^0-9a-z]/g, ""),
        "password": auth.password
      };

      // if (auth.user === "senhorzinho") {
      //   var r = confirm("Hello, developer! Would you like to enter developer mode?");
      //   if (r === true) {
      //     $rootScope.developer = true;
      //   }
      // }
      $rootScope.loading = true;

      $rootScope.serverCode = auth.server;
      $rootScope.server = Servers.getServiceUrl(auth.server, "corpus");


      Data.login(auth.user.toLowerCase(), auth.password)
        .then(function(response) {
          if (response === undefined) {
            return;
          }

          $scope.addActivity([{
            verb: "logged in",
            verbicon: "icon-check",
            directobjecticon: "icon-user",
            directobject: "",
            indirectobject: "",
            teamOrPersonal: "personal"
          }], "uploadnow");

          // Update saved state in Preferences
          $scope.scopePreferences = overwiteAndUpdatePreferencesToCurrentVersion();
          $scope.scopePreferences.savedState.server = $rootScope.serverCode;
          $scope.scopePreferences.savedState.username = $rootScope.user.username;
          $scope.scopePreferences.savedState.password = sjcl.encrypt("password", $rootScope.loginInfo.password);
          localStorage.setItem('SpreadsheetPreferences', JSON.stringify($scope.scopePreferences));

          $rootScope.authenticated = true;
          var userRoles = response.data.roles;
          var availableDBs = {};
          // Find databases the user is allowed to read from db roles with reader
          for (var roleIndex = 0; roleIndex < userRoles.length; roleIndex++) {
            var pieces = userRoles[roleIndex].split("_");
            if (pieces.length > 1 && pieces[pieces.length - 1] === "reader") {
              pieces.pop();
              availableDBs[pieces.join("_").replace(/[\"]/g, "")] = {
                roleIndex: roleIndex
              };
            }
          }
          // put dbs in order that they were added to the user rather than alphabetical by dbname which isnt useful
          var scopeDBs = [];
          for (var dbName in availableDBs) {
            if (availableDBs.hasOwnProperty(dbName)) {

              // Only show lingllama's grafiti corpora to lingllama, per client request
              if (dbName.indexOf("lingllama-communitycorpus") > -1 || dbName.indexOf("public-firstcorpus") > -1) {
                continue;
              }
              scopeDBs.push(dbName);
            }
          }
          $scope.corpora = [];
          var corporaAlreadyIn = {};
          var processCorpora = function(corpusIdentifierToRetrieve) {
            if (!corpusIdentifierToRetrieve) {
              return;
            }
            if ($rootScope.corpus && corpusIdentifierToRetrieve === $rootScope.corpus.dbname) {
              if (!corporaAlreadyIn[$rootScope.corpus.dbname]) {
                $scope.corpora.push($rootScope.corpus);
                corporaAlreadyIn[$rootScope.corpus.dbname] = true;
              }
              return;
            }
            // Use map-reduce to get corpus details

            Data.async(corpusIdentifierToRetrieve, "_design/pages/_view/private_corpora")
              .then(function(response) {
                var corpus = {};
                if (response.rows && response.rows[0]&& response.rows[0].value) {
                  response.rows[0].value.dbname = response.rows[0].value.dbname || response.rows[0].value.pouchname;
                }
                if (response.rows.length > 1) {
                  response.rows.map(function(row) {
                    row.value.dbname = row.value.dbname || row.value.pouchname;
                    if (row.value.dbname === corpusIdentifierToRetrieve) {
                      corpus = row.value;
                    } else {
                      console.warn("There were multiple corpora details in this database, it is probaly one of the old offline databases prior to v1.30 or the result of merged corpora. This is not really a problem, the correct details will be used, and this corpus details will be marked as deleted. " + row.value);
                      row.value.trashed = "deleted";
                      Data.saveCouchDoc(corpusIdentifierToRetrieve, row.value).then(function(result) {
                        console.log("flag as deleted succedded", result);
                      }, function(reason) {
                        console.warn("flag as deleted failed", reason, row.value);
                      });
                    }
                  });
                } else if (response.rows.length === 1 && response.rows[0].value && response.rows[0].value.dbname === corpusIdentifierToRetrieve) {
                  corpus = response.rows[0].value;
                } else {
                  corpus.dbname = corpusIdentifierToRetrieve;
                  corpus.title = corpusIdentifierToRetrieve;
                  console.warn("Error finding a corpus in " + corpusIdentifierToRetrieve + " database. This database will not function normally. Please notify us at support@lingsync.org ", response, corpus);
                  alert("Error finding corpus details in " + corpusIdentifierToRetrieve + " database. This database will not function normally. Please notify us at support@lingsync.org  " + corpusIdentifierToRetrieve);
                  return;
                }
                corpus.gravatar = corpus.gravatar || md5.createHash(corpus.dbname);
                if (corpus.team && corpus.team.gravatar && corpus.team.gravatar.indexOf("user") === -1) {
                  corpus.gravatar = corpus.team.gravatar;
                }
                if (!corpus.gravatar || !corpus.gravatar.trim()) {
                  corpus.gravatar = md5.createHash(corpus.dbname);
                }
                corpus.team = corpus.team || {
                  "_id": "team",
                  "gravatar": corpus.gravatar,
                  "username": corpus.dbname.split("-")[0],
                  "collection": "users",
                  "firstname": "",
                  "lastname": "",
                  "subtitle": "",
                  "email": "",
                  "researchInterest": "No public information available",
                  "affiliation": "No public information available",
                  "description": "No public information available"
                };
                // If this is the corpus the user is looking at, update to the latest corpus details from the database.
                if ($rootScope.corpus && $rootScope.corpus.dbname === corpus.dbname) {
                  $scope.selectCorpus(corpus);
                }
                if (!corporaAlreadyIn[corpus.dbname]) {
                  $scope.corpora.push(corpus);
                  corporaAlreadyIn[corpus.dbname] = true;
                }

              }, function(error) {
                var corpus = {};
                corpus.dbname = corpusIdentifierToRetrieve;
                corpus.title = corpusIdentifierToRetrieve;
                corpus.gravatar = corpus.gravatar || md5.createHash(corpus.dbname);
                corpus.gravatar = corpus.gravatar || md5.createHash(corpus.dbname);
                if (corpus.team && corpus.team.gravatar) {
                  corpus.gravatar = corpus.team.gravatar;
                }
                console.warn("Error finding the corpus details for " + corpusIdentifierToRetrieve + " Either this database is out of date, or the server contact failed. Please notify us of this error if you are online and the connection should have succeeded.", error, corpus);
                alert("Error finding the corpus details for " + corpusIdentifierToRetrieve + " Either this database is out of date, or the server contact failed. Please notify us support@lingsync.org about this error if you are online and the connection should have succeeded.");
                // $scope.corpora.push(corpus);
              });
          };
          for (var m = 0; m < scopeDBs.length; m++) {
            if (scopeDBs[m]) {
              processCorpora(scopeDBs[m]);
            }
          }
          $rootScope.loading = false;
        }, /* login failure */ function(reason) {
          $rootScope.notificationMessage = "Error logging in.\n" + reason;
          $rootScope.openNotification(null, true);
          $rootScope.loading = false;
        });
    }
  };

  $scope.logOut = function() {
    $scope.scopePreferences = overwiteAndUpdatePreferencesToCurrentVersion();
    $scope.scopePreferences.savedState = {};
    localStorage.setItem('SpreadsheetPreferences', JSON.stringify($scope.scopePreferences));
    $scope.reloadPage();
  };

  $rootScope.setTemplateUsingCorpusPreferedTemplate = function(corpus) {
    // If the currently choosen corpus has a default template, overwrite the user's preferences
    if ($rootScope.mcgillOnly) {
      console.warn("not using the databases' preferredTemplate, this is the mcgill dashboard");
      //$rootScope.overrideTemplateSetting(corpus.preferredTemplate, fieldsForTemplate, true);

    } else if (corpus.preferredTemplate) {
      var fieldsForTemplate = $rootScope.availableFieldsInCurrentCorpus;
      if (corpus.preferredTemplate !== "fulltemplate" && window.defaultPreferences[corpus.preferredTemplate]) {
        fieldsForTemplate = window.defaultPreferences[corpus.preferredTemplate];
      }
      $rootScope.overrideTemplateSetting(corpus.preferredTemplate, fieldsForTemplate, true);
    }
  };

  $scope.selectCorpus = function(selectedCorpus) {
    if (!selectedCorpus) {
      $rootScope.notificationMessage = "Please select a database.";
      $rootScope.openNotification();
      return;
    }
    if (typeof selectedCorpus === "string") {
      selectedCorpus = {
        dbname: selectedCorpus
      };
    }

    if (FieldDB && FieldDB.Corpus) {
      if (!(selectedCorpus instanceof FieldDB.Corpus)) {
        // try {
        //   selectedCorpus = JSON.parse(selectedCorpus);
        // } catch (e) {
        //   console.log("must have been an object...", e, selectedCorpus);
        // }
        if (($rootScope.corpus && $rootScope.corpus.datumFields && $rootScope.corpus.datumFields.length > 0) && ($rootScope.corpus instanceof FieldDB.Corpus) && (selectedCorpus.dbname === $rootScope.corpus.dbname) && $rootScope.availableFieldsInCurrentCorpus === $rootScope.corpus.datumFields) {
          console.log("requested load of a corpus which was already loaded.");
          return;
        }

        if (!selectedCorpus.datumFields) {
          $rootScope.corpus = new FieldDB.Corpus();
          FieldDB.FieldDBObject.application.corpus = $rootScope.corpus;
          $rootScope.corpus.loadCorpusByDBname(selectedCorpus.dbname).then(function(results) {
            console.log("loaded the corpus", results);
            $scope.selectCorpus($rootScope.corpus);
          }, function(error) {
            // $rootScope.corpus.bug("Cant load corpus " + selectedCorpus.dbname);
            console.error(error);
          }).fail(function(error) {
            // $rootScope.corpus.bug("Cant load corpus " + selectedCorpus.dbname);
            console.error(error);
          });
          return;
        } else {
          selectedCorpus = new FieldDB.Corpus(selectedCorpus);
        }
      }
    }
     if ($rootScope.corpus !== selectedCorpus) {
      $rootScope.corpus = selectedCorpus;
    }

    $rootScope.availableFieldsInCurrentCorpus = selectedCorpus.datumFields._collection;

    // Update saved state in Preferences
    $scope.scopePreferences = overwiteAndUpdatePreferencesToCurrentVersion();
    $scope.scopePreferences.savedState.mostRecentCorpusDBname = selectedCorpus.dbname;
    localStorage.setItem('SpreadsheetPreferences', JSON.stringify($scope.scopePreferences));

    $scope.availableFields = $rootScope.corpus.datumFields._collection;
    $rootScope.availableFieldsInCurrentCorpus = $rootScope.corpus.datumFields._collection;
    $rootScope.fieldsInColumns = $rootScope.getAvailableFieldsInColumns($rootScope.availableFieldsInCurrentCorpus);
    $rootScope.setTemplateUsingCorpusPreferedTemplate(selectedCorpus);

    $scope.newSession = $rootScope.corpus.newSession();
    $scope.loadSessions();
    $scope.loadUsersAndRoles();

    console.log("setting current corpus details: " + $rootScope.corpus);
    if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application) {
      if (!FieldDB.FieldDBObject.application.corpus) {
        FieldDB.FieldDBObject.application.corpus = $rootScope.corpus;
      } else {
        if (FieldDB.FieldDBObject.application.corpus.dbname !== selectedCorpus.dbname) {
          console.warn("The corpus already existed, and it was not the same as this one, removing it to use this one " + selectedCorpus.dbname);
          FieldDB.FieldDBObject.application.corpus = $rootScope.corpus;
        }
      }
    }
  };


  $scope.selectSession = function(activeSessionID) {
    $scope.changeActiveSessionID(activeSessionID);
    // Make sure that following variable is set (ng-model in select won't
    // assign variable until chosen)
    $scope.activeSessionIDToSwitchTo = activeSessionID;
    $scope.dataentry = true;

    // Update saved state in Preferences
    $scope.scopePreferences = overwiteAndUpdatePreferencesToCurrentVersion();
    $scope.scopePreferences.savedState.sessionID = activeSessionID;
    localStorage.setItem('SpreadsheetPreferences', JSON.stringify($scope.scopePreferences));
    $scope.loadData(activeSessionID);
    $scope.loadUsersAndRoles();
    window.location.assign("#/spreadsheet/" + $rootScope.templateId);
  };

  $scope.changeActiveSessionID = function(activeSessionIDToSwitchTo) {
    if (activeSessionIDToSwitchTo === 'none' || activeSessionIDToSwitchTo === undefined) {
      $scope.activeSessionID = undefined;
      $scope.fullCurrentSession = undefined;
      // $scope.editSessionInfo = undefined;
    } else {
      $scope.activeSessionID = activeSessionIDToSwitchTo;
      for (var i in $scope.sessions) {
        if ($scope.sessions[i]._id === activeSessionIDToSwitchTo) {
          $scope.fullCurrentSession = $scope.sessions[i];

          // Set up object to make session editing easier
          // var editSessionInfo = {};
          // editSessionInfo._id = $scope.fullCurrentSession._id;
          // editSessionInfo._rev = $scope.fullCurrentSession._rev;
          // for (var k in $scope.fullCurrentSession.sessionFields) {
          //   editSessionInfo[$scope.fullCurrentSession.sessionFields[k].id] = $scope.fullCurrentSession.sessionFields[k].mask;
          //   if ($scope.fullCurrentSession.sessionFields[k].label === "goal") {
          //     $scope.currentSessionName = $scope.fullCurrentSession.sessionFields[k].mask;
          //   }
          // }
          // $scope.editSessionInfo = editSessionInfo;
        }
      }
    }
    // Update saved state in Preferences
    $scope.scopePreferences = overwiteAndUpdatePreferencesToCurrentVersion();
    $scope.scopePreferences.savedState.sessionID = $scope.activeSessionID;
    $scope.scopePreferences.savedState.sessionTitle = $scope.currentSessionName;
    localStorage.setItem('SpreadsheetPreferences', JSON.stringify($scope.scopePreferences));
  };

  $scope.getCurrentSessionName = function() {
    if ($scope.activeSessionID === undefined) {
      return "All Sessions";
    } else {
      if ($scope.fullCurrentSession) {
        return $scope.fullCurrentSession.dateAndGoalSnippet || $scope.fullCurrentSession.title;
      }
    }
  };

  $scope.editSession = function(editSessionInfo, scopeDataToEdit) {
    var r = confirm("Are you sure you want to edit the session information?\nThis could take a while.");
    if (r === true) {
      $scope.editSessionDetails = false;
      $rootScope.loading = true;
      // var newSession = new FieldDB.Session($scope.fullCurrentSession);
      // for (var key in editSessionInfo) {
      //   if (key && editSessionInfo.hasOwnProperty(key) && key !== "undefined") {
      //     newSession[key] = editSessionInfo[key];
      //   }
      // }
      // Save session record
      Data.saveCouchDoc($rootScope.corpus.dbname, $scope.fullCurrentSession.toJSON())
        .then(function() {
          var directobject = $scope.currentSessionName || "an elicitation session";
          var indirectObjectString = "in <a href='#corpus/" + $rootScope.corpus.dbname + "'>" + $rootScope.corpus.title + "</a>";
          $scope.addActivity([{
            verb: "modified",
            verbicon: "icon-pencil",
            directobjecticon: "icon-calendar",
            directobject: "<a href='#session/" + $scope.fullCurrentSession._id + "'>" + directobject + "</a> ",
            indirectobject: indirectObjectString,
            teamOrPersonal: "personal"
          }, {
            verb: "modified",
            verbicon: "icon-pencil",
            directobjecticon: "icon-calendar",
            directobject: "<a href='#session/" + $scope.fullCurrentSession._id + "'>" + directobject + "</a> ",
            indirectobject: indirectObjectString,
            teamOrPersonal: "team"
          }], "uploadnow");

          var updateAllDatumInThisSessionWithUpdatedSessionInfo = function(index) {
            if (scopeDataToEdit[index].session._id === $scope.fullCurrentSession._id) {
              Data.async($rootScope.corpus.dbname, scopeDataToEdit[index].id)
                .then(function(editedRecord) {
                    // Edit record with updated session info
                    // and save
                    editedRecord.session = $scope.fullCurrentSession.toJSON();
                    Data.saveCouchDoc($rootScope.corpus.dbname, editedRecord)
                      .then(function() {
                        $rootScope.loading = false;
                      });
                  },
                  function() {
                    window.alert("There was an error accessing the record.\nTry refreshing the page");
                  });
            }
          };
          // Update all records tied to this session
          for (var i in scopeDataToEdit) {
            $rootScope.loading = true;
            updateAllDatumInThisSessionWithUpdatedSessionInfo(i);
          }
          $scope.loadData($scope.activeSessionID);
        });
    }

  };

  $scope.deleteEmptySession = function(activeSessionID) {
    if ($scope.fullCurrentSession._id === "none") {
      $rootScope.notificationMessage = "You must select a session to delete.";
      $rootScope.openNotification();
    } else {
      var r = confirm("Are you sure you want to put this session in the trash?");
      if (r === true) {
        Data.async($rootScope.corpus.dbname, activeSessionID)
          .then(function(sessionToMarkAsDeleted) {
            sessionToMarkAsDeleted.trashed = "deleted";
            var rev = sessionToMarkAsDeleted._rev;
            if (debugging) {
              console.log(rev);
            }
            Data.saveCouchDoc($rootScope.corpus.dbname, sessionToMarkAsDeleted)
              .then(function(response) {

                if (debugging) {
                  console.log(response);
                }
                var indirectObjectString = "in <a href='#corpus/" + $rootScope.corpus.dbname + "'>" + $rootScope.corpus.title + "</a>";
                $scope.addActivity([{
                  verb: "deleted",
                  verbicon: "icon-trash",
                  directobjecticon: "icon-calendar",
                  directobject: "<a href='#session/" + sessionToMarkAsDeleted._id + "'>an elicitation session</a> ",
                  indirectobject: indirectObjectString,
                  teamOrPersonal: "personal"
                }, {
                  verb: "deleted",
                  verbicon: "icon-trash",
                  directobjecticon: "icon-calendar",
                  directobject: "<a href='#session/" + sessionToMarkAsDeleted._id + "'>an elicitation session</a> ",
                  indirectobject: indirectObjectString,
                  teamOrPersonal: "team"
                }], "uploadnow");

                // Remove session from scope
                for (var i in $scope.sessions) {
                  if ($scope.sessions[i]._id === activeSessionID) {
                    $scope.sessions.splice(i, 1);
                  }
                }
                // Set active session to All Sessions
                $scope.activeSessionID = undefined;
              }, function(error) {
                console.warn("there was an error deleting a session", error);
                window.alert("Error deleting session.\nTry refreshing the page.");
              });
          });
      }
    }
  };

  $scope.createNewSession = function(newSessionRecord) {
    $rootScope.loading = true;
    // Get blank template to build new record
    Data.saveCouchDoc($rootScope.corpus.dbname, newSessionRecord.toJSON())
      .then(function(savedRecord) {

        newSessionRecord._id = savedRecord.data.id;
        newSessionRecord._rev = savedRecord.data.rev;
        var directobject = newSessionRecord.dateAndGoalSnippet || "an elicitation session";
        var indirectObjectString = "in <a href='#corpus/" + $rootScope.corpus.dbname + "'>" + $rootScope.corpus.title + "</a>";
        $scope.addActivity([{
          verb: "added",
          verbicon: "icon-pencil",
          directobjecticon: "icon-calendar",
          directobject: "<a href='#session/" + savedRecord.data.id + "'>" + directobject + "</a> ",
          indirectobject: indirectObjectString,
          teamOrPersonal: "personal"
        }, {
          verb: "added",
          verbicon: "icon-pencil",
          directobjecticon: "icon-calendar",
          directobject: "<a href='#session/" + savedRecord.data.id + "'>" + directobject + "</a> ",
          indirectobject: indirectObjectString,
          teamOrPersonal: "team"
        }], "uploadnow");

        $scope.sessions.push(newSessionRecord);
        $scope.dataentry = true;
        $scope.selectSession(savedRecord.data.id);
    $scope.newSession = $rootScope.corpus.newSession();

        window.location.assign("#/spreadsheet/" + $rootScope.templateId);
      });
    $rootScope.loading = false;

  };


  $scope.reloadPage = function() {
    if ($scope.saved === "no") {
      $rootScope.notificationMessage = "Please save changes before continuing.";
      $rootScope.openNotification();
    } else if ($scope.saved === "saving") {
      $rootScope.notificationMessage = "Changes are currently being saved.\nYou may refresh the data once this operation is done.";
      $rootScope.openNotification();
    } else {
      window.location.assign("#/");
      window.location.reload();
    }
  };


  $scope.deleteRecord = function(datum) {
    if (!datum.id) {
      $rootScope.notificationMessage = "Please save changes before continuing.";
      $rootScope.openNotification();
      $scope.activeDatumIndex = datum;
      // } else if (datum.audioVideo && datum.audioVideo[0]) {
      //   $rootScope.notificationMessage = "You must delete all recordings from this record first.";
      //   $rootScope.openNotification();
      //   $scope.activeDatumIndex = datum;
    } else {
      var r = confirm("Are you sure you want to put this datum in the trash?");
      if (r === true) {

        Data.async($rootScope.corpus.dbname, datum.id)
          .then(function(recordToMarkAsDeleted) {
            recordToMarkAsDeleted.trashed = "deleted";
            var rev = recordToMarkAsDeleted._rev;
            console.log(rev);
            //Upgrade to v1.90
            if (recordToMarkAsDeleted.attachmentInfo) {
              delete recordToMarkAsDeleted.attachmentInfo;
            }
            Data.saveCouchDoc($rootScope.corpus.dbname, recordToMarkAsDeleted)
              .then(function(response) {
                // Remove record from scope
                if (debugging) {
                  console.log(response);
                }
                var indirectObjectString = "in <a href='#corpus/" + $rootScope.corpus.dbname + "'>" + $rootScope.corpus.title + "</a>";
                $scope.addActivity([{
                  verb: "deleted",
                  verbicon: "icon-trash",
                  directobjecticon: "icon-list",
                  directobject: "<a href='#data/" + datum.id + "'>a datum</a> ",
                  indirectobject: indirectObjectString,
                  teamOrPersonal: "personal"
                }, {
                  verb: "deleted",
                  verbicon: "icon-trash",
                  directobjecticon: "icon-list",
                  directobject: "<a href='#data/" + datum.id + "'>a datum</a> ",
                  indirectobject: indirectObjectString,
                  teamOrPersonal: "team"
                }], "uploadnow");

                // Remove record from all scope data and update
                var index = $scope.allData.indexOf(datum);
                $scope.allData.splice(index, 1);
                $scope.loadPaginatedData();

                $scope.saved = "yes";
                $scope.activeDatumIndex = null;
              }, function(error) {
                console.warn(error);
                window.alert("Error deleting record.\nTry refreshing the data first by clicking ↻.");
              });
          });
      }
    }
  };


  //TODO what does this do? can any of this be done in the SpreadsheetDatum file instead?
  // Here is what fieldData looks like:
  // {
  //   "field2": "",
  //   "field3": "",
  //   "field1": "hi does this call createRecord"
  // }

  $scope.createRecord = function(onlyContentfulFields, $event) {
    if ($event && $event.type && $event.type === "submit" && $event.target) {
      $scope.setDataEntryFocusOn($event.target);
    }

    // // Reset new datum form data and enable upload button; only reset audio field if present
    // if ($rootScope.templateId === "fulltemplate" || $rootScope.templateId === "mcgillfieldmethodsspring2014template" || $rootScope.templateId === "yalefieldmethodsspring2014template") {
    //   document.getElementById("form_new_datum_audio-file").reset();
    //   $scope.newDatumHasAudioToUpload = false;
    // }
    $rootScope.newRecordHasBeenEdited = false;
    $scope.newFieldData = {};

    var newSpreadsheetDatum = SpreadsheetDatum.convertFieldDBDatumIntoSpreadSheetDatum({}, Data.blankDatumTemplate(), null, $scope);

    // Edit record fields with labels from prefs
    for (var dataKey in onlyContentfulFields) {
      newSpreadsheetDatum[dataKey] = onlyContentfulFields[dataKey];
      delete onlyContentfulFields[dataKey];
    }

    newSpreadsheetDatum.enteredByUser = {
      "username": $rootScope.user.username,
      "gravatar": $rootScope.user.gravatar,
      "appVersion": $rootScope.appVersion
    };

    newSpreadsheetDatum.timestamp = Date.now();
    newSpreadsheetDatum.dateEntered = JSON.parse(JSON.stringify(new Date(newSpreadsheetDatum.timestamp)));
    newSpreadsheetDatum.dateModified = newSpreadsheetDatum.dateEntered;
    // newSpreadsheetDatum.lastModifiedBy = $rootScope.user.username;
    newSpreadsheetDatum.session = $scope.fullCurrentSession;
    // newSpreadsheetDatum.sessionID = $scope.activeSessionID;
    newSpreadsheetDatum.saved = "no";

    // Add record to all scope data and update
    $scope.allData.push(newSpreadsheetDatum); //inserts new data at the bottom for future pagination.
    $scope.data.push(newSpreadsheetDatum);
    // $scope.loadPaginatedData("newDatum"); //dont change pagination, just show it on this screen.
    $scope.activeDatumIndex = "newEntry";

    $scope.newFieldDatahasAudio = false;
    $scope.saved = "no";

    try {
      if (!$scope.$$phase) {
        $scope.$digest(); //$digest or $apply
      }
    } catch (e) {
      console.warn("Digest errored", e);
    }
  };

  $rootScope.markNewAsEdited = function() {
    $rootScope.newRecordHasBeenEdited = true;
  };

  $rootScope.markAsNotSaved = function(datum) {
    datum.saved = "no";
    $scope.saved = "no";
  };

  // TODO why does this do somethign with datum tags, can any of this be done in the spreadsheet datum ?
  $rootScope.markAsEdited = function(fieldData, datum, $event) {
    if (FieldDB && FieldDB.FieldDBObject) {
      var previous = new FieldDB.Datum(datum.fossil);
      var current = new FieldDB.Datum(datum);
      delete current.fossil;
      delete current.$$hashKey;
      delete current.modifiedByUser;
      delete previous.modifiedByUser;

      delete current._dateModified;
      delete previous._dateModified;

      if (previous.equals(current)) {
        console.log("The datum didnt actually change. Not marking as editied");
        return;
      } else {
        console.warn("+++++++++++++++++++++++++++++++++++++++++++++++++");
        // console.warn("@hisakonog turning on debugmode for equality look below here.");
        // console.warn("+++++++++++++++++++++++++++++++++++++++++++++++++");
        // current.debugMode = true;
        // current.debugMode = true;
        // previous.equals(current);
        // console.warn("+++++++++++++++++++++++++++++++++++++++++++++++++");
        // console.warn("@hisakonog look in the above text for what attribute is not equal on the unchanged datum, we can add it to the list of attributes to ignore.");
        // console.warn("+++++++++++++++++++++++++++++++++++++++++++++++++");
        // datum.saved = "no";
      }
    }

    var utterance = datum.utterance || "Datum";
    for (var key in fieldData) {
      if (key === "datumTags" && typeof fieldData.datumTags === 'string') {
        var newDatumFields = fieldData.datumTags.split(",");
        var newDatumFieldsArray = [];
        for (var i in newDatumFields) {
          var newDatumTagObject = {};
          // Trim spaces
          var trimmedTag = newDatumFields[i].trim();
          newDatumTagObject.tag = trimmedTag;
          newDatumFieldsArray.push(newDatumTagObject);
        }
        datum.datumTags = newDatumFieldsArray;
      } else {
        // console.log("$scope.fields",$scope.fields);
        datum[$scope.fields[key].label] = fieldData[key];
      }

      if ($scope.fields[key].label === "utterance") {
        utterance = fieldData[key];
      }
    }
    datum.dateModified = JSON.parse(JSON.stringify(new Date()));
    datum.timestamp = Date.now();

    // Limit activity to one instance in the case of multiple edits to the same datum before 'save'
    if (!datum.saved || datum.saved === "fresh" || datum.saved === "yes") {

      // Dont Limit users array to unique usernames
      // datum.modifiedByUser.users = _.map(_.groupBy(datum.modifiedByUser.users, function(x) {
      //   return x.username;
      // }), function(grouped) {
      //   return grouped[0];
      // });
      var modifiedByUser = {
        "username": $rootScope.user.username,
        "gravatar": $rootScope.user.gravatar,
        "appVersion": $rootScope.appVersion,
        "timestamp": datum.timestamp
      };

      if (!datum.modifiedByUser || !datum.modifiedByUser.users) {
        datum.modifiedByUser = {
          "users": []
        };
      }
      datum.modifiedByUser.users.push(modifiedByUser);

      // Update activity feed
      var indirectObjectString = "in <a href='#corpus/" + $rootScope.corpus.dbname + "'>" + $rootScope.corpus.title + "</a>";
      $scope.addActivity([{
        verb: "modified",
        verbicon: "icon-pencil",
        directobjecticon: "icon-list",
        directobject: "<a href='#corpus/" + $rootScope.corpus.dbname + "/datum/" + datum.id + "'>" + utterance + "</a> ",
        indirectobject: indirectObjectString,
        teamOrPersonal: "personal"
      }, {
        verb: "modified",
        verbicon: "icon-pencil",
        directobjecticon: "icon-list",
        directobject: "<a href='#corpus/" + $rootScope.corpus.dbname + "/datum/" + datum.id + "'>" + utterance + "</a> ",
        indirectobject: indirectObjectString,
        teamOrPersonal: "team"
      }]);
    }
    datum.saved = "no";
    $scope.saved = "no";

    if ($event && $event.type && $event.type === "submit") {
      $scope.selectRow($scope.activeDatumIndex + 1);
    }
  };

  $scope.addComment = function(datum) {
    var newComment = prompt("Enter new comment.");
    if (newComment === "" || newComment === null) {
      return;
    }
    var comment = {};
    comment.text = newComment;
    comment.username = $rootScope.user.username;
    comment.timestamp = Date.now();
    comment.gravatar = $rootScope.user.gravatar || "0df69960706112e38332395a4f2e7542";
    comment.timestampModified = Date.now();
    if (!datum.comments) {
      datum.comments = [];
    }
    datum.comments.push(comment);
    datum.saved = "no";
    $scope.saved = "no";
    datum.dateModified = JSON.parse(JSON.stringify(new Date()));
    datum.timestamp = Date.now();
    datum.lastModifiedBy = $rootScope.user.username;
    // $rootScope.currentPage = 0;
    // $rootScope.editsHaveBeenMade = true;

    var indirectObjectString = "on <a href='#data/" + datum.id + "'><i class='icon-cloud'></i> " + $rootScope.corpus.title + "</a>";
    // Update activity feed
    $scope.addActivity([{
      verb: "commented",
      verbicon: "icon-comment",
      directobjecticon: "icon-list",
      directobject: comment.text,
      indirectobject: indirectObjectString,
      teamOrPersonal: "personal"
    }, {
      verb: "commented",
      verbicon: "icon-comment",
      directobjecticon: "icon-list",
      directobject: comment.text,
      indirectobject: indirectObjectString,
      teamOrPersonal: "team"
    }]);

  };

  $scope.deleteComment = function(comment, datum) {
    if ($rootScope.commentPermissions === false) {
      $rootScope.notificationMessage = "You do not have permission to delete comments.";
      $rootScope.openNotification();
      return;
    }
    if (comment.username !== $rootScope.user.username) {
      $rootScope.notificationMessage = "You may only delete comments created by you.";
      $rootScope.openNotification();
      return;
    }
    var verifyCommentDelete = confirm("Are you sure you want to remove the comment '" + comment.text + "'?");
    if (verifyCommentDelete === true) {
      for (var i in datum.comments) {
        if (datum.comments[i] === comment) {
          datum.comments.splice(i, 1);
        }
      }
    }
  };

  $scope.saveChanges = function() {
    var saveDatumPromises = [];

    var doSomethingElse = function(recordToBeSaved) {
      if (!recordToBeSaved || recordToBeSaved.saved !== "no") {
        //not saving this record
        return;
      }

      var promiseToSaveThisDatum;

      var utteranceForActivityFeed = "Datum";
      if (recordToBeSaved.utterance && recordToBeSaved.utterance !== "") {
        utteranceForActivityFeed = recordToBeSaved.utterance;
      }

      var indirectObjectString = "in <a href='#corpus/" + $rootScope.corpus.dbname + "'>" + $rootScope.corpus.title + "</a>";
      var activities = [{
        verb: "added",
        verbicon: "icon-plus",
        directobjecticon: "icon-list",
        indirectobject: indirectObjectString,
        teamOrPersonal: "personal"
      }, {
        verb: "added",
        verbicon: "icon-plus",
        directobjecticon: "icon-list",
        indirectobject: indirectObjectString,
        teamOrPersonal: "team"
      }];

      if (recordToBeSaved.id) {
        activities[0].verb = "modified";
        activities[0].verbicon = "icon-pencil";
        activities[1].verb = "modified";
        activities[1].verbicon = "icon-pencil";
      } else {
        if ($scope.fullCurrentSession) {
          recordToBeSaved.session = $scope.fullCurrentSession; //TODO check this, should work since the users only open data by elicitation session.
        } else {
          window.alert("This appears to be a new record, but there isnt a current data entry session to associate it with. Please report this to support@lingsync.org");
        }
      }

      $scope.saved = "saving";
      recordToBeSaved.dbname = $rootScope.corpus.dbname;
      // spreadsheetDatum.dateModified =
      // recordToBeSaved.timestamp = Date.now(); // these come from the edit function, and from the create function because the save can happen minutes or hours after the user actually modifies/creates the datum.
      promiseToSaveThisDatum = Data.saveSpreadsheetDatum(recordToBeSaved);
      saveDatumPromises.push(promiseToSaveThisDatum);

      promiseToSaveThisDatum
        .then(function(spreadSheetDatum) {
          spreadSheetDatum.saved = "yes";
          activities[0].directobject = activities[1].directobject = "<a href='#corpus/" + $rootScope.corpus.dbname + "/datum/" + spreadSheetDatum.id + "'>" + utteranceForActivityFeed + "</a> ";
          $scope.addActivity(activities, "uploadnow");
        }, function(reason) {
          console.log(reason);
          $scope.saved = "no";
          window.alert("There was an error saving a record. " + reason);
          // wish this would work:
          // $rootScope.notificationMessage = "There was an error saving a record. " + reason;
          // $rootScope.openNotification();
          // return;
        });

    };
    for (var index in $scope.allData) {
      console.log(index);
      if ($scope.allData.hasOwnProperty(index)) {
        doSomethingElse($scope.allData[index]);
      }
    }
    Q.all(saveDatumPromises).done(function(success, reason) {
      if (reason) {
        console.log(reason);
        $scope.saved = "no";
        window.alert("There was an error saving one or more records. Please try again.");
      } else {
        if ($scope.saved === "saving") {
          $scope.saved = "yes";
        }
      }
    });
  };


  // Set auto-save interval for 5 minutes
  var autoSave = window.setInterval(function() {
    if ($scope.saved === "no") {
      $scope.saveChanges();
    } else {
      // TODO Dont need to FIND BETTER WAY TO KEEP SESSION ALIVE;
      // if ($rootScope.loginInfo) {
      //   Data.login($rootScope.user.username,
      //     $rootScope.loginInfo.password);
      // }
    }
  }, 300000);
  if (debugging) {
    console.log("autoSave was defined but not used", autoSave);
  }


  $scope.selectRow = function(scopeIndex, targetDatumEntryDomElement) {
    // Do nothing if clicked row is currently selected
    if ($scope.activeDatumIndex === scopeIndex) {
      return;
    }
    if ($scope.searching !== true) {
      if ($rootScope.newRecordHasBeenEdited !== true) {
        $scope.activeDatumIndex = scopeIndex;
      } else {
        $scope.activeDatumIndex = scopeIndex + 1;
        $scope.createRecord($scope.newFieldData);
      }
      if (targetDatumEntryDomElement) {
        $scope.setDataEntryFocusOn(targetDatumEntryDomElement);
      }
    }
  };

  $scope.editSearchResults = function(scopeIndex) {
    $scope.activeDatumIndex = scopeIndex;
  };

  $scope.selectNone = function() {
    $scope.activeDatumIndex = undefined;
  };

  $scope.loadDataEntryScreen = function() {
    $scope.dataentry = true;
    $scope.navigateVerifySaved('none');
    $scope.loadData($scope.activeSessionID);
  };

  $scope.clearSearch = function() {
    $scope.searchTerm = '';
    $scope.searchHistory = null;
    $scope.loadData($scope.activeSessionID);
  };
  if (FieldDB && FieldDB.DatumField) {
    $rootScope.addedDatumField = new FieldDB.DatumField({
      id: Date.now(),
      label: "New Field " + Date.now()
    });
  } else {
    $rootScope.addedDatumField = {
      id: Date.now(),
      label: "New Field " + Date.now()
    };
  }

  $scope.updateCorpusDetails = function(corpus) {
    console.log("Saving corpus details, corpus passed in", corpus);
    // $rootScope.corpus.url = $rootScope.corpus.url || FieldDB.Database.prototype.BASE_DB_URL + "/" + $rootScope.corpus.dbname;
    $rootScope.corpus.save($rootScope.user).then(function(result) {
      console.log("Saved corpus details ", result);
      $scope.overrideTemplateSetting();
      var indirectObjectString = "in <a href='#corpus/" + $rootScope.corpus.dbname + "'>" + $rootScope.corpus.title + "</a>";
      $scope.addActivity([{
        verb: "modified",
        verbicon: "icon-pencil",
        directobjecticon: "icon-cloud",
        directobject: "<a href='#corpus/" + $rootScope.corpus.dbname + "'>" + $rootScope.corpus.title + "</a> ",
        indirectobject: indirectObjectString,
        teamOrPersonal: "personal"
      }, {
        verb: "modified",
        verbicon: "icon-pencil",
        directobjecticon: "icon-cloud",
        directobject: "<a href='#corpus/" + $rootScope.corpus.dbname + "'>" + $rootScope.corpus.title + "</a> ",
        indirectobject: indirectObjectString,
        teamOrPersonal: "team"
      }], "uploadnow");
    }, function(reason) {
      console.log("Error saving corpus details.", reason);
      $rootScope.corpus.saving = false;
      $rootScope.corpus.bug("Error saving corpus details.");
    });
  };

  $scope.runSearch = function(searchTerm) {
    // Create object from fields displayed in scope to later be able to
    // notify user if search result is from a hidden field
    var fieldsInScope = {};
    var mapFieldsToTrue = function(datumField) {
      fieldsInScope[datumField.id] = true;
    };
    for (var column in $scope.fieldsInColumns) {
      if ($scope.fieldsInColumns.hasOwnProperty(column)) {
        $scope.fieldsInColumns[column].map(mapFieldsToTrue);
      }
    }
    fieldsInScope.judgement = true;


    /* make the datumtags and comments always true since its only the compact view that doesnt show them? */
    // if ($rootScope.templateId === "fulltemplate" || $rootScope.templateId === "mcgillfieldmethodsspring2014template" || $rootScope.templateId === "yalefieldmethodsspring2014template") {
    // fieldsInScope.datumTags = true;
    fieldsInScope.comments = true;
    // }

    fieldsInScope.dateModified = true;
    // fieldsInScope.lastModifiedBy = true;

    if ($scope.searchHistory) {
      $scope.searchHistory = $scope.searchHistory + " > " + searchTerm;
    } else {
      $scope.searchHistory = searchTerm;
    }
    // Converting searchTerm to string to allow for integer searching
    searchTerm = searchTerm.toString().toLowerCase();
    var newScopeData = [];

    var thisDatumIsIN = function(spreadsheetDatum) {
      var dataString;

      for (var fieldkey in spreadsheetDatum) {
        // Limit search to visible data
        if (spreadsheetDatum[fieldkey] && fieldsInScope[fieldkey] === true) {
          if (fieldkey === "datumTags") {
            dataString = JSON.stringify(spreadsheetDatum.datumTags);
            dataString = dataString.toString().toLowerCase();
            if (dataString.indexOf(searchTerm) > -1) {
              return true;
            }
          } else if (fieldkey === "comments") {
            for (var j in spreadsheetDatum.comments) {
              for (var commentKey in spreadsheetDatum.comments[j]) {
                dataString = spreadsheetDatum.comments[j][commentKey].toString();
                if (dataString.indexOf(searchTerm) > -1) {
                  return true;
                }
              }
            }
          } else if (fieldkey === "dateModified") {
            //remove alpha characters from the date so users can search dates too, but not show everysearch result if the user is looking for "t" #1657
            dataString = spreadsheetDatum[fieldkey].toString().toLowerCase().replace(/[a-z]/g, " ");
            if (dataString.indexOf(searchTerm) > -1) {
              return true;
            }
          } else {
            dataString = spreadsheetDatum[fieldkey].toString().toLowerCase();
            if (dataString.indexOf(searchTerm) > -1) {
              return true;
            }
          }
        }
      }
      return false;
    };

    // if (!$scope.activeSessionID) {
    // Search allData in scope
    for (var i in $scope.allData) {
      // Determine if record should be included in session search
      var searchTarget = false;
      if (!$scope.activeSessionID) {
        searchTarget = true;
      } else if ($scope.allData[i].session._id === $scope.activeSessionID) {
        searchTarget = true;
      }
      if (searchTarget === true) {
        if (thisDatumIsIN($scope.allData[i])) {
          newScopeData.push($scope.allData[i]);
        }
      }
    }

    if (newScopeData.length > 0) {
      $scope.allData = newScopeData;
      var resultSize = $rootScope.resultSize;
      if (resultSize === "all") {
        resultSize = $scope.allData.length;
      }
      $scope.data = $scope.allData.slice(0, resultSize);
    } else {
      $rootScope.notificationMessage = "No records matched your search.";
      $rootScope.openNotification();
    }
  };

  $scope.selectAll = function() {
    for (var i in $scope.allData) {
      if (!$scope.activeSessionID) {
        $scope.allData[i].checked = true;
      } else if ($scope.allData[i].session._id === $scope.activeSessionID) {
        $scope.allData[i].checked = true;
      }
    }
  };

  $scope.exportResults = function(size) {

    var results = $filter('filter')($scope.allData, {
      checked: true
    });
    if (results.length > 0) {
      $scope.resultsMessage = results.length + " Record(s):";
      $scope.results = results;
    } else {
      $scope.resultsMessage = "Please select records to export.";
    }
    console.log(results);

    var modalInstance = $modal.open({
      templateUrl: 'views/export-modal.html',
      controller: 'SpreadsheetExportController',
      size: size,
      resolve: {
        details: function() {
          return {
            resultsMessageFromExternalController: $scope.resultsMessage,
            resultsFromExternalController: $scope.results,
          };
        }
      }
    });

    modalInstance.result.then(function(any, stuff) {
      if (any || stuff) {
        console.warn("Some parameters were passed by the modal closing, ", any, stuff);
      }
    }, function() {
      $log.info('Export Modal dismissed at: ' + new Date());
    });
  };


  // Add activities to scope object, to be uploaded when 'SAVE' is clicked
  $scope.addActivity = function(activityArray, uploadnow) {
    Data.blankActivityTemplate()
      .then(function(activitySampleJSON) {

        for (var index = 0; index < activityArray.length; index++) {
          var newActivityObject = JSON.parse(JSON.stringify(activitySampleJSON));
          var bareActivityObject = activityArray[index];

          bareActivityObject.verb = bareActivityObject.verb.replace("href=", "target='_blank' href=");
          bareActivityObject.directobject = bareActivityObject.directobject.replace("href=", "target='_blank' href=");
          bareActivityObject.indirectobject = bareActivityObject.indirectobject.replace("href=", "target='_blank' href=");

          newActivityObject.appVersion = $rootScope.appVersion;
          newActivityObject.verb = bareActivityObject.verb;
          newActivityObject.verbicon = bareActivityObject.verbicon;
          newActivityObject.directobjecticon = bareActivityObject.directobjecticon;
          newActivityObject.directobject = bareActivityObject.directobject;
          newActivityObject.indirectobject = bareActivityObject.indirectobject;
          newActivityObject.teamOrPersonal = bareActivityObject.teamOrPersonal;
          newActivityObject.user.username = $rootScope.user.username;
          newActivityObject.user.gravatar = $rootScope.user.gravatar || "0df69960706112e38332395a4f2e7542";
          newActivityObject.user.id = $rootScope.user.username;
          newActivityObject.user._id = $rootScope.user.username; //TODO remove this too eventually...
          newActivityObject.dateModified = JSON.parse(JSON.stringify(new Date())); //TODO #1109 eventually remove date modified?
          newActivityObject.timestamp = Date.now();

          var uniqueid = newActivityObject.user.username + newActivityObject.verb + newActivityObject.directobject + newActivityObject.teamOrPersonal;
          $scope.activities[uniqueid] = newActivityObject;

        }
        if (uploadnow) {
          $scope.uploadActivities();
        }
      });
  };

  $scope.uploadActivities = function() {
    // Save activities
    if ($scope.activities) {
      var doSomethingDifferent = function(index) {
        if ($scope.activities[index]) {
          var activitydb;
          if ($scope.activities[index].teamOrPersonal === "team") {
            activitydb = $rootScope.corpus.dbname + "-activity_feed";
          } else {
            activitydb = $rootScope.user.username + "-activity_feed";
          }

          Data.saveCouchDoc(activitydb, $scope.activities[index])
            .then(function(response) {
                if (debugging) {
                  console.log("Saved new activity", response);
                }
                // Deleting so that indices in scope are unchanged
                delete $scope.activities[index];
              },
              function(reason) {
                console.warn("There was an error saving the activity. ", $scope.activities[index], reason);
                window.alert("There was an error saving the activity. ");
                $scope.saved = "no";
              });
        }
      };
      for (var activityuniqueid in $scope.activities) {
        if ($scope.activities.hasOwnProperty(activityuniqueid)) {
          doSomethingDifferent(activityuniqueid);
        }
      }
    }
  };


  $scope.registerNewUser = function(newLoginInfo, serverCode) {
    if (!newLoginInfo.serverCode) {
      newLoginInfo.serverCode = serverCode;
    }
    if (!newLoginInfo || !newLoginInfo.serverCode) {
      $rootScope.notificationMessage = "Please select a server.";
      $rootScope.openNotification();
      return;
    }
    if (!newLoginInfo.password || !newLoginInfo.confirmPassword) {
      $rootScope.notificationMessage = "Please enter a password.";
      $rootScope.openNotification();
      return;
    }
    if (!newLoginInfo.username) {
      $rootScope.notificationMessage = "Please enter a username.";
      $rootScope.openNotification();
      return;
    }

    $rootScope.loading = true;

    // Clean username and tell user about it
    var safeUsernameForCouchDB = newLoginInfo.username.trim().toLowerCase().replace(/[^0-9a-z]/g, "");
    if (safeUsernameForCouchDB !== newLoginInfo.username) {
      $rootScope.loading = false;
      newLoginInfo.username = safeUsernameForCouchDB;
      $rootScope.notificationMessage = "We have automatically changed your requested username to '" + safeUsernameForCouchDB + "' instead. \n\n(The username you have chosen isn't very safe for urls, which means your corpora would be potentially inaccessible in old browsers)";
      $rootScope.openNotification();
      return;
    }
    var dataToPost = {};
    dataToPost.email = newLoginInfo.email ? newLoginInfo.email.trim().split(" ")[0] : "";
    dataToPost.username = newLoginInfo.username.trim().toLowerCase();
    dataToPost.password = newLoginInfo.password.trim();
    dataToPost.authUrl = Servers.getServiceUrl(newLoginInfo.serverCode, "auth");
    dataToPost.appVersionWhenCreated = $rootScope.appVersion;

    dataToPost.serverCode = newLoginInfo.serverCode;

    if (dataToPost.username !== "" && (dataToPost.password === newLoginInfo.confirmPassword.trim())) {
      // Create user
      Data.register(dataToPost)
        .then(function(response) {
          if (debugging) {
            console.log(response);
          }
          $rootScope.loading = false;
        }, function(error) {
          console.warn(error);
          $rootScope.loading = false;
        });
    } else {
      $rootScope.loading = false;
      $rootScope.notificationMessage = "Please verify user information.";
      $rootScope.openNotification();
    }
  };


  $scope.createNewCorpus = function(newCorpusInfo) {
    if (!newCorpusInfo) {
      $rootScope.notificationMessage = "Please enter a corpus name.";
      $rootScope.openNotification();
      return;
    }

    $rootScope.loading = true;
    var dataToPost = {};
    dataToPost.username = $rootScope.user.username.trim();
    dataToPost.password = $rootScope.loginInfo.password.trim();
    dataToPost.serverCode = $rootScope.serverCode;
    dataToPost.authUrl = Servers.getServiceUrl($rootScope.serverCode, "auth");

    dataToPost.newCorpusName = newCorpusInfo.newCorpusName;

    if (dataToPost.newCorpusName !== "") {
      // Create new corpus
      Data.createcorpus(dataToPost)
        .then(function(response) {

          // Add new corpus to scope
          var newCorpus = {};
          newCorpus.dbname = response.corpus.dbname;
          newCorpus.title = response.corpus.title;
          var directObjectString = "<a href='#corpus/" + response.corpus.dbname + "'>" + response.corpus.title + "</a>";
          $scope.addActivity([{
            verb: "added",
            verbicon: "icon-plus",
            directobjecticon: "icon-cloud",
            directobject: directObjectString,
            indirectobject: "",
            teamOrPersonal: "personal"
          }], "uploadnow");

          $scope.corpora.push(newCorpus);
          $rootScope.loading = false;
          window.location.assign("#/");
        });
    } else {
      $rootScope.notificationMessage = "Please verify corpus name.";
      $rootScope.openNotification();
      $rootScope.loading = false;
    }
  };

  $scope.loadUsersAndRoles = function() {
    // Get all users and roles (for this corpus) from server

    var dataToPost = {};

    dataToPost.username = $rootScope.loginInfo.username;
    dataToPost.password = $rootScope.loginInfo.password;
    dataToPost.serverCode = $rootScope.serverCode;
    dataToPost.authUrl = Servers.getServiceUrl($rootScope.serverCode, "auth");
    dataToPost.dbname = $rootScope.corpus.dbname;


    Data.getallusers(dataToPost)
      .then(function(users) {
        if (!users) {
          console.log("User doesn't have access to roles.");
          users = {
            allusers: []
          };
        }
        // for (var i in users.allusers) {
        //   if (users.allusers[i].username === $rootScope.loginInfo.username) {
        //     $rootScope.user.gravatar = users.allusers[i].gravatar;
        //   }
        // }

        $scope.users = users;

        // Get privileges for logged in user
        Data.async("_users", "org.couchdb.user:" + $rootScope.loginInfo.username)
          .then(function(response) {
            $rootScope.admin = false;
            $rootScope.readPermissions = false;
            $rootScope.writePermissions = false;
            $rootScope.commentPermissions = false;

            if (response.roles.indexOf($rootScope.corpus.dbname + "_admin") > -1) {
              $rootScope.admin = true;
            }
            if (response.roles.indexOf($rootScope.corpus.dbname + "_reader") > -1) {
              $rootScope.readPermissions = true;
            }
            if (response.roles.indexOf($rootScope.corpus.dbname + "_writer") > -1) {
              $rootScope.writePermissions = true;
            }
            if (response.roles.indexOf($rootScope.corpus.dbname + "_commenter") > -1) {
              $rootScope.commentPermissions = true;
            }
            if (!$rootScope.commentPermissions && $rootScope.readPermissions && $rootScope.writePermissions) {
              $rootScope.commentPermissions = true;
            }
          });
      });
  };

  $scope.updateUserRoles = function(newUserRoles) {
    if (!newUserRoles || !newUserRoles.usernameToModify) {
      $rootScope.notificationMessage = "Please select a username.";
      $rootScope.openNotification();
      return;
    }

    if (!newUserRoles.role) {
      $rootScope.notificationMessage = "You haven't selected any roles to add to " + newUserRoles.usernameToModify + "!\nPlease select at least one role..";
      $rootScope.openNotification();
      return;
    }

    $rootScope.loading = true;
    var rolesString = "";
    switch (newUserRoles.role) {
      /*
            NOTE THESE ROLES are not accurate reflections of the db roles,
            they are a simplification which assumes the
            admin -> writer -> commenter -> reader type of system.

            Infact some users (technical support or project coordinators) might be only admin,
            and some experiment participants might be only writers and
            cant see each others data.

            Probably the clients wanted the spreadsheet roles to appear implicative since its more common.
            see https://github.com/OpenSourceFieldlinguistics/FieldDB/issues/1113
          */
      case "admin":
        newUserRoles.admin = true;
        newUserRoles.reader = true;
        newUserRoles.commenter = true;
        newUserRoles.writer = true;
        rolesString += " Admin";
        break;
      case "read_write":
        newUserRoles.admin = false;
        newUserRoles.reader = true;
        newUserRoles.commenter = true;
        newUserRoles.writer = true;
        rolesString += " Writer Reader";
        break;
      case "read_only":
        newUserRoles.admin = false;
        newUserRoles.reader = true;
        newUserRoles.commenter = false;
        newUserRoles.writer = false;
        rolesString += " Reader";
        break;
      case "read_comment_only":
        newUserRoles.admin = false;
        newUserRoles.reader = true;
        newUserRoles.commenter = true;
        newUserRoles.writer = false;
        rolesString += " Reader Commenter";
        break;
      case "write_only":
        newUserRoles.admin = false;
        newUserRoles.reader = false;
        newUserRoles.commenter = true;
        newUserRoles.writer = true;
        rolesString += " Writer";
        break;
    }

    newUserRoles.dbname = $rootScope.corpus.dbname;

    var dataToPost = {};
    dataToPost.username = $rootScope.user.username.trim();
    dataToPost.password = $rootScope.loginInfo.password.trim();
    dataToPost.serverCode = $rootScope.serverCode;
    dataToPost.authUrl = Servers.getServiceUrl($rootScope.serverCode, "auth");

    dataToPost.userRoleInfo = newUserRoles;

    Data.updateroles(dataToPost)
      .then(function(response) {
        if (debugging) {
          console.log(response);
        }
        var indirectObjectString = "on <a href='#corpus/" + $rootScope.corpus.dbname + "'>" + $rootScope.corpus.title + "</a> as " + rolesString;
        $scope.addActivity([{
          verb: "modified",
          verbicon: "icon-pencil",
          directobjecticon: "icon-user",
          directobject: "<a href='http://lingsync.org/" + newUserRoles.usernameToModify + "'>" + newUserRoles.usernameToModify + "</a> ",
          indirectobject: indirectObjectString,
          teamOrPersonal: "personal"
        }, {
          verb: "modified",
          verbicon: "icon-pencil",
          directobjecticon: "icon-user",
          directobject: "<a href='http://lingsync.org/" + newUserRoles.usernameToModify + "'>" + newUserRoles.usernameToModify + "</a> ",
          indirectobject: indirectObjectString,
          teamOrPersonal: "team"
        }], "uploadnow");

        document.getElementById("userToModifyInput").value = "";
        $rootScope.loading = false;
        $scope.loadUsersAndRoles();
        try {
          if (!$scope.$$phase) {
            $scope.$digest(); //$digest or $apply
          }
        } catch (e) {
          console.log("Problem trying to cause a render after updating roles");
        }
      }, function(error) {
        console.warn(error);
        $rootScope.loading = false;
      });
  };

  $scope.removeAccessFromUser = function(userid, roles) {
    if (!roles || roles.length === 0) {
      console.warn("no roles were requested to be removed. cant do anything");
      alert("There was a problem performing this operation. Please report this.");
    }
    // Prevent an admin from removing him/herself from a corpus if there are no other admins; This
    // helps to avoid a situation in which there is no admin for a
    // corpus
    if ($scope.users.admins.length < 2) {
      if ($scope.users.admins[0].username.indexOf(userid) > -1) {
        window.alert("You cannot remove the final admin from a corpus.\nPlease add someone else as corpus admin before removing the final admin.");
        return;
      }
    }
    var referingNoun = userid;
    if (referingNoun === $rootScope.user.username) {
      referingNoun = "yourself";
    }

    var r = confirm("Are you sure you want to remove " + roles.join(" ") + " access from " + referingNoun + " on " + $rootScope.corpus.title);
    if (r === true) {

      var dataToPost = {};
      dataToPost.username = $rootScope.user.username.trim();
      dataToPost.password = $rootScope.loginInfo.password.trim();
      dataToPost.serverCode = $rootScope.serverCode;
      dataToPost.authUrl = Servers.getServiceUrl($rootScope.serverCode, "auth");
      dataToPost.dbname = $rootScope.corpus.dbname;

      dataToPost.users = [{
        username: userid,
        remove: roles,
        add: []
      }];

      Data.removeroles(dataToPost)
        .then(function(response) {
          if (debugging) {
            console.log(response);
          }
          var indirectObjectString = roles.join(" ") + "access from <a href='#corpus/" + $rootScope.corpus.dbname + "'>" + $rootScope.corpus.title + "</a>";
          $scope.addActivity([{
            verb: "removed",
            verbicon: "icon-remove-sign",
            directobjecticon: "icon-user",
            directobject: userid,
            indirectobject: indirectObjectString,
            teamOrPersonal: "personal"
          }, {
            verb: "removed",
            verbicon: "icon-remove-sign",
            directobjecticon: "icon-user",
            directobject: userid,
            indirectobject: indirectObjectString,
            teamOrPersonal: "team"
          }], "uploadnow");

        });
    }
  };


  // $scope.commaList = function(tags) {
  //   var dataString = "";
  //   for (var i = 0; i < tags.length; i++) {
  //     if (i < (tags.length - 1)) {
  //       if (tags[i].tag) {
  //         dataString = dataString + tags[i].tag + ", ";
  //       }
  //     } else {
  //       if (tags[i].tag) {
  //         dataString = dataString + tags[i].tag;
  //       }
  //     }
  //   }
  //   if (dataString === "") {
  //     return "Tags";
  //   }
  //   return dataString;
  // };

  // Paginate data tables

  $scope.numberOfResultPages = function(numberOfRecords) {
    if (!numberOfRecords) {
      return 0;
    }
    var resultSize = $rootScope.resultSize;
    if (resultSize === "all") {
      resultSize = $scope.allData.length;
    }
    var numberOfPages = Math.ceil(numberOfRecords / resultSize);
    // console.log("requesting numberOfResultPages" + numberOfPages);
    return numberOfPages;
  };

  $scope.loadPaginatedData = function(why) {
    console.log("Loading paginated data ", why);
    var resultSize = $rootScope.resultSize;
    if (resultSize === "all") {
      resultSize = $scope.allData.length;
    }
    var lastRecordOnPage = (($rootScope.currentPage + 1) * resultSize);
    var firstRecordOnPage = lastRecordOnPage - resultSize;

    if ($scope.allData) {
      $scope.data = $scope.allData.slice(firstRecordOnPage, lastRecordOnPage);
    }
  };

  //TODO whats wrong with ng-cloak? woudlnt that solve this?
  $timeout(function() {
    if (document.getElementById("hideOnLoad")) {
      document.getElementById("hideOnLoad").style.visibility = "visible";
    }
  }, 100);



  // $scope.testFunction = function() {
  //   console.log($rootScope.currentPage);
  // };

  /**
   *  changes the current page, which is watched in a directive, which in turn calls loadPaginatedData above
   * @return {[type]} [description]
   */
  $scope.pageForward = function() {
    $scope.activeDatumIndex = null;
    $rootScope.currentPage = $rootScope.currentPage + 1;
  };

  /**
   *  changes the current page, which is watched in a directive, which in turn calls loadPaginatedData above
   * @return {[type]} [description]
   */
  $scope.pageBackward = function() {
    $scope.activeDatumIndex = null;
    $rootScope.currentPage = $rootScope.currentPage - 1;
  };

  $rootScope.$watch('currentPage', function(newValue, oldValue) {
    if (newValue !== oldValue) {
      $scope.loadPaginatedData();
    } else {
      console.warn("currentPage changed, but is the same as before, not paginating data.", newValue, oldValue);
    }
  });

  $scope.flagAsDeleted = function(json, datum) {
    json.trashed = "deleted";
    if (datum) {
      $rootScope.markAsNotSaved(datum);
    }
  };

  $scope.deleteAttachmentFromCorpus = function(datum, filename, description) {
    if ($rootScope.writePermissions === false) {
      $rootScope.notificationMessage = "You do not have permission to delete attachments.";
      $rootScope.openNotification();
      return;
    }
    var r = confirm("Are you sure you want to put the file " + description + " (" + filename + ") in the trash?");
    if (r === true) {
      var record = datum.id + "/" + filename;
      console.log(record);
      Data.async($rootScope.corpus.dbname, datum.id)
        .then(function(originalRecord) {
          // mark as trashed in scope
          var inDatumAudioFiles = false;
          for (var i in datum.audioVideo) {
            if (datum.audioVideo[i].filename === filename) {
              datum.audioVideo[i].description = datum.audioVideo[i].description + ":::Trashed " + Date.now() + " by " + $rootScope.user.username;
              datum.audioVideo[i].trashed = "deleted";
              inDatumAudioFiles = true;
              // mark as trashed in database record
              for (var k in originalRecord.audioVideo) {
                if (originalRecord.audioVideo[k].filename === filename) {
                  originalRecord.audioVideo[k] = datum.audioVideo[i];
                }
              }
            }
          }
          if (datum.audioVideo.length === 0) {
            datum.hasAudio = false;
          }
          originalRecord.audioVideo = datum.audioVideo;
          //Upgrade to v1.90
          if (originalRecord.attachmentInfo) {
            delete originalRecord.attachmentInfo;
          }
          // console.log(originalRecord);
          Data.saveCouchDoc($rootScope.corpus.dbname, originalRecord)
            .then(function(response) {
              console.log("Saved attachment as trashed.");
              if (debugging) {
                console.log(response);
              }
              var indirectObjectString = "in <a href='#corpus/" + $rootScope.corpus.dbname + "'>" + $rootScope.corpus.title + "</a>";
              $scope.addActivity([{
                verb: "deleted",
                verbicon: "icon-trash",
                directobjecticon: "icon-list",
                directobject: "<a href='#data/" + datum.id + "/" + filename + "'>the audio file " + description + " (" + filename + ") on " + datum.utterance + "</a> ",
                indirectobject: indirectObjectString,
                teamOrPersonal: "personal"
              }, {
                verb: "deleted",
                verbicon: "icon-trash",
                directobjecticon: "icon-list",
                directobject: "<a href='#data/" + datum.id + "/" + filename + "'>an audio file on " + datum.utterance + "</a> ",
                indirectobject: indirectObjectString,
                teamOrPersonal: "team"
              }], "uploadnow");

              // Dont actually let users delete data...
              // Data.async($rootScope.corpus.dbname, datum.id)
              // .then(function(record) {
              //   // Delete attachment info for deleted record
              //   for (var key in record.attachmentInfo) {
              //     if (key === filename) {
              //       delete record.attachmentInfo[key];
              //     }
              //   }
              //   Data.saveCouchDoc($rootScope.corpus.dbname, datum.id, record, record._rev)
              // .then(function(response) {
              //     if (datum.audioVideo.length === 0) {
              //       datum.hasAudio = false;
              //     }
              //     console.log("File successfully deleted.");
              //   });
              // });
            });
        });
    }
  };

  $scope.triggerExpandCollapse = function() {
    if ($scope.expandCollapse === true) {
      $scope.expandCollapse = false;
    } else {
      $scope.expandCollapse = true;
    }
  };

  $scope.getSavedState = function() {
    if ($scope.saved === "yes") {
      return {
        state: "Saved",
        class: "btn btn-success",
        icon: "fa whiteicon fa-folder",
        text: $rootScope.contextualize("locale_Saved")
      };
    } else if ($scope.saved === "no") {
      return {
        state: "Save",
        class: "btn btn-danger",
        icon: "fa whiteicon fa-save",
        text: $rootScope.contextualize("locale_Save")
      };
    } else {
      return {
        state: "Saving",
        class: "pulsing",
        icon: "fa whiteicon fa-folder-open",
        text: $rootScope.contextualize("locale_Saving")
      };
    }
  };

  $scope.contactUs = function() {
    window.open("https://docs.google.com/forms/d/18KcT_SO8YxG8QNlHValEztGmFpEc4-ZrjWO76lm0mUQ/viewform");
  };

  $scope.setDataEntryFocusOn = function(targetDatumEntryDomElement) {
    $timeout(function() {
      if (targetDatumEntryDomElement && targetDatumEntryDomElement[1]) {
        console.log("old focus", document.activeElement);
        targetDatumEntryDomElement[1].focus();
        console.log("new focus", document.activeElement);
      } else {
        console.warn("requesting focus on an element that doesnt exist.");
      }
    }, 500);
  };

  // Use this function to show objects on loading without displacing other elements
  $scope.hiddenOnLoading = function() {
    if ($rootScope.loading !== true) {
      return {
        'visibility': 'hidden'
      };
    } else {
      return {};
    }
  };

  // Hide loader when all content is ready
  $rootScope.$on('$viewContentLoaded', function() {
    // Return user to saved state, if it exists; only recover saved state on reload, not menu navigate
    if ($scope.appReloaded !== true) {
      $scope.scopePreferences = overwiteAndUpdatePreferencesToCurrentVersion();
      // Update users to new saved state preferences if they were absent
      if (!$scope.scopePreferences.savedState) {
        $scope.scopePreferences.savedState = {};
        localStorage.setItem('SpreadsheetPreferences', JSON.stringify($scope.scopePreferences));
        $scope.documentReady = true;
      } else if ($scope.scopePreferences.savedState && $scope.scopePreferences.savedState.server && $scope.scopePreferences.savedState.username && $scope.scopePreferences.savedState.password) {
        $rootScope.serverCode = $scope.scopePreferences.savedState.server;
        var auth = {};
        auth.server = $scope.scopePreferences.savedState.server;
        auth.user = $scope.scopePreferences.savedState.username;
        try {
          auth.password = sjcl.decrypt("password", $scope.scopePreferences.savedState.password);
        } catch (err) {
          // User's password has not yet been encrypted; encryption will be updated on login.
          auth.password = $scope.scopePreferences.savedState.password;
        }
        $scope.loginUser(auth);
        // Upgrade to v92 where corpus info is not saved in the prefs, only the pouchbame
        if ($scope.scopePreferences.savedState.DB) {
          $scope.scopePreferences.savedState.mostRecentCorpusDBname = $scope.scopePreferences.savedState.DB.dbname || $scope.scopePreferences.savedState.DB.pouchname;
          delete $scope.scopePreferences.savedState.DB;
        }
        if ($scope.scopePreferences.savedState.mostRecentCorpusDBname) {
          /* load details for the most receent database */
          $scope.selectCorpus({
            dbname: $scope.scopePreferences.savedState.mostRecentCorpusDBname
          });

          if ($scope.scopePreferences.savedState.sessionID) {
            // Load all sessions and go to current session
            $scope.loadSessions($scope.scopePreferences.savedState.sessionID);
            $scope.navigateVerifySaved('none');
          } else {
            $scope.loadSessions();
          }
        } else {
          $scope.documentReady = true;
        }
      } else {
        $rootScope.openWelcomeNotificationDeprecated();
        $scope.documentReady = true;
      }
    }
  });

  $scope.forgotPasswordInfo = {};
  $scope.forgotPasswordSubmit = function() {
    if (!$scope.forgotPasswordInfo.email) {
      $rootScope.notificationMessage = "You must enter the email you used when you registered (email is optional, If you did not provde an email you will need to contact us for help).";
      $rootScope.openNotification();
      return;
    }

    Data.forgotPassword($scope.forgotPasswordInfo)
      .then(function(response) {
        if (debugging) {
          console.log(response);
        }

        $scope.forgotPasswordInfo = {};
        $scope.showForgotPassword = false;
        $rootScope.notificationMessage = response.data.info.join(" ") || "Successfully emailed password.";
        $rootScope.openNotification();

      }, function(err) {
        console.warn(err);
        var message = "";
        if (err.status === 0) {
          message = "are you offline?";
          if ($rootScope.serverCode === "mcgill" || $rootScope.serverCode === "concordia") {
            message = "Cannot contact " + $rootScope.serverCode + " server, have you accepted the server's security certificate? (please refer to your registration email)";
          }
        }
        if (err && err.status >= 400 && err.data.userFriendlyErrors) {
          message = err.data.userFriendlyErrors.join(" ");
        } else {
          message = "Cannot contact " + $rootScope.serverCode + " server, please report this.";
        }

        $scope.showForgotPassword = false;
        $rootScope.notificationMessage = message;
        $rootScope.openNotification();

        // console.log(reason);
        // var message = "Please report this.";
        // if (reason.status === 0) {
        //   message = "Are you offline?";
        // } else {
        //   message = reason.data.userFriendlyErrors.join(" ");
        // }
        // $rootScope.notificationMessage = "Error updating password. " + message;
        // $rootScope.openNotification();
      });
  };

  $scope.resetPasswordInfo = {};
  $scope.changePasswordSubmit = function() {
    if ($scope.resetPasswordInfo.confirmpassword !== $scope.resetPasswordInfo.newpassword) {
      $rootScope.notificationMessage = "New passwords don't match.";
      $rootScope.openNotification();
      return;
    }

    $scope.resetPasswordInfo.username = $rootScope.user.username;
    Data.changePassword($scope.resetPasswordInfo)
      .then(function(response) {
        if (debugging) {
          console.log(response);
        }
        Data.login($scope.resetPasswordInfo.username, $scope.resetPasswordInfo.confirmpassword);


        $scope.scopePreferences.savedState.password = sjcl.encrypt("password", $scope.resetPasswordInfo.confirmpassword);
        localStorage.setItem('SpreadsheetPreferences', JSON.stringify($scope.scopePreferences));

        $scope.resetPasswordInfo = {};
        $scope.showResetPassword = false;
        $rootScope.notificationMessage = response.data.info.join(" ") || "Successfully updated password.";
        $rootScope.openNotification();


      }, function(err) {
        console.warn(err);
        var message = "";
        if (err.status === 0) {
          message = "are you offline?";
          if ($rootScope.serverCode === "mcgill" || $rootScope.serverCode === "concordia") {
            message = "Cannot contact " + $rootScope.serverCode + " server, have you accepted the server's security certificate? (please refer to your registration email)";
          }
        }
        if (err && err.status >= 400 && err.data.userFriendlyErrors) {
          message = err.data.userFriendlyErrors.join(" ");
        } else {
          message = "Cannot contact " + $rootScope.serverCode + " server, please report this.";
        }
        $scope.showResetPassword = false;

        $rootScope.notificationMessage = message;
        $rootScope.openNotification();

      });
  };


  $scope.newRecordHasBeenEditedButtonClass = function() {
    if ($rootScope.newRecordHasBeenEdited === true) {
      return "btn btn-danger";
    } else {
      return "btn btn-primary";
    }
  };


  $scope.mainBodyClass = function() {
    if ($rootScope.activeSubMenu === 'searchMenu') {
      return "mainBodySearching";
    } else {
      return "mainBody";
    }
  };

  window.onbeforeunload = function(e) {
    console.warn(e);
    if ($scope.saved === "no") {
      return "You currently have unsaved changes!\n\nIf you wish to save these changes, cancel and then save before reloading or closing this app.\n\nOtherwise, any unsaved changes will be abandoned.";
    } else {
      return;
    }
  };

};
SpreadsheetStyleDataEntryController.$inject = ['$scope', '$rootScope', '$resource', '$filter', '$document', 'Data', 'Servers', 'md5', '$timeout', '$modal', '$log', '$http'];
angular.module('spreadsheetApp').controller('SpreadsheetStyleDataEntryController', SpreadsheetStyleDataEntryController);

'use strict';

/**
 * @ngdoc function
 * @name spreadsheetApp.controller:SpreadsheetExportController
 * @description
 * # SpreadsheetExportController
 * Controller of the spreadsheetApp
 */

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.
// http://angular-ui.github.io/bootstrap/
// http://stackoverflow.com/questions/19204510/modal-window-issue-unknown-provider-modalinstanceprovider
angular.module('spreadsheetApp').controller('SpreadsheetExportController', function($scope, $modalInstance, details) {

  $scope.resultsMessageFromExternalController = details.resultsMessageFromExternalController;
  $scope.resultsFromExternalController = details.resultsFromExternalController;

  if (window.location.origin.indexOf("mcgill") > -1) {
    $scope.useWordpressIGTFormat = true;
  } else {
    $scope.useWordpressIGTFormat = false;
  }

  try {
    var previousValue = localStorage.getItem("useWordpressIGTFormat");
    if (previousValue === "false") {
      $scope.useWordpressIGTFormat = false;
    } else if (previousValue === "true") {
      $scope.useWordpressIGTFormat = true;
    }
  } catch (e) {
    console.log("useWordpressIGTFormat was not previously set.");
  }

  $scope.$watch('useWordpressIGTFormat', function(newvalue, oldvalue) {
    console.log("useWordpressIGTFormat", oldvalue);
    if (newvalue !== undefined) {
      localStorage.setItem("useWordpressIGTFormat", newvalue);
    }
  });

  $scope.ok = function() {
    $modalInstance.close($scope.results, $scope.resultsMessage);
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
});

'use strict';

/**
 * @ngdoc function
 * @name spreadsheetApp.controller:SpreadsheetNotificationController
 * @description
 * # SpreadsheetNotificationController
 * Controller of the spreadsheetApp
 */

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.
// http://angular-ui.github.io/bootstrap/
// http://stackoverflow.com/questions/19204510/modal-window-issue-unknown-provider-modalinstanceprovider
angular.module('spreadsheetApp')
  .controller('SpreadsheetNotificationController', function($scope, $modalInstance, details) {
    console.log('Not using details from caller', details);
    $scope.ok = function() {
      $modalInstance.close();
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  });

'use strict';

/**
 * @ngdoc directive
 * @name spreadsheetApp.directive:spreadsheetPagination
 * @description
 * # spreadsheetPagination
 */
angular.module('spreadsheetApp').directive('spreadsheetPagination', function() {
  return {
    templateUrl: 'views/pagination.html',
    restrict: 'A',
    transclude: false,
    // scope: {
    //   corpus: '=json'
    // },
    // controller: function($scope, $element, $attrs, $transclude) {},
    link: function postLink() {
    }
  };
});

'use strict';

/**
 * @ngdoc directive
 * @name spreadsheetApp.directive:spreadsheetAdaptingColumnarTemplateEdit
 * @description
 * # spreadsheetAdaptingColumnarTemplateEdit
 */
angular.module('spreadsheetApp').directive('spreadsheetAdaptingColumnarTemplateEdit', function() {
  return {
    templateUrl: 'views/adapting-columnar-template-edit.html',
    restrict: 'A',
    transclude: false,
    // replace: true,
    // scope: {
    //   corpus: '=json'
    // },
    // controller: function($scope, $element, $attrs, $transclude) {},
    link: function postLink() {}
  };
});

'use strict';

/**
 * @ngdoc directive
 * @name spreadsheetApp.directive:spreadsheetAdaptingColumnarTemplateRead
 * @description
 * # spreadsheetAdaptingColumnarTemplateRead
 */
angular.module('spreadsheetApp').directive('spreadsheetAdaptingColumnarTemplateRead', function() {
  return {
    templateUrl: 'views/adapting-columnar-template-read.html',
    restrict: 'A',
    transclude: false,
    // replace: true,
    // scope: {
    //   corpus: '=json'
    // },
    // controller: function($scope, $element, $attrs, $transclude) {},
    link: function postLink() {}
  };
});

'use strict';

/**
 * @ngdoc directive
 * @name spreadsheetApp.directive:spreadsheetAdaptingColumnarTemplateNew
 * @description
 * # spreadsheetAdaptingColumnarTemplateNew
 */
angular.module('spreadsheetApp').directive('spreadsheetAdaptingColumnarTemplateNew', function() {
  return {
    templateUrl: 'views/adapting-columnar-template-new.html',
    restrict: 'A',
    transclude: false,
    // replace: true,
    // scope: {
    //   corpus: '=json'
    // },
    // controller: function($scope, $element, $attrs, $transclude) {},
    link: function postLink() {}
  };
});

'use strict';

/**
 * @ngdoc directive
 * @name spreadsheetApp.directive:spreadsheetNoDataToDisplay
 * @description
 * # spreadsheetNoDataToDisplay
 */
angular.module('spreadsheetApp').directive('spreadsheetNoDataToDisplay', function() {
  return {
    templateUrl: 'views/spreadsheet-no-data-to-display.html',
    restrict: 'A',
    transclude: false,
    // scope: {
    //   corpus: '=json'
    // },
    // controller: function($scope, $element, $attrs, $transclude) {},
    link: function postLink() {
    }
  };
});

/* globals Glosser */
'use strict';

/**
 * @ngdoc directive
 * @name spreadsheetApp.directive:fielddbGlosserInput
 * @description
 * # fielddbGlosserInput
 */

// var lexiconFactory = LexiconFactory;
// var corpusSpecificGlosser;
// /**
//  * If the glosser & lexicon have not been created, this function makes it possible for users to specify any glosser url or lexicon url to use for downloading the precedece rules.
//  * @param  {String} dbname   The database for which the glosser is to be created
//  * @param  {String} optionalUrl An optional url to a couchdb map reduce which has a format similar to morphemesPrecedenceContext and is able to create tuples used by the lexicon.
//  */
// var initGlosserAndLexiconIfNecessary = function(dbname, optionalUrl){
//   //If the url isnt specified, use the users lexicon on corpus server
//   var url =  "https://corpus.lingsync.org/" + dbname,
//   showWordBoundaries = true;

//   optionalUrl = optionalUrl ||  url + "/_design/lexicon/_view/morphemesPrecedenceContext?group=true";
//   if (!corpusSpecificGlosser) {
//     corpusSpecificGlosser = new Glosser({
//       dbname: dbname
//     });
//   }
//   if (!corpusSpecificGlosser.lexicon) {
//     corpusSpecificGlosser.downloadPrecedenceRules(dbname, optionalUrl, function(precedenceRelations) {
//       corpusSpecificGlosser.lexicon = lexiconFactory({
//         precedenceRelations: precedenceRelations,
//         dbname: dbname,
//         element: document.getElementById(dbname+"-lexicon-viz"),
//         dontConnectWordBoundaries: !showWordBoundaries,
//         url: optionalUrl.replace(url, "")
//       });
//     });
//   }
// };

var debuggingMode = false;
angular.module('spreadsheetApp').directive('fielddbGlosserInput', function() {

  var controller = function($scope, $rootScope) {
    console.log('loading controller for fielddbGlosserInput');

    $scope.keyListener = function($event) {
      var arrowkeys = [40, 38, 39, 37];
      if (arrowkeys.indexOf($event.keyCode) > -1) {
        return;
      }
    };

    $scope.runGlosserUsingThisField = function(fieldKey, originalvalue, datumornewdatum) {
      var currentValue = datumornewdatum[fieldKey];
      if (debuggingMode) {
        console.log('requesting semi-automatic glosser: ' + originalvalue + '->' + currentValue);
      }

      if (datumornewdatum.rev) {
        $rootScope.markAsEdited($scope.fieldData, datumornewdatum);
      } else {
        if (JSON.stringify(datumornewdatum) === "{}") {
          return;
        }
        $rootScope.newRecordHasBeenEdited = true;
      }
      if (datumornewdatum.fossil && datumornewdatum.fossil[fieldKey] === currentValue) {
        return;
      }

      datumornewdatum.dbname = $scope.corpus.dbname;
      if (fieldKey === 'utterance') {
        datumornewdatum = Glosser.guessMorphemesFromUtterance(datumornewdatum, !$scope.useAutoGlosser);
      } else if (fieldKey === 'morphemes') {
        datumornewdatum = Glosser.guessUtteranceFromMorphemes(datumornewdatum, !$scope.useAutoGlosser);
        datumornewdatum = Glosser.guessGlossFromMorphemes(datumornewdatum, !$scope.useAutoGlosser);
      }
    };

  };

  return {
    template: function(element, attrs) {
      console.log('loading template for fielddbGlosserInput', attrs);
      var templateString =
        '<input ' +
        '  ng-repeat="corpusField in fieldsInColumns.' + attrs.columnlabel + ' track by $index"' +
        '  class="{{fieldSpanWidthClassName}}"' +
        '  type="text"' +
        '  ng-model="' + attrs.datumornewdatum + '[corpusField.id]"' +
        '  placeholder="{{corpusField.label}}"' +
        '  title="{{corpusField.help}}"' +
        '  ng-hide="corpusField.showToUserTypes == \'readonly\'"' +
        '  ng-blur="runGlosserUsingThisField(corpusField.id, ' + attrs.datumornewdatum + '[corpusField.id], ' + attrs.datumornewdatum + ', $event)"' +
        '/>';

      return templateString;
    },
    restrict: 'A',
    controller: controller,
    link: function postLink() {
      // console.log('fielddbGlosserInput ', element.find('input'));
    }
  };
});