if ('undefined' === typeof navigator) {
  var navigator = {"userAgent" : "Node.js"};
}

var OPrime = OPrime || {};

OPrime.debugMode = false;
/*
 * Android touchdb for OPrime runs on port 8128, so if the app is running on
 * port 8128 it is likely in a touchdb (either in the android app or in a
 * browser)
 */
OPrime.runFromTouchDBOnAndroidInLocalNetwork = function() {
  return window.location.port == 8128;
};

/**
 * The address of the TouchDB-Android database on the Android.
 */
OPrime.touchUrl = "http://localhost:8128/";

/**
 * The address of the PouchDB database on the browser.
 */
OPrime.pouchUrl = "idb://";

OPrime.getCouchUrl = function(couchConnection, couchdbcommand) {
  if (!couchConnection) {
    couchConnection = OPrime.defaultCouchConnection();
    if (OPrime.debugMode) OPrime.debug("Using the apps ccouchConnection", couchConnection);
  }

  var couchurl = couchConnection.protocol + couchConnection.domain;
  if (couchConnection.port && couchConnection.port != "443" && couchConnection.port != "80") {
    couchurl = couchurl + ":" + couchConnection.port;
  }
  if(!couchConnection.path){
    couchConnection.path = "";
  }
  couchurl = couchurl + couchConnection.path;
  if (couchdbcommand === null || couchdbcommand === undefined) {
    couchurl = couchurl + "/" + couchConnection.pouchname;
  } else {
    couchurl = couchurl + couchdbcommand;
  }


  /* Switch user to the new dev servers if they have the old ones */
  couchurl = couchurl.replace(/ifielddevs.iriscouch.com/g, "corpus.lingsync.org");
  couchurl = couchurl.replace(/corpusdev.lingsync.org/g, "corpus.lingsync.org");

  /*
   * For debugging cors #838: Switch to use the corsproxy corpus service instead
   * of couchdb directly
   */
  // couchurl = couchurl.replace(/https/g,"http").replace(/6984/g,"3186");

  return couchurl;
};

OPrime.contactUs = "<a href='https://docs.google.com/forms/d/18KcT_SO8YxG8QNlHValEztGmFpEc4-ZrjWO76lm0mUQ/viewform' target='_blank'>Contact Us</a>";

OPrime.debug = function(message, message2, message3, message4) {
  if (navigator.appName == 'Microsoft Internet Explorer') {
    return;
  }
  if (this.debugMode) {
    console.log(message);

    if (message2) {
      console.log(message2);
    }
    if (message3) {
      console.log(message3);
    }
    if (message4) {
      console.log(message4);
    }
  }
};

OPrime.bug = function(message) {
  alert(message);
};

OPrime.warn = function(message) {
  alert(message);
};

/*
 * Declare functions for PubSub
 */
