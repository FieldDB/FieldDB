console.log("Loading the SpreadsheetStyleDataEntryDirectives.");

'use strict';
define(
    [ "angular" ],
    function(angular) {
      var SpreadsheetStyleDataEntryDirectives = angular
          .module('SpreadsheetStyleDataEntry.directives', [])
          .directive('moduleVersion', [ 'version', function(version) {
            return function(scope, element, attrs) {
              element.text(version);
            };
          } ])
          .directive(
              'selectDropdown1',
              function() {
                return function(scope, element, attrs) {
                  if (scope.field.label == scope.scopePreferences.template1[attrs.selectDropdown1].label) {
                    element[0].selected = true;
                  }
                };
              })
          .directive(
              'selectDropdown2',
              function() {
                return function(scope, element, attrs) {
                  if (scope.field.label == scope.scopePreferences.template2[attrs.selectDropdown2].label) {
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
              function() {
                return function(scope, element, attrs) {
                  element.bind('keydown', function(e) {
                    if (e.keyCode === 40 && scope.$index == undefined) {
                      scope.selectRow(scope.$$childHead.datum);
                    } else if (e.keyCode === 40
                        && scope.$index < scope.data.length
                        && scope.$$nextSibling) {
                      scope.selectRow(scope.$$nextSibling.datum);
                    } else if (e.keyCode === 38 && scope.$index == 0) {
                      scope.selectRow('newEntry');
                    } else if (e.keyCode === 38 && scope.$index > 0
                        && scope.$$prevSibling) {
                      scope.selectRow(scope.$$prevSibling.datum);
                    } else {
                      return;
                    }
                    scope.$apply();
                  });
                };
              }).directive(
              'focus',
              function($timeout) {
                return function(scope, element) {
                  scope.$watch('selected', function() {
                    if (scope.selected == scope.datum
                        || scope.selected == 'newEntry') {
                      $timeout(function() {
                        element[0].focus();
                      }, 0);
                    }
                    ;
                  });
                };
              }).directive(
              'input',
              function() {
                return {
                  restrict : 'E',
                  require : 'ngModel',
                  link : function(scope, element, attrs, ngModel) {
                    if (attrs.class == undefined
                        || attrs.class.indexOf("glossmorpheme") < 0) {
                      return;
                    }
                    // Override the input event and add custom 'glossmorpheme'
                    // logic

                    scope.$watch('glosserLoaded', function() {
                      if (attrs.placeholder == "Utterance") {
                        element.bind('keyup', function(e) {
                          var newUtterance = this.value;
                          scope.$apply(function() {
                            scope.morphemesGuess = Glosser.morphemefinder(
                                newUtterance, scope.DB.pouchname);
                          });
                        });
                      }

                      if (attrs.placeholder == "Morphemes") {
                        scope.$watch('morphemesGuess', function() {
                          element.val(scope.morphemesGuess);
                          ngModel.$setViewValue(scope.morphemesGuess);
                          scope.glossGuess = Glosser
                              .glossFinder(scope.morphemesGuess, scope.DB.pouchname);
                        });
                      }

                      // TODO Set up auto-glosser (question: where do the lexicon nodes come from?)
                       if (attrs.placeholder == "Gloss") {
                        scope.$watch('glossGuess', function() {
                          element.val(scope.glossGuess);
                          ngModel.$setViewValue(scope.glossGuess);
                        });
                      }
                    });
                  }
                };
              });

      return SpreadsheetStyleDataEntryDirectives;
    });