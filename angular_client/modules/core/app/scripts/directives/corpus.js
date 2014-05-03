'use strict';

angular.module('fielddbAngularApp').directive('corpus', function($timeout) {

  // var corpus = {};

  var directiveDefinitionObject = {
    templateUrl: 'views/corpus.html', // or // function(tElement, tAttrs) { ... },
    restrict: 'A',
    transclude: false,
    scope: {
      corpus: '=json'
    },
    // controller: function($scope, $element, $attrs, $transclude, otherInjectables) {
    // controller: function($scope, $element, $attrs, $transclude) {
    //   console.log('in controller');
    //   console.log($element.html());
    // },
    link: function postLink(scope, element  ) {
      console.log('in the link function', element);
      // for (var information in scope.data) {
      //   if (scope.data.hasOwnProperty(information)) {
      //     corpus[information] = scope.data[information];
      //   }
      // }
      if(!scope.corpus.title){
        //simulate a late fetch of the information
        $timeout(function(){
          scope.corpus.gravatar = 'https://secure.gravatar.com/avatar/948814f0b1bc8bebd701a9732ab3ebbd.jpg?s=96&d=retro&r=pg';
          scope.corpus.title = 'CommunityCorpus';
          scope.corpus.description = 'This is a corpus which is editable by anyone in the LingSync community. You can add comments to data, import data, leave graffiti and help suggestions for other community members. We think that \'graffiti can give us a unique view into the daily life and customs of a people, for their casual expression encourages the recording of details that more formal writing would tend to ignore\' ref: http://nemingha.hubpages.com/hub/History-of-Graffiti';
          scope.corpus.termsOfUse = {
            'humanReadable': 'Sample: The materials included in this corpus are available for research and educational use. If you want to use the materials for commercial purposes, please notify the author(s) of the corpus (myemail@myemail.org) prior to the use of the materials. Users of this corpus can copy and redistribute the materials included in this corpus, under the condition that the materials copied/redistributed are properly attributed.  Modification of the data in any copied/redistributed work is not allowed unless the data source is properly cited and the details of the modification is clearly mentioned in the work. Some of the items included in this corpus may be subject to further access conditions specified by the owners of the data and/or the authors of the corpus.'
          };
          scope.corpus.license = {
            'title': 'Default: Creative Commons Attribution-ShareAlike (CC BY-SA).',
            'humanReadable': 'This license lets others remix, tweak, and build upon your work even for commercial purposes, as long as they credit you and license their new creations under the identical terms. This license is often compared to “copyleft” free and open source software licenses. All new works based on yours will carry the same license, so any derivatives will also allow commercial use. This is the license used by Wikipedia, and is recommended for materials that would benefit from incorporating content from Wikipedia and similarly licensed projects.',
            'link': 'http://creativecommons.org/licenses/by-sa/3.0/',
            'imgURL': '//i.creativecommons.org/l/by-sa/3.0/88x31.png'
          };
          scope.corpus.copyright = 'Default: Add names of the copyright holders of the corpus.';
        }, 1000);

      }
      // scope.corpus = corpus;
      // element.text('this is the corpus directive');
    },
    priority: 0,
    replace: false,
    controllerAs: 'stringAlias'
    // require: 'siblingDirectiveName', // or // ['^parentDirectiveName', '?optionalDirectiveName', '?^optionalParent'],
    // compile: function compile(tElement, tAttrs, transclude) {
    //   return {
    //     pre: function preLink(scope, iElement, iAttrs, controller) {
    //       console.log("in preLink");
    //     },
    //     post: function postLink(scope, iElement, iAttrs, controller) {
    //       console.log("in postLink");
    //       console.log(iElement.html());
    //       iElement.text('this is the corpus directive');
    //     }
    //   }
    //   // or
    //   // return function postLink( ... ) { ... }
    // }
  };
  return directiveDefinitionObject;
});