OPrime.publisher = {
  subscribers : {
    any : []
  },
  subscribe : function(type, fn, context) {
    type = type || 'any';
    fn = typeof fn === "function" ? fn : context[fn];

    if (typeof this.subscribers[type] === "undefined") {
      this.subscribers[type] = [];
    }
    this.subscribers[type].push({
      fn : fn,
      context : context || this
    });
  },
  unsubscribe : function(type, fn, context) {
    this.visitSubscribers('unsubscribe', type, fn, context);
  },
  publish : function(type, publication) {
    this.visitSubscribers('publish', type, publication);
  },
  visitSubscribers : function(action, type, arg, context) {
    var pubtype = type || 'any';
    var subscribers = this.subscribers[pubtype];
    if (!subscribers || subscribers.length == 0) {
      if (OPrime.debugMode) OPrime.debug(pubtype + ": There were no subscribers.");
      return;
    }
    var i;
    var maxUnsubscribe = subscribers ? subscribers.length - 1 : 0;
    var maxPublish = subscribers ? subscribers.length : 0;

    if (action === 'publish') {
      // count up so that older subscribers get the message first
      for (i = 0; i < maxPublish; i++) {
        if (subscribers[i]) {
          // TODO there is a bug with the subscribers they are getting lost, and
          // it is trying to call fn of undefiend. this is a workaround until we
          // figure out why subscribers are getting lost. Update: i changed the
          // loop to count down and remove subscribers from the ends, now the
          // size of subscribers isnt changing such that the subscriber at index
          // i doesnt exist.
          subscribers[i].fn.call(subscribers[i].context, arg);
        }
      }
      if (OPrime.debugMode) OPrime.debug('Visited ' + subscribers.length + ' subscribers.');

    } else {

      // count down so that subscribers index exists when we remove them
      for (i = maxUnsubscribe; i >= 0; i--) {
        try {
          if (!subscribers[i].context) {
            OPrime
                .debug("This subscriber has no context. should we remove it? "
                    + i);
          }
          if (subscribers[i].context === context) {
            var removed = subscribers.splice(i, 1);
            if (OPrime.debugMode) OPrime.debug("Removed subscriber " + i + " from " + type, removed);
          } else {
            if (OPrime.debugMode) OPrime.debug(type + " keeping subscriber " + i,
                subscribers[i].context);
          }
        } catch (e) {
          if (OPrime.debugMode) OPrime.debug("problem visiting Subscriber " + i, subscribers)
        }
      }
    }
  }
};
OPrime.makePublisher = function(o) {
  var i;
  for (i in OPrime.publisher) {
    if (OPrime.publisher.hasOwnProperty(i)
        && typeof OPrime.publisher[i] === "function") {
      o[i] = OPrime.publisher[i];
    }
  }
  o.subscribers = {
    any : []
  };
};

/**
 * http://www.w3schools.com/js/js_cookies.asp name of the cookie, the value of
 * the cookie, and the number of days until the cookie expires.
 *
 * @param c_name
 * @param value
 * @param exdays
 */
OPrime.setCookie = function(c_name, value, exdays) {
  if (value) {
    localStorage.setItem(c_name, value);
  } else {
    localStorage.removeItem(c_name);
  }
  // var exdate = new Date();
  // exdate.setDate(exdate.getDate() + exdays);
  // var c_value = escape(value)
  // + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
  // document.cookie = c_name + "=" + c_value;
};
OPrime.getCookie = function(c_name) {
  return localStorage.getItem(c_name);
  // var i, x, y, ARRcookies = document.cookie.split(";");
  // for (i = 0; i < ARRcookies.length; i++) {
  // x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
  // y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
  // x = x.replace(/^\s+|\s+$/g, "");
  // if (x == c_name) {
  // return unescape(y);
  // }
  // }
};

OPrime.isAndroidApp = function() {
  // Development tablet navigator.userAgent:
  // Mozilla/5.0 (Linux; U; Android 3.0.1; en-us; gTablet Build/HRI66)
  // AppleWebKit/534.13 (KHTML, like Gecko) Version/4.0 Safari/534.13
  // this.debug("The user agent is " + navigator.userAgent);
  return navigator.userAgent.indexOf("OfflineAndroidApp") > -1;
};

if (OPrime.isAndroidApp()) {
  var debugOrNot = Android.isD();
  console.log("Setting debug mode to the Android's mode: " + debugOrNot);
  // OPrime.debugMode = debugOrNot;
};

OPrime.isAndroid4 = function() {
  return navigator.userAgent.indexOf("Android 4") > -1;
};

OPrime.isChromeApp = function() {
  return window.location.href.indexOf("chrome-extension") > -1;
};

OPrime.isCouchApp = function() {
  return window.location.href.indexOf("_design/pages") > -1;
};

OPrime.isTouchDBApp = function() {
  return window.location.href.indexOf("localhost:8128") > -1;
};

OPrime.isBackboneCouchDBApp = function(){
  return true;
};
/**
 * If not running offline on an android or in a chrome extension, assume we are
 * online.
 *
 * @returns {Boolean} true if not on offline Android or on a Chrome Extension
 */
OPrime.onlineOnly = function() {
  return !this.isAndroidApp() && !this.isChromeApp();
};

