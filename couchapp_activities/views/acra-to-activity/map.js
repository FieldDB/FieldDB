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
  };
  var docid = "undefined";
  var oldrev = "undefined";
  var newrev = "undefined";
  var userdbname = "default";
  var teamdbname = "default";
  var username = "default";
  var personalActivity = {
    _id: doc._id,
    timestamp: 0,
    verb: "default",
    verbicon: "icon-default",
    directobject: "",
    directobjecticon: "icon-list",
    indirectobject: "",
    teamOrPersonal: "personal",
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
      username = androidCustomData.registerUser || androidCustomData.username;
      personalActivity.user.username = username;
      teamActivity.user.username = username;
      if (androidCustomData.urlString.indexOf("speechrec.kartuli") > -1) {
        userdbname = username + "-firstcorpus";
        teamdbname = "speechrecognition-kartuli";
        personalActivity.indirectobject = "in Kartuli Speech Recognition Corpus";
        teamActivity.indirectobject = "in Kartuli Speech Recognition Corpus";
        personalActivity.context = " via Kartuli Speech Recognizer";
        teamActivity.context = " via Kartuli Speech Recognizer";
      } else if (androidCustomData.urlString.indexOf("migmaq") > -1) {
        userdbname = username + "-firstcorpus";
        teamdbname = "community-migmaq";
        personalActivity.indirectobject = "in Mig'maq";
        teamActivity.indirectobject = "in Mig'maq";
      } else {
        userdbname = username + "-firstcorpus";
        teamdbname = "community-georgian";
        personalActivity.indirectobject = "in Kartuli";
        teamActivity.indirectobject = "in Kartuli";
      }
    }
    if (androidCustomData && androidCustomData.urlString) {
      docid = androidCustomData.urlString.substring(androidCustomData.urlString.lastIndexOf("/") + 1);
      if (androidCustomData.action && androidCustomData.action.indexOf("totalDatumEditsOnPause") > -1) {
        if (androidCustomData.action === "{totalDatumEditsOnPause : []}") {
          return;
        }
        personalActivity.verb = "modified";
        teamActivity.verb = "modified";
        personalActivity.verbicon = "icon-pencil";
        teamActivity.verbicon = "icon-pencil";
      }
      personalActivity.directobject = "<a target='_blank' href='#corpus/" + userdbname + "/datum/" + docid + "'>a datum</a>";
      teamActivity.directobject = "<a target='_blank' href='#corpus/" + teamdbname + "/datum/" + docid + "'>a datum</a>";
    }
    if (androidCustomData.action.indexOf("register") > -1 || androidCustomData.downloadDatums) {
      personalActivity.verb = "logged in";
      teamActivity.verb = "logged in";
      personalActivity.verbicon = "icon-check";
      teamActivity.verbicon = "icon-check";
      personalActivity.directobjecticon = "icon-user";
      teamActivity.directobjecticon = "icon-user";
      personalActivity.directobject = "";
      teamActivity.directobject = "";
    } else
    if (androidCustomData.action.indexOf("download") > -1) {
      var directobject = androidCustomData.action.split(":::");
      personalActivity.verb = "downloaded ";
      teamActivity.verb = "downloaded";
      personalActivity.verbicon = "icon-download";
      teamActivity.verbicon = "icon-download";
      personalActivity.directobjecticon = "icon-file";
      teamActivity.directobjecticon = "icon-file";
      if (directobject === "SampleData") {
        personalActivity.directobjecticon = "icon-flag";
        teamActivity.directobjecticon = "icon-flag";
      }
      personalActivity.directobject = directobject[1];
      teamActivity.directobject = directobject[1];
    } else
    if (androidCustomData.action.indexOf("capture") > -1) {
      var directobject = androidCustomData.action;
      try {
        directobject = androidCustomData.action.replace("}", "");
        directobject = directobject.substring(directobject.lastIndexOf("/") + 1);
      } catch (e) {
        //couldnt figure out the image
      }
      personalActivity.verb = "photographed";
      teamActivity.verb = "photographed";
      personalActivity.verbicon = "icon-plus";
      teamActivity.verbicon = "icon-plus";
      personalActivity.directobjecticon = "icon-camera";
      teamActivity.directobjecticon = "icon-camera";
      if (androidCustomData.action.indexOf("Audio") > -1) {
        personalActivity.verb = "recorded";
        teamActivity.verb = "recorded";
        personalActivity.directobjecticon = "icon-audio";
        teamActivity.directobjecticon = "icon-audio";
      }
      if (androidCustomData.action.indexOf("Video") > -1) {
        personalActivity.verb = "videoed";
        teamActivity.verb = "videoed";
        personalActivity.directobjecticon = "icon-video";
        teamActivity.directobjecticon = "icon-video";
      }
      personalActivity.directobject = directobject;
      teamActivity.directobject = directobject;
    } else
    if (androidCustomData.action.indexOf("loadDatum") > -1) {
      var docid = androidCustomData.action;
      try {
        docid = androidCustomData.action.replace("{loadDatum : ", "").replace("}", "");
      } catch (e) {
        //couldnt figure out the image
      }
      personalActivity.verb = "viewed";
      teamActivity.verb = "viewed";
      personalActivity.verbicon = "icon-eye";
      teamActivity.verbicon = "icon-eye";
      personalActivity.directobjecticon = "icon-list";
      teamActivity.directobjecticon = "icon-list";
      personalActivity.directobject = "<a target='_blank' href='#corpus/" + userdbname + "/datum/" + docid + "'>a datum</a>";
      teamActivity.directobject = "<a target='_blank' href='#corpus/" + teamdbname + "/datum/" + docid + "'>a datum</a>";
    }
    if (androidCustomData.androidTimestamp) {
      personalActivity.timestamp = androidCustomData.androidTimestamp;
      teamActivity.timestamp = androidCustomData.androidTimestamp;
    } else {
      try {
        var timestamp = (new Date(doc.USER_CRASH_DATE)).getTime();
        personalActivity.timestamp = timestamp;
        teamActivity.timestamp = timestamp;
      } catch (e) {
        // this activiit will have no date
      }
    }

  }
  if (doc.APP_VERSION_NAME) {
    personalActivity.appVersion = doc.APP_VERSION_NAME;
    teamActivity.appVersion = doc.APP_VERSION_NAME;
  }
  if (personalActivity.verb === "default") {
    return;
  }

  if (!personalActivity.user.username) {
    return;
  }
  var deviceName = utils.getDevice(doc);
  personalActivity.deviceName = deviceName;
  teamActivity.deviceName = deviceName;

  personalActivity.androidDetails = doc.CUSTOM_DATA;
  teamActivity.androidDetails = doc.CUSTOM_DATA;
  // try {
  //   var device = JSON.parse(androidCustomData.deviceDetails.replace(/'/g, '"'));
  //   if (device.location && device.location.latitude != 0) {
  //     personalActivity.location = device.location;
  //     teamActivity.location = device.location;
  //   }
  // } catch (e) {
  //   // console.log(e)
  // }
  // try {
  //   var action = JSON.parse(androidCustomData.action);
  //   if (action && action.totalDatumEditsOnPause) {
  //     personalActivity.timespent.totalDatumEditsOnPause = action.totalDatumEditsOnPause;
  //     teamActivity.timespent.totalDatumEditsOnPause = action.totalDatumEditsOnPause;
  //   }
  // } catch (e) {
  //   // console.log(e)
  // }


  if (doc.APP_VERSION_NAME) {
    var since = (Date.now() - teamActivity.timestamp)/60000;
    emit(since, teamActivity);
    emit(since, personalActivity);
  }
}
