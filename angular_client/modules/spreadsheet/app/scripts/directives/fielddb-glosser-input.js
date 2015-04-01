/* globals Glosser, alert */
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
//  * @param  {String} dbname   The database for which the glosser is to be created
//  * @param  {String} optionalUrl An optional url to a couchdb map reduce which has a format similar to morphemesPrecedenceContext and is able to create tuples used by the lexicon.
//  */
// var initGlosserAndLexiconIfNecessary = function(dbname, optionalUrl){
//   //If the url isnt specified, use the users lexicon on corpus server
//   var url =  "https://corpus.lingsync.org/" + dbname,
//   showWordBoundaries = true;

//   optionalUrl = optionalUrl ||  url + "/_design/lexicon/_view/morphemesPrecedenceContext?group=true";
//   if (!corpusSpecificGlosser) {
//     corpusSpecificGlosser = new Glosser({
//       dbname: dbname
//     });
//   }
//   if (!corpusSpecificGlosser.lexicon) {
//     corpusSpecificGlosser.downloadPrecedenceRules(dbname, optionalUrl, function(precedenceRelations) {
//       corpusSpecificGlosser.lexicon = lexiconFactory({
//         precedenceRelations: precedenceRelations,
//         dbname: dbname,
//         element: document.getElementById(dbname+"-lexicon-viz"),
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
      if (!$scope.corpus || !$scope.corpus.currentSession) {
        return;
      }
      var tempDatum;
      if (datumornewdatum === "newDatum") {
        if (!$scope.corpus.currentSession.newDatum) {
          return;
        }
        tempDatum = $scope.corpus.currentSession.newDatum;
      } else {
        if (!$scope.corpus.currentSession.docs || !$scope.corpus.currentSession.docs._collection || !$scope.corpus.currentSession.activeDatumIndex) {
          return;
        }
        tempDatum = $scope.corpus.currentSession.docs._collection[$scope.corpus.currentSession.activeDatumIndex];
      }
      var currentValue = tempDatum[fieldKey];
      if (debuggingMode) {
        console.log('requesting semi-automatic glosser: ' + originalvalue + '->' + currentValue);
      }

      if (tempDatum.rev) {
        // $rootScope.markAsEdited(currentValue, tempDatum);
      } else {
        alert("TODO decide if its empty");
        if (JSON.stringify(tempDatum) === "{}") {
          return;
        }
        $rootScope.application.corpus.currentSession.newDatum.unsaved = true;
      }
      if (tempDatum.fossil && tempDatum.fossil.fields[fieldKey].value === currentValue) {
        return;
      }

      // tempDatum.dbname = tempDatum.pouchname = $scope.corpus.dbname;
      if (fieldKey === 'utterance') {
        tempDatum = Glosser.guessMorphemesFromUtterance(tempDatum, !$scope.useAutoGlosser);
      } else if (fieldKey === 'morphemes') {
        tempDatum = Glosser.guessUtteranceFromMorphemes(tempDatum, !$scope.useAutoGlosser);
        tempDatum = Glosser.guessGlossFromMorphemes(tempDatum, !$scope.useAutoGlosser);
      }
    };

  };

  return {
    template: function(element, attrs) {
      console.log('loading template for fielddbGlosserInput', attrs);
      var templateString =
        '<input class="spreadsheet-row"' +
        '  ng-repeat="corpusField in corpus.fieldsInColumns.' + attrs.columnlabel + ' track by $index"' +
        '  ng-blur="runGlosserUsingThisField(corpusField.id, ' + attrs.datumornewdatum + '.fields[corpusField.id].value, ' + attrs.datumornewdatum + ', $event)"' +
        '  type="{{corpusField.type}}"' +
        '  placeholder="{{corpusField.label}}"' +
        '  ng-hide="corpusField.showToUserTypes == \'readonly\'" ' +
        '  title="{{corpusField.help}}"' +
        '  ng-model="' + attrs.datumornewdatum + '.fields[corpusField.id].value"' +
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
