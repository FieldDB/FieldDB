"use strict";

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbDoc
 * @description
 * # fielddbDoc
 */
angular.module("fielddbAngularApp").directive("fielddbDoc", function($compile) {
  var templates = {
    UserMask: "<div data-fielddb-user view='UserMask' json='doc' corpus='corpus'></div>",
    User: "<div data-fielddb-user view='User' json='doc' corpus='corpus'></div>",
    Team: "<div data-fielddb-user view='UserMask' json='doc' corpus='corpus'></div>",
    Speaker: "<div data-fielddb-user view='UserMask' json='doc' corpus='corpus'></div>",
    Consultant: "<div data-fielddb-user view='UserMask' json='doc' corpus='corpus'></div>",
    Participant: "<div data-fielddb-user view='Participant' json='doc' corpus='corpus'></div>",

    Corpus: "<div data-fielddb-corpus json='doc' corpus='corpus'></div>",
    Session: "<div data-fielddb-datum json='doc' corpus='corpus'></div>",

    DataList: "<div data-fielddb-datalist json='doc' corpus='corpus'></div>",
    LessonDataList: "<div data-fielddb-datalist json='doc' corpus='corpus' view='LessonDataList'></div>",
    SubExperimentDataList: "<div class='well' data-fielddb-datalist json='doc' corpus='corpus' view='SubExperimentDataList'></div>",

    Document: "<div class='well' data-fielddb-datum json='doc' corpus='corpus'></div>",
    DatumField: "<div class='well' data-fielddb-datum-field json='doc' corpus='corpus'></div>",
    Datum: "<div class='well' data-fielddb-datum json='doc' corpus='corpus'></div>",
    MultipleChoice: "<div data-fielddb-datum json='doc' corpus='corpus'></div>",
    Stimulus: "<div data-fielddb-datum json='doc' corpus='corpus'></div>",

    Response: "<div data-fielddb-datum json='doc' corpus='corpus'></div>"
  };
  return {
    template: "{{doc.fieldDBtype}} Unable to display this document. {{doc._id}}",
    restrict: "A",
    transclude: false,
    scope: {
      doc: "=json",
      corpus: "=corpus"
    },
    link: function postLink(scope, element, attrs) {

      // https://docs.angularjs.org/api/ng/service/$compile
      scope.$watch(
        function(scope) {
          // watch the "compile" expression for changes
          return scope.$eval(attrs.compile);
        },
        function() {
          // console.log("Scope value changed", value);
          // when the "compile" expression changes
          // assign it into the current DOM
          console.log("doc type is ", scope.doc.fieldDBtype);
          if (templates[scope.doc.fieldDBtype]) {
            element.html(templates[scope.doc.fieldDBtype]);
            if (scope && scope.doc && !scope.doc.fetch) {
              console.warn("This doc doesnt have the FieldDBObject methods to it, cant turn it into a " + scope.doc.fieldDBtype + " without loosing its references. Please pass it as a complex object if you need its functionality.");
              // scope.doc = new FieldDB[scope.doc.fieldDBtype](scope.doc);
            }
          } else {
            element.html("{{doc.fieldDBtype}} Unable to display this document. {{doc | json}}");
            if (scope && scope.doc && scope.doc.fetch) {
              console.log("TODO fetch the doc details and refresh the render to the right template if necessary");
              // doc.fetch().then(function(){
              //   scope.$digest();
              // });
            }
          }
          // console.log("Using html: " + element.html());

          // compile the new DOM and link it to the current
          // scope.
          // NOTE: we only compile .childNodes so that
          // we don"t get into infinite loop compiling ourselves
          $compile(element.contents())(scope);
        }
      );

    }
  };
});
