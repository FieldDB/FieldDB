console.log("Loading the SpreadsheetStyleDataEntryDirectives.");

'use strict';
define(
  ["angular"],
  function(angular) {
    var SpreadsheetStyleDataEntryDirectives = angular
      .module('SpreadsheetStyleDataEntry.directives', [])
      .directive('moduleVersion', ['version',
        function(version) {
          return function(scope, element, attrs) {
            element.text(version);
          };
        }
      ])
      .directive(
        'selectDropdown1',
        function() {
          return function(scope, element, attrs) {
            if (scope.field.label == scope.scopePreferences.compacttemplate[attrs.selectDropdown1].label) {
              element[0].selected = true;
            }
          };
        })
      .directive(
        'selectDropdown2',
        function() {
          return function(scope, element, attrs) {
            if (scope.field.label == scope.scopePreferences.fulltemplate[attrs.selectDropdown2].label) {
              element[0].selected = true;
            }
          };
        }).directive('selectDropdownSession', function() {
        return function(scope, element, attrs) {
          scope.$watch('activeSession', function() {
            if (scope.session._id == scope.activeSession) {
              element[0].selected = true;
            }
          });
        };
      }).directive(
        'arrowKey',
        function($rootScope) {
          return function(scope, element, attrs) {
            element.bind('keydown', function(e) {
              if (e.keyCode === 40 && scope.$index == undefined) {
                scope.selectRow(scope.$$childHead.datum);
              } else if (e.keyCode === 40 && scope.$index < scope.data.length && scope.$$nextSibling) {
                scope.selectRow(scope.$$nextSibling.datum);
              } else if (e.keyCode === 38 && scope.$index == 0) {
                scope.selectRow('newEntry');
              } else if (e.keyCode === 38 && scope.$index > 0 && scope.$$prevSibling) {
                scope.selectRow(scope.$$prevSibling.datum);
              } else {
                return;
              }
              scope.$apply();
            });
          };
        }).directive(
        'keypressMarkAsEdited',
        function($rootScope) {
          return function(scope, element, attrs) {
            element.bind('keydown', function(e) {
              if (e.keyCode != 40 && e.keyCode != 38) {
                $rootScope.editsHaveBeenMade = true;
              } else {
                return;
              }
            });
          };
        }).directive(
        'focus',
        function($timeout) {
          return function(scope, element) {
            scope.$watch('selected', function() {
              if (scope.selected == scope.datum || scope.selected == 'newEntry') {
                $timeout(function() {
                  element[0].focus();
                }, 0);
              }
            });
          };
        }).directive(
        'glossmorpheme',
        function() {
          return function(scope, element) {
            element.bind('keyup', function(e) {
              var newUtterance = this.value;
              var morphemeGuess = Glosser.morphemefinder(
                newUtterance, scope.DB.pouchname);
              var glossGuess = Glosser
                .glossFinder(morphemeGuess, scope.DB.pouchname);


              // Set scope data for existing records
              if (scope.fieldData) {
                for (key in scope.fields) {
                  if (scope.fields[key].label == "morphemes") {
                    scope.$apply(function() {
                      scope.fieldData[key] = morphemeGuess;
                    });
                  }

                  if (scope.fields[key].label == "gloss") {
                    scope.$apply(function() {
                      scope.fieldData[key] = glossGuess;
                    });
                  }
                }
              } else {
                // Set scope data for new record
                for (key in scope.fields) {
                  if (scope.fields[key].label == "morphemes") {
                    scope.$apply(function() {
                      scope.newFieldData[key] = morphemeGuess;
                    });
                  }

                  if (scope.fields[key].label == "gloss") {
                    scope.$apply(function() {
                      scope.newFieldData[key] = glossGuess;
                    });
                  }
                }
              }


            });
          }
        });

    return SpreadsheetStyleDataEntryDirectives;
  });