console.log("Loading the LingSyncSpreadsheetController.");

'use strict';
define(
    [ "angular" ],
    function(angular) {
      var LingSyncSpreadsheetController = function($scope, $rootScope,
          $resource, LingSyncData) {

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
        $scope.loading = true;
        var DB = "lingllama-firstcorpus";
        $rootScope.DB = DB;
        $scope.orderProp = "dateModified";
        $scope.reverse = true;
        $scope.selected = 'newEntry';
        $scope.pword = false;
        $scope.dataentry = false;

        // Set data size for pagination
        $rootScope.resultSize = LingSyncPreferences.resultSize;

        // Fetch data from server and put into template scope
        function loadData() {
          LingSyncData
              .async(DB)
              .then(
                  function(fieldData) {
                    var scopeData = [];
                    var j = 0;
                    for ( var i = 0; i < fieldData.length; i++) {
                      if (fieldData[i].value.jsonType == "Datum") {
                        scopeData[j] = {};
                        var newField;
                        scopeData[j].id = fieldData[i].id;
                        scopeData[j].rev = fieldData[i].value._rev;
                        if (fieldData[i].value.datumFields) {
                          for ( var k = 0; k < fieldData[i].value.datumFields.length; k++) {
                            newField = fieldData[i].value.datumFields[k].label;
                            scopeData[j][newField] = fieldData[i].value.datumFields[k].value;
                          }
                        }
                        scopeData[j].dateModified = fieldData[i].value.dateModified;
                        j++;
                      }
                    }

                    $scope.data = scopeData;
                    $scope.loading = false;
                  });
        }
        $scope.setpword = function(temppword) {
          $rootScope.temppword = temppword;
          $scope.pword = true;
          loadData();
        };

        $scope.saveNew = function(fieldData) {
          $scope.loading = true;
          // Get blank template to build new record
          LingSyncData.blankTemplate().then(function(newRecord) {
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
                  newRecord.datumFields[i].value = fieldData[key];
                }
              }
            }
            newRecord.dateEntered = new Date();
            newRecord.dateModified = new Date();
            LingSyncData.saveNew(DB, newRecord).then(function(savedRecord) {
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
          LingSyncData.async(DB, docID).then(
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
                      editedRecord.datumFields[i].value = fieldData[key];
                    }
                  }
                }
                editedRecord.dateModified = new Date();

                // Save edited record and refresh data
                // in scope
                LingSyncData.saveEditedRecord(DB, docID, editedRecord).then(
                    function() {
                      loadData();
                    });
              });
        };

        $scope.deleteRecord = function(id, rev) {
          var r = confirm("Are you sure you want to delete this record permanently?");
          if (r == true) {
            LingSyncData.removeRecord(DB, id, rev).then(function(response) {
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

      };
      LingSyncSpreadsheetController.$inject = [ '$scope', '$rootScope',
          '$resource', 'LingSyncData' ];
      return LingSyncSpreadsheetController;
    });