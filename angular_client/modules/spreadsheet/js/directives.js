console.log("Loading the SpreadsheetStyleDataEntryDirectives.");

define(
  ["angular"],
  function(angular) {

    'use strict';

    var corpusSpecificGlosser;
    /**
     * If the glosser & lexicon have not been created, this function makes it possible for users to specify any glosser url or lexicon url to use for downloading the precedece rules.
     * @param  {String} pouchname   The database for which the glosser is to be created
     * @param  {String} optionalUrl An optional url to a couchdb map reduce which has a format similar to morphemesPrecedenceContext and is able to create tuples used by the lexicon.
     */
    var initGlosserAndLexiconIfNecessary = function(pouchname, optionalUrl){
      //If the url isnt specified, use the users lexicon on corpus server
      var url =  "https://corpus.lingsync.org/" + pouchname,
      showWordBoundaries = true;

      optionalUrl = optionalUrl ||  url + "/_design/lexicon/_view/morphemesPrecedenceContext?group=true";
      if (!corpusSpecificGlosser) {
        corpusSpecificGlosser = new Glosser({
          pouchname: pouchname
        });
      }
      if (!corpusSpecificGlosser.lexicon) {
        corpusSpecificGlosser.downloadPrecedenceRules(pouchname, optionalUrl, function(precedenceRelations) {
          corpusSpecificGlosser.lexicon = LexiconFactory({
            precedenceRelations: precedenceRelations,
            dbname: pouchname,
            element: document.getElementById(pouchname+"-lexicon-viz"),
            dontConnectWordBoundaries: !showWordBoundaries,
            url: optionalUrl.replace(url, "")
          });
        });
      }
    };

    var convertFieldsIntoDatum = function(fieldLabelHolder, dataHolder){
      var datum = {};
      for (var key in fieldLabelHolder) {
        if (fieldLabelHolder[key].label === "morphemes") {
          datum.morphemes = dataHolder[key];
          datum.morphemesfield = key;
        }
        if (fieldLabelHolder[key].label === "gloss") {
          datum.gloss = dataHolder[key];
          datum.glossfield = key;
        }
        if (fieldLabelHolder[key].label === "utterance") {
          datum.utterance = dataHolder[key];
          datum.utterancefield = key;
        }
        if (fieldLabelHolder[key].label === "allomorphs") {
          datum.allomorphs = dataHolder[key];
          datum.allomorphsfield = key;
        }
      }
      return datum;
    };

    var SpreadsheetStyleDataEntryDirectives = angular
      .module('spreadsheet_directives', [])
      .directive('moduleVersion', ['version',
        function(version) {
          return function(scope, element, attrs) {
            element.text(version);
          };
        }
      ])
      .directive(
        'selectFieldFromDefaultCompactTemplate',
        function() {
          return function(scope, element, attrs) {
            var Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
            if (scope.field.label == Preferences.compacttemplate[attrs.selectFieldFromDefaultCompactTemplate].label) {
              element[0].selected = true;
            }
          };
        })
      .directive(
        'selectFieldFromDefaultFullTemplate',
        function() {
          return function(scope, element, attrs) {
            var Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
            if (scope.field.label == Preferences.fulltemplate[attrs.selectFieldFromDefaultFullTemplate].label) {
              element[0].selected = true;
            }
          };
        })
      .directive(
        'selectFieldFromYaleFieldMethodsSpring2014Template',
        function() {
          return function(scope, element, attrs) {
            var Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
            if (scope.field.label == Preferences.yalefieldmethodsspring2014template[attrs.selectFieldFromYaleFieldMethodsSpring2014Template].label) {
              element[0].selected = true;
            }
          };
        })
      .directive('selectDropdownSession', function() {
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
            element.bind('keyup', function(e) {
              scope.$apply(function() {
                // NOTE: scope.$index represents the the scope index of the record when an arrow key is pressed
                var lastPage = scope.numberOfResultPages(scope.allData.length);
                var scopeIndexOfLastRecordOnLastPage = $rootScope.resultSize - (($rootScope.resultSize * lastPage) - scope.allData.length) - 1;
                var currentRecordIsLastRecord = false;
                if ($rootScope.currentPage == (lastPage - 1) && scopeIndexOfLastRecordOnLastPage == scope.$index) {
                  currentRecordIsLastRecord = true;
                }

                if (e.keyCode === 40) {
                  element[0].scrollIntoView(true);
                }

                if (e.keyCode === 38) {
                  element[0].scrollIntoView(false);
                }

                if (e.keyCode === 40 && scope.$index === undefined) {
                  // Select first record if arrowing down from new record
                  scope.selectRow(0);
                } else if (e.keyCode === 40 && currentRecordIsLastRecord === true) {
                  // Do not go past very last record
                  return;
                } else if (e.keyCode === 40) {
                  if (scope.$index + 2 > scope.scopePreferences.resultSize) {
                    // If the next record down is on another page, change to that page and select the first record
                    $rootScope.currentPage = $rootScope.currentPage + 1;
                    scope.selectRow(0);
                  } else {
                    scope.selectRow(scope.$index + 1);
                  }
                } else if (e.keyCode === 38 && $rootScope.currentPage === 0 && (scope.$index === 0 || scope.$index === undefined)) {
                  // Select new entry if coming from most recent record
                  scope.selectRow('newEntry');
                } else if (e.keyCode === 38 && scope.$index === 0) {
                  // Go back one page and select last record
                  $rootScope.currentPage = $rootScope.currentPage - 1;
                  scope.selectRow(scope.scopePreferences.resultSize - 1);
                } else if (e.keyCode === 38) {
                  scope.selectRow(scope.$index - 1);
                } else {
                  return;
                }
              });
            });
          };
        }).directive(
        'keypressMarkAsEdited',
        function($rootScope) {
          return function(scope, element, attrs) {
            element.bind('blur', function(e) {
              var keycodesToIgnore = [40, 38, 13, 39, 37, 9];
              if (keycodesToIgnore.indexOf(e.keyCode) == -1) {
                $rootScope.markAsEdited(scope.fieldData, scope.datum);
              } else {
                return;
              }
            });
          };
        }).directive(
        'keypressMarkAsNew',
        function($rootScope) {
          return function(scope, element, attrs) {
            element.bind('keyup', function(e) {
              var keycodesToIgnore = [40, 38, 13, 39, 37, 9];
              if (keycodesToIgnore.indexOf(e.keyCode) == -1) {
                $rootScope.newRecordHasBeenEdited = true;
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
              if (scope.selected == scope.$index || scope.selected == 'newEntry') {
                $timeout(function() {
                  element[0].focus();
                }, 0);
              }
            });
          };
        }).directive(
        'guessUtteranceFromMorphemes',
        function() {
          return function(scope, element, attrs) {
            element.bind('blur', function(e) {
              var justCopyDontGuessIGT = false;
              if (!attrs.autoGlosserOn || attrs.autoGlosserOn == "false") {
                justCopyDontGuessIGT = true;
              }
              // Ignore arrows
              var keycodesToIgnore = [40, 38, 39, 37];
              if (keycodesToIgnore.indexOf(e.keyCode) > -1) {
                return;
              }
              var dataHolder = scope.fieldData ? scope.fieldData : scope.newFieldData;
              var datum = convertFieldsIntoDatum(scope.fields, dataHolder);
              datum.pouchname = scope.DB.pouchname;
              initGlosserAndLexiconIfNecessary(scope.DB.pouchname);
              datum = corpusSpecificGlosser.guessUtteranceFromMorphemes(datum, justCopyDontGuessIGT);
              scope.$apply(function() {
                dataHolder[datum.utterancefield] = datum.utterance;
              });
            });
          };
        }).directive(
        'guessMorphemesFromUtterance',
        function() {
          return function(scope, element, attrs) {
            element.bind('blur', function(e) {
              var justCopyDontGuessIGT = false;
              if (!attrs.autoGlosserOn || attrs.autoGlosserOn == "false") {
                justCopyDontGuessIGT = true;
              }
              // Ignore arrows
              var keycodesToIgnore = [40, 38, 39, 37];
              if (keycodesToIgnore.indexOf(e.keyCode) > -1) {
                return;
              }
              var dataHolder = scope.fieldData ? scope.fieldData : scope.newFieldData;
              var datum = convertFieldsIntoDatum(scope.fields, dataHolder);
              datum.pouchname = scope.DB.pouchname;
              initGlosserAndLexiconIfNecessary(scope.DB.pouchname);
              datum = corpusSpecificGlosser.guessMorphemesFromUtterance(datum, justCopyDontGuessIGT);
              scope.$apply(function() {
                dataHolder[datum.morphemesfield] = datum.morphemes;
                dataHolder[datum.glossfield] = datum.gloss;
              });
            });
          };
        }).directive(
        'guessGlossFromMorphemes',
        function() {
          return function(scope, element, attrs) {
            element.bind('blur', function(e) {
              var justCopyDontGuessIGT = false;
              if (!attrs.autoGlosserOn || attrs.autoGlosserOn == "false") {
                justCopyDontGuessIGT = true;
              }
              // Ignore arrows
              var keycodesToIgnore = [40, 38, 39, 37];
              if (keycodesToIgnore.indexOf(e.keyCode) > -1) {
                return;
              }
              var dataHolder = scope.fieldData ? scope.fieldData : scope.newFieldData;
              var datum = convertFieldsIntoDatum(scope.fields, dataHolder);
              datum.pouchname = scope.DB.pouchname;
              initGlosserAndLexiconIfNecessary(scope.DB.pouchname);
              datum = corpusSpecificGlosser.guessGlossFromMorphemes(datum, justCopyDontGuessIGT);
              scope.$apply(function() {
                dataHolder[datum.glossfield] = datum.gloss;
              });
            });
          };
        }).directive(
        'loadPaginatedDataOnPageChange',
        function($timeout, $rootScope) {
          return function(scope, element) {
            scope.$watch('currentPage', function() {
              scope.loadPaginatedData();
            });
          };
        });

    return SpreadsheetStyleDataEntryDirectives;
  });
