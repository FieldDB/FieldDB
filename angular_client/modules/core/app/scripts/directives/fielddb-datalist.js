'use strict';

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbDatalist
 * @description
 * # fielddbDatalist
 */
angular.module('fielddbAngularApp').directive('fielddbDatalist', function($compile) {

  var fetchDatalistDocsExponentialDecay = 2000;

  var controller = function($scope, $timeout) {
    var fetchDatalistDocsIfEmpty = function() {

      if (!$scope.corpus || !$scope.corpus.confidential || !$scope.corpus.confidential.secretkey || !$scope.corpus.fetchCollection) {
        fetchDatalistDocsExponentialDecay = fetchDatalistDocsExponentialDecay * 2;
        $timeout(function() {
          if ($scope.datalist && $scope.datalist.docs && $scope.datalist.docs.length > 0) {
            return;
          } else {
            fetchDatalistDocsIfEmpty();
          }
        }, fetchDatalistDocsExponentialDecay);
        console.log(' No real corpus is available, waiting another ' + fetchDatalistDocsExponentialDecay + ' until trying to fetch docs again.');
        if ($scope.datalist) {
          $scope.datalist.fetchDatalistDocsExponentialDecay = fetchDatalistDocsExponentialDecay;
        }
        return;
      }

      $scope.corpus.authUrl = FieldDB.BASE_AUTH_URL;
      // $scope.corpus.debugMode = true;

      // console.log('fetching docs for ', $scope.corpus.toJSON());
      // $scope.datalist.title = '';
      var whatToFetch = $scope.datalist.api;
      if ($scope.datalist.docIds && $scope.datalist.docIds.length && $scope.datalist.docIds.length >= 0) {
        whatToFetch = $scope.datalist.docIds;
      }
      if (!whatToFetch || whatToFetch === []) {
        $scope.datalist.docs = [];
        $scope.$digest();
        return;
      }
      $scope.corpus.fetchCollection(whatToFetch).then(function(results) {
        // Reset the exponential decay to normal for subsequent requests
        fetchDatalistDocsExponentialDecay = 2000;

        console.log('downloaded docs', results);
        $scope.datalist.docs = $scope.datalist.docs || [];
        results.map(function(doc) {
          if (doc.type && FieldDB[doc.type]) {
            $scope.corpus.debug('Converting doc into type ' + doc.type);
            doc.confidential = $scope.corpus.confidential;
            doc = new FieldDB[doc.type](doc);
          } else {
            var guessedType = doc.jsonType || doc.collection || 'FieldDBObject';
            if ($scope.datalist.api) {
              guessedType = $scope.datalist.api[0].toUpperCase() + $scope.datalist.api.substring(1, $scope.datalist.api.length);
            }
            guessedType = guessedType.replace(/s$/, '');
            if (guessedType === 'Datalist') {
              guessedType = 'DataList';
            }
            if (FieldDB[guessedType]) {
              $scope.corpus.warn('Converting doc into guessed type ' + guessedType);
              doc.confidential = $scope.corpus.confidential;
              doc = new FieldDB[guessedType](doc);
            } else {
              $scope.corpus.warn('This doc does not have a type, it might display oddly ', doc);
            }
          }

          $scope.datalist.docs.add(doc);
        });
        $scope.$digest();

      }, function(reason) {

        console.log('No docs docs...', reason);
        fetchDatalistDocsExponentialDecay = fetchDatalistDocsExponentialDecay * 2;
        $scope.datalist.fetchDatalistDocsExponentialDecay = fetchDatalistDocsExponentialDecay;
        console.log(' No connetion, Waiting another ' + fetchDatalistDocsExponentialDecay + ' until trying to fetch docs again.');
        $scope.$digest();

        $timeout(function() {
          if ($scope.datalist && $scope.datalist.docs && $scope.datalist.docs.length > 0) {
            return;
          } else {
            fetchDatalistDocsIfEmpty();
          }
        }, fetchDatalistDocsExponentialDecay);

      });

    };

    fetchDatalistDocsIfEmpty();

    $scope.canAddNewItemsToDataList = function() {
      return false;
    };

  };
  controller.$inject = ['$scope', '$timeout'];

  // http://stackoverflow.com/questions/21835471/angular-js-directive-dynamic-templateurl
  var templates = {
    DataList: 'views/datalist.html',
    Lesson: 'views/datalist.html',
    SubExperimentDataList: 'views/sub-experiment-datalist.html'
  };

  var directiveDefinitionObject = {
    template: '<div ng-include="contentUrl"></div>',
    restrict: 'A',
    transclude: false,
    scope: {
      datalist: '=json',
      corpus: '=corpus'
    },
    controller: controller,
    link: function postLink(scope, element, attrs) {

      // https://docs.angularjs.org/api/ng/service/$compile
      scope.$watch(
        function(scope) {
          // watch the 'compile' expression for changes
          return scope.$eval(attrs.compile);
        },
        function(value) {
          console.log('Datalist Scope value changed', value);
          // when the 'compile' expression changes
          // assign it into the current DOM
          if (!scope.doc) {
            return;
          }
          console.log('doc type is ', scope.doc.type);
          if (templates[scope.doc.type]) {
            scope.contentUrl = templates[scope.doc.type];
            // element.html(templates[scope.doc.type]);
            if (scope && scope.doc && !scope.doc.fetch) {
              console.warn('This doc doesnt have the FieldDBObject methods to it, cant turn it into a ' + scope.doc.type + ' without loosing its references. Please pass it as a complex object if you need its functionality.');
              // scope.doc = new FieldDB[scope.doc.type](scope.doc);
            }
          } else {
            // element.html('{{doc.type}} Unable to display this document. {{doc._id}}');
            scope.contentUrl = templates.DataList;

            if (scope && scope.doc && scope.doc.fetch) {
              console.log('TODO fetch the doc details and refresh the render to the right template if necessary');
              // doc.fetch().then(function(){
              //   scope.$digest();
              // });
            }
          }
          // attrs.$observe("ver", function(v) {
          //   scope.contentUrl = 'content/excerpts/hymn-' + v + '.html';
          // });
          console.log('Using html: ' + element.html());

          // compile the new DOM and link it to the current
          // scope.
          // NOTE: we only compile .childNodes so that
          // we don't get into infinite loop compiling ourselves
          $compile(element.contents())(scope);
        }
      );

    },
    priority: 0,
    replace: false,
    controllerAs: 'stringAlias'
  };
  return directiveDefinitionObject;
});