OPrime.getVersion = function(callback) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open('GET', 'manifest.json');
  xmlhttp.onload = function(e) {
    var manifest = JSON.parse(xmlhttp.responseText);
    callback(manifest.version);
  };
  xmlhttp.send(null);
};
OPrime.escapeLatexChars = function(input) {
  var result = input;
  if (!result.replace) {
    return "error parsing field, please report this." + JSON.stringify(input);
  }
  //curly braces need to be escaped TO and escaped FROM, so we're using a placeholder
  result = result.replace(/\\/g, "\\textbackslashCURLYBRACES");
  result = result.replace(/\^/g, "\\textasciicircumCURLYBRACES");
  result = result.replace(/\~/g, "\\textasciitildeCURLYBRACES");
  result = result.replace(/#/g, "\\#");
  result = result.replace(/\$/g, "\\$");
  result = result.replace(/%/g, "\\%");
  result = result.replace(/&/g, "\\&");
  result = result.replace(/_/g, "\\_");
  result = result.replace(/{/g, "\\{");
  result = result.replace(/}/g, "\\}");
  result = result.replace(/</g, "\\textless");
  result = result.replace(/>/g, "\\textgreater");

  var tipas = app.get("authentication").get("userPrivate").get("prefs").get("unicodes").toJSON();
  for (var t = 0; t < tipas.length; t++) {
    if (tipas[t].tipa) {
      var symbolAsRegularExpession = new RegExp(tipas[t].symbol, "g");
      result = result.replace(symbolAsRegularExpession, tipas[t].tipa);
    }
  }
  result = result.replace(/CURLYBRACES/g, "{}");
  return result;
};
/*
 * JavaScript Pretty Date Copyright (c) 2011 John Resig (ejohn.org) Licensed
 * under the MIT and GPL licenses.
 */

// Takes an ISO time and returns a string representing how
// long ago the date represents.
// modified by FieldDB team to take in Greenwich time which is what we are using
// for our time stamps so that users in differnt time zones will get real times,
// not strangely futureistic times
// we have been using JSON.stringify(new Date()) to create our timestamps
// instead of unix epoch seconds (not sure why we werent using unix epoch), so
// this function is modified from the original in that it expects dates that
// were created using
// JSON.stringify(new Date())
OPrime.prettyDate = function(input) {
    if (!input) {
      return '--';
    }
    if (input.replace) {
      input = input.replace(/\"/g, '');
    }
    if (input.trim) {
      input = input.trim();
    }
    if (!input) {
      return '--';
    }
    // For unknown historical reasons in the spreadsheet app
    // there were some dates that were unknown and were set
    // to a random? date like this:
    if (input === '2000-09-06T16:31:30.988Z' || (input >= new Date('2000-09-06T16:31:30.000Z') && input <= new Date('2000-09-06T16:31:31.000Z'))) {
      return 'N/A';
    }
    if (!input.toLocaleDateString) {
      input = new Date(input);
    }

    var greenwichdate = new Date();
    var minuteDiff = ((greenwichdate.getTime() - input.getTime()) / 1000);
    var dayDiff = Math.floor(minuteDiff / 86400);

    if (isNaN(dayDiff) || dayDiff < 0) {
      return '--';
    }
    if (dayDiff >= 1430) {
      return (Math.round(dayDiff / 365) + ' years ago');
    }
    if (dayDiff >= 1278) {
      return '3.5 years ago';
    }
    if (dayDiff >= 1065) {
      return '3 years ago';
    }
    if (dayDiff >= 913) {
      return '2.5 years ago';
    }
    if (dayDiff >= 730) {
      return '2 years ago';
    }
    if (dayDiff >= 540) {
      return '1.5 years ago';
    }
    if (dayDiff >= 50) {
      return (Math.round(dayDiff / 31) + ' months ago');
    }
    if (dayDiff >= 48) {
      return '1.5 months ago';
    }
    if (dayDiff >= 40) {
      return '1 month ago';
    }
    if (dayDiff >= 16) {
      return (Math.round(dayDiff / 7) + ' weeks ago').replace('1 weeks', '1 week');
    }
    if (dayDiff >= 2) {
      return (Math.round(dayDiff / 1) + ' days ago').replace('1 days', '1 day');
    }
    if (dayDiff >= 1) {
      return 'Yesterday';
    }

    if (minuteDiff >= 5000) {
      return (Math.floor(minuteDiff / 3600) + ' hours ago').replace('1 hours', '1.5 hours');
    }

    if (minuteDiff >= 4000) {
      return '1 hour ago';
    }
    //  if(minuteDiff >= 7200 ){
    //    Math.floor(minuteDiff / 3600) + ' 1 hour ago';
    //  }
    if (minuteDiff >= 70) {
      return Math.floor(minuteDiff / 60) + ' minutes ago';
    }
    if (minuteDiff >= 120) {
      return '1 minute ago';
    }
    return 'just now';

  };
OPrime.prettyTimestamp = OPrime.prettyDate;
/*
 * Audio functions
 */
OPrime.playAudioFile = function(divid, audioOffsetCallback, callingcontext) {
  this.debug("Playing Audio File and subscribing to audio completion.")
  var audiourl = document.getElementById(divid).getAttribute("src")
  if (!callingcontext) {
    callingcontext = window;
  }
  var callingcontextself = callingcontext;
  if (!audioOffsetCallback) {
    audioOffsetCallback = function(message) {
      if (OPrime.debugMode) OPrime.debug("In audioOffsetCallback: " + message);
      OPrime.hub.unsubscribe("playbackCompleted", null, callingcontextself);
    }
  }
  this.hub.unsubscribe("playbackCompleted", null, callingcontextself);
  this.hub.subscribe("playbackCompleted", audioOffsetCallback,
      callingcontextself);

  if (this.isAndroidApp()) {
    this.debug("Playing Audio via Android:" + audiourl + ":");
    Android.playAudio(audiourl);
  } else {
    this.debug("Playing Audio via HTML5:" + audiourl + ":");
    document.getElementById(divid).removeEventListener('ended',
        OPrime.audioEndListener);
    if (OPrime.debugMode) OPrime.debug("\tRemoved previous endaudio event listeners for " + audiourl);
    document.getElementById(divid).addEventListener('ended',
        OPrime.audioEndListener);
    document.getElementById(divid).play();
  }
}
OPrime.audioEndListener = function() {
  var audiourl = this.getAttribute("src")
  if (OPrime.debugMode) OPrime.debug("End audio ", audiourl);
  OPrime.hub.publish('playbackCompleted', audiourl);
};
OPrime.pauseAudioFile = function(divid, callingcontext) {
  if (!callingcontext) {
    callingcontext = window;
  }
  var callingcontextself = callingcontext;
  OPrime.hub.unsubscribe("playbackCompleted", null, callingcontextself);

  if (this.isAndroidApp()) {
    this.debug("Pausing Audio via Android");
    Android.pauseAudio();
  } else {
    this.debug("Pausing Audio via HTML5");
    document.getElementById(divid).pause();
    if (document.getElementById(divid).currentTime > 0.05) {
      document.getElementById(divid).currentTime = document
          .getElementById(divid).currentTime - 0.05;
    }

  }
}
OPrime.stopAudioFile = function(divid, callback, callingcontext) {
  if (!callingcontext) {
    callingcontext = window;
  }
  var callingcontextself = callingcontext;
  OPrime.hub.unsubscribe("playbackCompleted", null, callingcontextself);

  if (this.isAndroidApp()) {
    this.debug("Stopping Audio via Android");
    Android.stopAudio();
  } else {
    this.debug("Stopping Audio via HTML5");
    document.getElementById(divid).pause();
    document.getElementById(divid).currentTime = 0.0;
  }
  if (typeof callback == "function") {
    callback();
  }
}
OPrime.playingInterval = false;
OPrime.playIntervalAudioFile = function(divid, startime, endtime, callback) {
  startime = parseFloat(startime, 10);
  endtime = parseFloat(endtime, 10);
  if (this.isAndroidApp()) {
    this.debug("Playing Audio via Android from " + startime + " to " + endtime);
    startime = startime * 1000;
    endtime = endtime * 1000;
    var audiourl = document.getElementById(divid).getAttribute("src")
    Android.playIntervalOfAudio(audiourl, startime, endtime);
  } else {
    this.debug("Playing Audio via HTML5 from " + startime + " to " + endtime);

    var audioElement = document.getElementById(divid);
    if(!audioElement){
      console.log("Audio element does not exist.");
      return;
    }
    var audioElementToPlaySelf = audioElement;
    var startTimeSelf = startime;
    //pause all audio and remove all listeners from all audio
    $(document.getElementsByTagName("audio")).map(function(i, localAudioElement) {
      // console.log(localAudioElement);
      localAudioElement.pause();
      if (window.actuallyPlayAudio) {
        localAudioElement.removeEventListener('canplaythrough', window.actuallyPlayAudio);
      }
      if (window.audioTimeUpdateListener) {
        localAudioElement.removeEventListener('timeupdate', window.audioTimeUpdateListener);
      }
      if (window.audioEndListener) {
        localAudioElement.removeEventListener('ended', window.audioEndListener);
      }
    });

    window.actuallyPlayAudio = function(){
      audioElementToPlaySelf.removeEventListener('canplaythrough', window.actuallyPlayAudio);
      OPrime.playingInterval = true;
      audioElementToPlaySelf.currentTime = startTimeSelf;
      console.log("Cueing audio to " + audioElementToPlaySelf.currentTime +", supposed to be "+startTimeSelf);
      // audioElementToPlaySelf.load();
      audioElementToPlaySelf.play();
    };
    // if(window.audioEndListener){
    //   window.audioEndListener();
    // }
    window.audioEndListener = function(){
      OPrime.playingInterval = false;
      audioElementToPlaySelf.removeEventListener('ended', window.audioEndListener);
      audioElementToPlaySelf.removeEventListener('timeupdate', window.audioTimeUpdateListener);
      audioElementToPlaySelf.removeEventListener('canplaythrough', window.actuallyPlayAudio);
      // if(audioElementToPlaySelf.readyState > 0){
      //   audioElementToPlaySelf.currentTime = startTimeSelf;
      // }else {
      //   console.log("Ready state" + audioElementToPlaySelf.readyState);
      // }
      audioElementToPlaySelf.load();
      console.log("Cueing audio to starttime " + audioElementToPlaySelf.currentTime);
      if (typeof callback == "function") {
        callback();
      }
    };
    window.audioTimeUpdateListener = function() {
      if (this.currentTime >= endtime && OPrime.playingInterval) {
        console.log("Ending at: " + this.currentTime)
        this.pause();
        window.audioEndListener();
      }
    };
    if (endtime) {
      audioElement.addEventListener("timeupdate", window.audioTimeUpdateListener);
    }
    audioElement.addEventListener('ended', window.audioEndListener);
    audioElement.addEventListener('canplaythrough', window.actuallyPlayAudio);
    try{
      // audioElement.currentTime = startime;
      // console.log("Cueing audio to " + audioElement.currentTime);
      audioElement.load();
      // audioElement.currentTime = startime;
      // console.log("Cueing audio again to " + audioElement.currentTime);
    } catch(e){
      console.log(e);
    }

  }

}
OPrime.captureAudio = function(resultfilename, callbackRecordingStarted,
    callbackRecordingCompleted, callingcontext) {
  if (!callingcontext) {
    callingcontext = window;
  }
  /*
   * verify completed callback and subscribe it to audioRecordingCompleted
   */
  var callingcontextself = callingcontext;
  if (!callbackRecordingCompleted) {
    callbackRecordingCompleted = function(message) {
      if (OPrime.debugMode) OPrime.debug("In callbackRecordingCompleted: " + message);
      OPrime.hub.unsubscribe("audioRecordingCompleted", null,
          callingcontextself);
    };
  }
  this.hub.unsubscribe("audioRecordingCompleted", null, callingcontextself);
  this.hub.subscribe("audioRecordingCompleted", callbackRecordingCompleted,
      callingcontextself);

  /*
   * verify started callback and subscribe it to
   * audioRecordingSucessfullyStarted
   */
  if (!callbackRecordingStarted) {
    callbackRecordingStarted = function(message) {
      if (OPrime.debugMode) OPrime.debug("In callbackRecordingStarted: " + message);
      OPrime.hub.unsubscribe("audioRecordingSucessfullyStarted", null,
          callingcontextself);
    };
  }
  this.hub.unsubscribe("audioRecordingSucessfullyStarted", null,
      callingcontextself);
  this.hub.subscribe("audioRecordingSucessfullyStarted",
      callbackRecordingStarted, callingcontextself);

  /* start the recording */
  if (this.isAndroidApp()) {
    this.debug("Recording Audio via Android");
    Android.startAudioRecordingService(resultfilename);
    // the android will publish if its successfully stopped, and that it
    // completed
  } else {
    this.debug("Recording Audio via HTML5: " + resultfilename);
    OPrime.bug("Recording audio only works on Android, because it has a microphone, and your computer might not.\n\n Faking that it was sucessful")
    // fake publish it was sucessfully started
    this.hub.publish('audioRecordingSucessfullyStarted', resultfilename);
  }

};
OPrime.stopAndSaveAudio = function(resultfilename, callbackRecordingStopped,
    callingcontext) {

  /*
   * verify started callback and subscribe it to
   * audioRecordingSucessfullyStarted
   */
  var callingcontextself = callingcontext;
  if (!callbackRecordingStopped) {
    callbackRecordingStopped = function(message) {
      if (OPrime.debugMode) OPrime.debug("In callbackRecordingStopped: " + message);
      OPrime.hub.unsubscribe("audioRecordingSucessfullyStopped", null,
          callingcontextself);
    };
  }
  this.hub.unsubscribe("audioRecordingSucessfullyStopped", null,
      callingcontextself);
  this.hub.subscribe("audioRecordingSucessfullyStopped",
      callbackRecordingStopped, callingcontextself);

  /* start the recording */
  if (this.isAndroidApp()) {
    this.debug("Stopping Recording Audio via Android");
    Android.stopAudioRecordingService(resultfilename);
    // the android will publish if its successfully started
  } else {
    this.debug("Stopping Recording Audio via HTML5: " + resultfilename);
    OPrime.bug("Recording audio only works on Android, because it has a microphone, and your computer might not.\n\n Faking that stopped and saved sucessfully");
    // fake publish it was sucessfully started
    resultfilename = "chime.mp3";
    this.hub.publish('audioRecordingSucessfullyStopped', resultfilename);
    // fake publish it finished
    this.hub.publish('audioRecordingCompleted', resultfilename);
  }

};
/*
 * Camera functions
 */
OPrime.capturePhoto = function(resultfilename, callbackPictureCaptureStarted,
    callbackPictureCaptureCompleted, callingcontext) {
  if (!callingcontext) {
    callingcontext = window;
  }
  /*
   * verify completed callback and subscribe it to audioRecordingCompleted
   */
  var callingcontextself = callingcontext;
  if (!callbackPictureCaptureStarted) {
    callbackPictureCaptureStarted = function(message) {
      if (OPrime.debugMode) OPrime.debug("In callbackPictureCaptureStarted: " + message);
      OPrime.hub.unsubscribe("pictureCaptureSucessfullyStarted", null,
          callingcontextself);
    };
  }
  if (!callbackPictureCaptureCompleted) {
    callbackPictureCaptureCompleted = function(message) {
      if (OPrime.debugMode) OPrime.debug("In callbackPictureCaptureCompleted: " + message);
      OPrime.hub.unsubscribe("pictureCaptureSucessfullyCompleted", null,
          callingcontextself);
    };
  }
  /*
   * unsubscribe this context from the chanel incase the user calls it many
   * times on teh same item, only fire the last event
   */
  this.hub.unsubscribe("pictureCaptureSucessfullyStarted", null,
      callingcontextself);
  this.hub.unsubscribe("pictureCaptureSucessfullyCompleted", null,
      callingcontextself);
  /* subscribe the caller's functions to the channels */
  this.hub.subscribe("pictureCaptureSucessfullyStarted",
      callbackPictureCaptureStarted, callingcontextself);
  this.hub.subscribe("pictureCaptureSucessfullyCompleted",
      callbackPictureCaptureCompleted, callingcontextself);

  /* start the picture taking */
  if (this.isAndroidApp()) {
    this.debug("Starting picture capture via Android");
    Android.takeAPicture(resultfilename);
    // the android will publish if its successfully started and completed
  } else {
    this.debug("Starting picture capture via HTML5: " + resultfilename);
    OPrime.bug("Taking a picture only works on Android, because it has a camera, and your computer might not.\n\n Faking that taken a picture and saved sucessfully");
    // fake publish it was sucessfully started
    resultfilename = "happyface.png";
    this.hub.publish('pictureCaptureSucessfullyStarted', resultfilename);
    this.hub.publish('pictureCaptureSucessfullyCompleted', resultfilename);
  }
};

/*
 * Initialize the debugging output, taking control from the Android side.
 */
if (OPrime.debugMode) OPrime.debug("Intializing OPrime Javascript library. \n" + "The user agent is "
    + navigator.userAgent);

if (OPrime.isAndroidApp()) {
  if (!Android.isD()) {
    this.debugMode = false;
    this.debug = function() {
    };
  } else {
    this.debugMode = true;
  }
}

OPrime.userEncryptionToken = function() {
  return "topsecretuserencryptiontokenfortestingTODOchangethis";
};

OPrime.getConnectivityType = function(callingcontextself, callback) {
  this.hub.unsubscribe("connectivityType", null, callingcontextself);
  /* subscribe the caller's functions to the channels */
  this.hub.subscribe("connectivityType", callback, callingcontextself);

  /* Fire command which will publish the connectivity */
  if (OPrime.isAndroidApp()) {
    if (OPrime.debugMode) OPrime.debug("This is an Android.");
    Android.getConectivityType();
  } else {
    OPrime.hub.publish('connectivityType', 'Probably Online');
  }
};

OPrime.getHardwareInfo = function(callingcontextself, callback) {
  this.hub.unsubscribe("hardwareDetails", null, callingcontextself);
  /* subscribe the caller's functions to the channels */
  this.hub.subscribe("hardwareDetails", callback, callingcontextself);

  /* Fire command which will publish the connectivity */
  if (OPrime.isAndroidApp()) {
    if (OPrime.debugMode) OPrime.debug("This is an Android.");
    Android.getHardwareDetails();
  } else {
    OPrime.hub.publish('hardwareDetails', {
      name : 'Browser',
      model : navigator.userAgent,
      identifier : 'TODOgetMACAddress'
    });
  }
};
OPrime.useUnsecureCouchDB = function() {
  if (OPrime.isAndroidApp()) {
    /*
     * TODO if later when TouchDB has secure databases, we can use a secure
     * TouchDB, return false
     */
    return true;
  }
  if (OPrime.runFromTouchDBOnAndroidInLocalNetwork()
      && window.location.origin.indexOf("chrome-extension") != 0) {
    return true;
  }
  return false;
};

/*
 * Functions for well formed CORS requests
 */
OPrime.makeCORSRequest = function(options) {
  OPrime.debugMode = false;
  if(!options.method){
    options.method = options.type || "GET";
  }
  if(!options.url){
    OPrime.bug("There was an error. Please report this.");
  }
  if(!options.data){
    options.data = "";
  }
  options.dataToSend = JSON.stringify(options.data).replace(/,/g,"&").replace(/:/g,"=").replace(/"/g,"").replace(/[}{]/g,"");

  if(options.method == "GET" && options.data){
    options.url = options.url + "?" + options.dataToSend;
  }
  /*
   * Helper function which handles IE
   */
  var createCORSRequest = function(method, url){
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
      // XHR for Chrome/Firefox/Opera/Safari.
      xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
      // XDomainRequest for IE.
      xhr = new XDomainRequest();
      xhr.open(method, url);
    } else {
      // CORS not supported.
      xhr = null;
    }
    return xhr;
  };

  var xhr = createCORSRequest(options.method, options.url);
  if (!xhr) {
    OPrime.bug('CORS not supported, your browser is unable to contact the database.');
    return;
  }

//  if(options.method == "POST"){
    //xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.setRequestHeader("Content-type","application/json");
    xhr.withCredentials = true;
//  }

  xhr.onload = function(e,f,g) {
    var text = xhr.responseText;
    if (OPrime.debugMode) OPrime.debug('Response from CORS request to ' + options.url + ': ' + text);
    if(typeof options.success == "function"){
      if(text){
        options.success(JSON.parse(text));
      }else{
        OPrime.bug("There was no content in the server's response text. Please report this.");
        options.error(e,f,g);
      }
    }
    OPrime.debugMode = false;
  };

  xhr.onerror = function(e,f,g) {
    if (OPrime.debugMode) OPrime.debug(e,f,g);
    var message = 'There was an error making the CORS request to '+options.url+ " from "+window.location.href+" the app will not function normally";
    if (options.url.indexOf("localhost") > 0) {
      message = message + " Please turn on your CouchDB by going into the Applications (on Mac), and then re-load the page.";
    } else {
      message = message + " Please report this."
    }
    OPrime.bug(message);
    if(typeof options.error == "function"){
      options.error(e,f,g);
    }
  };
  if (options.method == "POST") {
    xhr.send(JSON.stringify(options.data));
  } else {
    xhr.send();
  }

};



OPrime.checkToSeeIfCouchAppIsReady = function(urlIsCouchAppReady, readycallback, failcallback) {
  if (readycallback) {
    OPrime.checkToSeeIfCouchAppIsReadyreadycallback = readycallback;
  }
  if(!failcallback){
    failcallback = function(){
      OPrime.checkToSeeIfCouchAppIsReady(urlIsCouchAppReady, readycallback, failcallback);
    }
  }
  if (!$) {
    OPrime.bug("Can't check if DB is ready.");
    console.warn("Can't check if DB is ready, checkToSeeIfCouchAppIsReady function depends on JQuery at the moment...");
    return;
  }
  var finishedWaiting = function() {
    localStorage.setItem("urlIsCouchAppReady", urlIsCouchAppReady);
    if (typeof OPrime.checkToSeeIfCouchAppIsReadyreadycallback == "function") {
      OPrime.checkToSeeIfCouchAppIsReadyreadycallback();
    }
  };

  var continueWaiting = function() {
    window.setTimeout(failcallback, 2000);
  };

  OPrime.makeCORSRequest({
    type: 'GET',
    url: urlIsCouchAppReady,
    data: {},
    dataType: "json",
    success: function(serverResults) {
      console.log("serverResults" + JSON.stringify(serverResults));
      if (serverResults) {
        if (serverResults.error) {
          continueWaiting();
        } else if (serverResults.rows) {
          finishedWaiting();
        }
      }
    }, // end successful fetch
    error: function(response) {
      // alert("Error contacting the server.");

      console.log("error response." + JSON.stringify(response));
      // alert("error response." + JSON.stringify(response));


      if (response.responseJSON) {
        if (response.responseJSON.error) {
          continueWaiting();
        } else if (response.responseJSON.rows && response.responseJSON.rows.length > 0) {
          finishedWaiting();
        }
      } else {
        if (response.responseText) {
          if (response.responseText.indexOf("<html") >= 0) {
            finishedWaiting();
            return;
          }
          var error = JSON.parse(response.responseText);
          if (error.error == "unauthorized") {
            alert("CouchDB ready but you need to get a session token, this can only happen when you are online.");
          } else {
            continueWaiting();
          }
        } else {
          continueWaiting();
        }
      }
    }
  });
};

OPrime.sum = function(list) {
  var result = 0;
  for (value in list) {
    result += list[value];
  }
  return result;
};

OPrime.mean = function(list) {
  return OPrime.sum(list) / list.length;
};

OPrime.standardDeviation = function(list) {
  var totalVariance = 0;
  var mean = OPrime.mean(list);
  for ( var i in list) {
    totalVariance += Math.pow(list[i] - mean, 2);
  }
  return Math.sqrt(totalVariance / list.length);
};

/*
 * Initialize pub sub
 */
OPrime.hub = {};
OPrime.makePublisher(OPrime.hub);
