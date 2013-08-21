console.log("Loading the SpreadsheetStyleDataEntryController.");

'use strict';
define(
  ["angular"],
  function(angular) {
    var SpreadsheetStyleDataEntryController =
    /**
     * @param $scope
     * @param $rootScope
     * @param $resource
     * @param Data
     * @returns {SpreadsheetStyleDataEntryController}
     */

      function($scope, $rootScope, $resource, $filter, Data) {

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

        // TEST FOR CHROME BROWSER
        var is_chrome = window.chrome;
        if (!is_chrome) {
          $scope.not_chrome = true;
        }

        // Set/get/update user preferences
        var defaultPreferences = {
          "userTemplate": "template2",
          "resultSize": 10,
          "availableFields": {
            "judgement": {
              "label": "judgement",
              "title": "Judgement"
            },
            "utterance": {
              "label": "utterance",
              "title": "Utterance"
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
          "template1": {
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
          "template2": {
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

        if (Preferences == undefined) {
          Preferences = defaultPreferences;
          console
            .log("No preferences. Setting default preferences in localStorage.");
          localStorage.clear();
          localStorage.setItem('SpreadsheetPreferences', JSON
            .stringify(defaultPreferences));
        } else if (Preferences.availableFields && Preferences.availableFields.notes) {
          // Update to v1.2
          Preferences = defaultPreferences;
          console
            .log("Preferences need to be upgraded. Clearing and setting defaults.");
          localStorage.clear();
          localStorage.setItem('SpreadsheetPreferences', JSON
            .stringify(defaultPreferences));
          Preferences = localStorage.getItem('SpreadsheetPreferences');
        } else {
          console.log("Loading Preferences from localStorage.");
          Preferences = JSON.parse(Preferences);
        }

        // Set scope variables
        $rootScope.template = Preferences.userTemplate;
        $rootScope.fields = Preferences[Preferences.userTemplate];
        $scope.scopePreferences = Preferences;
        $scope.orderProp = "dateModified";
        $scope.currentPage = 0;
        $scope.reverse = true;
        $scope.selected = 'newEntry';
        $rootScope.authenticated = false;
        $rootScope.developer = false;
        $scope.dataentry = false;
        $scope.searching = false;
        $rootScope.activeSubMenu = 'none';
        $scope.activeSession = undefined;
        $scope.currentSessionName = "All Sessions";
        $scope.showCreateSessionDiv = false;
        $scope.editSessionDetails = false;
        $scope.currentDate = JSON.parse(JSON.stringify(new Date()));
        $scope.activities = [];
        $rootScope.DBselected = false;
        $scope.recordingStatus = "Record";
        $scope.recordingButtonClass = "btn btn-success";
        $scope.recordingIcon = "speaker_icon.png";
        $scope.createNewButtonClass = "btn btn-primary";
        $scope.showAudioFeatures = false;
        $scope.newFieldData = {};

        $rootScope.serverLabels = {
          "mcgill" : "McGill Prosody Lab",
          "testing" : "LingSync Beta",
          "localhost" : "Localhost"
        };

        // Set data size for pagination
        $scope.resultSize = Preferences.resultSize;

        $scope.changeActiveSubMenu = function(subMenu) {
          if ($rootScope.activeSubMenu == subMenu) {
            $rootScope.activeSubMenu = 'none';
          } else if (subMenu == 'none' && $scope.searching == true) {
            return;
          } else {
            $rootScope.activeSubMenu = subMenu;
          }
        };

        $scope.navigateVerifySaved = function(itemToDisplay) {
          if ($scope.saved == 'no') {
            window.alert("Please save changes before continuing");
          } else if ($scope.saved == "saving") {
            window.alert("Changes are currently being saved.\nPlease wait until this operation is done.");
          } else {

            if ($rootScope.DB) {
              $rootScope.DBselected = true;
            }

            if ($scope.searching == true) {
              $scope.searching = false;
            }

            if (itemToDisplay == "settings") {
              $scope.dataentry = false;
              $scope.changeActiveSubMenu('none');
              window.location.assign("#/settings");
            } else if (itemToDisplay == "corpusSettings") {
              $scope.dataentry = false;
              $scope.changeActiveSubMenu('none');
              window.location.assign("#/corpussettings");
            } else if (itemToDisplay == "home") {
              $scope.dataentry = false;
              $scope.changeActiveSubMenu('none');
              window.location.assign("#/");
            } else if (itemToDisplay == "searchMenu") {
              $scope.selectRow('newEntry');
              $scope.changeActiveSubMenu(itemToDisplay);
              if ($scope.searching == true) {
                $scope.searching = false;
              } else {
                $scope.searching = true;
              }
            } else if (itemToDisplay == "faq") {
              $scope.dataentry = false;
              $scope.changeActiveSubMenu('none');
              window.location.assign("#/faq");
            } else if (itemToDisplay == "reload") {
              $scope.dataRefreshed = true;
              $scope.searchTerm = '';
              $scope.searchHistory = null;
              $scope.search = false;
              $scope.changeActiveSubMenu('none');
              window.location.assign("#/spreadsheet/" + $scope.template);
              $scope.loadData();
            } else {
              window.location.assign("#/spreadsheet/" + $scope.template);
              $scope.changeActiveSubMenu(itemToDisplay);
            }
          }
        };

        // Fetch data from server and put into template scope
        $scope.loadData = function() {
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

                    for (j in dataFromServer[i].value.datumFields) {
                      newDatumFromServer[dataFromServer[i].value.datumFields[j].label] = dataFromServer[i].value.datumFields[j].mask;
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
                    newDatumFromServer.attachments = [];
                    for (key in dataFromServer[i].value._attachments) {
                      var attachment = {
                        "filename": key
                      };
                      if (dataFromServer[i].value.attachmentInfo && dataFromServer[i].value.attachmentInfo[key]) {
                        attachment.description = dataFromServer[i].value.attachmentInfo[key].description;
                      } else {
                        attachment.description = "Add a description";
                      }
                      newDatumFromServer.attachments.push(attachment);
                    }
                    if (newDatumFromServer.attachments.length > 0) {
                      newDatumFromServer.hasAudio = true;
                    }
                    scopeData.push(newDatumFromServer);
                  }
                }
                $scope.data = scopeData;

                $scope.loadUsersAndRoles();

                // Get sessions
                var scopeSessions = [];
                Data
                  .sessions($rootScope.DB.pouchname)
                  .then(
                    function(response) {
                      for (k in response) {
                        scopeSessions.push(response[k].value);
                      }

                      for (i in scopeSessions) {
                        for (j in scopeSessions[i].sessionFields) {
                          if (scopeSessions[i].sessionFields[j].label == "goal") {
                            if (scopeSessions[i].sessionFields[j].mask) {
                              scopeSessions[i].title = scopeSessions[i].sessionFields[j].mask
                                .substr(0, 20);
                            }
                          }
                        }
                      }
                      $scope.sessions = scopeSessions;
                    });
                $scope.saved = "yes";
                $rootScope.loading = false;
              });

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
              for (i in lexicon) {
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
              for (key in sortedLexicon) {
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
          if (!auth || !auth.server) {
            window.alert("Please choose a server.");
          } else {
            $rootScope.clickSuccess = true;
            $rootScope.userInfo = {
              "name": auth.user,
              "password": auth.password
              // "withCredentials" : true
            };

            // if (auth.user == "senhorzinho") {
            //   var r = confirm("Hello, developer! Would you like to enter developer mode?");
            //   if (r == true) {
            //     $rootScope.developer = true;
            //   }
            // }
            $rootScope.loading = true;
            if (auth.server == "mcgill") {
              $rootScope.server = "https://prosody.linguistics.mcgill.ca/corpus/";
              $rootScope.serverCode = "mcgill";
            }

            if (auth.server == "testing") {
              $rootScope.server = "https://corpusdev.lingsync.org/";
              $rootScope.serverCode = "testing";
            }

            if (auth.server == "localhost") {
              $rootScope.server = "https://localhost:6984/";
              $rootScope.serverCode = "localhost";
            }
            Data.login(auth.user, auth.password).then(
              function(response) {
                if (response == undefined) {
                  return;
                }

                $rootScope.authenticated = true;
                $scope.username = auth.user;
                var DBs = response.data.roles;
                // Format available databases (pluck final string after
                // underscore) TODO Implement underscore pluck?
                for (i in DBs) {
                  DBs[i] = DBs[i].split("_");
                  DBs[i].pop();
                  if (DBs[i].length > 1) {
                    var newDBString = DBs[i][0];
                    for (var j = 1; j < DBs[i].length; j++) {
                      (function(index) {
                        newDBString = newDBString + "_" + DBs[i][index];
                      })(j);
                    }
                    DBs[i] = newDBString;
                  } else {
                    DBs[i] = DBs[i][0];
                  }
                  if (DBs[i]) {
                    DBs[i] = DBs[i].replace(/[\"]/g, "");
                  }
                }
                DBs.sort();
                var scopeDBs = [];
                for (var i = 0; i < DBs.length; i++) {
                  // Hiding public-firstcorpus, per client request
                  if (DBs[i + 1] != DBs[i] && DBs[i] != "fielddbuser" && DBs[i] != "public-firstcorpus") {
                    // Only show lingllama corpora to lingllama, per client request
                    if (DBs[i].indexOf("lingllama") > -1 && $rootScope.userInfo.name != "lingllama") {
                      continue;
                    }

                    scopeDBs.push(DBs[i]);
                  }
                }
                $scope.corpora = [];

                for (var i = 0; i < scopeDBs.length; i++) {
                  (function(index) {
                    Data.async(scopeDBs[index], "corpus").then(
                      function(response) {
                        var corpus = {};
                        corpus.pouchname = scopeDBs[index];
                        Data.async(scopeDBs[index], response.corpusid)
                          .then(function(responseWithTitle) {
                            corpus.corpustitle = responseWithTitle.title;
                            $scope.corpora.push(corpus);
                          });
                      }, function(error) {
                        // If no corpus file, set corpus title and pouchname
                        // to pouchname
                        var corpus = {};
                        corpus.pouchname = scopeDBs[index];
                        corpus.corpustitle = scopeDBs[index];
                        $scope.corpora.push(corpus);
                      });
                  })(i);
                }
                $rootScope.loading = false;
              });
          }
        };

        $scope.selectDB = function(selectedDB) {
          if (!selectedDB) {
            window.alert("Please select a database.");
          } else {
            selectedDB = JSON.parse(selectedDB);
            $rootScope.DB = selectedDB;
            $scope.loadData();
          }
        };

        $scope.selectSession = function(activeSessionID) {
          $scope.changeActiveSession(activeSessionID);
          // Make sure that following variable is set (ng-model in select won't
          // assign variable until chosen)
          $scope.activeSessionToSwitchTo = activeSessionID;
          $scope.dataentry = true;
          window.location.assign("#/spreadsheet/" + $scope.template);
        };

        $scope.changeActiveSession = function(activeSessionToSwitchTo) {
          if (activeSessionToSwitchTo == 'none' || activeSessionToSwitchTo == undefined) {
            $scope.activeSession = undefined;
            $scope.currentSessionName = "All Sessions";
          } else {
            $scope.activeSession = activeSessionToSwitchTo;
            for (i in $scope.sessions) {
              if ($scope.sessions[i]._id == activeSessionToSwitchTo) {
                var newDate = $scope.sessions[i].dateCreated.replace(/\"/g, "");
                var d = new Date(newDate);
                var goal = "";
                for (j in $scope.sessions[i].sessionFields) {
                  if ($scope.sessions[i].sessionFields[j].label == "goal") {
                    if ($scope.sessions[i].sessionFields[j].mask) {
                      goal = $scope.sessions[i].sessionFields[j].mask.substr(0,
                        20);
                    }
                  }
                }
                $scope.fullCurrentSession = $scope.sessions[i];

                // Set up object to make session editing easier
                var fullCurrentSessionToEdit = {};
                fullCurrentSessionToEdit._id = $scope.fullCurrentSession._id;
                fullCurrentSessionToEdit._rev = $scope.fullCurrentSession._rev;
                for (k in $scope.fullCurrentSession.sessionFields) {
                  fullCurrentSessionToEdit[$scope.fullCurrentSession.sessionFields[k].label] = $scope.fullCurrentSession.sessionFields[k].mask;
                }
                $scope.fullCurrentSessionToEdit = fullCurrentSessionToEdit;
                $scope.currentSessionName = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear() + " " + goal;
                return;
              }
            }
          }
        };

        $scope.editSession = function(editSessionInfo, scopeDataToEdit) {
          var r = confirm("Are you sure you want to edit the session information?\nThis could take a while.");
          if (r == true) {
            $scope.editSessionDetails = false;
            $scope.loading = true;
            var newSession = $scope.fullCurrentSession;
            for (i in newSession.sessionFields) {
              for (key in editSessionInfo) {
                if (newSession.sessionFields[i].label == key) {
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

                  // Update all records tied to this session
                  for (i in scopeDataToEdit) {
                    $scope.loading = true;
                    (function(index) {
                      if (scopeDataToEdit[index].sessionID == newSession._id) {
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
                                  $scope.loading = false;
                                });

                            },
                            function() {
                              window
                                .alert("There was an error accessing the record.\nTry refreshing the data first by clicking ↻.");
                            });
                      }
                    })(i);
                  }
                  $scope.loadData();
                });
          }

        };

        $scope.deleteEmptySession = function(activeSessionID) {
          if ($scope.currentSessionName == "All Sessions") {
            window.alert("You must select a session to delete.");
          } else {
            var r = confirm("Are you sure you want to delete this session permanently?");
            if (r == true) {
              var revID = "";
              for (i in $scope.sessions) {
                if ($scope.sessions[i]._id == activeSessionID) {
                  revID = $scope.sessions[i]._rev;
                  $scope.sessions.splice(i, 1);
                }
              }
              Data
                .removeRecord($rootScope.DB.pouchname, activeSessionID, revID)
                .then(
                  function(response) {
                    $scope.changeActiveSession('none');
                    $rootScope.activeSubMenu = 'none';
                    // $scope.loadData();
                  },
                  function() {
                    window
                      .alert("Error deleting record.\nTry refreshing the data first by clicking ↻.");
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
                for (key in newSession) {
                  for (i in newSessionRecord.sessionFields) {
                    if (newSessionRecord.sessionFields[i].label == "user") {
                      newSessionRecord.sessionFields[i].value = $scope.username;
                      newSessionRecord.sessionFields[i].mask = $scope.username;
                    }
                    if (newSessionRecord.sessionFields[i].label == "dateSEntered") {
                      newSessionRecord.sessionFields[i].value = new Date()
                        .toString();
                      newSessionRecord.sessionFields[i].mask = new Date()
                        .toString();
                    }
                    if (key == newSessionRecord.sessionFields[i].label) {
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
                      for (i in newSessionRecord.sessionFields) {
                        if (newSessionRecord.sessionFields[i].label == "goal") {
                          newSessionRecord.title = newSessionRecord.sessionFields[i].mask
                            .substr(0, 20);
                        }
                      }
                      $scope.sessions.push(newSessionRecord);
                      $scope.dataentry = true;
                      $scope.changeActiveSession(savedRecord.data.id);
                      window.location.assign("#/spreadsheet/" + $scope.template);
                    });
                $rootScope.loading = false;
              });

        };

        $scope.reloadPage = function() {
          if ($scope.saved == "no") {
            window.alert("Please save changes before continuing.");
          } else if ($scope.saved == "saving") {
            window.alert("Changes are currently being saved.\nYou may refresh the data once this operation is done.");
          } else {
            window.location.assign("#/");
            window.location.reload();
          }
        };

        $scope.deleteRecord = function(id, rev) {
          if (!id) {
            window.alert("Please save records before continuing.");
          } else {
            var r = confirm("Are you sure you want to delete this record permanently?");
            if (r == true) {
              Data
                .removeRecord($rootScope.DB.pouchname, id, rev)
                .then(
                  function(response) {
                    $scope.loadData();
                  },
                  function() {
                    window
                      .alert("Error deleting record.\nTry refreshing the data first by clicking ↻.");
                  });
            }
          }
        };

        $scope.createRecord = function(fieldData) {

          // Reset new datum form data
          document.getElementById("form_new_datum_audio-file").reset();
          $scope.newFieldData = {};

          // Set dataRefreshed to false to show user notifications for data that
          // has been created, but not yet updated in scope.

          $scope.dataRefreshed = false;

          if (!fieldData) {
            fieldData = {};
          }

          // Edit record fields with labels from prefs
          for (dataKey in fieldData) {
            for (fieldKey in $scope.fields) {
              if (dataKey == fieldKey) {
                var newDataKey = $scope.fields[fieldKey].label;
                fieldData[newDataKey] = fieldData[dataKey];
                delete fieldData[dataKey];
              }
            }
          }
          // Save tags
          if (fieldData.datumTags) {
            var newDatumFields = fieldData.datumTags.split(",");
            var newDatumFieldsArray = [];
            for (i in newDatumFields) {
              var newDatumTagObject = {};
              // Trim spaces
              var trimmedTag = trim(newDatumFields[i]);
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
            comment.gravatar = "./../user/user_gravatar.png";
            comment.timestampModified = Date.now();
            fieldData.comments = [];
            fieldData.comments.push(comment);
          }

          fieldData.dateEntered = JSON.parse(JSON.stringify(new Date()));
          fieldData.dateModified = JSON.parse(JSON.stringify(new Date()));
          fieldData.lastModifiedBy = $rootScope.userInfo.name;
          fieldData.sessionID = $scope.activeSession;
          fieldData.saved = "no";
          if (fieldData.attachments) {
            fieldData.hasAudio = true;
          }
          $scope.data.push(fieldData);
          $scope.newFieldDatahasAudio = false;
          $scope.createNewButtonClass = "btn btn-primary";
          $scope.saved = "no";
        };

        $scope.markAsEdited = function(fieldData, datum) {
          var utterance = "Datum";
          for (key in fieldData) {
            if (key == "datumTags" && typeof fieldData.datumTags === 'string') {
              var newDatumFields = fieldData.datumTags.split(",");
              var newDatumFieldsArray = [];
              for (i in newDatumFields) {
                var newDatumTagObject = {};
                // Trim spaces
                var trimmedTag = trim(newDatumFields[i]);
                newDatumTagObject.tag = trimmedTag;
                newDatumFieldsArray.push(newDatumTagObject);
              }
              datum.datumTags = newDatumFieldsArray;
            } else {
              datum[$scope.fields[key].label] = fieldData[key];
            }

            if (key == "utterance" && fieldData[key].value != undefined) {
              utterance = fieldData[key].value;
            }
          }
          datum.saved = "no";
          datum.dateModified = JSON.parse(JSON.stringify(new Date()));
          datum.lastModifiedBy = $rootScope.userInfo.name;
          $scope.saved = "no";
          $scope.currentPage = 0;
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
        };

        $rootScope.addComment = function(datum) {
          var newComment = prompt("Enter new comment.");
          if (newComment == "" || newComment == null) {
            return;
          }
          var comment = {};
          comment.text = newComment;
          comment.username = $rootScope.userInfo.name;
          comment.timestamp = Date.now();
          comment.gravatar = "./../user/user_gravatar.png";
          comment.timestampModified = Date.now();
          if (datum.comments == null) {
            datum.comments = [];
          }
          datum.comments.push(comment);
          datum.saved = "no";
          datum.dateModified = JSON.parse(JSON.stringify(new Date()));
          datum.lastModifiedBy = $rootScope.userInfo.name;
          $scope.currentPage = 0;

          var indirectObjectString = "on <a href='#data/" + datum.id + "'><i class='icon-pushpin'></i> " + $rootScope.DB.corpustitle + "</a>";
          // Update activity feed
          $scope.addActivity([{
            verb: "commented",
            verbicon: "icon-comment",
            directobjecticon: "",
            directobject: "'" + comment.text + "'",
            indirectobject: indirectObjectString,
            teamOrPersonal: "personal"
          }, {
            verb: "commented",
            verbicon: "icon-comment",
            directobjecticon: "",
            directobject: "'" + comment.text + "'",
            indirectobject: indirectObjectString,
            teamOrPersonal: "team"
          }]);

        };

        $scope.deleteComment = function(comment, datum) {
          if (comment.username != $rootScope.userInfo.name) {
            window.alert("You may only delete comments created by you.");
            return;
          }
          var verifyCommentDelete = confirm("Are you sure you want to delete the comment '" + comment.text + "'?");
          if (verifyCommentDelete == true) {
            for (i in datum.comments) {
              if (datum.comments[i] == comment) {
                datum.comments.splice(i, 1);
              }
            }
          }
        };

        $scope.saveChanges = function() {
          for (i in $scope.data) {
            (function(index) {
              if ($scope.data[index].saved && $scope.data[index].saved == "no") {

                $scope.saved = "saving";

                // Save edited record
                if ($scope.data[index].id) {
                  console.log("Saving edited record: " + $scope.data[index].id);
                  var fieldData = $scope.data[index];
                  var docID = fieldData.id;
                  Data
                    .async($rootScope.DB.pouchname, docID)
                    .then(
                      function(editedRecord) {
                        // Populate new record with fields from
                        // scope
                        for (var i = 0; i < editedRecord.datumFields.length; i++) {
                          for (key in fieldData) {
                            if (editedRecord.datumFields[i].label == key) {
                              editedRecord.datumFields[i].mask = fieldData[key];
                              editedRecord.datumFields[i].value = fieldData[key];
                            }
                          }
                        }
                        editedRecord.dateModified = JSON.parse(JSON
                          .stringify(new Date()));
                        editedRecord.lastModifiedBy = $rootScope.userInfo.name;

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
                              $scope.data[index].saved = "yes";
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

                  var fieldData = $scope.data[index];
                  Data
                    .blankTemplate()
                    .then(
                      function(newRecord) {
                        // Populate new record with fields from
                        // scope
                        for (var j = 0; j < newRecord.datumFields.length; j++) {
                          for (key in fieldData) {
                            if (newRecord.datumFields[j].label == key) {
                              newRecord.datumFields[j].mask = fieldData[key];
                            }
                          }
                        }
                        newRecord.dateModified = JSON.parse(JSON
                          .stringify(new Date()));
                        newRecord.lastModifiedBy = $rootScope.userInfo.name;

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
                          newRecord.attachmentInfo = fieldData.attachmentInfo;
                        }

                        Data
                          .saveNew($rootScope.DB.pouchname, newRecord)
                          .then(
                            function(response) {
                              // Check to see if newly created record is still in scope and update with response info;
                              // user may have refreshed data before save was complete
                              if ($scope.data[index]) {
                                $scope.data[index].id = response.data.id;
                                $scope.data[index].rev = response.data.rev;
                                $scope.data[index].saved = "yes";
                              }
                              console.log("Saved new record: " + $scope.data[index].id);

                              // Update activity feed with newly created
                              // records and couch ids (must be done
                              // here to have access to couch id)
                              var utterance = "Datum";
                              if ($scope.data[index].utterance && $scope.data[index].utterance != "") {
                                utterance = $scope.data[index].utterance;
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
            if ($scope.saved == "no") {
              $scope.saveChanges();
            } else {
              // TODO FIND BETTER WAY TO KEEP SESSION ALIVE;
              if ($rootScope.userInfo) {
                Data.login($rootScope.userInfo.name,
                  $rootScope.userInfo.password);
              }
            }
          }, 300000);

        $scope.selectRow = function(datum) {
          if ($scope.searching != true) {
            $scope.selected = datum;
          }
        };

        $scope.runSearch = function(searchTerm) {
          // Create object from fields displayed in scope to later be able to
          // notify user if search result is from a hidden field
          var fieldsInScope = {};
          for (key in $scope.fields) {
            fieldsInScope[$scope.fields[key].label] = true;
          }
          if ($scope.template == "template2") {
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
          searchTerm = searchTerm.toString().toLowerCase();
          var newScopeData = [];
          if (!$scope.activeSession) {
            for (i in $scope.data) {
              for (key in $scope.data[i]) {
                if ($scope.data[i][key]) {
                  // Limit search to visible data
                  if (fieldsInScope[key] == true) {
                    if (key == "datumTags") {
                      var tagString = JSON.stringify($scope.data[i].datumTags);
                      tagString = tagString.toString().toLowerCase();
                      if (tagString.indexOf(searchTerm) > -1) {
                        newScopeData.push($scope.data[i]);
                        break;
                      }
                    } else if (key == "comments") {
                      for (j in $scope.data[i].comments) {
                        for (commentKey in $scope.data[i].comments[j]) {
                          if ($scope.data[i].comments[j][commentKey].toString()
                            .indexOf(searchTerm) > -1) {
                            newScopeData.push($scope.data[i]);
                            break;
                          }
                        }
                      }
                    } else {
                      var dataString = $scope.data[i][key].toString()
                        .toLowerCase();
                      if (dataString.indexOf(searchTerm) > -1) {
                        newScopeData.push($scope.data[i]);
                        break;
                      }
                    }
                  }
                }
              }
            }
          } else {
            for (i in $scope.data) {
              if ($scope.data[i].sessionID == $scope.activeSession) {
                for (key in $scope.data[i]) {
                  if ($scope.data[i][key]) {
                    // Limit search to visible data
                    if (fieldsInScope[key] == true) {
                      if (key == "datumTags") {
                        var tagString = JSON.stringify($scope.data[i].datumTags);
                        tagString = tagString.toString().toLowerCase();
                        if (tagString.indexOf(searchTerm) > -1) {
                          newScopeData.push($scope.data[i]);
                          break;
                        }
                      } else if (key == "comments") {
                        for (j in $scope.data[i].comments) {
                          for (commentKey in $scope.data[i].comments[j]) {
                            if ($scope.data[i].comments[j][commentKey].toString()
                              .indexOf(searchTerm) > -1) {
                              newScopeData.push($scope.data[i]);
                              break;
                            }
                          }
                        }
                      } else {
                        var dataString = $scope.data[i][key].toString()
                          .toLowerCase();
                        if (dataString.indexOf(searchTerm) > -1) {
                          newScopeData.push($scope.data[i]);
                          break;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          if (newScopeData.length > 0) {
            $scope.data = newScopeData;
          } else {
            window.alert("No records matched your search.");
          }
        };

        $scope.selectAll = function() {
          if (!$scope.activeSession) {
            for (i in $scope.data) {
              $scope.data[i].checked = true;
            }
          } else {
            for (i in $scope.data) {
              if ($scope.data[i].sessionID == $scope.activeSession) {
                $scope.data[i].checked = true;
              }
            }
          }
        };

        $scope.exportResults = function() {
          $scope.open();
          var results = $filter('filter')($scope.data, {
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
                    template.timestamp = Date.now();
                    template.user.authUrl = $rootScope.server[0];

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
                  if ($scope.activities[index].teamOrPersonal == "team") {
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
          if (!newUserInfo || !newUserInfo.serverCode) {
            window.alert("Please select a server.");
            return;
          }
          var dataToPost = {};
          dataToPost.email = trim(newUserInfo.email);
          dataToPost.username = trim(newUserInfo.username.toLowerCase());
          dataToPost.password = trim(newUserInfo.password);

          if (newUserInfo.serverCode == "localhost") {
            dataToPost.authUrl = "https://localhost:3183";
          } else {
            dataToPost.authUrl = "https://authdev.lingsync.org";
          }
          dataToPost.appVersionWhenCreated = "ss1.62.2";
          // dataToPost.appVersionWhenCreated = this.appVersion;

          dataToPost.serverCode = newUserInfo.serverCode;

          if (dataToPost.username != "" && (dataToPost.password == trim(newUserInfo.confirmPassword)) && dataToPost.email != "") {
            // Create user
            Data.register(dataToPost);
          } else {
            window.alert("Please verify user information.");
          }
        };

        $scope.createNewCorpus = function(newCorpusInfo) {
          var dataToPost = {};
          dataToPost.username = trim($rootScope.userInfo.name);
          dataToPost.password = trim($rootScope.userInfo.password);

          if ($rootScope.serverCode == "localhost") {
            dataToPost.authUrl = "https://localhost:3183";
          } else {
            dataToPost.authUrl = "https://authdev.lingsync.org";
          }

          dataToPost.serverCode = $rootScope.serverCode;
          dataToPost.newCorpusName = newCorpusInfo.newCorpusName;

          if (dataToPost.newCorpusName != "") {
            // Create new corpus
            Data.createcorpus(dataToPost).then(function(response) {
              // Login user again to get most up-to-date corpus info
              var auth = {};
              auth.user = $rootScope.userInfo.name;
              auth.password = $rootScope.userInfo.password;
              auth.server = $rootScope.server;
              $scope.loginUser(auth);

            });
          } else {
            window.alert("Please verify corpus name.");
          }
        };

        $scope.loadUsersAndRoles = function() {
          // Get all users and roles (for this corpus) from server

          dataToPost = {};

          dataToPost.username = $rootScope.userInfo.name;
          dataToPost.password = $rootScope.userInfo.password;
          dataToPost.pouchname = $rootScope.DB.pouchname;
          dataToPost.serverCode = $rootScope.serverCode;

          if ($rootScope.serverCode == "localhost") {
            dataToPost.authUrl = "https://localhost:3183";
          } else {
            dataToPost.authUrl = "https://authdev.lingsync.org";
          }

          Data.getallusers(dataToPost).then(function(users) {
            $scope.users = users;
          });

          // Get privileges for logged in user
          Data.async("_users", "org.couchdb.user:" + $scope.username)
            .then(
              function(response) {
                if (response.roles.indexOf($rootScope.DB.pouchname + "_admin") > -1) {
                  $rootScope.admin = true;
                } else {
                  $rootScope.admin = false;
                }
              });
        };

        $scope.updateUserRoles = function(newUserRoles) {
          if (!newUserRoles || !newUserRoles.usernameToModify) {
            window.alert("Please select a username.");
            return;
          }

          // if (!newUserRoles.admin && !newUserRoles.read_write && !newUserRoles.reader && !newUserRoles.writer) {
          if (!newUserRoles.role) {
            window.alert("You haven't selected any roles to add to " + newUserRoles.usernameToModify + "!\nPlease select at least one role.");
            return;
          }

          if (newUserRoles.role == "admin") {
            newUserRoles.admin = true;
            newUserRoles.reader = true;
            newUserRoles.writer = true;
          }
          if (newUserRoles.role == "read_write") {
            newUserRoles.admin = false;
            newUserRoles.reader = true;
            newUserRoles.writer = true;
          }
          if (newUserRoles.role == "read_only") {
            newUserRoles.admin = false;
            newUserRoles.reader = true;
            newUserRoles.writer = false;
          }
          if (newUserRoles.role == "write_only") {
            newUserRoles.admin = false;
            newUserRoles.reader = false;
            newUserRoles.writer = true;
          }

          newUserRoles.pouchname = $rootScope.DB.pouchname;

          var dataToPost = {};
          dataToPost.username = trim($rootScope.userInfo.name);
          dataToPost.password = trim($rootScope.userInfo.password);

          if ($rootScope.serverCode == "localhost") {
            dataToPost.authUrl = "https://localhost:3183";
          } else {
            dataToPost.authUrl = "https://authdev.lingsync.org";
          }

          dataToPost.serverCode = $rootScope.serverCode;
          dataToPost.userRoleInfo = newUserRoles;

          Data.updateroles(dataToPost).then(function(response) {
            document.getElementById("userToModifyInput").value = "";
            $scope.loadUsersAndRoles();
          });
        };

        $scope.removeUserFromCorpus = function(userid) {
          // Prevent an admin from removing him/herself from a corpus; This
          // helps to avoid a situation in which there is no admin for a
          // corpus
          if (userid == $scope.username) {
            window
              .alert("You cannot remove yourself from a corpus.\nOnly another server admin can remove you.");
            return;
          }

          var r = confirm("Are you sure you want to remove " + userid + " from this corpus?\nNOTE: This will remove ALL user roles for " + userid + ". However, you may add this user again with new permissions.");
          if (r == true) {

            var dataToPost = {};
            dataToPost.username = trim($rootScope.userInfo.name);
            dataToPost.password = trim($rootScope.userInfo.password);

            if ($rootScope.serverCode == "localhost") {
              dataToPost.authUrl = "https://localhost:3183";
            } else {
              dataToPost.authUrl = "https://authdev.lingsync.org";
            }

            dataToPost.serverCode = $rootScope.serverCode;
            dataToPost.userRoleInfo = {};
            dataToPost.userRoleInfo.usernameToModify = userid;
            dataToPost.userRoleInfo.pouchname = $rootScope.DB.pouchname;
            dataToPost.userRoleInfo.removeUser = true;

            Data.updateroles(dataToPost).then(function(response) {
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
          if (tagString == "") {
            return "Tags";
          }
          return tagString;
        };

        // Paginate data tables

        $scope.numberOfResultPages = function(numberOfRecords) {
          var numberOfPages = Math
            .ceil(numberOfRecords / $scope.resultSize);
          return numberOfPages;
        };

        function trim(s) {
          s = s.replace(/(^\s*)|(\s*$)/gi, "");
          s = s.replace(/[ ]{2,}/gi, " ");
          s = s.replace(/\n /, "\n");
          return s;
        }

        document.getElementById("hideOnLoad").style.visibility = "visible";

        $scope.testFunction = function() {
          console.log($scope.currentPage);
        };

        $scope.pageForward = function() {
          $scope.currentPage = $scope.currentPage + 1;
        };

        $scope.pageBackward = function() {
          $scope.currentPage = $scope.currentPage - 1;
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
          $scope.recordingIcon = "speaker_icon.png";
          console.log('Audio Rejected!', e);
          window.alert("Unable to record audio.");
        };

        var onSuccess = function(s) {
          var context = new webkitAudioContext();
          var mediaStreamSource = context.createMediaStreamSource(s);
          recorder = new Recorder(mediaStreamSource);
          recorder.record();
        };

        window.URL = window.URL || window.webkitURL;
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia || navigator.msGetUserMedia;

        var recorder;

        $scope.startStopRecording = function(datum) {
          if ($scope.recordingStatus == "Record") {
            startRecording();
          } else {
            stopRecording(datum);
          }
        };

        startRecording = function() {
          if (navigator.getUserMedia) {
            $scope.recordingButtonClass = "btn btn-danger";
            $scope.recordingStatus = "Recording";
            $scope.recordingIcon = "recording_icon.gif";
            navigator.getUserMedia({
              audio: true
            }, onSuccess, onFail);
          } else {
            console.log('navigator.getUserMedia not present');
          }
        };

        stopRecording = function(datum) {
          recorder.stop();
          $scope.recordingStatus = "Record";
          $scope.recordingButtonClass = "btn btn-success";
          $scope.recordingIcon = "speaker_icon.png";
          $scope.processingAudio = true;
          recorder.exportWAV(function(s) {
            $scope.uploadFile(datum, s);
          });
        };

        $scope.uploadFile = function(datum, file) {

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
          var filePrefix;
          // Test to see if this is a new file
          if (!datum || !datum.id) {
            filePrefix = "new_datum";
          } else {
            filePrefix = datum.id;
          }

          // Create attachments

          var newAttachments = {};

          // If a new file, set up attachments structure, to be saved later
          if (!datum || !datum.id) {
            if (!datum) {
              datum = {};
            }

            datum._attachments = {};
            datum.attachments = [];
            datum.attachmentInfo = {};
          }

          var numberOfFiles;
          if (file) {
            numberOfFiles = 1;
          } else {
            numberOfFiles = document.getElementById(filePrefix + "_audio-file").files.length;
          }

          // Check to see if user has clicked on upload without recording or uploading files
          if (numberOfFiles == 0 || numberOfFiles == null) {
            window.alert("Please record or select audio to upload.");
            $scope.processingAudio = false;
            return;
          }

          for (var i = 0; i < numberOfFiles; i++) {
            (function(index) {

              blobToBase64(file || document.getElementById(filePrefix + "_audio-file").files[index], function(x) {
                base64File = x;
                var filename;
                var description;
                var content_type;
                if (file) {
                  filename = Date.now() + ".wav";
                  content_type = "audio\/wav";
                  description = "Add a description";
                } else {
                  // Test to see if this is a new file
                  if (!datum || !datum.id) {
                    var fileExt = document.getElementById("new_datum_audio-file").files[index].type.split("\/").pop();
                  } else {
                    var fileExt = document.getElementById(datum.id + "_audio-file").files[index].type.split("\/").pop();
                  }
                  if (fileExt != ("mp3" || "mpeg" || "wav" || "ogg")) {
                    window.alert("You can only upload audio files with extensions '.mp3', '.mpeg', '.wav', or '.ogg'.");
                    return;
                  }
                  filename = Date.now() + "" + index + "." + fileExt; // appending index in case of super-rapid processing on multi-file upload, to avoid duplicate filenames
                  content_type = "audio\/" + fileExt;
                  description = document.getElementById(filePrefix + "_audio-file").files[index].name;
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

                  datum._attachments[filename] = newAttachments[filename];
                  datum.attachments.push(newScopeAttachment);
                  datum.attachmentInfo[filename] = {
                    "description": newAttachments[filename].description
                  };
                }
              });
            })(i);
          }

          // Stop here if new datum record (i.e. do not upload yet)
          if (!datum || !datum.id) {

            // Force digest after recording audio
            if (file) {
              $scope.$apply(function() {
                $scope.createNewButtonClass = "btn btn-danger";
                $scope.newFieldDatahasAudio = true;
                $scope.processingAudio = false;
              });
            } else {
              $scope.createNewButtonClass = "btn btn-danger";
              $scope.newFieldDatahasAudio = true;
              $scope.processingAudio = false;
            }

            return;
          }

          // Save new attachments for existing record
          Data.async($rootScope.DB.pouchname, datum.id).then(function(originalDoc) {
            var rev = originalDoc._rev;

            if (originalDoc._attachments == undefined) {
              originalDoc._attachments = {};
            }

            if (originalDoc.attachmentInfo == undefined) {
              originalDoc.attachmentInfo = {};
            }

            for (key in newAttachments) {
              originalDoc._attachments[key] = newAttachments[key];
              originalDoc.attachmentInfo[key] = {
                "description": newAttachments[key].description
              };
            }

            Data.saveEditedRecord($rootScope.DB.pouchname, datum.id, originalDoc, rev).then(function(response) {
              console.log("Successfully uploaded attachment.");


              // Update scope attachments
              if (!datum.attachments) {
                datum.attachments = [];
              }

              for (key in newAttachments) {
                var newScopeAttachment = {
                  "filename": key,
                  "description": newAttachments[key].description
                };
                datum.attachments.push(newScopeAttachment);
              }

              // Reset file input field
              document.getElementById("form_" + filePrefix + "_audio-file").reset();

              datum.hasAudio = true;
              $scope.processingAudio = false;
            });
          });
        };

        $scope.saveAttachmentInfo = function(attachment, datumID) {
          Data.async($rootScope.DB.pouchname, datumID).then(function(originalDoc) {
            var rev = originalDoc._rev;
            originalDoc.attachmentInfo[attachment.filename].description = attachment.description;
            Data.saveEditedRecord($rootScope.DB.pouchname, datumID, originalDoc, rev).then(function(response) {
              window.alert("Successfully updated description for " + attachment.filename);
            });
          });
        };

        $scope.deleteAttachmentFromCorpus = function(datum, filename) {
          var r = confirm("Are you sure you want to delete the file " + filename + "?");
          if (r == true) {
            var record = datum.id + "/" + filename;
            Data.async($rootScope.DB.pouchname, datum.id).then(function(originalRecord) {
              Data.removeRecord($rootScope.DB.pouchname, record, originalRecord._rev).then(function(response) {
                for (i in datum.attachments) {
                  if (datum.attachments[i].filename == filename) {
                    datum.attachments[i].description = "Deleted";
                    datum.attachments.splice(i, 1);
                  }
                }

                Data.async($rootScope.DB.pouchname, datum.id).then(function(record) {
                  // Delete attachment info for deleted record
                  for (key in record.attachmentInfo) {
                    if (key == filename) {
                      delete record.attachmentInfo[key];
                    }
                  }
                  Data.saveEditedRecord($rootScope.DB.pouchname, datum.id, record, record._rev).then(function(response) {
                    if (datum.attachments.length == 0) {
                      datum.hasAudio = false;
                    }
                    console.log("File successfully deleted.");
                  });
                });
              });
            });
          }
        };

        $scope.triggerExpandCollapse = function() {
          if ($scope.expandCollapse == true) {
            $scope.expandCollapse = false;
          } else {
            $scope.expandCollapse = true;
          }
        };

        $scope.getExpandCollapse = function() {
          if ($scope.expandCollapse == true) {
            return "img/collapse.png";
          } else {
            return "img/expand.png";
          }
        };

        $scope.getSavedState = function() {
          if ($scope.saved == "yes") {
            $scope.savedStateButtonClass = "btn btn-success";
            return "Saved";
          } else if ($scope.saved == "no") {
            $scope.savedStateButtonClass = "btn btn-danger";
            return "Save";
          } else {
            $scope.savedStateButtonClass = "pulsing";
            return "Saving";
          }
        };

      };
    SpreadsheetStyleDataEntryController.$inject = ['$scope', '$rootScope',
      '$resource', '$filter', 'Data'
    ];
    return SpreadsheetStyleDataEntryController;
  });