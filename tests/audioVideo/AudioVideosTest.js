var AudioVideo = require("./../../api/audio_video/AudioVideo").AudioVideo;
var AudioVideos = require("./../../api/audio_video/AudioVideos").AudioVideos;

describe("Test AudioVideos", function() {
  it("should load", function() {
    expect(AudioVideos).toBeDefined();

    var audio = new AudioVideo();
    expect(audio).toBeDefined();

    var audios = new AudioVideos();
    expect(audios).toBeDefined();
  });

  it("should set the filename", function() {
    var audio = new AudioVideo();
    audio.filename = "Noqata.mp3";
    expect(audio.filename).toEqual("Noqata.mp3");
  });

  it("should have a description", function() {
    var audio = new AudioVideo();
    audio.description = "A short clip found in a movie";
    expect(audio.description).toEqual("A short clip found in a movie");
  });

  it("should have a URL ", function() {
    var audio = new AudioVideo();
    audio.URL = "http://youtu.be/wM89VAiYaU0";
    expect(audio.URL).toEqual("http://youtu.be/wM89VAiYaU0");
  });

  it("should build the URL if only filename is specified", function() {
    var audio = new AudioVideo();
    audio.url = "https://localhost:3184";
    audio.dbname = "lingllama-communitycorpus";

    audio.filename = "Noqata.mp3";
    expect(audio.URL).toEqual("https://localhost:3184/lingllama-communitycorpus/Noqata.mp3");
  });

});
