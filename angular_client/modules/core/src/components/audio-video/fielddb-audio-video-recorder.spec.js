"use strict";
var debugMode = false;

describe("Directive: fielddb-audio-video-recorder", function() {

  // load the directive's module and the template
  beforeEach(module("fielddbAngular"));

  var el, scope, compileFunction;

  beforeEach(inject(function($rootScope, $compile) {
    el = angular.element("<div data-fielddb-audio-video-recorder parent='datum1'></div> <div data-fielddb-audio-video-recorder parent='datum2'></div>");
    scope = $rootScope.$new();
    scope.datum1 = {
      utterance: "a first entry",
      dbname: "lingllama-firstcorpus"
    };
    scope.datum2 = {
      utterance: "another entry",
      dbname: "lingllama-firstcorpus"
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
      expect(firstAudioRecorder.text().trim()).toEqual("");
      // expect(firstAudioRecorder.scope().audioRecorder).toEqual("");

      expect(typeof firstAudioRecorder.scope().peripheralsCheck).toBe("function");
      expect(typeof firstAudioRecorder.scope().addFile).toBe("function");

      // var recorder = new FieldDB.AudioVideoRecorder({
      //   element: firstAudioRecorder[0]
      // });
      // expect(recorder).toBeDefined();
      // expect(recorder.element).toBeDefined();

      // firstAudioRecorder.scope().peripheralsCheck("audio");
      // expect(firstAudioRecorder.scope().audioRecorder).toBeDefined();

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
