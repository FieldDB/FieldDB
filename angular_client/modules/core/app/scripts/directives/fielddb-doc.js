/*globals FieldDB */
'use strict';

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbDoc
 * @description
 * # fielddbDoc
 */
angular.module('fielddbAngularApp').directive('fielddbDoc', function($compile) {
  var templates = {
    UserMask: '<div data-fielddb-user json="doc"></div>',
    User: '<div data-fielddb-user json="doc"></div>',
    Team: '<div data-fielddb-user json="doc"></div>',
    Speaker: '<div data-fielddb-user json="doc"></div>',
    Consultant: '<div data-fielddb-user json="doc"></div>',
    Participant: '<div data-fielddb-user json="doc"></div>',

    Corpus: '<div data-fielddb-corpus json="doc"></div>',
    Session: '<div data-fielddb-user json="doc"></div>',

    DataList: '<div data-fielddb-datalist json="doc"></div>',
    Lesson: '<div data-fielddb-datalist json="doc"></div>',
    TestBlock: '<div data-fielddb-datalist json="doc"></div>',

    Datum: '<div data-fielddb-user json="doc"></div>',
    MultipleChoice: '<div data-fielddb-user json="doc"></div>',
    Stimulus: '<div data-fielddb-user json="doc"></div>',

    Response: '<div data-fielddb-user json="doc"></div>'
  };
  return {
    template: '{{doc.type}} Unable to display this document.',
    restrict: 'A',
    transclude: false,
    scope: {
      doc: '=json'
    },
    link: function postLink(scope, element, attrs) {

      // https://docs.angularjs.org/api/ng/service/$compile
      scope.$watch(
        function(scope) {
          // watch the 'compile' expression for changes
          return scope.$eval(attrs.compile);
        },
        function(value) {
          // when the 'compile' expression changes
          // assign it into the current DOM
          console.log('doc type is ', scope.doc.type);
          if (templates[scope.doc.type]) {
            element.html(templates[scope.doc.type]);
            if (scope && scope.doc && !scope.doc.toJSON) {
              console.warn('This doc doesnt have the FieldDBObject methods to it, cant turn it into a ' + scope.doc.type + ' without loosing its references. Please pass it as a complex object if you need its functionality.');
              // scope.doc = new FieldDB[scope.doc.type](scope.doc);
            }
          } else {
            element.html('{{doc.type}} Unable to display this document.');
          }
          console.log('Using html: ' + element.html());

          // compile the new DOM and link it to the current
          // scope.
          // NOTE: we only compile .childNodes so that
          // we don't get into infinite loop compiling ourselves
          $compile(element.contents())(scope);
        }
      );

    }
  };
});
