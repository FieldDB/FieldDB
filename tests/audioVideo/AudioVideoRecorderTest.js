"use strict";

var AudioVideoRecorder;
try {
  /* globals FieldDB */
  if (FieldDB) {
    AudioVideoRecorder = FieldDB.AudioVideoRecorder;
  }
} catch (e) {}
AudioVideoRecorder = AudioVideoRecorder || require("./../../api/audio_video/AudioVideoRecorder").AudioVideoRecorder;


describe("Test AudioVideoRecorder", function() {
  it("should load", function() {
    expect(AudioVideoRecorder).toBeDefined();

    var audioRecorder = new AudioVideoRecorder();
    expect(audioRecorder).toBeDefined();

  });
  it("should have an element", function() {
    expect(AudioVideoRecorder).toBeDefined();

    var audioRecorder = new AudioVideoRecorder({
      element: {}
    });
    // audioRecorder.element = {};
    expect(audioRecorder).toBeDefined();
    // expect(audioRecorder.recorder).toBeDefined();
    // expect(audioRecorder.element).toBeDefined();
  });
});
