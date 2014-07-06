function(doc) {
  var utils = {

    digestReport: function(doc) {
      if (doc.USER_CRASH_DATE) {
        var value = {
          user_crash_date: doc.USER_CRASH_DATE,
          android_version: doc.ANDROID_VERSION,
          application_version_name: doc.APP_VERSION_NAME,
          application_package: doc.APPLICATION_PACKAGE
        };
        if (doc.SIGNATURE) {
          value.signature = doc.SIGNATURE;
        } else {
          value.stack_trace = doc.STACK_TRACE;
        }
        if (doc.INSTALLATION_ID) {
          value.installation_id = doc.INSTALLATION_ID;
        }

        value.device = utils.getDevice(doc);

        return value;
      }
    },

    digestCustomData: function(doc) {
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
      var androidCustomData = doc.CUSTOM_DATA;
      if (androidCustomData) {
        if (androidCustomData.registerUser || androidCustomData.username) {
          username = androidCustomData.username || androidCustomData.registerUser;
          personalCorpusActivity.user.username = username;
          teamActivity.user.username = username;
          if (androidCustomData.urlString.indexOf("speechrec.kartuli") > -1 || androidCustomData.urlString.indexOf("speechrecognition.kartuli") > -1) {
            userdbname = username + "-firstcorpus";
            teamdbname = "speechrecognition-kartuli";
            personalCorpusActivity.indirectobject = "in Kartuli Speech Recognition Corpus";
            teamActivity.indirectobject = "in Kartuli Speech Recognition Corpus";
            personalCorpusActivity.context = " via Kartuli Speech Recognizer";
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

        if (androidCustomData.action.indexOf("register") > -1 || androidCustomData.downloadDatums) {
          personalCorpusActivity.verb = "logged in";
          teamActivity.verb = "logged in";
          personalCorpusActivity.verbicon = "icon-check";
          teamActivity.verbicon = "icon-check";
          personalCorpusActivity.directobjecticon = "icon-user";
          teamActivity.directobjecticon = "icon-user";
          personalCorpusActivity.directobject = "";
          teamActivity.directobject = "";
        } else
        if (androidCustomData.action.indexOf("download") > -1) {
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
        } else
        if (androidCustomData.action.indexOf("capture") > -1) {
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
        } else
        if (androidCustomData.action.indexOf("loadDatum") > -1) {
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
        if (androidCustomData.androidTimestamp) {
          personalCorpusActivity.timestamp = androidCustomData.androidTimestamp;
          teamActivity.timestamp = androidCustomData.androidTimestamp;
        } else {
          try {
            var timestamp = (new Date(doc.USER_CRASH_DATE)).getTime();
            personalCorpusActivity.timestamp = timestamp;
            teamActivity.timestamp = timestamp;
          } catch (e) {
            // this activiit will have no date
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

      personalCorpusActivity.androidDetails = doc.CUSTOM_DATA;
      teamActivity.androidDetails = doc.CUSTOM_DATA;

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

  // CommonJS bindings
  if (typeof(exports) === 'object') {
    exports.digestReport = utils.digestReport;
  }



  if (doc.APP_VERSION_NAME) {
    var activities = utils.digestCustomData(doc);
    var now = Date.now();
    var lastPosition = 1403805265615;
    if (activities.teamActivity.timestamp < lastPosition) {
      return;
    }
    var since = (now - activities.teamActivity.timestamp) / 60000;
    emit(since, activities.teamActivity);
    emit(since, activities.personalCorpusActivity);
    emit(since, activities.personalActivity);
  }
}
