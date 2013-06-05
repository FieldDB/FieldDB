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
      function($scope, $rootScope, $resource, LingSyncData) {

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

        // Set data size for pagination
        $rootScope.resultSize = LingSyncPreferences.resultSize;

        // Fetch data from server and put into template scope
        function loadData() {
          $scope.loading = true;
          LingSyncData
              .async($rootScope.DB)
              .then(
                  function(dataFromServer) {
                    var scopeData = [];
                    for ( var i = 0; i < dataFromServer.length; i++) {
                      if (dataFromServer[i].value.datumFields) {
                        var newDatumFromServer = {};
                        newDatumFromServer.id = dataFromServer[i].id;

                        for (j in dataFromServer[i].value.datumFields) {
                          newDatumFromServer[dataFromServer[i].value.datumFields[j].label] = dataFromServer[i].value.datumFields[j].mask;
                        }
                        if (dataFromServer[i].value.dateModified) {
                          newDatumFromServer.dateModified = dataFromServer[i].value.dateModified;
                        } else {
                          newDatumFromServer.dateModified = "TODO"; 
                        }
                        scopeData.push(newDatumFromServer);
                      }
                    }
                    $scope.data = scopeData;
                    $scope.loading = false;
                  });
        }
        $scope.loginUser = function(auth) {
          $rootScope.DB = auth.user + "-firstcorpus";
          $rootScope.server = auth.server;
          LingSyncData.login(auth.user, auth.password).then(function(response) {
            if (response == undefined) {
              return;
            }

            // console.log("testCookie response: " + JSON.stringify(response));
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
          });

          $scope.selectDB = function(selectedDB) {
            $rootScope.DB = selectedDB;
            loadData();
            window.location.assign("#/lingsync/" + $scope.template);

          };

          $scope.reloadPage = function() {
            window.location.assign("#/");
            window.location.reload();
          };

        };

        $scope.saveNew = function(fieldData) {
          $scope.loading = true;
          // Get blank template to build new record
          LingSyncData.blankTemplate().then(
              function(newRecord) {
                for (dataKey in fieldData) {
                  for (fieldKey in $scope.fields) {
                    if (dataKey == fieldKey) {
                      var newDataKey = $scope.fields[fieldKey].label;
                      fieldData[newDataKey] = fieldData[dataKey];
                      delete fieldData[dataKey];
                    }
                  }
                }

                // Populate new record with fields from
                // scope
                for ( var i = 0; i < newRecord.datumFields.length; i++) {
                  for (key in fieldData) {
                    if (newRecord.datumFields[i].label == key) {
                      newRecord.datumFields[i].mask = fieldData[key];
                    }
                  }
                }
                newRecord.dateEntered = new Date();
                newRecord.dateModified = new Date();
                LingSyncData.saveNew($rootScope.DB, newRecord).then(
                    function(savedRecord) {
                      // Update UI with updated
                      // corpus
                      loadData();
                    });

              });
        };

        $scope.saveChanges = function(fieldData, docID) {
          $scope.loading = true;
          $rootScope.currentResult = 0;
          // Get latest version of record from server
          LingSyncData.async($rootScope.DB, docID).then(
              function(editedRecord) {
                // Edit record with updated data
                for (dataKey in fieldData) {
                  for (fieldKey in $scope.fields) {
                    if (dataKey == fieldKey) {
                      var newDataKey = $scope.fields[fieldKey].label;
                      fieldData[newDataKey] = fieldData[dataKey];
                      delete fieldData[dataKey];
                    }
                  }
                }

                // Populate new record with fields from
                // scope
                for ( var i = 0; i < editedRecord.datumFields.length; i++) {
                  for (key in fieldData) {
                    if (editedRecord.datumFields[i].label == key) {
                      editedRecord.datumFields[i].mask = fieldData[key];
                    }
                  }
                }
                editedRecord.dateModified = new Date();

                // Save edited record and refresh data
                // in scope
                LingSyncData.saveEditedRecord($rootScope.DB, docID,
                    editedRecord).then(function() {
                  loadData();
                });
              });
        };

        $scope.deleteRecord = function(id, rev) {
          var r = confirm("Are you sure you want to delete this record permanently?");
          if (r == true) {
            LingSyncData.removeRecord($rootScope.DB, id, rev).then(
                function(response) {
                  loadData();
                });
          }
        };

        $scope.selectRow = function(datum) {
          $scope.selected = datum;
        };

        // Paginate data tables
        $rootScope.currentResult = 0;
        $rootScope.numberOfResultPages = function(numberOfRecords) {
          var numberOfPages = Math
              .ceil(numberOfRecords / $rootScope.resultSize);
          return numberOfPages;
        };

        $scope.testFunction = function() {
          window.alert($rootScope.currentResult);
        };

      };
      LingSyncSpreadsheetController.$inject = [ '$scope', '$rootScope',
          '$resource', 'LingSyncData' ];
      return LingSyncSpreadsheetController;
    });