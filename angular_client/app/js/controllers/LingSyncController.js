console.log("Loading the LingSyncController.");

'use strict';
define(
    [ "angular" ],
    function(angular) {
      var LingSyncController = function($scope, $rootScope, $resource,
          LingSyncData) {

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
        var DB = "lingsync1";
        $scope.orderProp = "dateModified";
        $scope.reverse = true;
        $scope.selected = 'newEntry';

        // Set data size for pagination
        $rootScope.resultSize = LingSyncPreferences.resultSize;

        // Fetch data from server and put into template scope
        function loadData() {
          LingSyncData
              .async(DB)
              .then(
                  function(fieldData) {
                    var scopeData = [];
                    for ( var i = 0; i < fieldData.length; i++) {
                      scopeData[i] = {};
                      var newField;
                      scopeData[i].id = fieldData[i].id;
                      for ( var j = 0; j < fieldData[i].value.datumFields.length; j++) {
                        newField = fieldData[i].value.datumFields[j].label;
                        scopeData[i][newField] = fieldData[i].value.datumFields[j].value;
                      }
                      scopeData[i].dateModified = fieldData[i].value.dateModified;
                    }

                    $scope.data = scopeData;
                    $scope.loading = false;
                  });
        }

        loadData();

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

            // Populate new record with fields from scope
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
              // Update UI with updated corpus
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

                // Populate new record with fields from scope
                for ( var i = 0; i < editedRecord.datumFields.length; i++) {
                  for (key in fieldData) {
                    if (editedRecord.datumFields[i].label == key) {
                      editedRecord.datumFields[i].value = fieldData[key];
                    }
                  }
                }
                editedRecord.dateModified = new Date();

                // Save edited record and refresh data in scope
                LingSyncData.saveEditedRecord(DB, docID, editedRecord).then(
                    function() {
                      loadData();
                    });
              });
        };

        $scope.selectRow = function(datum) {
          $scope.selected = datum;
        };

        // Paginate data tables
        $rootScope.currentResult = 0;
        $scope.numberOfResultPages = function(numberOfRecords) {
          var numberOfPages = Math
              .ceil(numberOfRecords / $rootScope.resultSize);
          /*
           * Return to first page of results if filtering makes current page
           * empty.
           */
          if ($rootScope.currentResult + 1 > numberOfPages) {
            $rootScope.currentResult = numberOfPages - 1;
          }
          return numberOfPages;
        };

      };
      LingSyncController.$inject = [ '$scope', '$rootScope', '$resource',
          'LingSyncData' ];
      return LingSyncController;
    });