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
    if (true) {
      console.log("what is changeFieldToEdit for");
      return;
    }
    $scope.fieldToEdit = field;
  };


  $scope.editFieldTitle = function() {
    if (true) {
      console.log("editTagInfo is deprecated");
      return;
    }

  };

  $scope.editTagInfo = function(oldTag, newTag) {
    if (true) {
      console.log("editTagInfo is deprecated");
      return;
    }
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
    if (true) {
      console.log("deleteDuplicateTags is deprecated");
      return;
    }
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
    if (true) {
      console.log("getTags is deprecated");
      return;
    }
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



  $scope.saveNewPreferences = function() {
    console.log("unnecesary");

  };

  $scope.saveNumberOfRecordsToDisplay = function() {
        console.log("unnecesary");

  };

};

SpreadsheetStyleDataEntrySettingsController.$inject = ['$scope', '$rootScope', '$resource', 'Data'];
angular.module('spreadsheetApp').controller('SpreadsheetStyleDataEntrySettingsController', SpreadsheetStyleDataEntrySettingsController);
