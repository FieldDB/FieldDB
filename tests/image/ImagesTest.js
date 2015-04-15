"use strict";

var Image;
var Images;
try {
  /* globals FieldDB */
  if (FieldDB) {
    Image = FieldDB.Image;
    Images = FieldDB.Images;
  }
} catch (e) {}
Image = Image || require("./../../api/image/Image").Image;
Images = Images || require("./../../api/image/Images").Images;

describe("Test Images", function() {
  it("should load", function() {
    expect(Images).toBeDefined();

    var audio = new Image();
    expect(audio).toBeDefined();

    var audios = new Images();
    expect(audios).toBeDefined();
  });

  it("should set the filename", function() {
    var audio = new Image();
    audio.filename = "ponies.png";
    expect(audio.filename).toEqual("ponies.png");
  });

  it("should have a description", function() {
    var audio = new Image();
    audio.caption = "A colorful cartoon of numerous objects which are similar but not the same.";
    expect(audio.caption).toEqual("A colorful cartoon of numerous objects which are similar but not the same.");
  });

  it("should have a URL ", function() {
    var audio = new Image();
    audio.URL = "http://img1.wikia.nocookie.net/__cb20110319203712/mlpfanart/images/3/3c/Ponies.svg";
    expect(audio.URL).toEqual("http://img1.wikia.nocookie.net/__cb20110319203712/mlpfanart/images/3/3c/Ponies.svg");
  });

  it("should build the URL if only filename is specified", function() {
    var audio = new Image();
    audio.url = "https://localhost:3184";
    audio.dbname = "lingllama-communitycorpus";

    audio.filename = "ponies.svg";
    expect(audio.URL).toEqual("https://localhost:3184/lingllama-communitycorpus/ponies.svg");
  });

});
