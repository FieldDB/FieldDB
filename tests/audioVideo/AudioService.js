define([], function() {
  var AudioService = function(url, user) {
    this.url = url;
    this.user = user;
    this.result = {};
    this.uploadResult = {};
    this.multipartAudioBlob = '------WebKitFormBoundarypnqzcal9A5yjKaAb\n'+
'Content-Disposition: form-data; name="userFile[]"; filename="testing_audio.wav"\n'+
'Content-Type: image/wav\n'+
'\n'+
'\n'+
'------WebKitFormBoundarypnqzcal9A5yjKaAb\n'+
'Content-Disposition: form-data; name="userFile[]"; filename="testing_audio.wav"\n'+
'Content-Type: image/wav\n'+
 '\n'+
 '\n'+
 '------WebKitFormBoundarypnqzcal9A5yjKaAb--\n';
    this.requestTextGrids = function(callbackIfAudioNeedsToBeSent) {
      var dataToSend = {
        filesToBeAligned : [ {
          md5 : "iji34j02qk40q2o3o31mpo13mp",
          filename : "testing_audio.wav",
          labelsToAlign : "THIS IS A TEST."
        }, {
          md5 : "9waje0k309ka3094k30a29ka331",
          filename : "testing_audio2.wav",
          labelsToAlign : "THIS IS A TEST AGAIN."
        } ],
        user : {
          username : user.name
        },
        dictionary : {
          dialect : "AmericanEnglish",
          file : null,
          url : "https://www.lingsync.org/dictionaries/english.txt"
        }
      };
      var that = this;
      OPrime.makeCORSRequest({
        type : 'POST',
        url : that.url + "/textgrids",
        data : dataToSend,
        success : function(serverResults) {
          that.result = serverResults;
          console.log("server contacted", serverResults);
          if (typeof callbackIfAudioNeedsToBeSent == "function") {
            callbackIfAudioNeedsToBeSent(serverResults);
          }
        },
        error : function(serverResults) {
          that.result = serverResults;
          console.log("There was a problem contacting the server to login.");
        }
      });

    };
    this.uploadAudioForAlignment = function() {
      var dataToSend = {
        filesToBeAligned : [ {
          md5 : "iji34j02qk40q2o3o31mpo13mp",
          filename : "testing_audio.wav",
          labelsToAlign : "THIS IS A TEST."
        }, {
          md5 : "9waje0k309ka3094k30a29ka331",
          filename : "testing_audio2.wav",
          labelsToAlign : "THIS IS A TEST AGAIN."
        } ],
        user : {
          username : user.name
        },
        dictionary : {
          dialect : "AmericanEnglish",
          file : null,
          url : "https://www.lingsync.org/dictionaries/english.txt"
        }
      };

      /*
       * Prepare a function, incase we need to upload the audio
       */
      var self = this;
      var callbackIfAudioNeedsToBeSent = function() {
        var filesToBeSent = JSON.parse(JSON.stringify(dataToSend));
        filesToBeSent.files = [new Blob(['hello world'], {type: 'text/plain'}),new Blob(['hello world2'], {type: 'text/plain'})];
        
        //http://hacks.mozilla.org/2010/05/formdata-interface-coming-to-firefox/
        var formdata = new FormData();
        formdata.append("filesToBeAligned", filesToBeSent.filesToBeAligned); 
        formdata.append("user", filesToBeSent.user); 
        formdata.append("dictionary", filesToBeSent.dictionary); 
        formdata.append("media", new Blob(['hello world'], {type: 'text/plain'}));
//        xhr.send(formdata);
        
        
        OPrime.makeCORSRequest({
          type : 'POST',
          url : self.url + "/upload",
//          headers: {"Content-type": "multipart/form-data; boundary=----WebKitFormBoundarypnqzcal9A5yjKaAb"},
          data : filesToBeSent,
          success : function(serverResults) {
            self.uploadResult = serverResults;
            console.log("server contacted", serverResults);
          },
          error : function(serverResults) {
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

  return AudioService;
});