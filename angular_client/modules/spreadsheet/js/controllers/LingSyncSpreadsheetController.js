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
        $rootScope.dataentry = false;

        // Set data size for pagination
        $rootScope.resultSize = LingSyncPreferences.resultSize;

        // Fetch data from server and put into template scope
        $scope.loadData = function() {
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

                        scopeData.push(newDatumFromServer);
                      }
                    }
                    $scope.data = scopeData;
                    $scope.loading = false;
                  });
        };
        $scope.loginUser = function(auth) {
          if (!auth || !auth.server) {
            window.alert("Please choose a server.");
          } else {
            $rootScope.DB = auth.user + "-firstcorpus";
            $rootScope.server = auth.server;
            LingSyncData.login(auth.user, auth.password).then(
                function(response) {
                  if (response == undefined) {
                    return;
                  }

                  // console.log("testCookie response: " +
                  // JSON.stringify(response));
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
          }
        };
        $scope.selectDB = function(selectedDB) {
          if (!selectedDB) {
            window.alert("Please select a database.");
          } else {
            $rootScope.DB = selectedDB;
            $rootScope.dataentry = true;
            $scope.loadData();
            window.location.assign("#/lingsync/" + $scope.template);
          }
        };

        $scope.reloadPage = function() {
          window.location.assign("#/");
          window.location.reload();
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
                // Save tags
                var newDatumFields = fieldData.datumTags.split(",");
                var newDatumFieldsArray = [];
                for (i in newDatumFields) {
                  var newDatumTagObject = {};
                  // Trim spaces
                  var trimmedTag = trim(newDatumFields[i]);
                  newDatumTagObject.tag = trimmedTag;
                  newDatumFieldsArray.push(newDatumTagObject);
                }
                newRecord.datumTags = newDatumFieldsArray;
                LingSyncData.saveNew($rootScope.DB, newRecord).then(
                    function(savedRecord) {
                      // Update UI with updated
                      // corpus
                      $scope.loadData();
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

                // Save tags
                var newDatumFields = fieldData.datumTags.split(",");
                var newDatumFieldsArray = [];
                for (i in newDatumFields) {
                  var newDatumTagObject = {};
                  // Trim spaces
                  var trimmedTag = trim(newDatumFields[i]);
                  newDatumTagObject.tag = trimmedTag;
                  newDatumFieldsArray.push(newDatumTagObject);
                }
                editedRecord.datumTags = newDatumFieldsArray;

                // Save edited record and refresh data
                // in scope
                LingSyncData.saveEditedRecord($rootScope.DB, docID,
                    editedRecord).then(function() {
                  $scope.loadData();
                });
              });
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

        $scope.selectRow = function(datum) {
          $scope.selected = datum;
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
          '$resource', 'LingSyncData' ];
      return LingSyncSpreadsheetController;
    });