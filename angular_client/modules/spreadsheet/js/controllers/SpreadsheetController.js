console.log("Loading the SpreadsheetStyleDataEntryController.");

define(
  ["angular"],
  function(angular) {

    'use strict';

    var SpreadsheetStyleDataEntryController =
    /**
     * @param $scope
     * @param $rootScope
     * @param $resource
     * @param Data
     * @param Servers provides utility functions which can let users choose a server
     * @returns {SpreadsheetStyleDataEntryController}
     */

    function($scope, $rootScope, $resource, $filter, $document, Data, Servers, md5) {

      /* Modal controller TODO could move somewhere where the search is? */
      $scope.open = function() {
        $scope.shouldBeOpen = true;
      };

      $scope.close = function() {
        $scope.shouldBeOpen = false;
      };

      $scope.opts = {
        backdropFade: true,
        dialogFade: true
      };

      // Functions to open/close generic notification modal
      $rootScope.openNotification = function() {
        $scope.notificationShouldBeOpen = true;
      };

      $rootScope.closeNotification = function() {
        $scope.notificationShouldBeOpen = false;
      };

      // Functions to open/close welcome notification modal
      $rootScope.openWelcomeNotification = function() {
        $scope.welcomeNotificationShouldBeOpen = true;
      };

      $rootScope.closeWelcomeNotification = function() {
        $scope.welcomeNotificationShouldBeOpen = false;
      };

      // TEST FOR CHROME BROWSER
      var is_chrome = window.chrome;
      if (!is_chrome) {
        $scope.not_chrome = true;
      }
      
      $scope.useAutoGlosser = true;
      try {
        var previousValue = localStorage.getItem("useAutoGlosser");
        if (previousValue === "false") {
          $scope.useAutoGlosser =  false; 
        }
      } catch (e) {
        console.log("Use autoglosser was not previously set.");
      }

      $scope.$watch('useAutoGlosser', function(newvalue, oldvalue) {
        localStorage.setItem("useAutoGlosser", newvalue);
      });

      /*
        Create an array of servers which the user may use
         */
      $rootScope.servers = Servers.getAvailable();
      $rootScope.servers[0].selected = "selected";

      // Set/get/update user preferences
      var defaultPreferences = {
        "userTemplate": "fulltemplate",
        "resultSize": 10,
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
            "title": "Judgement"
          },
          "utterance": {
            "label": "utterance",
            "title": "Utterance"
          },
          "allomorphs": {
            "label": "allomorphs",
            "title": "Allomorphs"
          },
          "phonetic": {
            "label": "phonetic",
            "title": "Phonetic"
          },
          "morphemes": {
            "label": "morphemes",
            "title": "Morphemes"
          },
          "gloss": {
            "label": "gloss",
            "title": "Gloss"
          },
          "translation": {
            "label": "translation",
            "title": "Translation"
          },
          "comments": {
            "label": "comments",
            "title": "Comments"
          },
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
          "dateElicited": {
            "label": "dateElicited",
            "title": "Date Elicited"
          },
          "user": {
            "label": "user",
            "title": "User"
          },
          "dateSEntered": {
            "label": "dateSEntered",
            "title": "Date entered"
          },
          "tags": {
            "label": "tags",
            "title": "tags"
          },
          "validationStatus": {
            "label": "validationStatus",
            "title": "validationStatus"
          },
          "syntacticCategory": {
            "label": "syntacticCategory",
            "title": "syntacticCategory"
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
            "label": "comments",
            "title": "Comments"
          },
          "field6": {
            "label": "judgement",
            "title": "Judgement"
          },
          "field7": {
            "label": "",
            "title": ""
          },
          "field8": {
            "label": "",
            "title": ""
          }
        }
      };

      var Preferences = localStorage.getItem('SpreadsheetPreferences');

      if (Preferences === null) {
        Preferences = defaultPreferences;
        console
          .log("No preferences. Setting default preferences in localStorage.");
        localStorage.clear();
        localStorage.setItem('SpreadsheetPreferences', JSON
          .stringify(defaultPreferences));
      } else {
        console.log("Loading Preferences from localStorage.");
        Preferences = JSON.parse(Preferences);
      }

      if ((Preferences.template1 !== undefined) || (Preferences.availableFields && Preferences.availableFields.notes)) {
        // Update to v1.3
        Preferences = defaultPreferences;
        console
          .log("Preferences need to be upgraded. Clearing and setting defaults.");
        localStorage.clear();
        localStorage.setItem('SpreadsheetPreferences', JSON
          .stringify(defaultPreferences));
        Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
      }
      // Always get the most recent available fields
      Preferences.availableFields = defaultPreferences.availableFields;
      // console.log(Preferences.availableFields);
      // Set scope variables
      $scope.documentReady = false;
      $rootScope.template = Preferences.userTemplate;
      $rootScope.fields = Preferences[Preferences.userTemplate];
      $scope.scopePreferences = Preferences;
      $scope.availableFields = defaultPreferences.availableFields;
      $scope.orderProp = "dateEntered";
      $rootScope.currentPage = 0;
      $scope.reverse = true;
      // $scope.selected = 'newEntry';
      $rootScope.authenticated = false;
      $rootScope.developer = false;
      $scope.dataentry = false;
      $scope.searching = false;
      $rootScope.activeSubMenu = 'none';
      $scope.activeSession = undefined;
      $scope.currentSessionName = "All Sessions";
      $scope.showCreateSessionDiv = false;
      $scope.editSessionDetails = false;
      $scope.createNewSessionDropdown = false;
      $scope.currentDate = JSON.parse(JSON.stringify(new Date()));
      $scope.activities = [];
      $rootScope.DBselected = false;
      $scope.recordingStatus = "Record";
      $scope.recordingButtonClass = "btn btn-success";
      $scope.recordingIcon = "fa-microphone";
      $scope.showAudioFeatures = false;
      $scope.newFieldData = {};
      $rootScope.newRecordHasBeenEdited = false;

      $rootScope.serverLabels = Servers.getHumanFriendlyLabels();

      // Set data size for pagination
      $rootScope.resultSize = Preferences.resultSize;

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

          if ($rootScope.DB) {
            $rootScope.DBselected = true;
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
              $scope.selected = null;
              window.location.assign("#/spreadsheet/" + $rootScope.template);
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
              window.location.assign("#/spreadsheet/" + $rootScope.template);
              break;
            case "register":
              window.location.assign("#/register");
              break;
            default:
              window.location.assign("#/spreadsheet/" + $rootScope.template);
              $scope.changeActiveSubMenu(itemToDisplay);
          }
        }
      };

      // Get sessions for pouchname; select specific session on saved state load
      $scope.loadSessions = function(sessionID) {
        var scopeSessions = [];
        Data
          .sessions($rootScope.DB.pouchname)
          .then(
            function(response) {
              for (var k in response) {
                scopeSessions.push(response[k].value);
              }

              for (var i in scopeSessions) {
                for (var j in scopeSessions[i].sessionFields) {
                  if (scopeSessions[i].sessionFields[j].label === "goal") {
                    if (scopeSessions[i].sessionFields[j].mask) {
                      scopeSessions[i].title = scopeSessions[i].sessionFields[j].mask
                        .substr(0, 20);
                    }
                  }
                }
              }
              $scope.sessions = scopeSessions;
              if (sessionID) {
                $scope.selectSession(sessionID);
              }
              $scope.documentReady = true;
            }, function(error) {
              $scope.documentReady = true;
              console.log("Error loading sessions.");
              $rootScope.notificationMessage = "Error loading corpus, please report this.";
              $rootScope.openNotification();
              $rootScope.loading = false;
            });
      };

      // Fetch data from server and put into template scope
      $scope.loadData = function(sessionID) {
        $scope.appReloaded = true;
        $rootScope.loading = true;
        Data
          .async($rootScope.DB.pouchname)
          .then(
            function(dataFromServer) {
              var scopeData = [];
              for (var i = 0; i < dataFromServer.length; i++) {
                // Create array of datums
                if (dataFromServer[i].value.datumFields) {
                  var newDatumFromServer = {};
                  newDatumFromServer.id = dataFromServer[i].id;
                  newDatumFromServer.rev = dataFromServer[i].value._rev;

                  for (var j in dataFromServer[i].value.datumFields) {
                    // Get enteredByUser object
                    if (dataFromServer[i].value.datumFields[j].label === "enteredByUser") {
                      newDatumFromServer.enteredByUser = dataFromServer[i].value.datumFields[j].user;
                    }
                    // Get modifiedByUser object
                    else if (dataFromServer[i].value.datumFields[j].label === "modifiedByUser") {
                      newDatumFromServer.modifiedByUser = {};
                      newDatumFromServer.modifiedByUser.users = dataFromServer[i].value.datumFields[j].users;
                    } else {
                      newDatumFromServer[dataFromServer[i].value.datumFields[j].label] = dataFromServer[i].value.datumFields[j].mask;
                    }
                  }

                  // Grab enteredByUser for older records
                  if (dataFromServer[i].value.enteredByUser && typeof dataFromServer[i].value.enteredByUser === "string") {
                    newDatumFromServer.enteredByUser = {};
                    newDatumFromServer.enteredByUser.username = dataFromServer[i].value.enteredByUser;
                  }

                  // Update users to add a dateEntered to all datums (oversight in original code; needed so that datums are ordered properly)
                  if (!dataFromServer[i].value.dateEntered || dataFromServer[i].value.dateEntered === "" || dataFromServer[i].value.dateEntered === "N/A") {
                    newDatumFromServer.dateEntered = "2000-09-06T16:31:30.988Z";
                    newDatumFromServer.saved = "no";
                  } else {
                    newDatumFromServer.dateEntered = dataFromServer[i].value.dateEntered;
                  }

                  if (dataFromServer[i].value.dateModified) {
                    newDatumFromServer.dateModified = dataFromServer[i].value.dateModified;
                  }
                  if (dataFromServer[i].value.lastModifiedBy) {
                    newDatumFromServer.lastModifiedBy = dataFromServer[i].value.lastModifiedBy;
                  }
                  newDatumFromServer.datumTags = dataFromServer[i].value.datumTags;
                  newDatumFromServer.comments = dataFromServer[i].value.comments;
                  newDatumFromServer.sessionID = dataFromServer[i].value.session._id;
                  // Get attachments
                  // console.log(dataFromServer[i].value);
                  newDatumFromServer.audioFiles = dataFromServer[i].value.audioFiles || [];
                  if(newDatumFromServer.audioFiles.length === 0){
                    for (var key in dataFromServer[i].value._attachments) {
                      var attachment = {
                        "filename": key
                      };
                      if (dataFromServer[i].value.attachmentInfo && dataFromServer[i].value.attachmentInfo[key]) {
                        attachment.description = dataFromServer[i].value.attachmentInfo[key].description;
                      } else {
                        attachment.description = "Add a description";
                      }
                      newDatumFromServer.audioFiles.push(attachment);
                    }
                  }
                  if (newDatumFromServer.audioFiles.length > 0) {
                    newDatumFromServer.hasAudio = true;
                  }

                  // Load data from current session into scope
                  if (!sessionID) {
                    scopeData.push(newDatumFromServer);
                  } else if (newDatumFromServer.sessionID === sessionID) {
                    scopeData.push(newDatumFromServer);
                  }
                }
              }
              scopeData.sort(function(a, b) {
                if (a[$scope.orderProp] > b[$scope.orderProp])
                  return -1;
                if (a[$scope.orderProp] < b[$scope.orderProp])
                  return 1;
                return 0;
              });

              $scope.allData = scopeData;
              $scope.data = scopeData.slice(0, $rootScope.resultSize);
              $rootScope.currentPage = 0;

              $scope.loadAutoGlosserRules();
              $scope.loadUsersAndRoles();

              $scope.saved = "yes";
              $rootScope.loading = false;

              $scope.selected = "newEntry";


            }, function(error) {
              // On error loading data, reset saved state
              // Update saved state in Preferences
              Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
              Preferences.savedState = {};
              localStorage.setItem('SpreadsheetPreferences', JSON
                .stringify(Preferences));
              $scope.documentReady = true;
              $rootScope.notificationMessage = "There was an error loading the data. Please reload and log in.";
              $rootScope.openNotification();
            });
      };

      $scope.loadAutoGlosserRules = function() {
        // Get precedence rules for Glosser
        Data.glosser($rootScope.DB.pouchname).then(
          function(rules) {
            localStorage.setItem($rootScope.DB.pouchname + "precedenceRules", JSON.stringify(rules));

            // Reduce the rules such that rules which are found in multiple
            // source words are only used/included once.
            var reducedRules = _.chain(rules).groupBy(function(rule) {
              return rule.key.x + "-" + rule.key.y;
            }).value();

            // Save the reduced precedence rules in localStorage
            localStorage.setItem($rootScope.DB.pouchname + "reducedRules",
              JSON.stringify(reducedRules));
          }, function(error) {
            console.log("Error retrieving precedence rules.");
          });

        // Get lexicon for Glosser and organize based on frequency
        Data.lexicon($rootScope.DB.pouchname).then(
          function(lexicon) {
            var sortedLexicon = {};
            for (var i in lexicon) {
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

            // Sort each morpheme array by descending value
            for (var key in sortedLexicon) {
              sortedLexicon[key].sort(function(a, b) {
                return b.value - a.value;
              });
            }
            localStorage.setItem(
              $rootScope.DB.pouchname + "lexiconResults", JSON
              .stringify(sortedLexicon));
          }, function(error) {
            console.log("Error retrieving lexicon.");
          });
      };

      $scope.loginUser = function(auth) {
        if (!auth.server) {
          auth.server = $rootScope.servers[0].label;
        }
        if (!auth || !auth.server) {
          $rootScope.notificationMessage = "Please choose a server.";
          $rootScope.openNotification();
        } else {
          $rootScope.clickSuccess = true;
          $rootScope.userInfo = {
            "name": auth.user.toLowerCase(),
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


          Data.login(auth.user.toLowerCase(), auth.password).then(
            function(response) {
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
              }]);
              $scope.uploadActivities();

              // Update saved state in Preferences
              Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
              Preferences.savedState.server = $rootScope.serverCode;
              Preferences.savedState.username = $rootScope.userInfo.name;
              Preferences.savedState.password = sjcl.encrypt("password", $rootScope.userInfo.password);
              localStorage.setItem('SpreadsheetPreferences', JSON
                .stringify(Preferences));

              $rootScope.authenticated = true;
              var userRoles = response.data.roles;
              var availableDBs = {};
              // Find available databases from db roles
              for (var roleIndex = 0; roleIndex < userRoles.length; roleIndex++) {
                var pieces = userRoles[roleIndex].split("_");
                if (pieces.length > 1 && pieces[1] === "writer") {
                  availableDBs[pieces[0].replace(/[\"]/g, "")] = {
                    roleIndex: roleIndex
                  };
                }
              }
              // put dbs in order that they were added to the user rather than alphabetical by pouchname which isnt useful
              var scopeDBs = [];
              for (var dbName in availableDBs) {
                if (availableDBs.hasOwnProperty(dbName)) {

                  // Only show lingllama's grafiti corpora to lingllama, per client request
                  if (dbName.indexOf("lingllama-communitycorpus") > -1 && $rootScope.userInfo.name != "lingllama") {
                    continue;
                  }
                  scopeDBs.push(dbName);
                }
              }
              $scope.corpora = [];

              for (var m = 0; m < scopeDBs.length; m++) {
                (function(index) {
                  // Use map-reduce to get corpus title

                  Data.async(scopeDBs[index], "_design/pages/_view/private_corpuses").then(
                    function(response) {
                      var corpus = {};
                      corpus.pouchname = scopeDBs[index];
                      if (response.rows[0]) {
                        corpus.corpustitle = response.rows[0].value.title;
                      } else {
                        corpus.corpustitle = scopeDBs[index];
                      }
                      corpus.gravatar = md5.createHash(corpus.pouchname);
                      $scope.corpora.push(corpus);
                    }, function(error) {
                      var corpus = {};
                      corpus.pouchname = scopeDBs[index];
                      corpus.corpustitle = scopeDBs[index];
                      $scope.corpora.push(corpus);
                    });
                })(m);
              }
              $rootScope.loading = false;
            }, /* login failure */ function(reason){
              $rootScope.notificationMessage = "Error logging in.\n"+ reason;
              $rootScope.openNotification();
              $rootScope.loading = false;
            });
        }
      };

      $scope.logOut = function() {
        Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
        Preferences.savedState = {};
        localStorage.setItem('SpreadsheetPreferences', JSON
          .stringify(Preferences));
        $scope.reloadPage();
      };

      $scope.selectDB = function(selectedDB) {
        if (!selectedDB) {
          $rootScope.notificationMessage = "Please select a database.";
          $rootScope.openNotification();
        } else {
          $rootScope.DB = selectedDB;

          // Update saved state in Preferences
          Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
          Preferences.savedState.DB = selectedDB;
          localStorage.setItem('SpreadsheetPreferences', JSON
            .stringify(Preferences));

          $scope.loadSessions();
        }
      };

      $scope.selectSession = function(activeSessionID) {
        $scope.changeActiveSession(activeSessionID);
        // Make sure that following variable is set (ng-model in select won't
        // assign variable until chosen)
        $scope.activeSessionToSwitchTo = activeSessionID;
        $scope.dataentry = true;

        // Update saved state in Preferences
        Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
        Preferences.savedState.sessionID = activeSessionID;
        localStorage.setItem('SpreadsheetPreferences', JSON
          .stringify(Preferences));
        $scope.loadData(activeSessionID);
        window.location.assign("#/spreadsheet/" + $rootScope.template);
      };

      $scope.changeActiveSession = function(activeSessionToSwitchTo) {
        if (activeSessionToSwitchTo === 'none' || activeSessionToSwitchTo === undefined) {
          $scope.activeSession = undefined;
        } else {
          $scope.activeSession = activeSessionToSwitchTo;
          for (var i in $scope.sessions) {
            if ($scope.sessions[i]._id === activeSessionToSwitchTo) {
              $scope.fullCurrentSession = $scope.sessions[i];

              // Set up object to make session editing easier
              var editSessionInfo = {};
              editSessionInfo._id = $scope.fullCurrentSession._id;
              editSessionInfo._rev = $scope.fullCurrentSession._rev;
              for (var k in $scope.fullCurrentSession.sessionFields) {
                editSessionInfo[$scope.fullCurrentSession.sessionFields[k].label] = $scope.fullCurrentSession.sessionFields[k].mask;
              }
              $scope.editSessionInfo = editSessionInfo;
            }
          }
        }
        // Update saved state in Preferences
        Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
        Preferences.savedState.sessionID = $scope.activeSession;
        Preferences.savedState.sessionTitle = $scope.currentSessionName;
        localStorage.setItem('SpreadsheetPreferences', JSON
          .stringify(Preferences));
      };

      $scope.getCurrentSessionName = function() {
        if ($scope.activeSession === undefined) {
          return "All Sessions";
        } else {
          var sessionTitle;
          for (var i in $scope.sessions) {
            if ($scope.sessions[i]._id === $scope.activeSession) {
              for (var j in $scope.sessions[i].sessionFields) {
                if ($scope.sessions[i].sessionFields[j].label === "goal") {
                  if ($scope.sessions[i].sessionFields[j].mask) {
                    $scope.currentSessionName = $scope.sessions[i].sessionFields[j].mask;
                    return $scope.sessions[i].sessionFields[j].mask.substr(0,
                      20);
                  } else {
                    $scope.currentSessionName = $scope.sessions[i].sessionFields[j].value;
                    return $scope.sessions[i].sessionFields[j].value.substr(0,
                      20);
                  }
                }
              }
            }
          }
        }
      };

      $scope.editSession = function(editSessionInfo, scopeDataToEdit) {
        var r = confirm("Are you sure you want to edit the session information?\nThis could take a while.");
        if (r === true) {
          $scope.editSessionDetails = false;
          $rootScope.loading = true;
          var newSession = $scope.fullCurrentSession;
          for (var i in newSession.sessionFields) {
            for (var key in editSessionInfo) {
              if (newSession.sessionFields[i].label === key) {
                newSession.sessionFields[i].value = editSessionInfo[key];
                newSession.sessionFields[i].mask = editSessionInfo[key];
              }
            }
          }
          // Save new session record
          Data
            .saveEditedRecord($rootScope.DB.pouchname, newSession._id,
              newSession)
            .then(
              function() {
                var directobject =  $scope.currentSessionName || "an elicitation session";
                var indirectObjectString = "in <a href='#corpus/" + $rootScope.DB.pouchname + "'>" + $rootScope.DB.corpustitle + "</a>";
                $scope.addActivity([{
                  verb: "updated",
                  verbicon: "icon-pencil",
                  directobjecticon: "icon-calendar",
                  directobject: "<a href='#session/" + newSession._id + "'>" +directobject+ "</a> ",
                  indirectobject: indirectObjectString,
                  teamOrPersonal: "personal"
                }, {
                  verb: "updated",
                  verbicon: "icon-pencil",
                  directobjecticon: "icon-calendar",
                  directobject: "<a href='#session/" + newSession._id + "'>" +directobject+ "</a> ",
                  indirectobject: indirectObjectString,
                  teamOrPersonal: "team"
                }]);
                $scope.uploadActivities();

                // Update all records tied to this session
                for (var i in scopeDataToEdit) {
                  $rootScope.loading = true;
                  (function(index) {
                    if (scopeDataToEdit[index].sessionID === newSession._id) {
                      Data
                        .async($rootScope.DB.pouchname,
                          scopeDataToEdit[index].id)
                        .then(
                          function(editedRecord) {
                            // Edit record with updated session info
                            // and save

                            editedRecord.session = newSession;
                            Data.saveEditedRecord(
                              $rootScope.DB.pouchname,
                              scopeDataToEdit[index].id,
                              editedRecord, editedRecord._rev)
                              .then(function() {
                                $rootScope.loading = false;
                              });

                          },
                          function() {
                            window
                              .alert("There was an error accessing the record.\nTry refreshing the page");
                          });
                    }
                  })(i);
                }
                $scope.loadData($scope.activeSessionID);
              });
        }

      };


      $scope.deleteEmptySession = function(activeSessionID) {
        if ($scope.currentSessionName === "All Sessions") {
          $rootScope.notificationMessage = "You must select a session to delete.";
          $rootScope.openNotification();
        } else {
          var r = confirm("Are you sure you want to put this session in the trash?");
          if (r === true) {
            Data.async($rootScope.DB.pouchname, activeSessionID)
              .then(
                function(sessionToMarkAsDeleted) {
                  sessionToMarkAsDeleted.trashed = "deleted";
                  var rev = sessionToMarkAsDeleted._rev;
                  Data.saveEditedRecord($rootScope.DB.pouchname, activeSessionID, sessionToMarkAsDeleted, rev).then(function(response) {
                    
                    var indirectObjectString = "in <a href='#corpus/" + $rootScope.DB.pouchname + "'>" + $rootScope.DB.corpustitle + "</a>";
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
                    }]);
                    $scope.uploadActivities();

                    // Remove session from scope
                    for (var i in $scope.sessions) {
                      if ($scope.sessions[i]._id === activeSessionID) {
                        $scope.sessions.splice(i, 1);
                      }
                    }
                    // Set active session to All Sessions
                    $scope.activeSession = undefined;
                  }, function(error) {
                    window
                      .alert("Error deleting session.\nTry refreshing the page.");
                  });
                });
          }
        }
      };


      $scope.createNewSession = function(newSession) {
        $rootScope.loading = true;
        // Get blank template to build new record
        Data
          .blankSessionTemplate()
          .then(
            function(newSessionRecord) {
              newSessionRecord.pouchname = $rootScope.DB.pouchname;
              newSessionRecord.dateCreated = JSON.parse(JSON
                .stringify(new Date()));
              newSessionRecord.dateModified = JSON.parse(JSON
                .stringify(new Date()));
              newSessionRecord.lastModifiedBy = $rootScope.userInfo.name;
              for (var key in newSession) {
                for (var i in newSessionRecord.sessionFields) {
                  if (newSessionRecord.sessionFields[i].label === "user") {
                    newSessionRecord.sessionFields[i].value = $rootScope.userInfo.name;
                    newSessionRecord.sessionFields[i].mask = $rootScope.userInfo.name;
                  }
                  if (newSessionRecord.sessionFields[i].label === "dateSEntered") {
                    newSessionRecord.sessionFields[i].value = new Date()
                      .toString();
                    newSessionRecord.sessionFields[i].mask = new Date()
                      .toString();
                  }
                  if (key === newSessionRecord.sessionFields[i].label) {
                    newSessionRecord.sessionFields[i].value = newSession[key];
                    newSessionRecord.sessionFields[i].mask = newSession[key];
                  }
                }
              }
              Data
                .saveNew($rootScope.DB.pouchname, newSessionRecord)
                .then(
                  function(savedRecord) {


                    newSessionRecord._id = savedRecord.data.id;
                    newSessionRecord._rev = savedRecord.data.rev;
                    for (var i in newSessionRecord.sessionFields) {
                      if (newSessionRecord.sessionFields[i].label === "goal") {
                        newSessionRecord.title = newSessionRecord.sessionFields[i].mask
                          .substr(0, 20);
                      }
                    }
                    var directobject =  newSessionRecord.title || "an elicitation session";
                    var indirectObjectString = "in <a href='#corpus/" + $rootScope.DB.pouchname + "'>" + $rootScope.DB.corpustitle + "</a>";
                    $scope.addActivity([{
                      verb: "added",
                      verbicon: "icon-pencil",
                      directobjecticon: "icon-calendar",
                      directobject: "<a href='#session/" + savedRecord.data.id + "'>" +directobject+ "</a> ",
                      indirectobject: indirectObjectString,
                      teamOrPersonal: "personal"
                    }, {
                      verb: "added",
                      verbicon: "icon-pencil",
                      directobjecticon: "icon-calendar",
                      directobject: "<a href='#session/" + savedRecord.data.id + "'>" +directobject+ "</a> ",
                      indirectobject: indirectObjectString,
                      teamOrPersonal: "team"
                    }]);
                    $scope.uploadActivities();

                    $scope.sessions.push(newSessionRecord);
                    $scope.dataentry = true;
                    $scope.selectSession(savedRecord.data.id);
                    window.location.assign("#/spreadsheet/" + $rootScope.template);
                  });
              $rootScope.loading = false;
            });

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
          $scope.selected = datum;
        // } else if (datum.audioFiles && datum.audioFiles[0]) {
        //   $rootScope.notificationMessage = "You must delete all recordings from this record first.";
        //   $rootScope.openNotification();
        //   $scope.selected = datum;
        } else {
          var r = confirm("Are you sure you want to put this datum in the trash?");
          if (r === true) {

            Data
              .async($rootScope.DB.pouchname, datum.id)
              .then(
                function(recordToMarkAsDeleted) {
                  recordToMarkAsDeleted.trashed = "deleted";
                  var rev = recordToMarkAsDeleted._rev;
                  Data.saveEditedRecord($rootScope.DB.pouchname, datum.id, recordToMarkAsDeleted, rev).then(function(response) {
                    // Remove record from scope

                    var indirectObjectString = "in <a href='#corpus/" + $rootScope.DB.pouchname + "'>" + $rootScope.DB.corpustitle + "</a>";
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
                    }]);

                    $scope.uploadActivities();

                    // Delete record from all scope data and update
                    var index = $scope.allData.indexOf(datum);
                    $scope.allData.splice(index, 1);
                    $scope.loadPaginatedData();

                    $scope.saved = "yes";
                    $scope.selected = null;
                  }, function(error) {
                    window
                      .alert("Error deleting record.\nTry refreshing the data first by clicking ↻.");
                  });
                });
          }
        }
      };

      $scope.createRecord = function(fieldData) {

        // // Reset new datum form data and enable upload button; only reset audio field if present
        if ($rootScope.template === "fulltemplate") {
          document.getElementById("form_new_datum_audio-file").reset();
          $scope.newDatumHasAudioToUpload = false;
        }
        $rootScope.newRecordHasBeenEdited = false;
        $scope.newFieldData = {};

        if (!fieldData) {
          fieldData = {};
        }

        // Edit record fields with labels from prefs
        for (var dataKey in fieldData) {
          for (var fieldKey in $scope.fields) {
            if (dataKey === fieldKey) {
              // console.log(dataKey);
              var newDataKey = $scope.fields[fieldKey].label;
              fieldData[newDataKey] = fieldData[dataKey];
              delete fieldData[dataKey];
            }
          }
        }
        // console.log(fieldData);
        // Save tags
        if (fieldData.datumTags) {
          var newDatumFields = fieldData.datumTags.split(",");
          var newDatumFieldsArray = [];
          for (var i in newDatumFields) {
            var newDatumTagObject = {};
            // Trim spaces
            var trimmedTag = newDatumFields[i].trim();
            newDatumTagObject.tag = trimmedTag;
            newDatumFieldsArray.push(newDatumTagObject);
          }
          fieldData.datumTags = newDatumFieldsArray;
        } else {
          fieldData.datumTags = [];
        }

        // Save comments
        if (fieldData.comments) {
          var comment = {};
          comment.text = fieldData.comments;
          comment.username = $rootScope.userInfo.name;
          comment.timestamp = Date.now();
          comment.gravatar = $rootScope.userInfo.gravatar || "./../user/user_gravatar.png";
          comment.timestampModified = Date.now();
          fieldData.comments = [];
          fieldData.comments.push(comment);
        }

        fieldData.dateEntered = JSON.parse(JSON.stringify(new Date()));
        fieldData.enteredByUser = {
          "username": $rootScope.userInfo.name,
          "gravatar": $rootScope.userInfo.gravatar
        };

        fieldData.timestamp = Date.now();
        // fieldData.dateModified = JSON.parse(JSON.stringify(new Date()));
        // fieldData.lastModifiedBy = $rootScope.userInfo.name;
        fieldData.sessionID = $scope.activeSession;
        fieldData.saved = "no";
        if (fieldData.audioFiles) {
          fieldData.hasAudio = true;
        }

        // Add record to all scope data and update
        $scope.allData.unshift(fieldData);
        $scope.loadPaginatedData();

        $scope.newFieldDatahasAudio = false;
        $scope.saved = "no";
      };

      $rootScope.markAsEdited = function(fieldData, datum) {
        var utterance = "Datum";
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
            console.log("$scope.fields",$scope.fields);
            datum[$scope.fields[key].label] = fieldData[key];
          }

          if ($scope.fields[key].label === "utterance") {
            utterance = fieldData[key];
          }
        }
        datum.dateModified = JSON.parse(JSON.stringify(new Date()));
        var modifiedByUser = {};
        modifiedByUser.username = $rootScope.userInfo.name;
        modifiedByUser.gravatar = $rootScope.userInfo.gravatar;
        if (!datum.modifiedByUser || !datum.modifiedByUser.users) {
          datum.modifiedByUser = {};
          datum.modifiedByUser.users = [];
        }

        datum.modifiedByUser.users.push(modifiedByUser);

        // Limit users array to unique usernames
        datum.modifiedByUser.users = _.map(_.groupBy(datum.modifiedByUser.users, function(x) {
          return x.username;
        }), function(grouped) {
          return grouped[0];
        });

        $scope.saved = "no";

        // Limit activity to one instance in the case of multiple edits to the same datum before 'save'
        if (!datum.saved || datum.saved === "yes") {
          datum.saved = "no";
          // Update activity feed
          var indirectObjectString = "in <a href='#corpus/" + $rootScope.DB.pouchname + "'>" + $rootScope.DB.corpustitle + "</a>";
          $scope.addActivity([{
            verb: "updated",
            verbicon: "icon-pencil",
            directobjecticon: "icon-list",
            directobject: "<a href='#corpus/" + $rootScope.DB.pouchname + "/datum/" + datum.id + "'>" + utterance + "</a> ",
            indirectobject: indirectObjectString,
            teamOrPersonal: "personal"
          }, {
            verb: "updated",
            verbicon: "icon-pencil",
            directobjecticon: "icon-list",
            directobject: "<a href='#corpus/" + $rootScope.DB.pouchname + "/datum/" + datum.id + "'>" + utterance + "</a> ",
            indirectobject: indirectObjectString,
            teamOrPersonal: "team"
          }]);
        } else {
          datum.saved = "no";
        }
      };

      $scope.addComment = function(datum) {
        var newComment = prompt("Enter new comment.");
        if (newComment === "" || newComment === null) {
          return;
        }
        var comment = {};
        comment.text = newComment;
        comment.username = $rootScope.userInfo.name;
        comment.timestamp = Date.now();
        comment.gravatar = $rootScope.userInfo.gravatar || "./../user/user_gravatar.png";
        comment.timestampModified = Date.now();
        if (datum.comments === null) {
          datum.comments = [];
        }
        datum.comments.push(comment);
        datum.saved = "no";
        $scope.saved = "no";
        datum.dateModified = JSON.parse(JSON.stringify(new Date()));
        datum.lastModifiedBy = $rootScope.userInfo.name;
        // $rootScope.currentPage = 0;
        // $rootScope.editsHaveBeenMade = true;

        var indirectObjectString = "on <a href='#data/" + datum.id + "'><i class='icon-pushpin'></i> " + $rootScope.DB.corpustitle + "</a>";
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
        if ($rootScope.readOnly === true) {
          $rootScope.notificationMessage = "You do not have permission to delete comments.";
          $rootScope.openNotification();
          return;
        }
        if (comment.username != $rootScope.userInfo.name) {
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
        for (var i in $scope.allData) {
          (function(index) {
            if ($scope.allData[index].saved && $scope.allData[index].saved === "no") {
              var fieldData;
              $scope.saved = "saving";

              // Save edited record
              if ($scope.allData[index].id) {
                console.log("Saving edited record: " + $scope.allData[index].id);
                fieldData = $scope.allData[index];
                var docID = fieldData.id;
                Data
                  .async($rootScope.DB.pouchname, docID)
                  .then(
                    function(editedRecord) {
                      // Populate new record with fields from
                      // scope
                      // Check for modifiedByUser field in original record; if not present, add it
                      var hasModifiedByUser = false;
                      // console.log(fieldData);
                      // console.log(editedRecord.datumFields);
                      for (var key in fieldData) {
                      // for (var i = 0; i < editedRecord.datumFields.length; i++) {
                        // for (var key in fieldData) {
                        var fieldWasInDatum = false;
                        for (var i = 0; i < editedRecord.datumFields.length; i++) {
                          if (editedRecord.datumFields[i].label === key) {
                            fieldWasInDatum = true;
                            // Check for (existing) modifiedByUser field in original record and update correctly
                            if (key === "modifiedByUser") {
                              editedRecord.datumFields[i].users = fieldData.modifiedByUser.users;
                            } else {
                              editedRecord.datumFields[i].mask = fieldData[key];
                              editedRecord.datumFields[i].value = fieldData[key];
                            }
                          }

                          if (editedRecord.datumFields[i].label === "modifiedByUser") {
                            hasModifiedByUser = true;
                          }
                        }
                        if (!fieldWasInDatum) {
                          editedRecord.datumFields.push({
                            "label": key,
                            "value": fieldData[key],
                            "mask": fieldData[key],
                            "encrypted": "",
                            "shouldBeEncrypted": "checked",
                            "help": "Entered by user in Spreadsheet App, conventions are missing.",
                            "showToUserTypes": "linguist",
                            "userchooseable": "disabled"
                          });
                        }
                      }

                      // Add modifiedByUser field if not present
                      if (hasModifiedByUser === false) {
                        console.log("Adding modifiedByUser field to older record.");
                        var modifiedByUserField = {
                          "label": "modifiedByUser",
                          "mask": "",
                          "users": fieldData.modifiedByUser.users,
                          "encrypted": "",
                          "shouldBeEncrypted": "",
                          "help": "An array of users who modified the datum",
                          "showToUserTypes": "all",
                          "readonly": true,
                          "userchooseable": "disabled"
                        };
                        editedRecord.datumFields.push(modifiedByUserField);
                      }
                      // Save date info
                      editedRecord.dateModified = fieldData.dateModified;
                      editedRecord.lastModifiedBy = fieldData.lastModifiedBy;
                      editedRecord.dateEntered = fieldData.dateEntered;
                      editedRecord.enteredByUser = fieldData.enteredByUser;

                      // Save tags
                      if (fieldData.datumTags) {
                        editedRecord.datumTags = fieldData.datumTags;
                      }

                      // Save comments
                      if (fieldData.comments) {
                        editedRecord.comments = fieldData.comments;
                      }
                      // Save edited record and refresh data
                      // in scope
                      Data
                        .saveEditedRecord($rootScope.DB.pouchname,
                          docID, editedRecord)
                        .then(
                          function(response) {
                            $scope.allData[index].saved = "yes";
                            $scope.uploadActivities();
                            $scope.saved = "yes";
                          },
                          function() {
                            $scope.saved = "no";
                            window
                              .alert("There was an error saving the record. Please try again.");
                          });
                    });

              } else {
                // Save new record
                console.log("Saving new record.");

                fieldData = $scope.allData[index];

                Data
                  .blankDatumTemplate()
                  .then(
                    function(newRecord) {
                      // Populate new record with fields from
                      // scope
                      for (var j = 0; j < newRecord.datumFields.length; j++) {
                        for (var key in fieldData) {
                          if (newRecord.datumFields[j].label === key) {
                            // Create enteredByUser object
                            if (key === "enteredByUser") {
                              newRecord.datumFields[j].mask = fieldData[key].username;
                              newRecord.datumFields[j].user = fieldData[key];
                            } else {
                              newRecord.datumFields[j].mask = fieldData[key];
                            }
                          }
                        }
                      }

                      // Save date info
                      newRecord.dateEntered = fieldData.dateEntered;
                      newRecord.timestamp = fieldData.timestamp;

                      // Save session
                      newRecord.session = $scope.fullCurrentSession;

                      // Save pouchname
                      newRecord.pouchname = $rootScope.DB.pouchname;
                      // Save tags
                      if (fieldData.datumTags) {
                        newRecord.datumTags = fieldData.datumTags;
                      }

                      // Save comments
                      if (fieldData.comments) {
                        newRecord.comments = fieldData.comments;
                      }

                      // Save attachments
                      if (fieldData._attachments) {
                        newRecord._attachments = fieldData._attachments;
                        newRecord.audioFiles = fieldData.audioFiles;
                        newRecord.attachmentInfo = fieldData.attachmentInfo;
                      }

                      Data
                        .saveNew($rootScope.DB.pouchname, newRecord)
                        .then(
                          function(response) {
                            // Check to see if newly created record is still in scope and update with response info;
                            // user may have refreshed data before save was complete
                            if ($scope.allData[index]) {
                              $scope.allData[index].id = response.data.id;
                              $scope.allData[index].rev = response.data.rev;
                              $scope.allData[index].saved = "yes";
                            }
                            console.log("Saved new record: " + $scope.allData[index].id);

                            // Update activity feed with newly created
                            // records and couch ids (must be done
                            // here to have access to couch id)
                            var utterance = "Datum";
                            if ($scope.allData[index].utterance && $scope.allData[index].utterance !== "") {
                              utterance = $scope.allData[index].utterance;
                            }

                            var indirectObjectString = "in <a href='#corpus/" + $rootScope.DB.pouchname + "'>" + $rootScope.DB.corpustitle + "</a>";
                            $scope
                              .addActivity([{
                                verb: "added",
                                verbicon: "icon-plus",
                                directobjecticon: "icon-list",
                                directobject: "<a href='#corpus/" + $rootScope.DB.pouchname + "/datum/" + response.data.id + "'>" + utterance + "</a> ",
                                indirectobject: indirectObjectString,
                                teamOrPersonal: "personal"
                              }, {
                                verb: "added",
                                verbicon: "icon-plus",
                                directobjecticon: "icon-list",
                                directobject: "<a href='#corpus/" + $rootScope.DB.pouchname + "/datum/" + response.data.id + "'>" + utterance + "</a> ",
                                indirectobject: indirectObjectString,
                                teamOrPersonal: "team"
                              }]);

                            // Upload new activities from async
                            // process
                            $scope.uploadActivities();
                            $scope.saved = "yes";
                          },
                          function() {
                            $scope.saved = "no";
                            window
                              .alert("There was an error saving the record. Please try again.");
                          });
                    });
              }
            }
          })(i);
        }
        // Upload Activities
        $scope.uploadActivities();
      };

      // Set auto-save interval for 5 minutes
      var autoSave = window.setInterval(
        function() {
          if ($scope.saved === "no") {
            $scope.saveChanges();
          } else {
            // TODO Dont need to FIND BETTER WAY TO KEEP SESSION ALIVE;
            // if ($rootScope.userInfo) {
            //   Data.login($rootScope.userInfo.name,
            //     $rootScope.userInfo.password);
            // }
          }
        }, 300000);

      $scope.selectRow = function(scopeIndex) {
        // Do nothing if clicked row is currently selected
        if ($scope.selected === scopeIndex) {
          return;
        }
        if ($scope.searching !== true) {
          if ($rootScope.newRecordHasBeenEdited !== true) {
            $scope.selected = scopeIndex;
          } else {
            $scope.selected = scopeIndex + 1;
            $scope.createRecord($scope.newFieldData);
          }
        }
      };

      $scope.editSearchResults = function(scopeIndex) {
        $scope.selected = scopeIndex;
      };

      $scope.selectNone = function() {
        $scope.selected = undefined;
      };

      $scope.runSearch = function(searchTerm) {
        // Create object from fields displayed in scope to later be able to
        // notify user if search result is from a hidden field
        var fieldsInScope = {};
        for (var key in $scope.fields) {
          fieldsInScope[$scope.fields[key].label] = true;
        }
        if ($rootScope.template === "fulltemplate") {
          fieldsInScope.datumTags = true;
          fieldsInScope.comments = true;
        }

        fieldsInScope.dateModified = true;
        fieldsInScope.lastModifiedBy = true;

        if ($scope.searchHistory) {
          $scope.searchHistory = $scope.searchHistory + " > " + searchTerm;
        } else {
          $scope.searchHistory = searchTerm;
        }
        // Converting searchTerm to string to allow for integer searching
        searchTerm = searchTerm.toString().toLowerCase();
        var newScopeData = [];
        // if (!$scope.activeSession) {
        // Search allData in scope
        for (var i in $scope.allData) {
          // Determine if record should be included in session search
          var searchTarget = false;
          if (!$scope.activeSession) {
            searchTarget = true;
          } else if ($scope.allData[i].sessionID === $scope.activeSession) {
            searchTarget = true;
          }
          if (searchTarget === true) {
            for (var fieldkey in $scope.allData[i]) {
              if ($scope.allData[i][fieldkey]) {
                // Limit search to visible data
                if (fieldsInScope[fieldkey] === true) {
                  if (fieldkey === "datumTags") {
                    var tagString = JSON.stringify($scope.allData[i].datumTags);
                    tagString = tagString.toString().toLowerCase();
                    if (tagString.indexOf(searchTerm) > -1) {
                      newScopeData.push($scope.allData[i]);
                      break;
                    }
                  } else if (fieldkey === "comments") {
                    for (var j in $scope.allData[i].comments) {
                      for (var commentKey in $scope.allData[i].comments[j]) {
                        if ($scope.allData[i].comments[j][commentKey].toString()
                          .indexOf(searchTerm) > -1) {
                          newScopeData.push($scope.allData[i]);
                          break;
                        }
                      }
                    }
                  } else {
                    var dataString = $scope.allData[i][fieldkey].toString()
                      .toLowerCase();
                    if (dataString.indexOf(searchTerm) > -1) {
                      newScopeData.push($scope.allData[i]);
                      break;
                    }
                  }
                }
              }
            }
          }
        }

        if (newScopeData.length > 0) {
          $scope.allData = newScopeData;
          $scope.data = $scope.allData.slice(0, $rootScope.resultSize);
        } else {
          $rootScope.notificationMessage = "No records matched your search.";
          $rootScope.openNotification();
        }
      };

      $scope.selectAll = function() {
        for (var i in $scope.allData) {
          if (!$scope.activeSession) {
            $scope.allData[i].checked = true;
          } else if ($scope.allData[i].sessionID === $scope.activeSession) {
            $scope.allData[i].checked = true;
          }
        }
      };

      $scope.exportResults = function() {
        $scope.open();
        var results = $filter('filter')($scope.allData, {
          checked: true
        });
        if (results.length > 0) {
          $scope.resultsMessage = results.length + " Record(s):";
          $scope.results = results;
        } else {
          $scope.resultsMessage = "Please select records to export.";
        }
      };

      // Add activities to scope object, to be uploaded when 'SAVE' is clicked
      $scope.addActivity = function(activityArray) {

        for (var i = 0; i < activityArray.length; i++) {
          (function(index) {
            var bareActivityObject = activityArray[index];
            bareActivityObject.verb = bareActivityObject.verb.replace(
              "href=", "target='_blank' href=");
            bareActivityObject.directobject = bareActivityObject.directobject
              .replace("href=", "target='_blank' href=");
            bareActivityObject.indirectobject = bareActivityObject.indirectobject
              .replace("href=", "target='_blank' href=");

            Data
              .blankActivityTemplate()
              .then(
                function(template) {
                  template.verb = bareActivityObject.verb;
                  template.verbicon = bareActivityObject.verbicon;
                  template.directobjecticon = bareActivityObject.directobjecticon;
                  template.directobject = bareActivityObject.directobject;
                  template.indirectobject = bareActivityObject.indirectobject;
                  template.teamOrPersonal = bareActivityObject.teamOrPersonal;
                  template.user.username = $rootScope.userInfo.name;
                  template.user.gravatar = $rootScope.userInfo.gravatar || "./../user/user_gravatar.png";
                  template.user.id = $rootScope.userInfo.name;
                  template.user._id = $rootScope.userInfo.name;
                  template.dateModified = JSON.parse(JSON.stringify(new Date()));
                  template.timestamp = Date.now();

                  $scope.activities.push(template);
                });
          })(i);
        }
      };

      $scope.uploadActivities = function() {
        // Save activities
        if ($scope.activities.length > 0) {
          for (var i = 0; i < $scope.activities.length; i++) {
            (function(index) {
              if ($scope.activities[index]) {
                var activitydb;
                if ($scope.activities[index].teamOrPersonal === "team") {
                  activitydb = $rootScope.DB.pouchname + "-activity_feed";
                } else {
                  activitydb = $rootScope.userInfo.name + "-activity_feed";
                }

                Data
                  .saveNew(activitydb, $scope.activities[index])
                  .then(
                    function(response) {
                      console.log("Saved new activity");
                      // Deleting so that indices in scope are unchanged
                      delete $scope.activities[index];
                    },  
                    function() {
                      window
                        .alert("There was an error saving the activity. Please try again.");
                      $scope.saved = "no";
                    });
              }
            })(i);
          }
        }
      };

      $scope.registerNewUser = function(newUserInfo) {
        if (!newUserInfo.serverCode) {
          newUserInfo.serverCode = $rootScope.servers[0].label;
        }
        if (!newUserInfo || !newUserInfo.serverCode) {
          $rootScope.notificationMessage = "Please select a server.";
          $rootScope.openNotification();
          return;
        }
        $rootScope.loading = true;

        // Clean username and tell user about it
        var safeUsernameForCouchDB = newUserInfo.username.trim().toLowerCase().replace(/[^0-9a-z]/g,"");
        if(safeUsernameForCouchDB !== newUserInfo.username){
          $rootScope.loading = false;
          newUserInfo.username = safeUsernameForCouchDB;
          $rootScope.notificationMessage = "We have automatically changed your requested username to '"+safeUsernameForCouchDB+ "' instead \n(the username you have chosen isn't very safe for urls, which means your corpora would be potentially inaccessible in old browsers)";
          $rootScope.openNotification();
          return;
        }
        var dataToPost = {};
        dataToPost.email = newUserInfo.email ? newUserInfo.email.trim().split(" ")[0] : "";
        dataToPost.username = newUserInfo.username.trim().toLowerCase();
        dataToPost.password = newUserInfo.password.trim();
        dataToPost.authUrl = Servers.getServiceUrl(newUserInfo.serverCode, "auth");
        dataToPost.appVersionWhenCreated = "1.90.1.ss";
        // dataToPost.appVersionWhenCreated = this.appVersion;

        dataToPost.serverCode = newUserInfo.serverCode;

        if (dataToPost.username !== "" && (dataToPost.password === newUserInfo.confirmPassword.trim()) ) {
          // Create user
          Data.register(dataToPost).then(function(response) {
            $rootScope.loading = false;
          }, function(error) {
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
        dataToPost.username = $rootScope.userInfo.name.trim();
        dataToPost.password = $rootScope.userInfo.password.trim();
        dataToPost.serverCode = $rootScope.serverCode;
        dataToPost.authUrl = Servers.getServiceUrl($rootScope.serverCode, "auth");

        dataToPost.newCorpusName = newCorpusInfo.newCorpusName;

        if (dataToPost.newCorpusName !== "") {
          // Create new corpus
          Data.createcorpus(dataToPost).then(function(response) {
            
            // Add new corpus to scope
            var newCorpus = {};
            newCorpus.pouchname = response.corpus.pouchname;
            newCorpus.corpustitle = response.corpus.title;
            var directObjectString = "<a href='#corpus/" + response.corpus.pouchname + "'>" + response.corpus.title + "</a>";
            $scope.addActivity([{
              verb: "added",
              verbicon: "icon-plus",
              directobjecticon: "icon-cloud",
              directobject: directObjectString,
              indirectobject: "",
              teamOrPersonal: "personal"
            }]);

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

        dataToPost.username = $rootScope.userInfo.name;
        dataToPost.password = $rootScope.userInfo.password;
        dataToPost.serverCode = $rootScope.serverCode;
        dataToPost.authUrl = Servers.getServiceUrl($rootScope.serverCode, "auth");
        dataToPost.pouchname = $rootScope.DB.pouchname;


        Data.getallusers(dataToPost).then(function(users) {
          for (var i in users.allusers) {
            if (users.allusers[i].username === $rootScope.userInfo.name) {
              $rootScope.userInfo.gravatar = users.allusers[i].gravatar;
            }
          }

          $scope.users = users;

          // Get privileges for logged in user
          Data.async("_users", "org.couchdb.user:" + $rootScope.userInfo.name)
            .then(
              function(response) {
                if (response.roles.indexOf($rootScope.DB.pouchname + "_admin") > -1) {
                  // Admin
                  $rootScope.admin = true;
                  $rootScope.readOnly = false;
                  $rootScope.writeOnly = false;
                } else if (response.roles.indexOf($rootScope.DB.pouchname + "_reader") > -1 &&
                  response.roles.indexOf($rootScope.DB.pouchname + "_writer") > -1) {
                  // Read-write
                  $rootScope.admin = false;
                  $rootScope.readOnly = false;
                  $rootScope.writeOnly = false;
                } else if (response.roles.indexOf($rootScope.DB.pouchname + "_reader") > -1 &&
                  response.roles.indexOf($rootScope.DB.pouchname + "_writer") === -1) {
                  // Read-only
                  $rootScope.admin = false;
                  $rootScope.readOnly = true;
                  $rootScope.writeOnly = false;
                } else if (response.roles.indexOf($rootScope.DB.pouchname + "_reader") === -1 &&
                  response.roles.indexOf($rootScope.DB.pouchname + "_writer") > -1) {
                  // Write-only
                  $rootScope.admin = false;
                  $rootScope.readOnly = false;
                  $rootScope.writeOnly = true;
                } else {
                  // TODO Commenter
                  $rootScope.admin = false;
                  $rootScope.readOnly = false;
                  $rootScope.writeOnly = false;
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
          case "admin":
            newUserRoles.admin = true;
            newUserRoles.reader = true;
            newUserRoles.writer = true;
            rolesString += " Admin"
            break;
          case "read_write":
            newUserRoles.admin = false;
            newUserRoles.reader = true;
            newUserRoles.writer = true;
            rolesString += " Writer Reader"
            break;
          case "read_only":
            newUserRoles.admin = false;
            newUserRoles.reader = true;
            newUserRoles.writer = false;
            rolesString += " Reader"
            break;
          case "write_only":
            newUserRoles.admin = false;
            newUserRoles.reader = false;
            newUserRoles.writer = true;
            rolesString += " Writer"
            break;
        }

        newUserRoles.pouchname = $rootScope.DB.pouchname;

        var dataToPost = {};
        dataToPost.username = $rootScope.userInfo.name.trim();
        dataToPost.password = $rootScope.userInfo.password.trim();
        dataToPost.serverCode = $rootScope.serverCode;
        dataToPost.authUrl = Servers.getServiceUrl($rootScope.serverCode, "auth");

        dataToPost.userRoleInfo = newUserRoles;

        Data.updateroles(dataToPost).then(function(response) {

          var indirectObjectString = "on <a href='#corpus/" + $rootScope.DB.pouchname + "'>" + $rootScope.DB.corpustitle + "</a> as "+rolesString;
          $scope.addActivity([{
            verb: "updated",
            verbicon: "icon-pencil",
            directobjecticon: "icon-user",
            directobject: "<a href='http://lingsync.org/" + newUserRoles.usernameToModify + "'>" + newUserRoles.usernameToModify + "</a> ",
            indirectobject: indirectObjectString,
            teamOrPersonal: "personal"
          }, {
            verb: "updated",
            verbicon: "icon-pencil",
            directobjecticon: "icon-user",
            directobject: "<a href='http://lingsync.org/" + newUserRoles.usernameToModify + "'>" + newUserRoles.usernameToModify + "</a> ",
            indirectobject: indirectObjectString,
            teamOrPersonal: "team"
          }]);

          document.getElementById("userToModifyInput").value = "";
          $rootScope.loading = false;
          $scope.loadUsersAndRoles();
        }, function(error) {
          $rootScope.loading = false;
        });
      };

      $scope.removeUserFromCorpus = function(userid) {
        // Prevent an admin from removing him/herself from a corpus; This
        // helps to avoid a situation in which there is no admin for a
        // corpus
        if (userid === $rootScope.userInfo.name) {
          window
            .alert("You cannot remove yourself from a corpus.\nOnly another Admin can remove you.");
          return;
        }

        var r = confirm("Are you sure you want to remove " + userid + " from this corpus?\nNOTE: This will remove ALL user roles for " + userid + ". However, you may add this user again with new permissions.");
        if (r === true) {

          var dataToPost = {};
          dataToPost.username = $rootScope.userInfo.name.trim();
          dataToPost.password = $rootScope.userInfo.password.trim();
          dataToPost.serverCode = $rootScope.serverCode;
          dataToPost.authUrl = Servers.getServiceUrl($rootScope.serverCode, "auth");

          dataToPost.userRoleInfo = {};
          dataToPost.userRoleInfo.usernameToModify = userid;
          dataToPost.userRoleInfo.pouchname = $rootScope.DB.pouchname;
          dataToPost.userRoleInfo.removeUser = true;

          Data.updateroles(dataToPost).then(function(response) {
            
            var indirectObjectString = "from <a href='#corpus/" + $rootScope.DB.pouchname + "'>" + $rootScope.DB.corpustitle + "</a>";
            $scope.addActivity([{
              verb: "removed",
              verbicon: "icon-remove-sign",
              directobjecticon: "icon-user",
              directobject: dataToPost.userRoleInfo.usernameToModify,
              indirectobject: indirectObjectString,
              teamOrPersonal: "personal"
            }, {
              verb: "removed",
              verbicon: "icon-remove-sign",
              directobjecticon: "icon-user",
              directobject: dataToPost.userRoleInfo.usernameToModify,
              indirectobject: indirectObjectString,
              teamOrPersonal: "team"
            }]);

            $scope.loadUsersAndRoles();
          });
        }
      };

      $scope.commaList = function(tags) {
        var tagString = "";
        for (var i = 0; i < tags.length; i++) {
          if (i < (tags.length - 1)) {
            if (tags[i].tag) {
              tagString = tagString + tags[i].tag + ", ";
            }
          } else {
            if (tags[i].tag) {
              tagString = tagString + tags[i].tag;
            }
          }
        }
        if (tagString === "") {
          return "Tags";
        }
        return tagString;
      };

      // Paginate data tables

      $scope.numberOfResultPages = function(numberOfRecords) {
        var numberOfPages = Math
          .ceil(numberOfRecords / $rootScope.resultSize);
        return numberOfPages;
      };

      $scope.loadPaginatedData = function() {
        var lastRecordOnPage = (($rootScope.currentPage + 1) * $rootScope.resultSize);
        var firstRecordOnPage = lastRecordOnPage - $rootScope.resultSize;

        if ($scope.allData) {
          $scope.data = $scope.allData.slice(firstRecordOnPage, lastRecordOnPage);
        }
      };

      document.getElementById("hideOnLoad").style.visibility = "visible";

      $scope.testFunction = function() {
        console.log($rootScope.currentPage);
      };

      $scope.pageForward = function() {
        $scope.selected = null;
        $rootScope.currentPage = $rootScope.currentPage + 1;
      };

      $scope.pageBackward = function() {
        $scope.selected = null;
        $rootScope.currentPage = $rootScope.currentPage - 1;
      };
      // Audio recording

      function hasGetUserMedia() {
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia || navigator.msGetUserMedia);
      }

      if (hasGetUserMedia()) {
        $rootScope.audioCompatible = true;
      } else {
        $rootScope.audioCompatible = false;
      }

      var onFail = function(e) {
        $scope.recordingStatus = "Record";
        $scope.recordingButtonClass = "btn btn-success";
        $scope.recordingIcon = "fa-microphone";
        console.log('Audio Rejected!', e);
        $rootScope.notificationMessage = "Unable to record audio.";
        $rootScope.openNotification();
      };

      var onSuccess = function(s) {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        var context = new AudioContext();
        var mediaStreamSource = context.createMediaStreamSource(s);
        recorder = new Recorder(mediaStreamSource);
        recorder.record();
      };

      window.URL = window.URL || window.webkitURL;
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia;

      var recorder;

      // Functions to open/close audio warning modal
      var openAudioWarning = function() {
        $scope.audioWarningShouldBeOpen = true;
      };

      $scope.closeAudioWarning = function() {
        $scope.audioWarningShouldBeOpen = false;
      };

      var audioRecordingInterval;

      $scope.startRecording = function(datum) {
        if (navigator.getUserMedia) {
          $scope.datumForAudio = datum;
          openAudioWarning();
          $scope.timeLeftForAudio = "5 minutes 0 seconds";
          // Begin countdown
          var minutes = 5;
          var seconds = 0;
          audioRecordingInterval = setInterval(function() {
            if (seconds === 0) {
              if (minutes === 0) {
                clearInterval(audioRecordingInterval);
                stopRecording(datum);
                $scope.audioWarningShouldBeOpen = false;
                return;
              } else {
                minutes--;
                seconds = 59;
              }
            }
            var minute_text;
            if (minutes > 0) {
              minute_text = minutes + (minutes > 1 ? ' minutes' : ' minute');
            } else {
              minute_text = '';
            }
            var second_text = seconds + (seconds > 1 ? ' seconds' : ' second');
            seconds--;
            $scope.$apply(function() {
              $scope.timeLeftForAudio = minute_text + " " + second_text;
            });
          }, 1000);
          $scope.recordingButtonClass = "btn btn-success disabled";
          $scope.recordingStatus = "Recording";
          $scope.recordingIcon = "fa fa-rss";
          navigator.getUserMedia({
            audio: true
          }, onSuccess, onFail);
        } else {
          $scope.recordingStatus = "Record";
          console.log('navigator.getUserMedia not present');
        }
      };

      $scope.stopRecording = function(datum) {
        recorder.stop();
        $scope.closeAudioWarning();
        clearInterval(audioRecordingInterval);
        $scope.recordingStatus = "Record";
        $scope.recordingButtonClass = "btn btn-success";
        $scope.recordingIcon = "fa-microphone";
        $scope.processingAudio = true;
        recorder.exportWAV(function(s) {
          $scope.uploadFile(datum, s);
        });
      };

      $scope.uploadFile = function(datum, file) {
        if (!datum || !datum.id) {
          $rootScope.newRecordHasBeenEdited = true;
        }

        $scope.processingAudio = true;

        var blobToBase64 = function(blob, cb) {
          var reader = new FileReader();
          reader.onload = function() {
            var dataUrl = reader.result;
            var base64 = dataUrl.split(',')[1];
            cb(base64);
          };
          reader.readAsDataURL(blob);
        };

        var base64File;
        var inputBoxPrefix;
        // Test to see if this is a new datum
        if (!datum || !datum.id) {
          inputBoxPrefix = "new_datum";
        } else {
          inputBoxPrefix = datum.id;
        }

        // Create attachments

        var newAttachments = {};

        // // If a new file, set up attachments structure, to be saved later
        if (!datum || !datum.id) {
          if (!datum) {
            datum = {};
          }
          datum._attachments = {};
          datum.audioFiles = [];
          datum.attachmentInfo = {};
        }

        var numberOfFiles;
        if (file) {
          numberOfFiles = 1;
        } else {
          numberOfFiles = document.getElementById(inputBoxPrefix + "_audio-file").files.length;
          // Disable upload button after uploading file(s) once in new datum; cannot reset file input in non-async task
          if (!datum || !datum.id) {
            $scope.newDatumHasAudioToUpload = true;
          }
        }

        // Check to see if user has clicked on upload without recording or uploading files
        if (numberOfFiles === 0 || numberOfFiles === null) {
          // $rootScope.editsHaveBeenMade = false;
          $scope.processingAudio = false;
          $scope.newDatumHasAudioToUpload = false;
          document.getElementById("form_" + inputBoxPrefix + "_audio-file").reset();
          $rootScope.notificationMessage = "Please record or select audio to upload.";
          $rootScope.openNotification();
          return;
        }

        for (var i = 0; i < numberOfFiles; i++) {
          (function(index) {
            blobToBase64(file || document.getElementById(inputBoxPrefix + "_audio-file").files[index], function(x) {
              base64File = x;
              var filename;
              var description;
              var content_type;
              if (file) {
                filename = Date.now() + ".wav";
                content_type = "audio\/wav";
                description = "Add a description";
              } else {
                // Test to see if this is a new datum
                var fileExt;
                if (!datum || !datum.id) {
                  fileExt = document.getElementById("new_datum_audio-file").files[index].type.split("\/").pop();
                } else {
                  fileExt = document.getElementById(datum.id + "_audio-file").files[index].type.split("\/").pop();
                }
                if (fileExt != ("mp3" || "mpeg" || "wav" || "ogg")) {
                  $rootScope.notificationMessage = "You can only upload audio files with extensions '.mp3', '.mpeg', '.wav', or '.ogg'.";
                  $rootScope.openNotification();
                  return;
                }
                filename = Date.now() + "" + index + "." + fileExt; // appending index in case of super-rapid processing on multi-file upload, to avoid duplicate filenames
                content_type = "audio\/" + fileExt;
                description = document.getElementById(inputBoxPrefix + "_audio-file").files[index].name;
              }

              var newAttachment = {};
              newAttachment = {
                "content_type": content_type,
                "data": base64File
              };
              newAttachments[filename] = newAttachment;
              newAttachments[filename].description = description;

              // Push attachment to scope if new record, to be saved later
              if (!datum || !datum.id) {
                var newScopeAttachment = {
                  "filename": filename,
                  "description": newAttachments[filename].description
                };

                $scope.$apply(function() {
                  datum._attachments[filename] = newAttachments[filename];
                  datum.audioFiles.push(newScopeAttachment);
                  datum.attachmentInfo[filename] = {
                    "description": newAttachments[filename].description
                  };
                });
              }
            });
          })(i);
        }

        // Stop here if new datum record (i.e. do not upload yet)
        if (!datum || !datum.id) {

          // Force digest after recording audio
          if (file) {
            $scope.$apply(function() {
              $scope.newFieldDatahasAudio = true;
              $scope.processingAudio = false;
            });
          } else {
            $scope.newFieldDatahasAudio = true;
            $scope.processingAudio = false;
          }
          return;
        }

        // Save new attachments for existing record
        Data.async($rootScope.DB.pouchname, datum.id).then(function(originalDoc) {
          var rev = originalDoc._rev;

          if (originalDoc._attachments === undefined) {
            originalDoc._attachments = {};
          }

          if (originalDoc.attachmentInfo === undefined) {
            originalDoc.attachmentInfo = {};
          }

          for (var key in newAttachments) {
            originalDoc._attachments[key] = newAttachments[key];
            originalDoc.attachmentInfo[key] = {
              "description": newAttachments[key].description
            };
          }
          // Update scope attachments
          if (!datum.audioFiles) {
            datum.audioFiles = [];
          }
          for (var key in newAttachments) {
            var newScopeAttachment = {
              "filename": key,
              "description": newAttachments[key].description
            };
            datum.audioFiles.push(newScopeAttachment);
          }
          datum.hasAudio = true;
          originalDoc.audioFiles = datum.audioFiles;
          // console.log(originalDoc.audioFiles);
          Data.saveEditedRecord($rootScope.DB.pouchname, datum.id, originalDoc, rev).then(function(response) {
            console.log("Successfully uploaded attachment.");

            // Reset file input field
            document.getElementById("form_" + inputBoxPrefix + "_audio-file").reset();

            $scope.processingAudio = false;
          });
        });
      };

      $scope.saveAttachmentInfo = function(attachment, datumID) {
        Data.async($rootScope.DB.pouchname, datumID).then(function(originalDoc) {
          var rev = originalDoc._rev;
          originalDoc.attachmentInfo[attachment.filename].description = attachment.description;
          Data.saveEditedRecord($rootScope.DB.pouchname, datumID, originalDoc, rev).then(function(response) {
            $rootScope.notificationMessage = "Successfully updated description for " + attachment.filename;
            $rootScope.openNotification();
          });
        });
      };

      $scope.deleteAttachmentFromCorpus = function(datum, filename, description) {
        if ($rootScope.readOnly === true) {
          $rootScope.notificationMessage = "You do not have permission to delete attachments.";
          $rootScope.openNotification();
          return;
        }
        var r = confirm("Are you sure you want to put the file " + description + " (" + filename + ") in the trash?");
        if (r === true) {
          var record = datum.id + "/" + filename;
          Data.async($rootScope.DB.pouchname, datum.id).then(function(originalRecord) {
            // mark as trashed in scope
            var inDatumAudioFiles = false;
            for (var i in datum.audioFiles) {
              if (datum.audioFiles[i].filename === filename) {
                datum.audioFiles[i].description = datum.audioFiles[i].description + ":::Trashed " + Date.now() + " by " + $rootScope.user.username;
                datum.audioFiles[i].trashed = "deleted";
                inDatumAudioFiles = true;
                // mark as trashed in database record
                for (var k in originalRecord.audioFiles) {
                  if (originalRecord.audioFiles[k].filename === filename) {
                    originalRecord.audioFiles[k] = datum.audioFiles[i];
                  }
                }
              }
            }
            if (datum.audioFiles.length === 0) {
              datum.hasAudio = false;
            }
            originalRecord.audioFiles = datum.audioFiles;
            // console.log(originalRecord);
            Data.saveEditedRecord($rootScope.DB.pouchname, datum.id, originalRecord).then(function(response) {
              console.log("Saved attachment as trashed.");

              var indirectObjectString = "in <a href='#corpus/" + $rootScope.DB.pouchname + "'>" + $rootScope.DB.corpustitle + "</a>";
              $scope.addActivity([{
                verb: "deleted",
                verbicon: "icon-trash",
                directobjecticon: "icon-list",
                directobject: "<a href='#data/" + datum.id + "/" + filename+ "'>the audio file "+ description + " (" + filename + ") on "+datum.utterance+"</a> ",
                indirectobject: indirectObjectString,
                teamOrPersonal: "personal"
              }, {
                verb: "deleted",
                verbicon: "icon-trash",
                directobjecticon: "icon-list",
                directobject: "<a href='#data/" + datum.id + "/" + filename + "'>an audio file on "+datum.utterance+"</a> ",
                indirectobject: indirectObjectString,
                teamOrPersonal: "team"
              }]);

              $scope.uploadActivities();

              // Dont actually let users delete data...
              // Data.async($rootScope.DB.pouchname, datum.id).then(function(record) {
              //   // Delete attachment info for deleted record
              //   for (var key in record.attachmentInfo) {
              //     if (key === filename) {
              //       delete record.attachmentInfo[key];
              //     }
              //   }
              //   Data.saveEditedRecord($rootScope.DB.pouchname, datum.id, record, record._rev).then(function(response) {
              //     if (datum.audioFiles.length === 0) {
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
          $scope.savedStateButtonClass = "btn btn-success";
          return "Saved";
        } else if ($scope.saved === "no") {
          $scope.savedStateButtonClass = "btn btn-danger";
          return "Save";
        } else {
          $scope.savedStateButtonClass = "pulsing";
          return "Saving";
        }
      };

      $scope.contactUs = function() {
        window.open("https://docs.google.com/spreadsheet/viewform?formkey=dGFyREp4WmhBRURYNzFkcWZMTnpkV2c6MQ");
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
          Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
          // Update users to new saved state preferences if they were absent
          if (!Preferences.savedState) {
            Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
            Preferences.savedState = {};
            localStorage.setItem('SpreadsheetPreferences', JSON
              .stringify(Preferences));
            $scope.documentReady = true;
          } else if (Preferences.savedState && Preferences.savedState.server && Preferences.savedState.username && Preferences.savedState.password) {
            $rootScope.serverCode = Preferences.savedState.server;
            var auth = {};
            auth.server = Preferences.savedState.server;
            auth.user = Preferences.savedState.username;
            try {
              auth.password = sjcl.decrypt("password", Preferences.savedState.password);
            } catch (err) {
              // User's password has not yet been encrypted; encryption will be updated on login.
              auth.password = Preferences.savedState.password;
            }
            $scope.loginUser(auth);
            if (Preferences.savedState.DB) {
              $rootScope.DB = Preferences.savedState.DB;
              if (Preferences.savedState.sessionID) {
                // Load all sessions and go to current session
                $scope.loadSessions(Preferences.savedState.sessionID);
                $scope.navigateVerifySaved('none');
              } else {
                $scope.loadSessions();
              }
            } else {
              $scope.documentReady = true;
            }
          } else {
            $rootScope.openWelcomeNotification();
            $scope.documentReady = true;
          }
        }
      });
      $scope.resetPasswordInfo = {};
      $scope.changePasswordSubmit = function(){
        if ($scope.resetPasswordInfo.confirmpassword !== $scope.resetPasswordInfo.newpassword) {
          $rootScope.notificationMessage = "New passwords don't match.";
          $rootScope.openNotification();
        }

        $scope.resetPasswordInfo.username = $rootScope.userInfo.name,
        Data.changePassword($scope.resetPasswordInfo).then(function(result){
          // console.log(result);
          Data.login($scope.resetPasswordInfo.username, $scope.resetPasswordInfo.confirmpassword);
          $scope.resetPasswordInfo = {};
          $scope.showResetPassword = false;
          $rootScope.notificationMessage = "Successfully updated password";
          $rootScope.openNotification();
        }, function(reason){
          console.log(reason);
          var message = "Please report this.";
          if (reason.status === 0) {
            message = "Are you offline?";
          } else {
            message = reason.data.userFriendlyErrors.join(" ");
          }
          $rootScope.notificationMessage = "Error updating password. " + message;
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
        if ($scope.saved === "no") {
          return "You currently have unsaved changes!\n\nIf you wish to save these changes, cancel and then save before reloading or closing this app.\n\nOtherwise, any unsaved changes will be abandoned.";
        } else {
          return;
        }
      };

    };
    SpreadsheetStyleDataEntryController.$inject = ['$scope', '$rootScope',
      '$resource', '$filter', '$document', 'Data', 'Servers', 'md5'
    ];
    return SpreadsheetStyleDataEntryController;
  });
