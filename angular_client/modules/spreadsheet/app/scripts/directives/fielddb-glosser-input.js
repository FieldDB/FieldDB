/* globals Glosser */
'use strict';

/**
 * @ngdoc directive
 * @name spreadsheetApp.directive:fielddbGlosserInput
 * @description
 * # fielddbGlosserInput
 */

// var lexiconFactory = LexiconFactory;
// var corpusSpecificGlosser;
// /**
//  * If the glosser & lexicon have not been created, this function makes it possible for users to specify any glosser url or lexicon url to use for downloading the precedece rules.
//  * @param  {String} pouchname   The database for which the glosser is to be created
//  * @param  {String} optionalUrl An optional url to a couchdb map reduce which has a format similar to morphemesPrecedenceContext and is able to create tuples used by the lexicon.
//  */
// var initGlosserAndLexiconIfNecessary = function(pouchname, optionalUrl){
//   //If the url isnt specified, use the users lexicon on corpus server
//   var url =  "https://corpus.lingsync.org/" + pouchname,
//   showWordBoundaries = true;

//   optionalUrl = optionalUrl ||  url + "/_design/lexicon/_view/morphemesPrecedenceContext?group=true";
//   if (!corpusSpecificGlosser) {
//     corpusSpecificGlosser = new Glosser({
//       pouchname: pouchname
//     });
//   }
//   if (!corpusSpecificGlosser.lexicon) {
//     corpusSpecificGlosser.downloadPrecedenceRules(pouchname, optionalUrl, function(precedenceRelations) {
//       corpusSpecificGlosser.lexicon = lexiconFactory({
//         precedenceRelations: precedenceRelations,
//         dbname: pouchname,
//         element: document.getElementById(pouchname+"-lexicon-viz"),
//         dontConnectWordBoundaries: !showWordBoundaries,
//         url: optionalUrl.replace(url, "")
//       });
//     });
//   }
// };

angular.module('spreadsheetApp')
  .directive('keypressMarkAsEdited', function($rootScope) {
    return function(scope, element) {
      element.bind('blur', function(e) {
        var keycodesToIgnore = [40, 38, 13, 39, 37, 9];
        if (keycodesToIgnore.indexOf(e.keyCode) === -1) {
          $rootScope.markAsEdited(scope.fieldData, scope.datum);
        } else {
          return;
        }
      });
    };
  })
  .directive('keypressMarkAsNew', function($rootScope) {
    return function(scope, element) {
      element.bind('keyup', function(e) {
        var keycodesToIgnore = [40, 38, 13, 39, 37, 9];
        if (keycodesToIgnore.indexOf(e.keyCode) === -1) {
          $rootScope.newRecordHasBeenEdited = true;
        } else {
          return;
        }
      });
    };
  })
  .directive('guessUtteranceFromMorphemes', function() {
    return function(scope, element, attrs) {
      var datum = attrs.datum;
      if (typeof datum === "string") {
        datum = JSON.parse(attrs.datum);
      }
      element.bind('blur', function(e) {
        console.log("which field is this", attrs.fieldLabel);
        if (datum && attrs.fieldLabel === "morphemes") {
          // Ignore arrows
          var keycodesToIgnore = [40, 38, 39, 37];
          if (keycodesToIgnore.indexOf(e.keyCode) > -1) {
            return;
          }

          datum.pouchname = scope.DB.pouchname;
          // initGlosserAndLexiconIfNecessary(scope.DB.pouchname);
          datum = Glosser.guessUtteranceFromMorphemes(datum, scope.useAutoGlosser);
        }

      });
    };
  })
  .directive('guessMorphemesFromUtterance', function() {
    return function(scope, element, attrs) {
      var datum = scope.datum;
      element.bind('blur', function(e) {
        console.log("which field is this", attrs.fieldLabel);
        if (!datum || attrs.fieldLabel !== "utterance") {
          return;
        }
        // Ignore arrows
        var keycodesToIgnore = [40, 38, 39, 37];
        if (keycodesToIgnore.indexOf(e.keyCode) > -1) {
          return;
        }
        if (!datum.pouchname) {
          datum.pouchname = scope.DB.pouchname;
        }
        // initGlosserAndLexiconIfNecessary(scope.DB.pouchname);
        scope.$apply(function() {
          datum = Glosser.guessMorphemesFromUtterance(datum, scope.useAutoGlosser);
        });
      });
    };
  })
  .directive('guessGlossFromMorphemes', function() {
    return function(scope, element, attrs) {
      var datum = attrs.datum;
      if (typeof datum === "string") {
        datum = JSON.parse(attrs.datum);
      }
      element.bind('blur', function(e) {
        console.log("which field is this", attrs.fieldLabel);
        if (datum && attrs.fieldLabel === "morphemes") {
          // Ignore arrows
          var keycodesToIgnore = [40, 38, 39, 37];
          if (keycodesToIgnore.indexOf(e.keyCode) > -1) {
            return;
          }
          datum.pouchname = scope.DB.pouchname;
          // initGlosserAndLexiconIfNecessary(scope.DB.pouchname);
          datum = Glosser.guessGlossFromMorphemes(datum, scope.useAutoGlosser);
        }

      });
    };
  });
