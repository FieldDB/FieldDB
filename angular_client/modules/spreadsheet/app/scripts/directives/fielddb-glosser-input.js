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

var debuggingMode = false;
angular.module('spreadsheetApp').directive('fielddbGlosserInput', function() {

  var controller = function($scope, $rootScope) {
    console.log('loading controller for fielddbGlosserInput');

    $scope.keyListener = function($event) {
      var arrowkeys = [40, 38, 39, 37];
      if (arrowkeys.indexOf($event.keyCode) > -1) {
        return;
      }
    };

    $scope.runGlosserUsingThisField = function(fieldKey, originalvalue, datumornewdatum) {
      var currentValue = datumornewdatum[fieldKey];
      if (debuggingMode) {
        console.log('requesting semi-automatic glosser: ' + originalvalue + '->' + currentValue);
      }

      if (datumornewdatum.rev) {
        $rootScope.markAsEdited($scope.fieldData, datumornewdatum);
      } else {
        if (JSON.stringify(datumornewdatum) === "{}") {
          return;
        }
        $rootScope.newRecordHasBeenEdited = true;
      }
      if (datumornewdatum.fossil && datumornewdatum.fossil[fieldKey] === currentValue) {
        return;
      }

      datumornewdatum.pouchname = $scope.corpus.pouchname;
      if (fieldKey === 'utterance') {
        datumornewdatum = Glosser.guessMorphemesFromUtterance(datumornewdatum, !$scope.useAutoGlosser);
      } else if (fieldKey === 'morphemes') {
        datumornewdatum = Glosser.guessUtteranceFromMorphemes(datumornewdatum, !$scope.useAutoGlosser);
        datumornewdatum = Glosser.guessGlossFromMorphemes(datumornewdatum, !$scope.useAutoGlosser);
      }
    };

  };

  return {
    template: function(element, attrs) {
      console.log('loading template for fielddbGlosserInput', attrs);
      var templateString =
        '<input ' +
        '  ng-repeat="corpusField in fieldsInColumns.' + attrs.columnlabel + ' track by $index"' +
        '  class="{{fieldSpanWidthClassName}}"' +
        '  type="text"' +
        '  ng-model="' + attrs.datumornewdatum + '[corpusField.id]"' +
        '  placeholder="{{corpusField.label}}"' +
        '  title="{{corpusField.help}}"' +
        '  ng-hide="corpusField.showToUserTypes == \'readonly\'"' +
        '  ng-blur="runGlosserUsingThisField(corpusField.id, ' + attrs.datumornewdatum + '[corpusField.id], ' + attrs.datumornewdatum + ', $event)"' +
        '/>';

      return templateString;
    },
    restrict: 'A',
    controller: controller,
    link: function postLink() {
      // console.log('fielddbGlosserInput ', element.find('input'));
    }
  };
});
