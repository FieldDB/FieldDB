console.log("Loading the LingSyncSpreadsheetController.");

'use strict';
define(
    [ "angular" ],
    function(angular) {
      var LingSyncSpreadsheetController = /**
                                           * @param $scope
                                           * @param $rootScope
                                           * @param $resource
                                           * @param LingSyncData
                                           * @returns {LingSyncSpreadsheetController}
                                           */
      function($scope, $rootScope, $resource, $filter, LingSyncData) {

        var LingSyncPreferences = localStorage.getItem('LingSyncPreferences');
        if (LingSyncPreferences == undefined) {
          LingSyncPreferences = {
            "userTemplate" : "template2",
            "resultSize" : 5,
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
          localStorage.setItem('LingSyncPreferences', JSON
              .stringify(LingSyncPreferences));
          console.log("Setting default preferences in localStorage.");
        } else {
          console.log("Loading LingSyncPreferences from localStorage.");
          LingSyncPreferences = JSON.parse(LingSyncPreferences);
        }

        // Set scope variables
        $rootScope.template = LingSyncPreferences.userTemplate;
        $rootScope.fields = LingSyncPreferences[LingSyncPreferences.userTemplate];
        $scope.orderProp = "dateModified";
        $scope.reverse = true;
        $scope.selected = 'newEntry';
        $rootScope.authenticated = false;
        $scope.dataentry = false;
        $scope.searching = false;
        $rootScope.activeSubMenu = 'none';
        $scope.activeSession = undefined;
        $scope.currentSessionName = "All Sessions";
        $scope.showCreateSessionDiv = false;
        $scope.editSessionDetails = false;
        $scope.currentDate = new Date().toDateString();

        // Set data size for pagination
        $rootScope.resultSize = LingSyncPreferences.resultSize;

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
            } else {
              $scope.changeActiveSubMenu(itemToDisplay);
            }
          }
        };

        // Fetch data from server and put into template scope
        $scope.loadData = function() {
          $rootScope.loading = true;
          LingSyncData
              .async($rootScope.DB)
              .then(
                  function(dataFromServer) {
                    var scopeData = [];
                    var scopeSessions = [];
                    for ( var i = 0; i < dataFromServer.length; i++) {
                      // Create array of sessions
                      if (dataFromServer[i].value.sessionFields) {
                        scopeSessions.push(dataFromServer[i].value);
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
                    $rootScope.loading = false;
                  });
        };
        $scope.loginUser = function(auth) {
          if (!auth || !auth.server) {
            window.alert("Please choose a server.");
          } else {
            $rootScope.loading = true;
            $rootScope.server = auth.server;
            LingSyncData.login(auth.user, auth.password).then(
                function(response) {
                  if (response == undefined) {
                    return;
                  }

                  $rootScope.authenticated = true;
                  $scope.username = auth.user;
                  var DBs = response.data.roles;
                  for (i in DBs) {
                    DBs[i] = DBs[i].split("_")[0];
                    DBs[i] = DBs[i].replace(/[\"]/g, "");
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
          window.location.assign("#/lingsync/" + $scope.template);
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
            LingSyncData.saveEditedRecord($rootScope.DB, newSession._id,
                newSession).then(function() {
            });

            // Update all records tied to this session
            for (i in scopeDataToEdit) {
              $scope.loading = true;
              (function(index) {
                if (scopeDataToEdit[index].sessionID == newSession._id) {
                  LingSyncData
                      .async($rootScope.DB, scopeDataToEdit[index].id)
                      .then(
                          function(editedRecord) {
                            // Edit record with updated session info and save

                            editedRecord.session = newSession;
                            LingSyncData.saveEditedRecord($rootScope.DB,
                                scopeDataToEdit[index].id, editedRecord,
                                editedRecord._rev).then(function() {
                              $scope.loading = false;
                            });

                          },
                          function() {
                            window
                                .alert("There was an error accessing the record.");
                          });
                }
              })(i);
            }
            $scope.loadData();
          }
        };

        $scope.deleteEmptySession = function(activeSessionID) {
          var r = confirm("Are you sure you want to delete this session permanently?");
          if (r == true) {
            var revID = "";
            for (i in $scope.sessions) {
              if ($scope.sessions[i]._id == activeSessionID) {
                revID = $scope.sessions[i]._rev;
                $scope.sessions.splice(i, 1);
              }
            }
            LingSyncData.removeRecord($rootScope.DB, activeSessionID, revID)
                .then(function(response) {
                  $scope.changeActiveSession('none');
                  $rootScope.activeSubMenu = 'none';
                  // $scope.loadData();
                }, function() {
                  window.alert("Error deleting record.");
                });
          }
        };

        $scope.createNewSession = function(newSession) {
          $rootScope.loading = true;
          // Get blank template to build new record
          LingSyncData
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
                    LingSyncData.saveNew($rootScope.DB, newSessionRecord).then(
                        function(savedRecord) {
                          $scope.loadData();
                          newSessionRecord._id = savedRecord.data.id;
                          newSessionRecord._rev = savedRecord.data.rev;
                          $scope.sessions.push(newSessionRecord);
                          $scope.dataentry = true;
                          $scope.changeActiveSession(savedRecord.data.id);
                          window.location.assign("#/lingsync/"
                              + $scope.template);
                          // Update UI with updated
                          // corpus
                          // $scope.loadData();
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
          var r = confirm("Are you sure you want to delete this record permanently?");
          if (r == true) {
            LingSyncData.removeRecord($rootScope.DB, id, rev).then(
                function(response) {
                  $scope.loadData();
                }, function() {
                  window.alert("Error deleting record.");
                });
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
                  LingSyncData
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
                            LingSyncData
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
                  LingSyncData
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

                            LingSyncData
                                .saveNew($rootScope.DB, newRecord)
                                .then(
                                    function(response) {
                                      $scope.data[index].id = response.data.id;
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

        $scope.selectRow = function(datum) {
          if ($scope.searching != true) {
            $scope.selected = datum;
          }
        };

        $scope.runSearch = function(searchTerm) {
          var newScopeData = [];
          if (!$scope.activeSession) {
            for (i in $scope.data) {
              for (key in $scope.data[i]) {
                if ($scope.data[i][key]
                    && $scope.data[i][key].indexOf(searchTerm) > -1) {
                  newScopeData.push($scope.data[i]);
                  break;
                }
              }
            }
          } else {
            for (i in $scope.data) {
              if ($scope.data[i].sessionID == $scope.activeSession) {
                for (key in $scope.data[i]) {
                  if ($scope.data[i][key]
                      && $scope.data[i][key].indexOf(searchTerm) > -1) {
                    newScopeData.push($scope.data[i]);
                    break;
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
          var results = $filter('filter')($scope.data, {
            checked : true
          });
          if (results.length > 0) {
            window.alert("TODO\n" + JSON.stringify(results));
          } else {
            window.alert("Please select records to export.");
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

        $scope.testFunction = function() {
          window.alert($rootScope.currentResult);
        };

      };
      LingSyncSpreadsheetController.$inject = [ '$scope', '$rootScope',
          '$resource', '$filter', 'LingSyncData' ];
      return LingSyncSpreadsheetController;
    });