'use strict';

describe('Controller: SpreadsheetStyleDataEntryController', function() {

  // load the controller's module
  beforeEach(module('spreadsheetApp'));

  var SpreadsheetStyleDataEntryController,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller, $rootScope) {
    scope = $rootScope.$new();

    localStorage.setItem('useAutoGlosser', 'false');
    localStorage.setItem('SpreadsheetPreferences', '{\"userTemplate\":\"mcgillfieldmethodsspring2014template\",\"resultSize\":10,\"savedState\":{\"server\":\"production\",\"username\":\"lingllama\",\"password\":\"{\\"iv\\":\\"Rd2lDH+nzH/3PIfUeaNXxw\\",\\"v\\":1,\\"iter\\":1000,\\"ks\\":128,\\"ts\\":64,\\"mode\\":\\"ccm\\",\\"adata\\":\\"\\",\\"cipher\\":\\"aes\\",\\"salt\\":\\"2M2W9iOA+Mg\\",\\"ct\\":\\"3u9s5yAX3zL19rxPWGG+QQ\\"}\",\"mostRecentCorpusPouchname\":\"lingllama-communitycorpus\",\"sessionID\":\"723a8b707e579087aa36c2e33869680a\",\"sessionTitle\":\"All Sessions\"},\"availableFields\":{\"judgement\":{\"label\":\"judgement\",\"title\":\"Grammaticality Judgement\"},\"utterance\":{\"label\":\"utterance\",\"title\":\"Utterance\"},\"morphemes\":{\"label\":\"morphemes\",\"title\":\"Morphemes\"},\"gloss\":{\"label\":\"gloss\",\"title\":\"Gloss\"},\"translation\":{\"label\":\"translation\",\"title\":\"Translation\"},\"refs\":{\"label\":\"refs\",\"title\":\"References\"},\"goal\":{\"label\":\"goal\",\"title\":\"Goal\"},\"consultants\":{\"label\":\"consultants\",\"title\":\"Consultants\"},\"dialect\":{\"label\":\"dialect\",\"title\":\"Dialect\"},\"language\":{\"label\":\"language\",\"title\":\"language\"},\"dateElicited\":{\"label\":\"dateElicited\",\"title\":\"Date Elicited\"},\"user\":{\"label\":\"user\",\"title\":\"User\"},\"dateSEntered\":{\"label\":\"dateSEntered\",\"title\":\"Date entered\"},\"tags\":{\"label\":\"tags\",\"title\":\"Tags\"},\"validationStatus\":{\"label\":\"validationStatus\",\"title\":\"validationStatus\"},\"syntacticCategory\":{\"label\":\"syntacticCategory\",\"title\":\"syntacticCategory\"},\"allomorphs\":{\"label\":\"allomorphs\",\"title\":\"Allomorphs\"},\"phonetic\":{\"label\":\"phonetic\",\"title\":\"Phonetic\"},\"housekeeping\":{\"label\":\"housekeeping\",\"title\":\"Housekeeping\"},\"spanish\":{\"label\":\"spanish\",\"title\":\"Spanish\"},\"orthography\":{\"label\":\"orthography\",\"title\":\"Orthography\"}},\"compacttemplate\":{\"field1\":{\"label\":\"utterance\",\"title\":\"Utterance\"},\"field2\":{\"label\":\"morphemes\",\"title\":\"Morphemes\"},\"field3\":{\"label\":\"gloss\",\"title\":\"Gloss\"},\"field4\":{\"label\":\"translation\",\"title\":\"Translation\"}},\"fulltemplate\":{\"field1\":{\"label\":\"phonetic\",\"title\":\"Phonetic\"},\"field2\":{\"label\":\"morphemes\",\"title\":\"Morphemes\"},\"field3\":{\"label\":\"gloss\",\"title\":\"Gloss\"},\"field4\":{\"label\":\"translation\",\"title\":\"Translation\"},\"field5\":{\"label\":\"comments\",\"title\":\"Comments\"},\"field6\":{\"label\":\"validationStatus\",\"title\":\"validationStatus\"},\"field7\":{\"label\":\"tags\",\"title\":\"Tags\"},\"field8\":{\"label\":\"\",\"title\":\"\"}},\"mcgillfieldmethodsspring2014template\":{\"field1\":{\"label\":\"utterance\",\"title\":\"Utterance\"},\"field2\":{\"label\":\"morphemes\",\"title\":\"Morphemes\"},\"field3\":{\"label\":\"gloss\",\"title\":\"Gloss\"},\"field4\":{\"label\":\"translation\",\"title\":\"Translation\"},\"field5\":{\"label\":\"judgement\",\"title\":\"Grammaticality Judgement\"},\"field6\":{\"label\":\"tags\",\"title\":\"Tags\"},\"field8\":{\"label\":\"\",\"title\":\"\"}},\"yalefieldmethodsspring2014template\":{\"field1\":{\"label\":\"orthography\",\"title\":\"Orthography\"},\"field2\":{\"label\":\"utterance\",\"title\":\"Utterance\"},\"field3\":{\"label\":\"morphemes\",\"title\":\"Morphemes\"},\"field4\":{\"label\":\"gloss\",\"title\":\"Gloss\"},\"field5\":{\"label\":\"translation\",\"title\":\"Translation\"},\"field6\":{\"label\":\"spanish\",\"title\":\"Spanish\"},\"field7\":{\"label\":\"housekeeping\",\"title\":\"Housekeeping\"},\"field8\":{\"label\":\"tags\",\"title\":\"Tags\"}}}');

    SpreadsheetStyleDataEntryController = $controller('SpreadsheetStyleDataEntryController', {
      $scope: scope
    });
  }));

  describe('old functionality', function() {
    it('should have all the old things in scope that it had before', function() {
      expect(typeof scope.open).toBe('function');
      expect(typeof scope.close).toBe('function');
      expect(typeof scope.opts).toBe('object');
      expect(typeof scope.openNotification).toBe('function');
      expect(typeof scope.closeNotification).toBe('function');
      expect(typeof scope.openWelcomeNotification).toBe('function');
      expect(typeof scope.closeWelcomeNotification).toBe('function');
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

    it('should have all the old things for authentication in scope that it had before', function() {
      expect(typeof scope.loginUser).toBe('function');
      expect(typeof scope.logOut).toBe('function');

      expect(typeof scope.registerNewUser).toBe('function');

      expect(typeof scope.resetPasswordInfo).toBe('object');
      expect(typeof scope.changePasswordSubmit).toBe('function');

    });

    it('should have all the old things for template prefs in scope that it had before', function() {
      expect(typeof scope.overrideTemplateSetting).toBe('function');
      expect(typeof scope.setAsDefaultCorpusTemplate).toBe('function');
    });

    it('should have all the old things for sessions in scope that it had before', function() {
      expect(typeof scope.selectSession).toBe('function');
      expect(typeof scope.changeActiveSession).toBe('function');
      expect(typeof scope.getCurrentSessionName).toBe('function');
      expect(typeof scope.editSession).toBe('function');
      expect(typeof scope.deleteEmptySession).toBe('function');
      expect(typeof scope.createNewSession).toBe('function');
    });

    it('should have all the old things for datum in scope that it had before', function() {
      expect(typeof scope.deleteRecord).toBe('function');
      expect(typeof scope.createRecord).toBe('function');
      expect(typeof scope.markAsEdited).toBe('function');
      expect(typeof scope.addComment).toBe('function');
      expect(typeof scope.deleteComment).toBe('function');
      expect(typeof scope.saveChanges).toBe('function');

      expect(typeof scope.getSavedState).toBe('function');
      expect(typeof scope.newRecordHasBeenEditedButtonClass).toBe('function');

      expect(typeof window.onbeforeunload).toBe('function');

    });

    it('should have all the old things for selecting searched datum in scope that it had before', function() {
      expect(typeof scope.selectRow).toBe('function');

      expect(typeof scope.selectNone).toBe('function');

      expect(typeof scope.selectAll).toBe('function');

    });

    it('should have all the old things for search in scope that it had before', function() {
      expect(typeof scope.editSearchResults).toBe('function');

      expect(typeof scope.runSearch).toBe('function');

      expect(typeof scope.exportResults).toBe('function');

      expect(typeof scope.mainBodyClass).toBe('function');
    });

    it('should have all the old things for activites in scope that it had before', function() {
      expect(typeof scope.addActivity).toBe('function');
      expect(typeof scope.uploadActivities).toBe('function');
    });

    it('should have all the old things for corpora in scope that it had before', function() {
      expect(typeof scope.selectDB).toBe('function');

      expect(typeof scope.createNewCorpus).toBe('function');
      expect(typeof scope.loadUsersAndRoles).toBe('function');
      expect(typeof scope.updateUserRoles).toBe('function');
      expect(typeof scope.removeUserFromCorpus).toBe('function');
    });



  });


  it('should persist useAutoGlosser preferences from local storage', function() {
    expect(scope.useAutoGlosser).toBeFalsy();
    scope.useAutoGlosser = true;
    expect(localStorage.getItem('useAutoGlosser')).toBeTruthy();
  });

  it('should use the private services to get a list of servers', function() {
    expect(scope.servers).toBeDefined();
    expect(scope.servers[0].serverCode).toBeDefined();
    expect(scope.servers[0].userFriendlyServerName).toBeDefined();
    expect(scope.serverLabels).toBeDefined();
    // expect(scope.serverLabels).toEqual(' '); //TODO  why is this empty?

  });

  it('should have some default preferences', function() {
    expect(window.defaultPreferences).toBeDefined();
    expect(scope.scopePreferences).toBeDefined();
    expect(scope.template).toBe(scope.scopePreferences.userTemplate);
    expect(scope.fields).toBe(scope.scopePreferences[scope.scopePreferences.userTemplate]);
    expect(scope.template).toBe(scope.scopePreferences.userTemplate);

    expect(scope.availableFields).toBe(scope.scopePreferences.availableFields);
    expect(scope.availableFields).toBe(window.defaultPreferences.availableFields);

    expect(scope.template).toBe(scope.scopePreferences.userTemplate);
    expect(scope.template).toBe(scope.scopePreferences.userTemplate);
    expect(scope.resultSize).toBe(scope.scopePreferences.resultSize);
  });

  it('should override availableFields with the current defaults', function() {
    expect(scope.scopePreferences.availableFields).toEqual(window.defaultPreferences.availableFields);
  });

  it('should override field methods class templates with the current defaults', function() {
    expect(scope.scopePreferences.mcgillfieldmethodsspring2014template).toEqual(window.defaultPreferences.mcgillfieldmethodsspring2014template);
    expect(scope.scopePreferences.yalefieldmethodsspring2014template).toEqual(window.defaultPreferences.yalefieldmethodsspring2014template);
  });

  it('should set some pagination control variables and functions ', function() {
    expect(scope.documentReady).toBeFalsy();
    expect(scope.orderProp).toEqual('dateEntered');
    expect(scope.currentPage).toEqual(0);
    expect(scope.reverse).toBeTruthy(); //TODO is this how we can get the data to show in cronological order!?

    expect(typeof scope.pageForward).toBe('function');
    expect(typeof scope.pageBackward).toBe('function');
  });

  it('should set some view control variables', function() {
    expect(scope.authenticated).toBeFalsy();
    expect(scope.developer).toBeFalsy();
    expect(scope.dataentry).toBeFalsy();
    expect(scope.searching).toBeFalsy();

    expect(typeof scope.triggerExpandCollapse).toBe('function');
    expect(typeof scope.setFocusOn).toBe('function');
    expect(typeof scope.hiddenOnLoading).toBe('function');


  });

  it('should set some session control variables', function() {
    expect(scope.activeSubMenu).toEqual('none');
    expect(scope.activeSession).toBeUndefined();
    expect(scope.currentSessionName).toEqual('All Sessions');
    expect(scope.showCreateSessionDiv).toBeFalsy();
    expect(scope.editSessionDetails).toBeFalsy();
    expect(scope.createNewSessionDropdown).toBeFalsy();
  });

  it('should initialize some variables', function() {
    expect(scope.currentDate).toBeDefined();
    expect(scope.activities).toBeDefined();
    expect(scope.DBselected).toBeFalsy();
    expect(scope.newFieldData).toBeDefined();
  });

  it('should set some audio recording control variables and functions', function() {
    expect(scope.recordingStatus).toEqual('Record');
    expect(scope.recordingButtonClass).toEqual('btn btn-success');
    expect(scope.recordingIcon).toEqual('fa-microphone');
    expect(scope.showAudioFeatures).toBeFalsy();
    expect(scope.newRecordHasBeenEdited).toBeFalsy();

    expect(typeof scope.closeAudioWarning).toBe('function');
    expect(typeof scope.startRecording).toBe('function');
    expect(typeof scope.stopRecording).toBe('function');
    expect(typeof scope.uploadFile).toBe('function');
    expect(typeof scope.deleteAttachmentFromCorpus).toBe('function');
  });


  it('should load preferences again when the $viewContentLoaded TODO try to manage prefs only once in the code', function() {
    expect(scope.scopePreferences.savedState).toBeDefined();
  });

});
