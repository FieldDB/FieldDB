
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
              });

      return SpreadsheetStyleDataEntryDirectives;
    });