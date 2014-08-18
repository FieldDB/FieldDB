/*globals FileReader, CryptoJS, OPrime, Blob, FormData */

var AudioService = function(url, user, corpusConnection, datumid) {

  this.corpus = corpusConnection;
  this.url = url;
  this.user = user;
  this.datumid = datumid;
  this.result = {};
  this.uploadResult = {};
  /**
   * http://stackoverflow.com/questions/768268/how-to-calculate-md5-hash-of-a-file-using-javascript
   */
  this.getMD5ForFile = function(file, callback) {
    var reader = new FileReader();
    reader.onload = function() {
      var md5 = CryptoJS.MD5(reader.result);
      console.log("MD5 is " + md5);
      callback(md5);
    };
    reader.onerror = function() {
      console.error("Could not read the file");
    };
    reader.readAsBinaryString(file);
  };
  // https://gist.github.com/jdhorner/b1cf02d5874c0c512a2c
  this.requestTextGrids = function(callbackIfAudioNeedsToBeSent) {
    var dataToSend = {
      filesToBeAligned: [{
        md5: "c07f75de65dc1c99763cee300dcd44a0",
        filename: "testing_audio.wav",
        labelsToAlign: "TESTING AUDIO UPLOAD.",
        textGrid: this.corpus.url.replace("/_session", "/") + this.corpus.pouchname + "/" + this.datumid + "/testing_audio.textGrid"
      }, {
        md5: "c07f75de65dc1c99763cee300dcd44a0",
        filename: "testing_audio2.wav",
        labelsToAlign: "TESTING AUDIO UPLOAD.",
        textGrid: this.corpus.url.replace("/_session", "/") + this.pouchname + "/" + this.datumid + "/testing_audio2.textGrid"
      }],
      user: {
        username: user.name
      },
      corpus: {
        corpusname: this.corpus.pouchname
      },
      dictionary: {
        dialect: "AmericanEnglish",
        file: null,
        url: "https://www.lingsync.org/dictionaries/AmericanEnglish.txt"
      }
    };
    var that = this;
    OPrime.makeCORSRequest({
      type: 'POST',
      url: that.url + "/textgrids",
      data: dataToSend,
      success: function(serverResults) {
        that.result = serverResults;
        console.log("server contacted", serverResults);
        if (typeof callbackIfAudioNeedsToBeSent === "function") {
          callbackIfAudioNeedsToBeSent(serverResults);
        }
      },
      error: function(serverResults) {
        that.result = serverResults;
        console.log("There was a problem contacting the server to login.");
      }
    });

  };
  this.uploadAudioForAlignment = function() {
    var dataToSend = {
      filesToBeAligned: [{
        md5: "iji34j02qk40q2o3o31mpo13mp",
        filename: "testing_audio.wav",
        labelsToAlign: "THIS IS A TEST."
      }, {
        md5: "9waje0k309ka3094k30a29ka331",
        filename: "testing_audio2.wav",
        labelsToAlign: "THIS IS A TEST AGAIN."
      }],
      user: {
        username: user.name
      },
      dictionary: {
        dialect: "AmericanEnglish",
        file: null,
        url: "https://www.lingsync.org/dictionaries/english.txt"
      }
    };

    /*
     * Prepare a function, incase we need to upload the audio
     */
    var self = this;
    var callbackIfAudioNeedsToBeSent = function() {
      var filesToBeSent = JSON.parse(JSON.stringify(dataToSend));
      filesToBeSent.files = [new Blob(['hello world'], {
        type: 'text/plain'
      }), new Blob(['hello world2'], {
        type: 'text/plain'
      })];

      // http://hacks.mozilla.org/2010/05/formdata-interface-coming-to-firefox/
      var formdata = new FormData();
      formdata.append("filesToBeAligned", filesToBeSent.filesToBeAligned);
      formdata.append("user", filesToBeSent.user);
      formdata.append("dictionary", filesToBeSent.dictionary);
      formdata.append("media", new Blob(['hello world'], {
        type: 'text/plain'
      }));
      // xhr.send(formdata);

      OPrime.makeCORSRequest({
        type: 'POST',
        url: self.url + "/upload",
        // headers: {"Content-type": "multipart/form-data;
        // boundary=----WebKitFormBoundarypnqzcal9A5yjKaAb"},
        data: filesToBeSent,
        success: function(serverResults) {
          self.uploadResult = serverResults;
          console.log("server contacted", serverResults);
        },
        error: function(serverResults) {
          self.uploadResult = serverResults;
          console.log("There was a problem contacting the server to login.");
        }
      });

    };

    /*
     * Ask the server if we need to upload the audio
     */
    if (!this.textGridsRetrieved) {
      this.requestTextGrids(callbackIfAudioNeedsToBeSent);
    } else {
      callbackIfAudioNeedsToBeSent();
    }

  };
  this.audioUploaded = function() {
    return this.uploadResult.ok;
  };
  this.textGridsRetrieved = function() {
    if (this.result.textGrids) {
      return this.result.textGrids.length > 0;
    } else {
      return false;
    }
  };
  this.assertRetrievedTextGridsSuccessful = function() {
    expect(this.result.textGrids.length > 0).toBe(true);
  };
  this.assertUploadSuccessful = function() {
    expect(this.uploadResult.ok).toBe(true);
  };
};

exports.AudioService = AudioService;
