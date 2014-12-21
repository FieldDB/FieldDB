"use strict";
var debugMode = true;

describe("Directive: fielddb-audio-video-recorder", function() {

  // load the directive's module and the template
  beforeEach(module("fielddbAngularApp", "views/audio-video-recorder.html", "views/import.html", "views/datalist.html"));
  var el, scope, compileFunction;

  beforeEach(inject(function($rootScope, $compile) {
    el = angular.element("<div data-fielddb-audio-video-recorder json='datum1'></div> <div data-fielddb-audio-video-recorder json='datum2'></div>");
    scope = $rootScope.$new();
    scope.datum1 = {
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

      var firstAudioRecorder = angular.element(angular.element(el[0]).find("p")[0]);
      expect(firstAudioRecorder.text().trim()).toEqual("Audio Recorder Element");
      // expect(firstAudioRecorder.scope().audioRecorder).toEqual("Audio Recorder Element");

      // expect(firstAudioRecorder.scope().recordingButtonClass).toEqual("btn btn-success");
      // expect(firstAudioRecorder.scope().recordingIcon).toEqual("fa-microphone");
      expect(firstAudioRecorder.scope().showAudioFeatures).toBeFalsy();
      expect(firstAudioRecorder.scope().newRecordHasBeenEdited).toBeFalsy();

      // expect(typeof firstAudioRecorder.scope().closeAudioWarning).toBe("function");
      expect(typeof firstAudioRecorder.scope().startRecording).toBe("function");
      expect(typeof firstAudioRecorder.scope().stopRecording).toBe("function");
      expect(typeof firstAudioRecorder.scope().uploadFile).toBe("function");
      // expect(typeof firstAudioRecorder.scope().deleteAttachmentFromCorpus).toBe("function");

      // var recorder = new FieldDB.AudioVideoRecorder({
      //   element: firstAudioRecorder[0]
      // });
      // expect(recorder).toBeDefined();
      // expect(recorder.element).toBeDefined();

      firstAudioRecorder.scope().startRecording();
      expect(firstAudioRecorder.scope().audioRecorder).toBeDefined();

    });
  });

  xit("should make attach recorders to every element marked RecordMP3js-recorder", function() {

    inject(function() {

      // FieldDB.AudioVideoRecorder.Recorder.initRecorder();
      // var firstAudioRecorder = angular.element(angular.element(el[0]).find("p")[0]);
      // expect(firstAudioRecorder.innerHTML).toEqual(" ");
    });

  });
});
