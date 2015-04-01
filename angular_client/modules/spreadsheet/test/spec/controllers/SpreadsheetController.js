'use strict';

var prefsV236 = {
  'userChosenTemplateId': 'fulltemplate',
  'resultSize': 3,
  'version': '2.36.30.16.09ss',
  'savedState': {
    'server': 'localhost',
    'username': 'testingspreadsheet',
    'password': '{\'iv\':\'PdXtF9isnS4vYHJywOoDSw==\',\'v\':1,\'iter\':1000,\'ks\':128,\'ts\':64,\'mode\':\'ccm\',\'adata\':\'\',\'cipher\':\'aes\',\'salt\':\'y8emhEN8a/w=\',\'ct\':\'UyvZtnvFkrKF1vGb\'}',
    'DB': '',
    'sessionID': ''
  },
  'availableFields': {
    'judgement': {
      'label': 'judgement',
      'title': 'Grammaticality Judgement',
      'hint': 'Grammaticality/acceptability judgement (*,#,?,1-3 etc). Leaving it blank usually means grammatical/acceptable, or your team can choose any symbol for this meaning.'
    },
    'utterance': {
      'label': 'utterance',
      'title': 'Utterance',
      'hint': 'Unparsed utterance in the language, in orthography or transcription. Line 1 in your LaTeXed examples for handouts. Sample entry: amigas'
    },
    'morphemes': {
      'label': 'morphemes',
      'title': 'Morphemes',
      'hint': 'Morpheme-segmented utterance in the language. Used by the system to help generate glosses (below). Can optionally appear below (or instead of) the first line in your LaTeXed examples. Sample entry: amig-a-s'
    },
    'gloss': {
      'label': 'gloss',
      'title': 'Gloss',
      'hint': 'Metalanguage glosses of each individual morpheme (above). Used by the system to help gloss, in combination with morphemes (above). It is Line 2 in your LaTeXed examples. We recommend Leipzig conventions (. for fusional morphemes, - for morpheme boundaries etc)  Sample entry: friend-fem-pl'
    },
    'translation': {
      'label': 'translation',
      'title': 'Translation',
      'hint': 'The team\'s primary translation. It might not be English, just a language the team is comfortable with (in which case you should change the lable to the language you are using). There may also be additional translations in the other fields.'
    },
    'refs': {
      'label': 'refs',
      'title': 'References'
    },
    'goal': {
      'label': 'goal',
      'title': 'Goal'
    },
    'consultants': {
      'label': 'consultants',
      'title': 'Consultants'
    },
    'dialect': {
      'label': 'dialect',
      'title': 'Dialect'
    },
    'language': {
      'label': 'language',
      'title': 'language'
    },
    'tags': {
      'label': 'tags',
      'title': 'Tags'
    },
    'validationStatus': {
      'label': 'validationStatus',
      'title': 'validationStatus'
    },
    'syntacticCategory': {
      'label': 'syntacticCategory',
      'title': 'syntacticCategory',
      'hint': 'This optional field is used by the machine to help with search and data cleaning, in combination with morphemes and gloss (above). If you want to use it, you can choose to use any sort of syntactic category tagging you wish. It could be very theoretical like Distributed Morphology (Sample entry: √-GEN-NUM), or very a-theroretical like the Penn Tree Bank Tag Set. (Sample entry: NNS) http://www.ims.uni-stuttgart.de/projekte/CorpusWorkbench/CQP-HTMLDemo/PennTreebankTS.html'
    },
    'allomorphs': {
      'label': 'allomorphs',
      'title': 'Allomorphs'
    },
    'phonetic': {
      'label': 'phonetic',
      'title': 'Phonetic'
    },
    'housekeeping': {
      'label': 'housekeeping',
      'title': 'Housekeeping'
    },
    'spanish': {
      'label': 'spanish',
      'title': 'Spanish'
    },
    'orthography': {
      'label': 'orthography',
      'title': 'Orthography',
      'hint': 'Many teams will only use the utterance line. However if your team needs to distinguish between utterance and orthography this is the unparsed word/sentence/dialog/paragraph/document in the language, in its native orthography which speakers can read. If there are more than one orthography an additional orthography field can be added to the corpus. This is Line 0 in your LaTeXed examples for handouts (if you distinguish the orthography from the utterance line and you choose to display the orthography for your language consultants and/or native speaker linguists). Sample entry: amigas'
    }
  },
  'compacttemplate': {
    'field1': {
      'label': 'utterance',
      'title': 'Utterance'
    },
    'field2': {
      'label': 'morphemes',
      'title': 'Morphemes'
    },
    'field3': {
      'label': 'gloss',
      'title': 'Gloss'
    },
    'field4': {
      'label': 'translation',
      'title': 'Translation'
    }
  },
  'fulltemplate': {
    'field1': {
      'label': 'utterance',
      'title': 'Utterance'
    },
    'field2': {
      'label': 'morphemes',
      'title': 'Morphemes'
    },
    'field3': {
      'label': 'gloss',
      'title': 'Gloss'
    },
    'field4': {
      'label': 'translation',
      'title': 'Translation'
    },
    'field5': {
      'label': 'phonetic',
      'title': 'IPA'
    },
    'field6': {
      'label': 'tags',
      'title': 'Tags'
    }
  },
  'mcgillfieldmethodsspring2014template': {
    'field1': {
      'label': 'utterance',
      'title': 'Utterance'
    },
    'field2': {
      'label': 'morphemes',
      'title': 'Morphemes'
    },
    'field3': {
      'label': 'gloss',
      'title': 'Gloss'
    },
    'field4': {
      'label': 'translation',
      'title': 'Translation'
    },
    'field5': {
      'label': 'judgement',
      'title': 'Grammaticality Judgement'
    },
    'field6': {
      'label': 'tags',
      'title': 'Tags'
    }
  },
  'mcgillfieldmethodsfall2014template': {
    'field1': {
      'label': 'utterance',
      'title': 'Utterance'
    },
    'field2': {
      'label': 'morphemes',
      'title': 'Morphemes'
    },
    'field3': {
      'label': 'gloss',
      'title': 'Gloss'
    },
    'field4': {
      'label': 'translation',
      'title': 'Translation'
    },
    'field5': {
      'label': 'phonetic',
      'title': 'IPA'
    },
    'field6': {
      'label': 'notes',
      'title': 'Notes'
    }
  },
  'yalefieldmethodsspring2014template': {
    'field1': {
      'label': 'orthography',
      'title': 'Orthography'
    },
    'field2': {
      'label': 'utterance',
      'title': 'Utterance'
    },
    'field3': {
      'label': 'morphemes',
      'title': 'Morphemes'
    },
    'field4': {
      'label': 'gloss',
      'title': 'Gloss'
    },
    'field5': {
      'label': 'translation',
      'title': 'Translation'
    },
    'field6': {
      'label': 'spanish',
      'title': 'Spanish'
    },
    'field7': {
      'label': 'housekeeping',
      'title': 'Housekeeping'
    },
    'field8': {
      'label': 'tags',
      'title': 'Tags'
    }
  },
  'fullTemplateDefaultNumberOfColumns': 2,
  'fullTemplateDefaultNumberOfFieldsPerColumn': 3
};
localStorage.setItem('SpreadsheetPreferences', JSON.stringify(prefsV236));

