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
          Data.async($rootScope.corpus.pouchname, UUID)
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
                Data.saveEditedCouchDoc($rootScope.corpus.pouchname, UUID, editedRecord, editedRecord._rev)
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
    Data.async($rootScope.corpus.pouchname)
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
    // for (var availableField in $scope.corpus.datumFields._collection) {
    //   for (var newField in newFieldPreferences) {
    //     if (newFieldPreferences[newField] === "") {
    //       Preferences[templateId][newField].title = "";
    //       Preferences[templateId][newField].label = "";
    //     } else if ($scope.corpus.datumFields._collection[availableField].label === newFieldPreferences[newField]) {
    //       if (!Preferences[templateId]) {
    //         //hack for #1290 until we refactor the app into something more MVC
    //         Preferences[templateId] = window.defaultPreferences[templateId];
    //       }
    //       Preferences[templateId][newField].title = $scope.corpus.datumFields._collection[availableField].title;
    //       Preferences[templateId][newField].label = $scope.corpus.datumFields._collection[availableField].label;
    //     }
    //   }
    // }
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
