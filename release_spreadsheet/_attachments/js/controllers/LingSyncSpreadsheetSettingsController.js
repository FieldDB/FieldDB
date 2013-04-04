console.log("Loading the LingSyncSpreadsheetSettingsController.");

'use strict';
define(
    [ "angular" ],
    function(angular) {
      var LingSyncSpreadsheetSettingsController = function($scope, $rootScope,
          $resource, LingSyncData) {

        $scope.scopePreferences = JSON.parse(localStorage
            .getItem('LingSyncPreferences'));

        // Get all available datum fields from server
        var availableFields = {};

        LingSyncData
            .async($rootScope.DB)
            .then(
                function(availableDatumFields) {
                  var availableFieldsFromServer = {};
                  console.log(JSON.stringify(availableDatumFields));
                  for (i in availableDatumFields) {
                    for (keyValue in availableDatumFields[i].key) {
                      availableFieldsFromServer[keyValue] = keyValue;
                    }
                  }

                  console.log(JSON.stringify(availableFieldsFromServer));

                  // for (i in availableDatumFields) {
                  // for (j in availableDatumFields[i].key) {
                  // if
                  // (!availableFieldsFromServer[availableDatumFields[i].key[j]])
                  // availableFieldsFromServer[availableDatumFields[i].key[j]] =
                  // availableDatumFields[i].key[j];
                  // }
                  // }
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

        $scope.saveNewPreferences = function(template, newFieldPreferences) {
          LingSyncPreferences = JSON.parse(localStorage
              .getItem('LingSyncPreferences'));
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
          localStorage.setItem('LingSyncPreferences', JSON
              .stringify(LingSyncPreferences));
          window.alert("Settings saved.");
        };
        $scope.saveNumberOfRecordsToDisplay = function(numberOfRecordsToDisplay) {
          LingSyncPreferences = JSON.parse(localStorage
              .getItem('LingSyncPreferences'));
          if (numberOfRecordsToDisplay) {
            LingSyncPreferences.resultSize = numberOfRecordsToDisplay;
            localStorage.setItem('LingSyncPreferences', JSON
                .stringify(LingSyncPreferences));
            $rootScope.resultSize = numberOfRecordsToDisplay;
            window.alert("Settings saved.");
          } else {
            window.alert("Please select a value from the dropdown.");
          }
        };
      };

      LingSyncSpreadsheetSettingsController.$inject = [ '$scope', '$rootScope',
          '$resource', 'LingSyncData' ];
      return LingSyncSpreadsheetSettingsController;
    });