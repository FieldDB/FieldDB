var AudioVideo = require("./../../api/audio_video/AudioVideo").AudioVideo;
var AudioVideos = require("./../../api/audio_video/AudioVideos").AudioVideos;

describe("Test AudioVideo", function() {
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
  describe("file types", function() {
    it("should have an accurate mime type for audio", function() {
      var unknownFile = new AudioVideo({
        filename: "test.mp3"
      });
      expect(unknownFile.type).toEqual("audio/mpeg");
      unknownFile = new AudioVideo({
        filename: "test.ogg"
      });
      expect(unknownFile.type).toEqual("audio/ogg");
      unknownFile = new AudioVideo({
        filename: "test.wav"
      });
      expect(unknownFile.type).toEqual("audio/x-wav");
      unknownFile = new AudioVideo({
        filename: "test.mp4"
      });
      expect(unknownFile.type).toEqual("video/mp4");
      unknownFile = new AudioVideo({
        filename: "test.amr"
      });
      expect(unknownFile.type).toEqual("application/octet-stream");
      unknownFile = new AudioVideo({
        filename: "test.raw"
      });
      expect(unknownFile.type).toEqual("application/octet-stream");

    });
    it("should have an accurate mime type for video", function() {
      var unknownFile = new AudioVideo({
        filename: "test.avi"
      });
      expect(unknownFile.type).toEqual("video/x-msvideo");
      unknownFile = new AudioVideo({
        filename: "test.flv"
      });
      expect(unknownFile.type).toEqual("video/x-flv");
      unknownFile = new AudioVideo({
        filename: "test.mkv"
      });
      expect(unknownFile.type).toEqual("video/x-matroska");
      unknownFile = new AudioVideo({
        filename: "test.mov"
      });
      expect(unknownFile.type).toEqual("video/quicktime");
      unknownFile = new AudioVideo({
        filename: "test.3gp"
      });
      expect(unknownFile.type).toEqual("video/3gpp");
    });

    it("should have an accurate mime type for images", function() {
      var unknownFile = new AudioVideo({
        filename: "test.png"
      });
      expect(unknownFile.type).toEqual("image/png");
      unknownFile = new AudioVideo({
        filename: "test.jpg"
      });
      expect(unknownFile.type).toEqual("image/jpeg");
      unknownFile = new AudioVideo({
        filename: "test.jpeg"
      });
      expect(unknownFile.type).toEqual("image/jpeg");
      unknownFile = new AudioVideo({
        filename: "test.gif"
      });
      expect(unknownFile.type).toEqual("image/gif");
      unknownFile = new AudioVideo({
        filename: "test.bmp"
      });
      expect(unknownFile.type).toEqual("image/bmp");
    });

    it("should have an accurate mime type for any file", function() {
      var unknownFile = new AudioVideo({
        filename: "test.html"
      });
      expect(unknownFile.type).toEqual("text/html; charset=UTF-8");
      unknownFile = new AudioVideo({
        filename: "test.csv"
      });
      expect(unknownFile.type).toEqual("text/csv; charset=UTF-8");
      unknownFile = new AudioVideo({
        filename: "test.pdf"
      });
      expect(unknownFile.type).toEqual("application/pdf");
      unknownFile = new AudioVideo({
        filename: "test.tex"
      });
      expect(unknownFile.type).toEqual("application/x-tex");
      unknownFile = new AudioVideo({
        filename: "test.doc"
      });
      expect(unknownFile.type).toEqual("application/msword");
      unknownFile = new AudioVideo({
        filename: "test.docx"
      });
      expect(unknownFile.type).toEqual("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      unknownFile = new AudioVideo({
        filename: "test.rtf"
      });
      expect(unknownFile.type).toEqual("application/rtf");
      unknownFile = new AudioVideo({
        filename: "test.txt"
      });
      expect(unknownFile.type).toEqual("text/plain; charset=UTF-8");
      unknownFile = new AudioVideo({
        filename: "test.xml"
      });
      expect(unknownFile.type).toEqual("application/xml");
      unknownFile = new AudioVideo({
        filename: "test.xls"
      });
      expect(unknownFile.type).toEqual("application/vnd.ms-excel");
      unknownFile = new AudioVideo({
        filename: "test.xlsx"
      });
      expect(unknownFile.type).toEqual("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      unknownFile = new AudioVideo({
        filename: "test.odf"
      });
      expect(unknownFile.type).toEqual("application/vnd.oasis.opendocument.formula");
    });

  });
});
