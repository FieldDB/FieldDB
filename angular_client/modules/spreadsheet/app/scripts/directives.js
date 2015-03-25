'use strict';
console.log("Declaring the SpreadsheetStyleDataEntryDirectives.");

angular.module('spreadsheetApp')
  // .directive('selectFieldFromDefaultCompactTemplate', function() {
  //   return function(scope, element, attrs) {
  //     var Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
  //     if (scope.field.label === Preferences.compacttemplate[attrs.selectFieldFromDefaultCompactTemplate].label) {
  //       element[0].selected = true;
  //     }
  //   };
  // })
  // .directive('selectFieldFromDefaultFullTemplate', function() {
  //   return function(scope, element, attrs) {
  //     var Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
  //     if (scope.field.label === Preferences.fulltemplate[attrs.selectFieldFromDefaultFullTemplate].label) {
  //       element[0].selected = true;
  //     }
  //   };
  // })
  // .directive('selectFieldFromYaleFieldMethodsSpring2014Template', function() {
  //   return function(scope, element, attrs) {
  //     var Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
  //     if (scope.field.label === Preferences.yalefieldmethodsspring2014template[attrs.selectFieldFromYaleFieldMethodsSpring2014Template].label) {
  //       element[0].selected = true;
  //     }
  //   };
  // })
  // .directive('selectDropdownSession', function() {
  //   return function(scope, element) {
  //     scope.$watch('activeSessionID', function() {
  //       if (scope.session._id === scope.activeSessionID) {
  //         element[0].selected = true;
  //       }
  //     });
  //   };
  // })
  .directive('spreadsheetCatchArrowKey', function($rootScope) {
    return function(scope, element) {
      element.bind('keyup', function(e) {
        if (e.keyCode !== 40 && e.keyCode !== 38) {
          return;
        }
        if (!scope.datum && !scope.datum.rev && typeof scope.datum.fetch === "function") {
          if (!scope.datum.whenReady) {
            scope.datum.fetch();
          }
          console.log("not catching arrow keys until this datum is defined");
          return;
        }
        try {
          if (!scope.$$phase) {
            scope.$apply(function() {
              if (!scope.datum && !scope.datum.rev) {
                if (!scope.datum.whenReady) {
                  scope.datum.fetch();
                }
                console.log("not catching arrow keys until this datum is defined");
                return;
              }
              // NOTE: scope.$index represents the the scope index of the record when an arrow key is pressed
              console.log("calculating arrows and requesting numberOfResultPages");
              var lastPage = scope.numberOfResultPages(scope.allData.length);
              if ($rootScope.user && $rootScope.user.prefs && $rootScope.user.prefs.numVisibleDatum) {
                console.warn("users prefs aren't loaded");
                return;
              }
              var resultSize = $rootScope.user.prefs.numVisibleDatum;
              if (resultSize === "all") {
                resultSize = scope.allData.length;
              }
              var scopeIndexOfLastRecordOnLastPage = resultSize - ((resultSize * lastPage) - scope.allData.length) - 1;
              var currentRecordIsLastRecord = false;
              var currentRecordIsFirstRecordOnNonFirstPage = false;
              if ($rootScope.currentPage === (lastPage - 1) && scopeIndexOfLastRecordOnLastPage === scope.$index) {
                currentRecordIsLastRecord = true;
              }
              if ($rootScope.currentPage > 0 && 0 === scope.$index) {
                currentRecordIsFirstRecordOnNonFirstPage = true;
              }

              if (e.keyCode === 40) {
                element[0].scrollIntoView(true);
              }

              if (e.keyCode === 38) {
                element[0].scrollIntoView(false);
              }

              if (e.keyCode === 40 && scope.$index === undefined) {
                // Select first record on next page if arrowing down from new record
                // $rootScope.currentPage = $rootScope.currentPage + 1;
                // scope.selectRow(0);
                //do nothing if it was the newEntry
              } else if (e.keyCode === 40 && currentRecordIsLastRecord === true) {
                // Do not go past very last record
                scope.selectRow('newEntry');
                return;
              } else if (e.keyCode === 40) {
                if (scope.$index + 2 > resultSize) {
                  // If the next record down is on another page, change to that page and select the first record
                  $rootScope.currentPage = $rootScope.currentPage + 1;
                  scope.selectRow(0);
                } else {
                  scope.selectRow(scope.$index + 1);
                }
              } else if (e.keyCode === 38 && scope.$index === undefined) {
                // Select new entry if coming from most recent record
                // scope.selectRow(scopeIndexOfLastRecordOnLastPage);
              } else if (e.keyCode === 38 && $rootScope.currentPage === 0 && (scope.$index === 0 || scope.$index === undefined)) {
                // Select new entry if coming from most recent record
                // scope.selectRow('newEntry');
              } else if (e.keyCode === 38 && scope.$index === 0) {
                // Go back one page and select last record
                $rootScope.currentPage = $rootScope.currentPage - 1;
                scope.selectRow(resultSize - 1);
              } else if (e.keyCode === 38) {
                scope.selectRow(scope.$index - 1);
              } else {
                return;
              }
            });
          }
        } catch (e) {
          console.warn("Rendering generated probably a digest erorr");
        }
      });
    };
  })
  .directive('spreadsheetCatchFocusOnArrowPress', function($timeout) {
    return function(scope, element) {
      var selfElement = element;
      scope.$watch('activeDatumIndex', function(newIndex, oldIndex) {
        // element.bind('blur', function(e) {

        if (newIndex === oldIndex) {
          console.log('spreadsheetCatchFocusOnArrowPress hasnt changed');
          // return; //cant return, it makes it so you cant go to the next page
        }

        if (scope.activeDatumIndex === 'newEntry' || scope.activeDatumIndex === scope.$index) {
          $timeout(function() {

            if (document.activeElement !== selfElement.find("input")[0] && selfElement.find("input")[0]) {
              // console.log("arrow old focus", document.activeElement);
              // element[0].focus();
              selfElement.find("input")[0].focus();
              // document.getElementById("firstFieldOfEditingEntry").focus();
              // console.log("arrow new focus", document.activeElement);
            }

          }, 0);
        }
      });
    };
  });
// .directive('loadPaginatedDataOnPageChange', function() {
//   return function(scope) {
//     scope.$watch('currentPage', function() {
//       scope.loadPaginatedData();
//     });
//   };
// });
