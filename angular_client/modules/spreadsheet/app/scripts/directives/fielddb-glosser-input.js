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


var convertFieldsIntoDatum = function(fieldLabelHolder, dataHolder) {
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

    element.bind('blur', function(e) {
      console.log("which field is this", attrs.fieldLabel);
      if (attrs.fieldLabel === "morphemes") {
        var justCopyDontGuessIGT = false;
        if (!attrs.autoGlosserOn || attrs.autoGlosserOn === "false") {
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
        // initGlosserAndLexiconIfNecessary(scope.DB.pouchname);
        datum = Glosser.guessUtteranceFromMorphemes(datum, justCopyDontGuessIGT);
        scope.$apply(function() {
          dataHolder[datum.utterancefield] = datum.utterance;
        });
      }

    });
  };
})
  .directive('guessMorphemesFromUtterance', function() {
    return function(scope, element, attrs) {
      element.bind('blur', function(e) {
        console.log("which field is this", attrs.fieldLabel);
        if (attrs.fieldLabel === "utterance") {
          var justCopyDontGuessIGT = false;
          if (!attrs.autoGlosserOn || attrs.autoGlosserOn === "false") {
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
          // initGlosserAndLexiconIfNecessary(scope.DB.pouchname);
          datum = Glosser.guessMorphemesFromUtterance(datum, justCopyDontGuessIGT);
          scope.$apply(function() {
            dataHolder[datum.morphemesfield] = datum.morphemes;
            dataHolder[datum.glossfield] = datum.gloss;
          });
        }

      });
    };
  })
  .directive('guessGlossFromMorphemes', function() {
    return function(scope, element, attrs) {
      element.bind('blur', function(e) {
        console.log("which field is this", attrs.fieldLabel);
        if (attrs.fieldLabel === "morphemes") {
          var justCopyDontGuessIGT = false;
          if (!attrs.autoGlosserOn || attrs.autoGlosserOn === "false") {
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
          // initGlosserAndLexiconIfNecessary(scope.DB.pouchname);
          datum = Glosser.guessGlossFromMorphemes(datum, justCopyDontGuessIGT);
          scope.$apply(function() {
            dataHolder[datum.glossfield] = datum.gloss;
          });
        }

      });
    };
  });