describe('Controller: SpreadsheetStyleDataEntryController', function() {

  // load the controller's module
  beforeEach(module('spreadsheetApp'));

  var SpreadsheetStyleDataEntryController,
    scope,
    rootScope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller, $rootScope) {
    rootScope = $rootScope;
    scope = $rootScope.$new();
    scope.allData = [{
      utterance: 'one'
    }, {
      utterance: 'two'
    }, {
      utterance: 'three'
    }, {
      utterance: 'four'
    }, {
      utterance: 'five'
    }, {
      utterance: 'six'
    }, {
      utterance: 'seven'
    }, {
      utterance: 'eight'
    }, {
      utterance: 'nine'
    }, {
      utterance: 'ten'
    }, {
      utterance: 'eleven'
    }];

    localStorage.setItem('useAutoGlosser', 'false');
    // Prefernces circa version 1.93ss
    // localStorage.setItem('SpreadsheetPreferences', '{\"userChosenTemplateId\":\"mcgillfieldmethodsspring2014template\",\"resultSize\":3,\"savedState\":{\"server\":\"production\",\"username\":\"lingllama\",\"password\":\"{\\"iv\\":\\"Rd2lDH+nzH/3PIfUeaNXxw\\",\\"v\\":1,\\"iter\\":1000,\\"ks\\":128,\\"ts\\":64,\\"mode\\":\\"ccm\\",\\"adata\\":\\"\\",\\"cipher\\":\\"aes\\",\\"salt\\":\\"2M2W9iOA+Mg\\",\\"ct\\":\\"3u9s5yAX3zL19rxPWGG+QQ\\"}\",\"mostRecentCorpusPouchname\":\"lingllama-communitycorpus\",\"sessionID\":\"723a8b707e579087aa36c2e33869680a\",\"sessionTitle\":\"All Sessions\"},\"availableFields\":{\"judgement\":{\"label\":\"judgement\",\"title\":\"Grammaticality Judgement\"},\"utterance\":{\"label\":\"utterance\",\"title\":\"Utterance\"},\"morphemes\":{\"label\":\"morphemes\",\"title\":\"Morphemes\"},\"gloss\":{\"label\":\"gloss\",\"title\":\"Gloss\"},\"translation\":{\"label\":\"translation\",\"title\":\"Translation\"},\"refs\":{\"label\":\"refs\",\"title\":\"References\"},\"goal\":{\"label\":\"goal\",\"title\":\"Goal\"},\"consultants\":{\"label\":\"consultants\",\"title\":\"Consultants\"},\"dialect\":{\"label\":\"dialect\",\"title\":\"Dialect\"},\"language\":{\"label\":\"language\",\"title\":\"language\"},\"dateElicited\":{\"label\":\"dateElicited\",\"title\":\"Date Elicited\"},\"user\":{\"label\":\"user\",\"title\":\"User\"},\"dateSEntered\":{\"label\":\"dateSEntered\",\"title\":\"Date entered\"},\"tags\":{\"label\":\"tags\",\"title\":\"Tags\"},\"validationStatus\":{\"label\":\"validationStatus\",\"title\":\"validationStatus\"},\"syntacticCategory\":{\"label\":\"syntacticCategory\",\"title\":\"syntacticCategory\"},\"allomorphs\":{\"label\":\"allomorphs\",\"title\":\"Allomorphs\"},\"phonetic\":{\"label\":\"phonetic\",\"title\":\"Phonetic\"},\"housekeeping\":{\"label\":\"housekeeping\",\"title\":\"Housekeeping\"},\"spanish\":{\"label\":\"spanish\",\"title\":\"Spanish\"},\"orthography\":{\"label\":\"orthography\",\"title\":\"Orthography\"}},\"compacttemplate\":{\"field1\":{\"label\":\"utterance\",\"title\":\"Utterance\"},\"field2\":{\"label\":\"morphemes\",\"title\":\"Morphemes\"},\"field3\":{\"label\":\"gloss\",\"title\":\"Gloss\"},\"field4\":{\"label\":\"translation\",\"title\":\"Translation\"}},\"fulltemplate\":{\"field1\":{\"label\":\"phonetic\",\"title\":\"Phonetic\"},\"field2\":{\"label\":\"morphemes\",\"title\":\"Morphemes\"},\"field3\":{\"label\":\"gloss\",\"title\":\"Gloss\"},\"field4\":{\"label\":\"translation\",\"title\":\"Translation\"},\"field5\":{\"label\":\"comments\",\"title\":\"Comments\"},\"field6\":{\"label\":\"validationStatus\",\"title\":\"validationStatus\"},\"field7\":{\"label\":\"tags\",\"title\":\"Tags\"},\"field8\":{\"label\":\"\",\"title\":\"\"}},\"mcgillfieldmethodsspring2014template\":{\"field1\":{\"label\":\"utterance\",\"title\":\"Utterance\"},\"field2\":{\"label\":\"morphemes\",\"title\":\"Morphemes\"},\"field3\":{\"label\":\"gloss\",\"title\":\"Gloss\"},\"field4\":{\"label\":\"translation\",\"title\":\"Translation\"},\"field5\":{\"label\":\"judgement\",\"title\":\"Grammaticality Judgement\"},\"field6\":{\"label\":\"tags\",\"title\":\"Tags\"},\"field8\":{\"label\":\"\",\"title\":\"\"}},\"yalefieldmethodsspring2014template\":{\"field1\":{\"label\":\"orthography\",\"title\":\"Orthography\"},\"field2\":{\"label\":\"utterance\",\"title\":\"Utterance\"},\"field3\":{\"label\":\"morphemes\",\"title\":\"Morphemes\"},\"field4\":{\"label\":\"gloss\",\"title\":\"Gloss\"},\"field5\":{\"label\":\"translation\",\"title\":\"Translation\"},\"field6\":{\"label\":\"spanish\",\"title\":\"Spanish\"},\"field7\":{\"label\":\"housekeeping\",\"title\":\"Housekeeping\"},\"field8\":{\"label\":\"tags\",\"title\":\"Tags\"}}}');
    // Preferences circa version 2.36
    localStorage.setItem('SpreadsheetPreferences', JSON.stringify(prefsV236));

    SpreadsheetStyleDataEntryController = $controller('SpreadsheetStyleDataEntryController', {
      $scope: scope
    });
  }));

  describe('old functionality', function() {
    it('should have all the old things in scope that it had before', function() {
      // expect(typeof scope.open).toBe('function');
      // expect(typeof scope.close).toBe('function');
      // expect(typeof scope.opts).toBe('object');
      expect(typeof scope.openNotification).toBe('function');
      // expect(typeof scope.closeNotification).toBe('function');
      // expect(scope.openWelcomeNotification).toBeUndefined();
      expect(typeof scope.openWelcomeNotificationDeprecated).toBe('function');
      // expect(typeof scope.closeWelcomeNotification).toBe('function');
    });

    it('should have all the old things for loading in scope that it had before', function() {
      expect(typeof scope.changeActiveSubMenu).toBe('function');
      expect(typeof scope.navigateVerifySaved).toBe('function');
      expect(typeof scope.loadSessions).toBe('function');
      expect(typeof scope.loadData).toBe('function');
      expect(typeof scope.loadAutoGlosserRules).toBe('function');

      expect(typeof scope.reloadPage).toBe('function');

      expect(typeof scope.numberOfResultPages).toBe('function');
      expect(typeof scope.loadPaginatedData).toBe('function');
      expect(typeof scope.reloadPage).toBe('function');
    });

    it('should calculate numberOfResultPages', function() {
      // expect(scope.numberOfResultPages()).toBe(0);
      // expect(scope.resultSize).toBe(3);
      // expect(scope.numberOfResultPages(13)).toBe(5);

      // rootScope.user.prefs.numVisibleDatum = 5;
      // expect(scope.numberOfResultPages(13)).toBe(3);
    });

    it('should monitor currenPage to trigger pagination of the data', function() {
      // scope.loadPaginatedData();
      // // expect(scope.data).toBeDefined();
      // // expect(scope.data[1]).toEqual({
      // //   utterance: 'two'
      // // });
      // // expect(scope.data.length).toEqual(rootScope.resultSize);

      // rootScope.currentPage += 1;
      // console.warn('TODO the watch on currentPage isnt getting triggered in the tests, triggering it manuall');
      // scope.loadPaginatedData();
      // // expect(scope.data[1]).toEqual({
      // //   utterance: 'five'
      // // });
    });

    it('should have all the old things for authentication in scope that it had before', function() {
      expect(typeof scope.loginUser).toBe('function');
      expect(typeof scope.logout).toBe('function');

      expect(typeof scope.registerNewUser).toBe('function');

      expect(typeof scope.resetPasswordInfo).toBe('object');
      expect(typeof scope.changePasswordSubmit).toBe('function');

    });

    it('should have all the old things for template prefs in scope that it had before', function() {
      // expect(typeof scope.overrideTemplateSetting).toBeUndefined();
      // expect(typeof scope.setAsDefaultCorpusTemplate).toBeUndefined();
    });

    it('should have all the old things for sessions in scope that it had before', function() {
      // expect(typeof scope.selectSession).toBeUndefined();
      // expect(typeof scope.changeActiveSessionID).toBeUndefined();
      // expect(typeof scope.getCurrentSessionName).toBeUndefined();
      expect(typeof scope.editSession).toBe('function');
      expect(typeof scope.deleteEmptySession).toBe('function');
      expect(typeof scope.createNewSession).toBe('function');
    });

    it('should have all the old things for datum in scope that it had before', function() {
      // expect(typeof scope.deleteRecord).toBeUndefined();
      // expect(typeof scope.createRecord).toBeUndefined();
      // expect(typeof scope.markAsEdited).toBeUndefined();
      // expect(typeof scope.addComment).toBeUndefined();
      // expect(typeof scope.deleteComment).toBeUndefined();
      // expect(typeof scope.saveChanges).toBeUndefined();

      expect(typeof scope.getSavedState).toBe('function');
      // expect(typeof scope.newRecordHasBeenEditedButtonClass).toBeUndefined();

      expect(typeof window.onbeforeunload).toBe('function');

    });

    it('should have all the old things for selecting searched datum in scope that it had before', function() {
      // expect(typeof scope.selectRow).toBeUndefined();

      expect(typeof scope.selectNone).toBe('function');

      expect(typeof scope.selectAll).toBe('function');

    });

    it('should have all the old things for search in scope that it had before', function() {
      expect(typeof scope.editSearchResults).toBe('function');

      expect(typeof scope.runSearch).toBe('function');

      expect(typeof scope.exportResults).toBe('function');

      // expect(typeof scope.mainBodyClass).toBeUndefined();
    });

    it('should have all the old things for activites in scope that it had before', function() {
      expect(typeof scope.addActivity).toBe('function');
      expect(typeof scope.uploadActivities).toBe('function');
    });

    it('should have all the old things for corpora in scope that it had before', function() {
      expect(typeof scope.selectCorpus).toBe('function');

      expect(typeof scope.createNewCorpus).toBe('function');
      expect(typeof scope.loadUsersAndRoles).toBe('function');
      expect(typeof scope.updateUserRoles).toBe('function');
      expect(typeof scope.removeAccessFromUser).toBe('function');
    });



  });


  it('should persist useAutoGlosser preferences from local storage', function() {
    expect(scope.useAutoGlosser).toBeFalsy();
    scope.useAutoGlosser = true;
    expect(localStorage.getItem('useAutoGlosser')).toBeTruthy();
  });

  it('should use the private services to get a list of connections', function() {
    expect(scope.servers).toBeUndefined();
    // expect(scope.connections).toBeDefined();
    // expect(scope.connections[0].serverCode).toBeDefined();
    // expect(scope.connections[0].userFriendlyServerName).toBeDefined();
    expect(scope.serverLabels).toBeUndefined();

  });

  it('should have some default preferences', function() {
    // expect(window.defaultPreferences).toBeDefined();
    // expect(scope.scopePreferences).toBeDefined();
    // expect(scope.scopePreferences.availableFields).toBeUndefined();
    // expect(scope.scopePreferences.fulltemplate).toBeUndefined();
    // expect(scope.scopePreferences.compacttemplate).toBeUndefined();

    // expect(scope.scopePreferences.mcgillfieldmethodsspring2014template).toBeUndefined();
    // expect(scope.scopePreferences.mcgillfieldmethodsfall2014template).toBeUndefined();
    // expect(scope.scopePreferences.yalefieldmethodsspring2014template).toBeUndefined();

    // expect(scope.scopePreferences.savedState).toBeDefined();
    // expect(scope.scopePreferences.savedState.sessionID).toBeUndefined();
    // expect(scope.scopePreferences.savedState.connection).toBeUndefined();
  });

  it('should override availableFields with the current defaults', function() {
    // expect(scope.scopePreferences.availableFields).toEqual(window.defaultPreferences.availableFields);
  });

  it('should always override field methods class preferences with the current defaults', function() {
    // expect(scope.scopePreferences.mcgillfieldmethodsspring2014template).toEqual(window.defaultPreferences.mcgillfieldmethodsspring2014template);
    // if (scope.scopePreferences.mcgillfieldmethodsfall2014template) {
    //   expect(scope.scopePreferences.mcgillfieldmethodsfall2014template).toEqual(window.defaultPreferences.mcgillfieldmethodsfall2014template);
    // }
    // expect(scope.scopePreferences.yalefieldmethodsspring2014template).toEqual(window.defaultPreferences.yalefieldmethodsspring2014template);
  });

  xit('should override fulltemplate with the current defaults', function() {
    expect(scope.scopePreferences.fulltemplate).toBeUndefined();
  });

  it('should use the mcgill template for any data entry', function() {
    expect(scope.scopePreferences).toBeUndefined();
    // expect(scope.scopePreferences.userChosenTemplateId).toBeUndefined();
  });

  xit('should upgrade fulltemplate to version 2.x', function() {
    expect(scope.scopePreferences.fulltemplate).toBeUndefined();
  });

  it('should not override number results per page with the current defaults', function() {
    // expect(scope.scopePreferences.resultSize).not.toEqual(window.defaultPreferences.resultSize);
  });

  it('should set some pagination control variables and functions ', function() {
    expect(scope.documentReady).toBeFalsy();
    expect(scope.orderProp).toEqual('dateEntered');
    expect(scope.currentPage).toEqual(0);
    expect(scope.reverse).toBeTruthy(); //TODO is this how we can get the data to show in cronological order!?

    expect(typeof scope.pageForward).toBe('function');
    expect(typeof scope.pageBackward).toBe('function');
  });

  it('should change the pageForward ', function() {
    expect(scope.currentPage).toEqual(0);
    scope.pageForward();
    expect(scope.currentPage).toEqual(1);
  });

  it('should set some view control variables', function() {
    expect(scope.authenticated).toBeFalsy();
    expect(scope.developer).toBeUndefined();
    expect(scope.dataentry).toBeFalsy();
    expect(scope.searching).toBeFalsy();

    expect(typeof scope.triggerExpandCollapse).toBe('function');
    // expect(typeof scope.setDataEntryFocusOn).toBe('function');
    // expect(typeof scope.hiddenOnLoading).toBeUndefined();


  });

  it('should set some session control variables', function() {
    expect(scope.activeSubMenu).toEqual('none');
    expect(scope.activeSessionID).toBeUndefined();
    expect(scope.currentSessionName).toBeUndefined();
    expect(scope.showCreateSessionDiv).toBeFalsy();
    expect(scope.editSessionDetails).toBeFalsy();
    expect(scope.createNewSessionDropdown).toBeFalsy();
  });

  it('should initialize some variables', function() {
    expect(scope.currentDate).toBeDefined();
    expect(scope.activities).toBeDefined();
    expect(scope.corpusSelected).toBeUndefined();
    expect(scope.newDatum).toBeUndefined();
    expect(scope.newFieldDatum).toBeUndefined();
  });

  it('should not set some audio recording control variables and functions', function() {
    expect(scope.recordingStatus).toBeUndefined();
  });

  it('should load preferences again when the $viewContentLoaded TODO try to manage prefs only once in the code', function() {
    // expect(scope.scopePreferences).toBeDefined();
    // expect(scope.scopePreferences.savedState).toBeDefined();
  });

});
