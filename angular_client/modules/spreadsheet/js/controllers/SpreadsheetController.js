console.log("Loading the SpreadsheetStyleDataEntryController.");

'use strict';
define(
    [ "angular" ],
    function(angular) {
      var SpreadsheetStyleDataEntryController = /**
                                           * @param $scope
                                           * @param $rootScope
                                           * @param $resource
                                           * @param Data
                                           * @returns {SpreadsheetStyleDataEntryController}
                                           */
      function($scope, $rootScope, $resource, $filter, Data) {
       
        /* Modal controller TODO could move somewhere wher the search is? */
        $scope.open = function () {
           $scope.shouldBeOpen = true;
         };

         $scope.close = function () {
           $scope.shouldBeOpen = false;
         };

         $scope.opts = {
           backdropFade: true,
           dialogFade:true
         };



        //TEST FOR CHROME BROWSER
        var is_chrome = window.chrome;
        if (!is_chrome) {
         $scope.not_chrome = true; 
        }
        
        var Preferences = localStorage.getItem('Preferences');
        if (Preferences == undefined) {
          Preferences = {
            "userTemplate" : "template2",
            "resultSize" : 5,
            "availableFields" : {
              "judgement" : {
                "label" : "judgement",
                "title" : "Judgement"
              },
              "utterance" : {
                "label" : "utterance",
                "title" : "Utterance"
              },
              "morphemes" : {
                "label" : "morphemes",
                "title" : "Morphemes"
              },
              "gloss" : {
                "label" : "gloss",
                "title" : "Gloss"
              },
              "translation" : {
                "label" : "translation",
                "title" : "Translation"
              },
              "notes" : {
                "label" : "notes",
                "title" : "Notes"
              },
              "refs" : {
                "label" : "refs",
                "title" : "References"
              },
              "goal" : {
                "label" : "goal",
                "title" : "Goal"
              },
              "consultants" : {
                "label" : "consultants",
                "title" : "Consultants"
              },
              "dialect" : {
                "label" : "dialect",
                "title" : "Dialect"
              },
              "language" : {
                "label" : "language",
                "title" : "language"
              },
              "dateElicited" : {
                "label" : "dateElicited",
                "title" : "Date Elicited"
              },
              "user" : {
                "label" : "user",
                "title" : "User"
              },
              "dateSEntered" : {
                "label" : "dateSEntered",
                "title" : "Date entered"
              },
              "tags" : {
                "label" : "tags",
                "title" : "tags"
              },
              "validationStatus" : {
                "label" : "validationStatus",
                "title" : "validationStatus"
              },
              "syntacticCategory" : {
                "label" : "syntacticCategory",
                "title" : "syntacticCategory"
              }
            },
            "template1" : {
              "field1" : {
                "label" : "utterance",
                "title" : "Utterance"
              },
              "field2" : {
                "label" : "morphemes",
                "title" : "Morphemes"
              },
              "field3" : {
                "label" : "gloss",
                "title" : "Gloss"
              },
              "field4" : {
                "label" : "translation",
                "title" : "Translation"
              }
            },
            "template2" : {
              "field1" : {
                "label" : "utterance",
                "title" : "Utterance"
              },
              "field2" : {
                "label" : "morphemes",
                "title" : "Morphemes"
              },
              "field3" : {
                "label" : "gloss",
                "title" : "Gloss"
              },
              "field4" : {
                "label" : "translation",
                "title" : "Translation"
              },
              "field5" : {
                "label" : "notes",
                "title" : "Notes"
              },
              "field6" : {
                "label" : "judgement",
                "title" : "Judgement"
              },
              "field7" : {
                "label" : "",
                "title" : ""
              },
              "field8" : {
                "label" : "",
                "title" : ""
              }
            }
          };
          localStorage.setItem('Preferences', JSON
              .stringify(Preferences));
          console.log("Setting default preferences in localStorage.");
        } else {
          console.log("Loading Preferences from localStorage.");
          Preferences = JSON.parse(Preferences);
        }

        // Set scope variables
        $rootScope.template = Preferences.userTemplate;
        $rootScope.fields = Preferences[Preferences.userTemplate];
        $scope.scopePreferences = Preferences;
        $scope.orderProp = "dateModified";
        $scope.reverse = true;
        $scope.selected = 'newEntry';
        $rootScope.authenticated = false;
        $scope.developer = false;
        $scope.dataentry = false;
        $scope.searching = false;
        $rootScope.activeSubMenu = 'none';
        $scope.activeSession = undefined;
        $scope.currentSessionName = "All Sessions";
        $scope.showCreateSessionDiv = false;
        $scope.editSessionDetails = false;
        $scope.currentDate = new Date().toDateString();

        // Set data size for pagination
        $rootScope.resultSize = Preferences.resultSize;

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
          } else {

            if ($scope.searching == true) {
              $scope.searching = false;
              $scope.loadData();
            }

            if (itemToDisplay == "settings") {
              $scope.dataentry = false;
              $scope.changeActiveSubMenu('none');
              window.location.assign("#/settings");
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
            } else if (itemToDisplay == "reload") {
              $scope.searchTerm = '';
              $scope.searchHistory = null;
              $scope.search = false;
              $scope.changeActiveSubMenu('none');
              window.location.assign("#/spreadsheet/" + $scope.template);
              $scope.loadData();
            } else {
              $scope.changeActiveSubMenu(itemToDisplay);
            }
          }
        };

        // Fetch data from server and put into template scope
        $scope.loadData = function() {
          $rootScope.loading = true;
          Data
              .async($rootScope.DB)
              .then(
                  function(dataFromServer) {
                    var scopeData = [];
                    var scopeSessions = [];
                    for ( var i = 0; i < dataFromServer.length; i++) {
                      // Create array of sessions
                      var addThisSession = true;
                      for ( var m in scopeSessions) {
                        if (dataFromServer[i].value.session._id == scopeSessions[m]._id) {
                          addThisSession = false;
                          continue;
                        }
                      }
                      if (addThisSession == true) {
                        scopeSessions.push(dataFromServer[i].value.session);
                      }
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
                        } else {
                          newDatumFromServer.dateModified = "TODO";
                        }
                        newDatumFromServer.datumTags = dataFromServer[i].value.datumTags;
                        newDatumFromServer.sessionID = dataFromServer[i].value.session._id;
                        scopeData.push(newDatumFromServer);
                      }
                    }
                    $scope.data = scopeData;

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
                    $scope.saved = "yes";
                    $rootScope.loading = false;
                  });
        };
        $scope.loginUser = function(auth) {
          if (!auth || !auth.server) {
            window.alert("Please choose a server.");
          } else {

            $rootScope.userInfo = {
              "name" : auth.user,
              "password" : auth.password
            // "withCredentials" : true
            };

            if (auth.user == "senhorzinho" || auth.user == "gina") {
              var r = confirm("Hello, developer! Would you like to enter developer mode?");
              if (r == true) {
                $scope.developer = true;
              }
            }
            $rootScope.loading = true;
            $rootScope.server = auth.server;
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
                      for ( var j = 1; j < DBs[i].length; j++) {
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
                  for ( var i = 0; i < DBs.length; i++) {
                    if (DBs[i + 1] != DBs[i] && DBs[i] != "fielddbuser") {
                      scopeDBs.push(DBs[i]);
                    }
                  }
                  $rootScope.availableDBs = scopeDBs;
                  $rootScope.loading = false;
                });
          }
        };
        $scope.selectDB = function(selectedDB) {
          if (!selectedDB) {
            window.alert("Please select a database.");
          } else {
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
          if (activeSessionToSwitchTo == 'none'
              || activeSessionToSwitchTo == undefined) {
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
                $scope.currentSessionName = d.getDate() + "-"
                    + (d.getMonth() + 1) + "-" + d.getFullYear() + " " + goal;
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
            Data.saveEditedRecord($rootScope.DB, newSession._id,
                newSession).then(function() {
            });

            // Update all records tied to this session
            for (i in scopeDataToEdit) {
              $scope.loading = true;
              (function(index) {
                if (scopeDataToEdit[index].sessionID == newSession._id) {
                  Data
                      .async($rootScope.DB, scopeDataToEdit[index].id)
                      .then(
                          function(editedRecord) {
                            // Edit record with updated session info and save

                            editedRecord.session = newSession;
                            Data.saveEditedRecord($rootScope.DB,
                                scopeDataToEdit[index].id, editedRecord,
                                editedRecord._rev).then(function() {
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
                  .removeRecord($rootScope.DB, activeSessionID, revID)
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
                    newSessionRecord.pouchname = $rootScope.DB[0];
                    newSessionRecord.dateCreated = new Date().toString();
                    newSessionRecord.dateModified = new Date().toString();
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
                        .saveNew($rootScope.DB, newSessionRecord)
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
                              console.log(newSessionRecord);
                              $scope.sessions.push(newSessionRecord);
                              $scope.dataentry = true;
                              $scope.changeActiveSession(savedRecord.data.id);
                              window.location.assign("#/spreadsheet/"
                                  + $scope.template);
                            });
                    $rootScope.loading = false;
                  });
        };

        $scope.reloadPage = function() {
          if ($scope.saved == "no") {
            window.alert("Please save changes before continuing.");
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
                  .removeRecord($rootScope.DB, id, rev)
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

          fieldData.dateEntered = new Date().toString();
          fieldData.dateModified = new Date().toString();
          fieldData.sessionID = $scope.activeSession;
          fieldData.saved = "no";
          $scope.data.push(fieldData);
          $scope.saved = "no";
        };

        $scope.markAsEdited = function(fieldData, datum) {
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
          }
          datum.saved = "no";
          datum.dateModified = new Date().toString();
          $scope.saved = "no";
        };

        $scope.saveChanges = function() {
          for (i in $scope.data) {
            (function(index) {
              if ($scope.data[index].saved && $scope.data[index].saved == "no") {

                // Save edited record
                if ($scope.data[index].id) {
                  console.log("Saving edited record: " + $scope.data[index].id);
                  var fieldData = $scope.data[index];
                  var docID = fieldData.id;
                  Data
                      .async($rootScope.DB, docID)
                      .then(
                          function(editedRecord) {
                            // Populate new record with fields from
                            // scope
                            for ( var i = 0; i < editedRecord.datumFields.length; i++) {
                              for (key in fieldData) {
                                if (editedRecord.datumFields[i].label == key) {
                                  editedRecord.datumFields[i].mask = fieldData[key];
                                  editedRecord.datumFields[i].value = fieldData[key];
                                }
                              }
                            }
                            editedRecord.dateModified = new Date();

                            // Save tags
                            if (fieldData.datumTags) {
                              editedRecord.datumTags = fieldData.datumTags;
                            }

                            // Save edited record and refresh data
                            // in scope
                            Data
                                .saveEditedRecord($rootScope.DB, docID,
                                    editedRecord)
                                .then(
                                    function(response) {
                                      $scope.data[index].saved = "yes";
                                    },
                                    function() {
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
                            for ( var i = 0; i < newRecord.datumFields.length; i++) {
                              for (key in fieldData) {
                                if (newRecord.datumFields[i].label == key) {
                                  newRecord.datumFields[i].mask = fieldData[key];
                                }
                              }
                            }
                            newRecord.dateModified = new Date().toString();
                            // Save session
                            newRecord.session = $scope.fullCurrentSession;
                            // Save tags
                            if (fieldData.datumTags) {
                              newRecord.datumTags = fieldData.datumTags;
                            }

                            Data
                                .saveNew($rootScope.DB, newRecord)
                                .then(
                                    function(response) {
                                      $scope.data[index].id = response.data.id;
                                      $scope.data[index].rev = response.data.rev;
                                      $scope.data[index].saved = "yes";
                                      console.log("Saved new record: "
                                          + $scope.data[index].id);
                                    },
                                    function() {
                                      window
                                          .alert("There was an error saving the record. Please try again.");
                                    });
                          });
                }
              }
            })(i);
          }
          $scope.saved = "yes";
        };

        // Set auto-save interval for 5 minutes
        var autoSave = window.setInterval(function() {
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
          if ($scope.searchHistory) {
            $scope.searchHistory = $scope.searchHistory + " > " + searchTerm;
          } else {
            $scope.searchHistory = searchTerm;
          }
          searchTerm = searchTerm.toLowerCase();
          var newScopeData = [];
          if (!$scope.activeSession) {
            for (i in $scope.data) {
              for (key in $scope.data[i]) {
                if (key == "datumTags") {
                  var tagString = JSON.stringify($scope.data[i].datumTags);
                  tagString = tagString.toLowerCase();
                  if (tagString.indexOf(searchTerm) > -1) {
                    newScopeData.push($scope.data[i]);
                    break;
                  }
                } else if ($scope.data[i][key]) {
                  console.log($scope.data[i][key]);
                  var dataString = $scope.data[i][key].toLowerCase();
                  if (dataString.indexOf(searchTerm) > -1) {
                    newScopeData.push($scope.data[i]);
                    break;
                  }
                }
              }
            }
          } else {
            for (i in $scope.data) {
              if ($scope.data[i].sessionID == $scope.activeSession) {
                for (key in $scope.data[i]) {
                  if (key == "datumTags") {
                    var tagString = JSON.stringify($scope.data[i].datumTags);
                    tagString = tagString.toLowerCase();
                    if (tagString.indexOf(searchTerm) > -1) {
                      newScopeData.push($scope.data[i]);
                      break;
                    }
                  } else if ($scope.data[i][key]) {
                    var dataString = $scope.data[i][key].toLowerCase();
                    if (dataString.indexOf(searchTerm) > -1) {
                      newScopeData.push($scope.data[i]);
                      break;
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
            checked : true
          });
          if (results.length > 0) {
            $scope.resultsMessage = results.length + " Record(s):";
            $scope.results = results;
          } else {
            $scope.resultsMessage = "Please select records to export.";
          }
        };

        $scope.commaList = function(tags) {
          var tagString = "";
          for ( var i = 0; i < tags.length; i++) {
            if (i < (tags.length - 1)) {
              if (tags[i].tag) {
                tagString = tagString + tags[i].tag + ", ";
              }
              ;
            } else {
              if (tags[i].tag) {
                tagString = tagString + tags[i].tag;
              }
              ;
            }
            ;
          }
          return tagString;
        };

        // Paginate data tables
        $rootScope.currentResult = 0;
        $rootScope.numberOfResultPages = function(numberOfRecords) {
          var numberOfPages = Math
              .ceil(numberOfRecords / $rootScope.resultSize);
          return numberOfPages;
        };

        function trim(s) {
          s = s.replace(/(^\s*)|(\s*$)/gi, "");
          s = s.replace(/[ ]{2,}/gi, " ");
          s = s.replace(/\n /, "\n");
          return s;
        }
        ;

        document.getElementById("hideOnLoad").style.visibility = "visible";

        $scope.testFunction = function() {
          window.alert($rootScope.currentResult);
        };

      };
      SpreadsheetStyleDataEntryController.$inject = [ '$scope', '$rootScope',
          '$resource', '$filter', 'Data' ];
      return SpreadsheetStyleDataEntryController;
    });