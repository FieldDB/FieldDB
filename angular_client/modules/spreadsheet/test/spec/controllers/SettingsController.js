'use strict';

describe('Controller: SpreadsheetStyleDataEntrySettingsController', function() {

  // load the controller's module
  beforeEach(module('spreadsheetApp'));

  var SpreadsheetStyleDataEntrySettingsController,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller, $rootScope) {
    scope = $rootScope.$new();
    scope.appReloaded = true; //TODO what does this mean? it is preventing the controller functions to exist.

    localStorage.setItem('useAutoGlosser', 'false');
    localStorage.setItem('SpreadsheetPreferences', '{\"userChosenTemplateId\":\"mcgillfieldmethodsspring2014template\",\"resultSize\":10,\"savedState\":{\"server\":\"production\",\"username\":\"lingllama\",\"password\":\"{\\"iv\\":\\"Rd2lDH+nzH/3PIfUeaNXxw\\",\\"v\\":1,\\"iter\\":1000,\\"ks\\":128,\\"ts\\":64,\\"mode\\":\\"ccm\\",\\"adata\\":\\"\\",\\"cipher\\":\\"aes\\",\\"salt\\":\\"2M2W9iOA+Mg\\",\\"ct\\":\\"3u9s5yAX3zL19rxPWGG+QQ\\"}\",\"mostRecentCorpusPouchname\":\"lingllama-communitycorpus\",\"sessionID\":\"723a8b707e579087aa36c2e33869680a\",\"sessionTitle\":\"All Sessions\"},\"availableFields\":{\"judgement\":{\"label\":\"judgement\",\"title\":\"Grammaticality Judgement\"},\"utterance\":{\"label\":\"utterance\",\"title\":\"Utterance\"},\"morphemes\":{\"label\":\"morphemes\",\"title\":\"Morphemes\"},\"gloss\":{\"label\":\"gloss\",\"title\":\"Gloss\"},\"translation\":{\"label\":\"translation\",\"title\":\"Translation\"},\"refs\":{\"label\":\"refs\",\"title\":\"References\"},\"goal\":{\"label\":\"goal\",\"title\":\"Goal\"},\"consultants\":{\"label\":\"consultants\",\"title\":\"Consultants\"},\"dialect\":{\"label\":\"dialect\",\"title\":\"Dialect\"},\"language\":{\"label\":\"language\",\"title\":\"language\"},\"dateElicited\":{\"label\":\"dateElicited\",\"title\":\"Date Elicited\"},\"user\":{\"label\":\"user\",\"title\":\"User\"},\"dateSEntered\":{\"label\":\"dateSEntered\",\"title\":\"Date entered\"},\"tags\":{\"label\":\"tags\",\"title\":\"Tags\"},\"validationStatus\":{\"label\":\"validationStatus\",\"title\":\"validationStatus\"},\"syntacticCategory\":{\"label\":\"syntacticCategory\",\"title\":\"syntacticCategory\"},\"allomorphs\":{\"label\":\"allomorphs\",\"title\":\"Allomorphs\"},\"phonetic\":{\"label\":\"phonetic\",\"title\":\"Phonetic\"},\"housekeeping\":{\"label\":\"housekeeping\",\"title\":\"Housekeeping\"},\"spanish\":{\"label\":\"spanish\",\"title\":\"Spanish\"},\"orthography\":{\"label\":\"orthography\",\"title\":\"Orthography\"}},\"compacttemplate\":{\"field1\":{\"label\":\"utterance\",\"title\":\"Utterance\"},\"field2\":{\"label\":\"morphemes\",\"title\":\"Morphemes\"},\"field3\":{\"label\":\"gloss\",\"title\":\"Gloss\"},\"field4\":{\"label\":\"translation\",\"title\":\"Translation\"}},\"fulltemplate\":{\"field1\":{\"label\":\"phonetic\",\"title\":\"Phonetic\"},\"field2\":{\"label\":\"morphemes\",\"title\":\"Morphemes\"},\"field3\":{\"label\":\"gloss\",\"title\":\"Gloss\"},\"field4\":{\"label\":\"translation\",\"title\":\"Translation\"},\"field5\":{\"label\":\"comments\",\"title\":\"Comments\"},\"field6\":{\"label\":\"validationStatus\",\"title\":\"validationStatus\"},\"field7\":{\"label\":\"tags\",\"title\":\"Tags\"},\"field8\":{\"label\":\"\",\"title\":\"\"}},\"mcgillfieldmethodsspring2014template\":{\"field1\":{\"label\":\"utterance\",\"title\":\"Utterance\"},\"field2\":{\"label\":\"morphemes\",\"title\":\"Morphemes\"},\"field3\":{\"label\":\"gloss\",\"title\":\"Gloss\"},\"field4\":{\"label\":\"translation\",\"title\":\"Translation\"},\"field5\":{\"label\":\"judgement\",\"title\":\"Grammaticality Judgement\"},\"field6\":{\"label\":\"tags\",\"title\":\"Tags\"},\"field8\":{\"label\":\"\",\"title\":\"\"}},\"yalefieldmethodsspring2014template\":{\"field1\":{\"label\":\"orthography\",\"title\":\"Orthography\"},\"field2\":{\"label\":\"utterance\",\"title\":\"Utterance\"},\"field3\":{\"label\":\"morphemes\",\"title\":\"Morphemes\"},\"field4\":{\"label\":\"gloss\",\"title\":\"Gloss\"},\"field5\":{\"label\":\"translation\",\"title\":\"Translation\"},\"field6\":{\"label\":\"spanish\",\"title\":\"Spanish\"},\"field7\":{\"label\":\"housekeeping\",\"title\":\"Housekeeping\"},\"field8\":{\"label\":\"tags\",\"title\":\"Tags\"}}}');

    SpreadsheetStyleDataEntrySettingsController = $controller('SpreadsheetStyleDataEntrySettingsController', {
      $scope: scope
    });
  }));

  describe('old functionality', function() {
    it('should have all the old things in scope that it had before', function() {

      expect(scope).toBeDefined();
      expect(scope.scopePreferences).toBeDefined();
      expect(scope.appReloaded).toBeDefined();

      expect(typeof scope.changeTagToEdit).toBe('function');
      expect(typeof scope.changeFieldToEdit).toBe('function');
      expect(typeof scope.editFieldTitle).toBe('function');
      expect(typeof scope.editTagInfo).toBe('function');
      expect(typeof scope.deleteDuplicateTags).toBe('function');
      expect(typeof scope.getTags).toBe('function');
      // expect(typeof scope.saveNewPreferences).toBe('function');
      expect(typeof scope.saveNumberOfRecordsToDisplay).toBe('function');

    });

  });



  // it('should load preferences again when the $viewContentLoaded TODO try to manage prefs only once in the code', function() {
  //   expect(scope.scopePreferences.savedState).toBeDefined();
  // });

});
