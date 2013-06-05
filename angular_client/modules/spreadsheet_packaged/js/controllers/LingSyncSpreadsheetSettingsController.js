console.log("Loading the LingSyncSpreadsheetSettingsController.");

'use strict';
define(
    [ "angular" ],
    function(angular) {
      var LingSyncSpreadsheetSettingsController = function($scope, $rootScope,
          $resource, LingSyncData) {

        chrome.storage.sync.get('LingSyncPreferences', function(value) {
          $scope.scopePreferences = value.LingSyncPreferences;
          console.log("TEST");
          console.log($scope.scopePreferences);
        });

        // Get all available datum fields from server
        var availableFields = {};

        LingSyncData
            .datumFields($rootScope.DB)
            .then(
                function(availableDatumFields) {
                  var availableFieldsFromServer = {};
                  for (i in availableDatumFields) {
                    for (keyValue in availableDatumFields[i].key) {
                      availableFieldsFromServer[keyValue] = keyValue;
                    }
                  }

                  for (field in availableFieldsFromServer) {
                    availableFieldsFromServer[field] = {};
                    availableFieldsFromServer[field].label = field;
                    if (field == "utterance") {
                      availableFieldsFromServer[field].title = "Utterance";
                    } else if (field == "translation") {
                      availableFieldsFromServer[field].title = "Translation";
                    } else if (field == "refs") {
                      availableFieldsFromServer[field].title = "References";
                    } else if (field == "notes") {
                      availableFieldsFromServer[field].title = "Notes";
                    } else if (field == "morphemes") {
                      availableFieldsFromServer[field].title = "Morphemes";
                    } else if (field == "judgement") {
                      availableFieldsFromServer[field].title = "Judgement";
                    } else if (field == "gloss") {
                      availableFieldsFromServer[field].title = "Gloss";
                    } else if (field == "dialect") {
                      availableFieldsFromServer[field].title = "Dialect";
                    } else if (field == "dateElicited") {
                      availableFieldsFromServer[field].title = "Date Elicited";
                    } else if (field == "checkedWithConsultant") {
                      availableFieldsFromServer[field].title = "Checked with consultant";
                    } else if (field == "goal") {
                      availableFieldsFromServer[field].title = "Goal";
                    } else if (field == "user") {
                      availableFieldsFromServer[field].title = "User";
                    } else if (field == "dateSEntered") {
                      availableFieldsFromServer[field].title = "Date entered";
                    } else if (field == "consultants") {
                      availableFieldsFromServer[field].title = "Consultants";
                    } else {
                      availableFieldsFromServer[field].title = field;
                    }
                  }
                  availableFields = availableFieldsFromServer;
                  $scope.availableFields = availableFieldsFromServer;
                });

        $scope.changeTagToEdit = function(tag) {
          $scope.tagToEdit = tag;
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
                  LingSyncData
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
                            LingSyncData
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
          LingSyncData
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
          var LingSyncPreferences;
          chrome.storage.sync
              .get(
                  'LingSyncPreferences',
                  function(value) {
                    LingSyncPreferences = value.LingSyncPreferences;

                    for (availableField in availableFields) {
                      for (newField in newFieldPreferences) {
                        if (newFieldPreferences[newField] == "") {
                          LingSyncPreferences[template][newField].title = "";
                          LingSyncPreferences[template][newField].label = "";
                        } else if (availableFields[availableField].label == newFieldPreferences[newField]) {
                          LingSyncPreferences[template][newField].title = availableFields[availableField].title;
                          LingSyncPreferences[template][newField].label = availableFields[availableField].label;
                        }
                      }
                    }

                    LingSyncPreferences.userTemplate = template;
                    $scope.scopePreferences = LingSyncPreferences;
                    $rootScope.template = LingSyncPreferences.userTemplate;
                    $rootScope.fields = LingSyncPreferences[LingSyncPreferences.userTemplate];
                    chrome.storage.sync.set({
                      'LingSyncPreferences' : LingSyncPreferences
                    });
                    chrome.app.window.create('popup_success.html', {
                      width : 200,
                      height : 100
                    });
                  });
        };
        $scope.saveNumberOfRecordsToDisplay = function(numberOfRecordsToDisplay) {
          var LingSyncPreferences;
          chrome.storage.sync.get('LingSyncPreferences', function(value) {
            LingSyncPreferences = value.LingSyncPreferences;
            if (numberOfRecordsToDisplay) {
              LingSyncPreferences.resultSize = numberOfRecordsToDisplay;
              chrome.storage.sync.set({
                'LingSyncPreferences' : LingSyncPreferences
              });
              $rootScope.resultSize = numberOfRecordsToDisplay;
              chrome.app.window.create('popup_success.html', {
                width : 200,
                height : 100
              });
            } else {
              chrome.app.window.create('popup_error.html', {
                width : 200,
                height : 100
              });
            }
          });

        };
      };

      LingSyncSpreadsheetSettingsController.$inject = [ '$scope', '$rootScope',
          '$resource', 'LingSyncData' ];
      return LingSyncSpreadsheetSettingsController;
    });