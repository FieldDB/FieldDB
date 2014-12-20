var AudioVideoRecorder = require("./../../api/audio_video/AudioVideoRecorder").AudioVideoRecorder;

describe("Test AudioVideoRecorder", function() {
  it("should load", function() {
    expect(AudioVideoRecorder).toBeDefined();

    var audioRecorder = new AudioVideoRecorder();
    expect(audioRecorder).toBeDefined();

  });

});
