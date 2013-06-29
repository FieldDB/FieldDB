console.log("Loading the SpreadsheetStyleDataEntrySettingsController.");

'use strict';
define(
    [ "angular" ],
    function(angular) {
      var SpreadsheetStyleDataEntrySettingsController = function($scope, $rootScope,
          $resource, Data) {

        $scope.scopePreferences = JSON.parse(localStorage
            .getItem('Preferences'));

        $scope.availableFields = $scope.scopePreferences.availableFields;

        // Get all available datum fields from server
        // var availableFields = {};
        //
        // Data
        // .datumFields($rootScope.DB)
        // .then(
        // function(availableDatumFields) {
        // var availableFieldsFromServer = {};
        // for (i in availableDatumFields) {
        // for (keyValue in availableDatumFields[i].key) {
        // availableFieldsFromServer[keyValue] = keyValue;
        // }
        // }
        //
        // for (field in availableFieldsFromServer) {
        // availableFieldsFromServer[field] = {};
        // availableFieldsFromServer[field].label = field;
        // if (field == "utterance") {
        // availableFieldsFromServer[field].title = "Utterance";
        // } else if (field == "translation") {
        // availableFieldsFromServer[field].title = "Translation";
        // } else if (field == "refs") {
        // availableFieldsFromServer[field].title = "References";
        // } else if (field == "notes") {
        // availableFieldsFromServer[field].title = "Notes";
        // } else if (field == "morphemes") {
        // availableFieldsFromServer[field].title = "Morphemes";
        // } else if (field == "judgement") {
        // availableFieldsFromServer[field].title = "Judgement";
        // } else if (field == "gloss") {
        // availableFieldsFromServer[field].title = "Gloss";
        // } else if (field == "dialect") {
        // availableFieldsFromServer[field].title = "Dialect";
        // } else if (field == "dateElicited") {
        // availableFieldsFromServer[field].title = "Date Elicited";
        // } else if (field == "checkedWithConsultant") {
        // availableFieldsFromServer[field].title = "Checked with consultant";
        // } else if (field == "goal") {
        // availableFieldsFromServer[field].title = "Goal";
        // } else if (field == "user") {
        // availableFieldsFromServer[field].title = "User";
        // } else if (field == "dateSEntered") {
        // availableFieldsFromServer[field].title = "Date entered";
        // } else if (field == "consultants") {
        // availableFieldsFromServer[field].title = "Consultants";
        // } else {
        // availableFieldsFromServer[field].title = field;
        // }
        // }
        // console.log(JSON.stringify(availableFieldsFromServer));
        // availableFields = availableFieldsFromServer;
        // $scope.availableFields = availableFieldsFromServer;
        // });

        $scope.changeTagToEdit = function(tag) {
          $scope.tagToEdit = tag;
        };

        $scope.changeFieldToEdit = function(field) {
          $scope.fieldToEdit = field;
        }

        $scope.editFieldTitle = function(field, newFieldTitle) {
          var Preferences = JSON.parse(localStorage
              .getItem('Preferences'));
          for (key in Preferences.availableFields) {
            if (key == field.label) {
              Preferences.availableFields[key].title = newFieldTitle;
            }
          }
          localStorage.setItem('Preferences', JSON
              .stringify(Preferences));
          $scope.scopePreferences = Preferences;
          $scope.availableFields = Preferences.availableFields;
        };

        $scope.editTagInfo = function(oldTag, newTag) {
          var r = confirm("Are you sure you want to change all '" + oldTag
              + "' to '" + newTag + "'?\nThis may take a while.");
          if (r == true) {
            var changeThisRecord;
            for ( var i = 0; i < $scope.dataCopy.length; i++) {
              changeThisRecord = false;
              (function(indexi) {
                var UUID = $scope.dataCopy[indexi].id;
                for ( var j = 0; j < $scope.dataCopy[indexi].value.datumTags.length; j++) {
                  if ($scope.dataCopy[indexi].value.datumTags[j].tag == oldTag) {
                    changeThisRecord = true;
                  }
                  ;
                }
                if (changeThisRecord == true) {
                  $rootScope.loading = true;
                  Data
                      .async($rootScope.DB, UUID)
                      .then(
                          function(editedRecord) {
                            // Edit record with updated tag data
                            for ( var k = 0; k < editedRecord.datumTags.length; k++) {
                              (function(indexk) {
                                if (editedRecord.datumTags[indexk].tag == oldTag) {
                                  editedRecord.datumTags[indexk].tag = newTag;
                                }
                              })(k);
                            }
                            // Save edited record
                            Data
                                .saveEditedRecord($rootScope.DB, UUID,
                                    editedRecord, editedRecord._rev)
                                .then(
                                    function() {
                                      console.log("Changed " + oldTag + " to "
                                          + newTag + " in " + UUID);
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
            for (i in $scope.tags) {
              if ($scope.tags[i] == oldTag) {
                $scope.tags[i] = newTag;
              }
            }
          }
        };

        $scope.deleteDuplicateTags = function() {
          window.alert("Coming soon.");
          var changeThisRecord;
          for ( var i = 0; i < $scope.dataCopy.length; i++) {
            changeThisRecord = false;
            (function(indexi) {
              var tagsArray = $scope.dataCopy[indexi].value.datumTags;
              if (tagsArray.length > 1) {
                for ( var j = 0; j < tagsArray.length; j++) {
                  for ( var k = 0; k < tagsArray.length; k++) {
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
              .async($rootScope.DB)
              .then(
                  function(dataFromServer) {
                    var tags = {};
                    // While getting tags, make a copy of all datums so other
                    // editing won't have to query the server again
                    var dataCopy = [];
                    for ( var i = 0; i < dataFromServer.length; i++) {
                      if (dataFromServer[i].value.datumFields) {
                        dataCopy.push(dataFromServer[i]);
                      }
                      if (dataFromServer[i].value.datumTags) {
                        for (j in dataFromServer[i].value.datumTags) {
                          if (tags[dataFromServer[i].value.datumTags[j].tag] == undefined
                              && dataFromServer[i].value.datumTags[j].tag != undefined) {
                            tags[dataFromServer[i].value.datumTags[j].tag] = dataFromServer[i].value.datumTags[j].tag;
                          }
                        }
                      }
                    }
                    $scope.dataCopy = dataCopy;
                    $scope.tags = tags;
                  });
        };
        $scope.getTags();

        $scope.saveNewPreferences = function(template, newFieldPreferences) {
          Preferences = JSON.parse(localStorage
              .getItem('Preferences'));
          for (availableField in $scope.availableFields) {
            for (newField in newFieldPreferences) {
              if (newFieldPreferences[newField] == "") {
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
          localStorage.setItem('Preferences', JSON
              .stringify(Preferences));
          window.alert("Settings saved.");
        };

        $scope.saveNumberOfRecordsToDisplay = function(numberOfRecordsToDisplay) {
          Preferences = JSON.parse(localStorage
              .getItem('Preferences'));
          if (numberOfRecordsToDisplay) {
            Preferences.resultSize = numberOfRecordsToDisplay;
            localStorage.setItem('Preferences', JSON
                .stringify(Preferences));
            $rootScope.resultSize = numberOfRecordsToDisplay;
            window.alert("Settings saved.");
          } else {
            window.alert("Please select a value from the dropdown.");
          }
        };
      };

      SpreadsheetStyleDataEntrySettingsController.$inject = [ '$scope', '$rootScope',
          '$resource', 'Data' ];
      return SpreadsheetStyleDataEntrySettingsController;
    });