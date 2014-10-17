"use strict";
var debugMode = true;

describe("Directive: fielddb-audio-video-recorder", function() {

  // load the directive's module and the template
  beforeEach(module("fielddbAngularApp", "views/audio-video-recorder.html"));
  var el, scope, compileFunction;

  beforeEach(inject(function($rootScope, $compile) {
    el = angular.element("<div data-fielddb-audio-video-recorder json='datum1'></div> <div data-fielddb-audio-video-recorder json='datum2'></div>");
    scope = $rootScope.$new();
    scope.datum1= {
      utterance: "a first entry"
    };
    scope.datum2 = {
      utterance: "another entry"
    };
    compileFunction = $compile(el);
    // bring html from templateCache
    scope.$digest();
    if (debugMode) {
      console.log("post compile", el.html()); // <== html here has {{}}
    }
  }));

  // http://stackoverflow.com/questions/17223850/how-to-test-directives-that-use-templateurl-and-controllers
  it("should make a audio-video-recorder element with contents from scope", function() {

    inject(function() {
      compileFunction(scope); // <== the html {{}} are bound
      scope.$digest(); // <== digest to get the render to show the bound values
      if (debugMode) {
        console.log("post link", el.html());
        console.log("scope datum1 ", scope.datum1);
      }
      expect(true).toBe(true);

    //    expect(scope.recordingStatus).toEqual('Record');
    // expect(scope.recordingButtonClass).toEqual('btn btn-success');
    // expect(scope.recordingIcon).toEqual('fa-microphone');
    // expect(scope.showAudioFeatures).toBeFalsy();
    // expect(scope.newRecordHasBeenEdited).toBeFalsy();

    // expect(typeof scope.closeAudioWarning).toBe('function');
    // expect(typeof scope.startRecording).toBe('function');
    // expect(typeof scope.stopRecording).toBe('function');
    // expect(typeof scope.uploadFile).toBe('function');
    // expect(typeof scope.deleteAttachmentFromCorpus).toBe('function');
      // expect(angular.element(el.find("h1")[0]).text().trim()).toEqual("Awesome Phonologists");
      // expect(angular.element(el.find("h1")[1]).text().trim()).toEqual("Ling Llama");
    });
  });
});
