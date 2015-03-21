'use strict';
var debugMode = true;

describe('Directive: fielddbGlosserInput', function() {

  // load the directive's module
  beforeEach(module('spreadsheetApp'));

  // load the directive's module and the template
  beforeEach(module('spreadsheetApp'));
  var el, scope, compileFunction;

  beforeEach(inject(function($rootScope, $compile) {
    // el = angular.element('<div class="span5" fielddb-glosser-input datumornewdatum="newFieldData" columnlabel="first" spreadsheet-catch-focus-on-arrow-press>');
    el = angular.element('<div class="span5" fielddb-glosser-input datumornewdatum="datum" columnlabel="first" spreadsheet-catch-focus-on-arrow-press>');
    scope = $rootScope.$new();
    scope.fieldsInColumns = [{
      'label': 'utterance',
      'title': 'Utterance',
      'hint': 'Unparsed utterance in the language, in orthography or transcription. Line 1 in your LaTeXed examples for handouts. Sample entry: amigas',
      '$$hashKey': '006'
    }, {
      'label': 'morphemes',
      'title': 'Morphemes',
      'hint': 'Morpheme-segmented utterance in the language. Used by the system to help generate glosses (below). Can optionally appear below (or instead of) the first line in your LaTeXed examples. Sample entry: amig-a-s',
      '$$hashKey': '007'
    }, {
      'label': 'gloss',
      'title': 'Gloss',
      'hint': 'Metalanguage glosses of each individual morpheme (above). Used by the system to help gloss, in combination with morphemes (above). It is Line 2 in your LaTeXed examples. We recommend Leipzig conventions (. for fusional morphemes, - for morpheme boundaries etc)  Sample entry: friend-fem-pl',
      '$$hashKey': '008'
    }];
    scope.datum = {
      'id': '2c31b34b7f52c50617e31f4a86101997',
      'rev': '14-e2436d5b14029bfea9c2ebc05a016c08',
      'judgement': '',
      'utterance': 'trying glosser again',
      'morphemes': 'try-ing gloss-er again',
      'gloss': 'try-ING gloss-AG again',
      'syntacticCategory': '',
      'syntacticTreeLatex': '',
      'translation': '',
      'tags': '',
      'validationStatus': '',
      'enteredByUser': {
        'username': 'testingspreadsheet',
        'gravatar': 'd3ab37db99e16d2c98b61cbedd87b921',
        'appVersion': '2.2.2ss'
      },
      'modifiedByUser': {
        'users': [{
          'username': 'testingspreadsheet',
          'gravatar': 'd3ab37db99e16d2c98b61cbedd87b921',
          'appVersion': '2.2.2ss',
          '$$hashKey': '02N'
        }]
      },
      'dateEntered': '2014-09-23T23:45:15.015Z',
      'dateModified': '2014-10-05T15:21:35.532Z',
      'comments': [],
      'session': {
        '_id': '2c31b34b7f52c50617e31f4a86001804',
        '_rev': '1-924b67c28c381fd840fcd11245a7772b',
        'pouchname': 'testingspreadsheet-firstcorpus',
        'comments': [],
        'sessionFields': [{
          'label': 'goal',
          'value': 'Change this session goal to the describe your first elicitiation session.',
          'mask': 'Change this session goal to the describe your first elicitiation session.',
          'encrypted': '',
          'shouldBeEncrypted': '',
          'help': 'The goals of the elicitation session, it could be why you set up the meeting, or some of the core contexts you were trying to elicit. Sample: collect some anti-passives',
          'userchooseable': 'disabled'
        }],
        'dateCreated': '2014-09-22T22:17:41.782Z',
        'dateModified': '2014-09-22T22:17:41.782Z',
        'collection': 'sessions',
        'timestamp': 1411424261782,
        'title': 'Change this session '
      },
      'audioVideo': [],
      'datumTags': [],
      'hasAudio': false,
      '$$hashKey': '00O',
      'timestamp': 1412522495532,
      'saved': 'no'
    };

    compileFunction = $compile(el);
    // bring html from templateCache
    scope.$digest();
    if (debugMode) {
      console.log('post compile', el.html()); // <== html here has {{}}
    }
  }));



  // http://stackoverflow.com/questions/17223850/how-to-test-directives-that-use-templateurl-and-controllers
  it('should make a edit datum for datum fields with contents from scope', function() {

    inject(function() {
      compileFunction(scope); // <== the html {{}} are bound
      scope.$digest(); // <== digest to get the render to show the bound values
      if (debugMode) {
        console.log('post link', el.html());
        console.log('scope corpus ', scope.corpus);
        console.log(angular.element(el.find('input')[0]));
      }
      expect(el.html()).toEqual('<!-- ngRepeat: corpusField in fieldsInColumns.first track by $index -->');
      // console.log(el.html());
      // expect(angular.element(el.find('input')[0]).html('testing glosser'));
      // expect(angular.element(el.find('input')[0]).html().trim()).toEqual('Sample: The materials included in this corpus');
    });
  });
});
