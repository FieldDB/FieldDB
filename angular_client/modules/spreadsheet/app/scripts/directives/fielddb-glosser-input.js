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

angular.module('spreadsheetApp').directive('fielddbGlosserInput', function() {

  var controller = function($scope, $rootScope) {
    console.log('loading controller for fielddbGlosserInput');

    $scope.keyListener = function($event) {
      var arrowkeys = [40, 38, 39, 37];
      if (arrowkeys.indexOf($event.keyCode) > -1) {
        return;
      }
    };

    $scope.runGlosserUsingThisField = function(label, originalvalue) {
      var currentValue = $scope.datum[label];
      console.log('requesting semi-automatic glosser: ' + originalvalue + '->' + currentValue);

      if ($scope.datum.rev) {
        $rootScope.markAsEdited($scope.fieldData, $scope.datum);
      } else {
        $rootScope.newRecordHasBeenEdited = true;
      }

      // $scope.datum.pouchname = $scope.DB.pouchname;
      if (label === 'utterance') {
        $scope.datum = Glosser.guessMorphemesFromUtterance($scope.datum, $scope.useAutoGlosser);
      } else if (label === 'morphemes') {
        $scope.datum = Glosser.guessUtteranceFromMorphemes($scope.datum, $scope.useAutoGlosser);
        $scope.datum = Glosser.guessGlossFromMorphemes($scope.datum, $scope.useAutoGlosser);
      }
    };

  };

  return {
    template: function(element, attrs) {
      console.log('loading template for fielddbGlosserInput', attrs);
      var templateString = '<input ' +
        'ng-repeat="corpusField in fieldsInColumns.' + attrs.columnlabel + '"' +
        'class="span5"' +
        'type="text"' +
        'ng-model="datum[corpusField.label]"' +
        'placeholder="{{corpusField.title}}"' +
        'title="{{corpusField.hint}}"' +
        'ng-blur="runGlosserUsingThisField(corpusField.label, datum[corpusField.label], $event)" />'

      return templateString;
    },
    restrict: 'A',
    controller: controller,
    link: function postLink() {
      // console.log('fielddbGlosserInput ', element.find('input'));
    }
  };
});
