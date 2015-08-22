function(doc) {
  var utils = {

    digestCustomData: function(doc) {
      // If it is a real bug, don't process it as an activity.
      if (doc.SIGNATURE && doc.SIGNATURE.full && doc.SIGNATURE.full.indexOf("***") === -1) {
        return;
      }
      var docid = "undefined";
      var oldrev = "undefined";
      var newrev = "undefined";
      var userdbname = "default";
      var teamdbname = "default";
      var username = "default";
      var directobject = "";

      var personalCorpusActivity = {
        _id: doc._id,
        _rev: doc._rev,
        timestamp: 0,
        verb: "default",
        verbicon: "icon-default",
        directobject: "",
        directobjecticon: "icon-list",
        indirectobject: "",
        teamOrPersonal: "team",
        context: " via LearnX App.",
        // timeSpent: {
        //   editingTimeSpent: 0,
        //   editingTimeDetails: [],
        //   totalTimeSpent: 0,
        //   readTimeSpent: 0
        // },
        user: {
          username: "",
          gravatar: ""
        },
        dateModified: "",
        appVersion: ""
      };
      var teamActivity = {
        _id: doc._id,
        _rev: doc._rev,
        timestamp: 0,
        verb: "default",
        verbicon: "icon-default",
        directobject: "",
        directobjecticon: "icon-list",
        indirectobject: "",
        teamOrPersonal: "team",
        context: " via LearnX App.",
        // timeSpent: {
        //   editingTimeSpent: 0,
        //   editingTimeDetails: [],
        //   totalTimeSpent: 0,
        //   readTimeSpent: 0
        // },
        user: {
          username: "",
          gravatar: ""
        },
        dateModified: "",
        appVersion: ""
      };
      // var androidCustomData = {
      //   action: "{totalDatumEditsOnPause : [{translation : 2},{gloss : 1}]}",
      //   username: "anonymous1398450847034",
      //   deviceDetails: "{name: 'Ace A100', model: 'A100', product: 'a100_pa_cus1', manufacturer: 'Ace', appversion: '1.102.3', sdk: '15', osversion: '2.6.39.4+(1374574145)',device: 'vangogh', screen: {height: '552', width: '1024', ratio: '1.855072463768116', currentOrientation: 'landscape'}, serial: '20105261615', identifier: '219e143ace5e6e97', wifiMACaddress: '00:08:CA:50:50:63', timestamp: '1398450927746',location:{longitude: '0.0', latitude: '0.0', accuracy: '0.0'} , telephonyDeviceId:'unknown'}",
      //   urlString: "content://com.github.opensourcefieldlinguistics.fielddb.kartuli.datum/datums/723a8b707e579087aa36c2e338eb17ec",
      //   registerUser: "anonymous1398450847034",
      //   androidTimestamp: 1398450927746
      // };
      var androidCustomData = JSON.parse(JSON.stringify(doc.CUSTOM_DATA));
      if (androidCustomData) {
        if (androidCustomData && androidCustomData.urlString && typeof androidCustomData.urlString === "object" && androidCustomData.urlString[0]) {
          androidCustomData.urlString = androidCustomData.urlString[0];
        }

        if (doc.user_ip) {
          personalCorpusActivity.ip = doc.user_ip;
          teamActivity.ip = doc.user_ip;
        } else if (doc.requestHeaders && doc.requestHeaders["X-Forwarded-For"]) {
          personalCorpusActivity.ip = doc.requestHeaders["X-Forwarded-For"];
          teamActivity.ip = doc.requestHeaders["X-Forwarded-For"];
        }
        if (androidCustomData.dbname && androidCustomData.dbname.indexOf("kartulispeechrec") > -1) {
          userdbname = androidCustomData.dbname.replace("-kartuli", "-firstcorpus");
          teamdbname = "speechrecognition-kartuli";
          personalCorpusActivity.indirectobject = "in Kartuli Speech Recognition Corpus";
          teamActivity.indirectobject = "in Kartuli Speech Recognition Corpus";
          personalCorpusActivity.context /= " via Kartuli Speech Recognizer";
          teamActivity.context = " via Kartuli Speech Recognizer";
        }
        if (androidCustomData.registerUser || androidCustomData.username) {
          username = androidCustomData.username || androidCustomData.registerUser;
          personalCorpusActivity.user.username = username;
          teamActivity.user.username = username;
          if (username.indexOf("kartulispeechrec") > -1) {
            userdbname = username + "-firstcorpus";
            teamdbname = "speechrecognition-kartuli";
            personalCorpusActivity.indirectobject = "in Kartuli Speech Recognition Corpus";
            teamActivity.indirectobject = "in Kartuli Speech Recognition Corpus";
            personalCorpusActivity.context /= " via Kartuli Speech Recognizer";
            teamActivity.context = " via Kartuli Speech Recognizer";
          }
        }
        if (userdbname === "default" && androidCustomData.urlString) {
          if (androidCustomData.urlString.indexOf("speechrec.kartuli") > -1 || androidCustomData.urlString.indexOf("speechrecognition.kartuli") > -1) {
            userdbname = username + "-firstcorpus";
            teamdbname = "speechrecognition-kartuli";
            personalCorpusActivity.indirectobject = "in Kartuli Speech Recognition Corpus";
            teamActivity.indirectobject = "in Kartuli Speech Recognition Corpus";
            personalCorpusActivity.context /= " via Kartuli Speech Recognizer";
            teamActivity.context = " via Kartuli Speech Recognizer";
          } else if (androidCustomData.urlString.indexOf("migmaq") > -1) {
            userdbname = username + "-firstcorpus";
            teamdbname = "community-migmaq";
            personalCorpusActivity.indirectobject = "in Mig'maq";
            teamActivity.indirectobject = "in Mig'maq";
          } else {
            userdbname = username + "-firstcorpus";
            teamdbname = "community-georgian";
            personalCorpusActivity.indirectobject = "in Kartuli";
            teamActivity.indirectobject = "in Kartuli";
          }
        }

        if (androidCustomData && androidCustomData.urlString) {
          docid = androidCustomData.urlString.substring(androidCustomData.urlString.lastIndexOf("/") + 1);
          if (androidCustomData.action && androidCustomData.action.indexOf("totalDatumEditsOnPause") > -1) {
            if (androidCustomData.action === "{totalDatumEditsOnPause : []}") {
              return;
            }
            personalCorpusActivity.verb = "modified";
            teamActivity.verb = "modified";
            personalCorpusActivity.verbicon = "icon-pencil";
            teamActivity.verbicon = "icon-pencil";
          }
          personalCorpusActivity.directobject = "<a target='_blank' href='#corpus/" + userdbname + "/datum/" + docid + "'>a datum</a>";
          teamActivity.directobject = "<a target='_blank' href='#corpus/" + teamdbname + "/datum/" + docid + "'>a datum</a>";
        }

        if (androidCustomData && androidCustomData.action) {
          if ((androidCustomData.action.indexOf("register") > -1 || androidCustomData.action.indexOf("login") > -1) || androidCustomData.downloadDatums) {
            personalCorpusActivity.verb = "logged in";
            teamActivity.verb = "logged in";
            personalCorpusActivity.verbicon = "icon-check";
            teamActivity.verbicon = "icon-check";
            personalCorpusActivity.directobjecticon = "icon-user";
            teamActivity.directobjecticon = "icon-user";
            personalCorpusActivity.directobject = "";
            teamActivity.directobject = "";
          } else if (androidCustomData.action.indexOf("download") > -1) {
            directobject = androidCustomData.action.split(":::");
            personalCorpusActivity.verb = "downloaded ";
            teamActivity.verb = "downloaded";
            personalCorpusActivity.verbicon = "icon-download";
            teamActivity.verbicon = "icon-download";
            personalCorpusActivity.directobjecticon = "icon-file";
            teamActivity.directobjecticon = "icon-file";
            if (directobject === "SampleData") {
              personalCorpusActivity.directobjecticon = "icon-flag";
              teamActivity.directobjecticon = "icon-flag";
            }
            personalCorpusActivity.directobject = directobject[1];
            teamActivity.directobject = directobject[1];
          } else if (androidCustomData.action.indexOf("capture") > -1) {
            directobject = androidCustomData.action;
            try {
              directobject = androidCustomData.action.replace("}", "");
              directobject = directobject.substring(directobject.lastIndexOf("/") + 1);
            } catch (e) {
              //couldnt figure out the image
            }
            personalCorpusActivity.verb = "photographed";
            teamActivity.verb = "photographed";
            personalCorpusActivity.verbicon = "icon-plus";
            teamActivity.verbicon = "icon-plus";
            personalCorpusActivity.directobjecticon = "icon-camera";
            teamActivity.directobjecticon = "icon-camera";
            if (androidCustomData.action.indexOf("Audio") > -1) {
              personalCorpusActivity.verb = "recorded";
              teamActivity.verb = "recorded";
              personalCorpusActivity.directobjecticon = "icon-audio";
              teamActivity.directobjecticon = "icon-audio";
            }

            if (androidCustomData.action.indexOf("Video") > -1) {
              personalCorpusActivity.verb = "videoed";
              teamActivity.verb = "videoed";
              personalCorpusActivity.directobjecticon = "icon-video";
              teamActivity.directobjecticon = "icon-video";
            }
            personalCorpusActivity.directobject = directobject;
            teamActivity.directobject = directobject;
            // } else if (androidCustomData.action.indexOf("recognizedAudio") > -1) {
            //   personalCorpusActivity.verb = "recorded";
            //   teamActivity.verb = "recorded";
            //   personalCorpusActivity.verbicon = "icon-plus";
            //   teamActivity.verbicon = "icon-plus";
            //   personalCorpusActivity.directobjecticon = "icon-microphone";
            //   teamActivity.directobjecticon = "icon-microphone";
            // }
          } else if (androidCustomData.action.indexOf("openedTrainer") > -1) {
            personalCorpusActivity.verb = "trained";
            teamActivity.verb = "trained";
            personalCorpusActivity.verbicon = "icon-bar-chart";
            teamActivity.verbicon = "icon-bar-chart";
            personalCorpusActivity.directobjecticon = "icon-microphone";
            teamActivity.directobjecticon = "icon-microphone";
            personalCorpusActivity.directobject = androidCustomData.action;
            teamActivity.directobject = androidCustomData.action;
          } else if (androidCustomData.action.indexOf("recognizedHypotheses") > -1 || androidCustomData.action.indexOf("receivedFinalHypotheses") > -1) {
            personalCorpusActivity.verb = "received an ASR result";
            teamActivity.verb = "received an ASR result";
            personalCorpusActivity.verbicon = "icon-refresh";
            teamActivity.verbicon = "icon-refresh";
            personalCorpusActivity.directobjecticon = "icon-microphone";
            teamActivity.directobjecticon = "icon-microphone";
            personalCorpusActivity.directobject = androidCustomData.action;
            teamActivity.directobject = androidCustomData.action;
          } else if (androidCustomData.action.indexOf("recognizedPartialHypotheses") > -1) {
            personalCorpusActivity.verb = "received a partial ASR result";
            teamActivity.verb = "received a partial ASR result";
            personalCorpusActivity.verbicon = "icon-refresh";
            teamActivity.verbicon = "icon-refresh";
            personalCorpusActivity.directobjecticon = "icon-microphone";
            teamActivity.directobjecticon = "icon-microphone";
            personalCorpusActivity.directobject = androidCustomData.action;
            teamActivity.directobject = androidCustomData.action;
          } else if (androidCustomData.action.indexOf("recognizeSpeech") > -1 || androidCustomData.action.indexOf("requestedRecognizeSpeech") > -1) {
            personalCorpusActivity.verb = "used Speech Recognizer";
            teamActivity.verb = "used Speech Recognizer";
            personalCorpusActivity.verbicon = "icon-plus";
            teamActivity.verbicon = "icon-plus";
            personalCorpusActivity.directobjecticon = "icon-microphone";
            teamActivity.directobjecticon = "icon-microphone";
            personalCorpusActivity.directobject = androidCustomData.action;
            teamActivity.directobject = androidCustomData.action;
          } else if (androidCustomData.action.indexOf("loadDatum") > -1) {
            docid = androidCustomData.action;
            try {
              docid = androidCustomData.action.replace("{loadDatum : ", "").replace("}", "");
            } catch (e) {
              //couldnt figure out the image
            }
            personalCorpusActivity.verb = "viewed";
            teamActivity.verb = "viewed";
            personalCorpusActivity.verbicon = "icon-eye";
            teamActivity.verbicon = "icon-eye";
            personalCorpusActivity.directobjecticon = "icon-list";
            teamActivity.directobjecticon = "icon-list";
            personalCorpusActivity.directobject = "<a target='_blank' href='#corpus/" + userdbname + "/datum/" + docid + "'>a datum</a>";
            teamActivity.directobject = "<a target='_blank' href='#corpus/" + teamdbname + "/datum/" + docid + "'>a datum</a>";
          }

        } //end if (androidCustomData && androidCustomData.action)

        if (androidCustomData && androidCustomData.androidTimestamp) {
          personalCorpusActivity.timestamp = androidCustomData.androidTimestamp;
          teamActivity.timestamp = androidCustomData.androidTimestamp;
        } else {
          try {
            var timestamp = (new Date(doc.USER_CRASH_DATE)).getTime();
            personalCorpusActivity.timestamp = timestamp;
            teamActivity.timestamp = timestamp;
          } catch (e) {
            // this activity will have no date
          }
        }

      }
      if (doc.APP_VERSION_NAME) {
        personalCorpusActivity.appVersion = doc.APP_VERSION_NAME;
        teamActivity.appVersion = doc.APP_VERSION_NAME;
      }
      if (personalCorpusActivity.verb === "default") {
        return;
      }

      if (!personalCorpusActivity.user.username) {
        return;
      }
      var deviceName = utils.getDevice(doc);
      personalCorpusActivity.deviceName = deviceName;
      teamActivity.deviceName = deviceName;

      personalCorpusActivity.androidDetails = androidCustomData;
      teamActivity.androidDetails = androidCustomData;

      personalCorpusActivity.pouchname = userdbname + "-activity_feed";
      teamActivity.pouchname = teamdbname + "-activity_feed";
      // try {
      //   var device = JSON.parse(androidCustomData.deviceDetails.replace(/'/g, '"'));
      //   if (device.location && device.location.latitude != 0) {
      //     personalCorpusActivity.location = device.location;
      //     teamActivity.location = device.location;
      //   }
      // } catch (e) {
      //   // console.log(e)
      // }
      // try {
      //   var action = JSON.parse(androidCustomData.action);
      //   if (action && action.totalDatumEditsOnPause) {
      //     personalCorpusActivity.timespent.totalDatumEditsOnPause = action.totalDatumEditsOnPause;
      //     teamActivity.timespent.totalDatumEditsOnPause = action.totalDatumEditsOnPause;
      //   }
      // } catch (e) {
      //   // console.log(e)
      // }
      var personalActivity = JSON.parse(JSON.stringify(personalCorpusActivity));
      personalActivity.pouchname = personalCorpusActivity.user.username + "-activity_feed";
      personalActivity.teamOrPersonal = "personal";
      return {
        teamActivity: teamActivity,
        personalCorpusActivity: personalCorpusActivity,
        personalActivity: personalActivity
      };
    },

    getDevice: function(doc) {
      if (doc.BUILD) {
        if (doc.BUILD.MANUFACTURER) {
          return doc.BUILD.MANUFACTURER + " " + doc.BUILD.BRAND + " " + doc.BUILD.MODEL;
        } else {
          return doc.BUILD.BRAND + " " + doc.BUILD.MODEL;
        }
      } else {
        var value = "";
        if (doc.BRAND) {
          value = doc.BRAND;
        }
        if (doc.PRODUCT) {
          value += " " + doc.PRODUCT;
        }
        if (doc.PHONE_MODEL) {
          value += " " + doc.MODEL;
        }

        return value;
      }
    }
  };

  try {

    if (doc.APP_VERSION_NAME) {
      var activities = utils.digestCustomData(doc);
      if (!activities || !activities.teamActivity || !activities.teamActivity.pouchname) {
        return;
      }
      // if (activities.teamActivity.pouchname !== "speechrecognition-kartuli-activity_feed") {
      //   return;
      // }
      var now = Date.now();
      // var lastPosition = 1403805265615;
      // if (activities.teamActivity.timestamp < lastPosition) {
      //   return;
      // }
      var since = (now - activities.teamActivity.timestamp) / 60000;
      emit(since, activities.teamActivity);
      emit(since, activities.personalCorpusActivity);
      emit(since, activities.personalActivity);
    }

  } catch (e) {
    emit(doc, e);
  }
}
