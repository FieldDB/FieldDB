console.log("Loading the SpreadsheetStyleDataEntrySettingsController.");

define(
  ["angular"],
  function(angular) {

    'use strict';

    var SpreadsheetStyleDataEntrySettingsController = function($scope, $rootScope,
      $resource, Data) {

      $scope.scopePreferences = JSON.parse(localStorage
        .getItem('SpreadsheetPreferences'));

      if ($scope.appReloaded !== true) {
        window.location.assign("#/");
        return;
      }

      $scope.availableFields = $scope.scopePreferences.availableFields;

      $scope.changeTagToEdit = function(tag) {
        $scope.tagToEdit = tag;
      };

      $scope.changeFieldToEdit = function(field) {
        $scope.fieldToEdit = field;
      };

      $scope.editFieldTitle = function(field, newFieldTitle) {
        var Preferences = JSON.parse(localStorage
          .getItem('SpreadsheetPreferences'));
        for (var key in Preferences.availableFields) {
          if (key == field.label) {
            Preferences.availableFields[key].title = newFieldTitle;
          }
        }
        localStorage.setItem('SpreadsheetPreferences', JSON
          .stringify(Preferences));
        $scope.scopePreferences = Preferences;
        $scope.availableFields = Preferences.availableFields;
      };

      $scope.editTagInfo = function(oldTag, newTag) {
        var r = confirm("Are you sure you want to change all '" + oldTag + "' to '" + newTag + "'?\nThis may take a while.");
        if (r === true) {
          var changeThisRecord;
          for (var i = 0; i < $scope.dataCopy.length; i++) {
            changeThisRecord = false;
            (function(indexi) {
              var UUID = $scope.dataCopy[indexi].id;
              for (var j = 0; j < $scope.dataCopy[indexi].value.datumTags.length; j++) {
                if ($scope.dataCopy[indexi].value.datumTags[j].tag == oldTag) {
                  changeThisRecord = true;
                }
              }
              if (changeThisRecord === true) {
                $rootScope.loading = true;
                Data
                  .async($rootScope.DB.pouchname, UUID)
                  .then(
                    function(editedRecord) {
                      // Edit record with updated tag data
                      for (var k = 0; k < editedRecord.datumTags.length; k++) {
                        (function(indexk) {
                          if (editedRecord.datumTags[indexk].tag == oldTag) {
                            editedRecord.datumTags[indexk].tag = newTag;
                          }
                        })(k);
                      }
                      // Save edited record
                      Data
                        .saveEditedRecord($rootScope.DB.pouchname, UUID,
                          editedRecord, editedRecord._rev)
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
            })(i);
          }
          for (var j in $scope.tags) {
            if ($scope.tags[j] == oldTag) {
              $scope.tags[j] = newTag;
            }
          }
        }
      };

      $scope.deleteDuplicateTags = function() {
        window.alert("Coming soon.");
        var changeThisRecord;
        for (var i = 0; i < $scope.dataCopy.length; i++) {
          changeThisRecord = false;
          (function(indexi) {
            var tagsArray = $scope.dataCopy[indexi].value.datumTags;
            if (tagsArray.length > 1) {
              for (var j = 0; j < tagsArray.length; j++) {
                for (var k = 0; k < tagsArray.length; k++) {
                  if (tagsArray[j].tag == tagsArray[k].tag) {
                    console.log(tagsArray[j].tag + " = " + tagsArray[k].tag);
                  }
                }
              }
              console.log(JSON.stringify(tagsArray));
            }
          })(i);
        }
      };

      // Get all tags
      $scope.getTags = function() {
        Data
          .async($rootScope.DB.pouchname)
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

      $scope.saveNewPreferences = function(template, newFieldPreferences) {
        Preferences = JSON.parse(localStorage
          .getItem('SpreadsheetPreferences'));
        for (var availableField in $scope.availableFields) {
          for (var newField in newFieldPreferences) {
            if (newFieldPreferences[newField] === "") {
              Preferences[template][newField].title = "";
              Preferences[template][newField].label = "";
            } else if ($scope.availableFields[availableField].label == newFieldPreferences[newField]) {
              Preferences[template][newField].title = $scope.availableFields[availableField].title;
              Preferences[template][newField].label = $scope.availableFields[availableField].label;
            }
          }
        }

        Preferences.userTemplate = template;
        $scope.scopePreferences = Preferences;
        $rootScope.template = Preferences.userTemplate;
        $rootScope.fields = Preferences[Preferences.userTemplate];
        localStorage.setItem('SpreadsheetPreferences', JSON
          .stringify(Preferences));
        window.alert("Settings saved.");
      };

      $scope.saveNumberOfRecordsToDisplay = function(numberOfRecordsToDisplay) {
        Preferences = JSON.parse(localStorage
          .getItem('SpreadsheetPreferences'));
        if (numberOfRecordsToDisplay) {
          Preferences.resultSize = numberOfRecordsToDisplay;
          localStorage.setItem('SpreadsheetPreferences', JSON
            .stringify(Preferences));
          $rootScope.resultSize = numberOfRecordsToDisplay;
          window.alert("Settings saved.\nYou may need to reload for the new settings to take effect.");
        } else {
          window.alert("Please select a value from the dropdown.");
        }
      };
    };

    SpreadsheetStyleDataEntrySettingsController.$inject = ['$scope', '$rootScope',
      '$resource', 'Data'
    ];
    return SpreadsheetStyleDataEntrySettingsController;
  });