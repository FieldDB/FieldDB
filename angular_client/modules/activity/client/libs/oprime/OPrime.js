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
      OPrime.debug(pubtype + ": There were no subscribers.");
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
      OPrime.debug('Visited ' + subscribers.length + ' subscribers.');

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
            OPrime.debug("Removed subscriber " + i + " from " + type, removed);
          } else {
            OPrime.debug(type + " keeping subscriber " + i,
                subscribers[i].context);
          }
        } catch (e) {
          OPrime.debug("problem visiting Subscriber " + i, subscribers)
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
OPrime.prettyDate = function(time) {
  if (!time) {
    return undefined;
  }
  time = time.replace(/"/g, "");
  var date = new Date((time || "").replace(/-/g, "/").replace(/[TZ]/g, " "));
  var greenwichtimenow = JSON.stringify(new Date()).replace(/"/g, "");
  var greenwichdate = new Date((greenwichtimenow || "").replace(/-/g, "/")
      .replace(/[TZ]/g, " "));
  var diff = ((greenwichdate.getTime() - date.getTime()) / 1000);
  var day_diff = Math.floor(diff / 86400);

  if (isNaN(day_diff) || day_diff < 0 ) {
    return undefined;
  }

  if (day_diff >= 548) {
    return Math.ceil(day_diff / 365) + " years ago";
  }
  if (day_diff >= 40) {
    return Math.ceil(day_diff / 31) + " months ago";
  }
  if (day_diff >= 14) {
    return Math.ceil(day_diff / 7) + " weeks ago";
  }
  if (day_diff >= 2) {
    return Math.ceil(day_diff / 1) + " days ago";
  }
  if (day_diff >= 1) {
    return "Yesterday";
  }
  if(diff >= 4000 ){
    return Math.floor(diff / 3600) + " hours ago";
  }
//  if(diff >= 7200 ){
//    Math.floor(diff / 3600) + " 1 hour ago";
//  }
  if(diff >= 70 ){
    return Math.floor(diff / 60) + " minutes ago";
  }
  if(diff >= 120 ){
    return "1 minute ago";
  }
  return "just now";
};

OPrime.prettyTimestamp = function(timestamp) {
  var date = new Date(timestamp);
  var greenwichtimenow = new Date();
  var diff = ((greenwichtimenow.getTime() - date.getTime()) / 1000);
  var day_diff = Math.floor(diff / 86400);

  if (isNaN(day_diff) || day_diff < 0) {
    return;
  }

  if (day_diff >= 548) {
    return Math.ceil(day_diff / 365) + " years ago";
  }
  if (day_diff >= 40) {
    return Math.ceil(day_diff / 31) + " months ago";
  }
  if (day_diff >= 14) {
    return Math.ceil(day_diff / 7) + " weeks ago";
  }
  if (day_diff >= 2) {
    return Math.ceil(day_diff / 1) + " days ago";
  }
  if (day_diff >= 1) {
    return "Yesterday";
  }
  if(diff >= 4000 ){
    return Math.floor(diff / 3600) + " hours ago";
  }
//  if(diff >= 7200 ){
//    Math.floor(diff / 3600) + " 1 hour ago";
//  }
  if(diff >= 70 ){
    return Math.floor(diff / 60) + " minutes ago";
  }
  if(diff >= 120 ){
    return "1 minute ago";
  }
  return "just now";
};


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
      OPrime.debug("In audioOffsetCallback: " + message);
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
    OPrime.debug("\tRemoved previous endaudio event listeners for " + audiourl);
    document.getElementById(divid).addEventListener('ended',
        OPrime.audioEndListener);
    document.getElementById(divid).play();
  }
}
OPrime.audioEndListener = function() {
  var audiourl = this.getAttribute("src")
  OPrime.debug("End audio ", audiourl);
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
    document.getElementById(divid).currentTime = 0;
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
    document.getElementById(divid).pause();
    document.getElementById(divid).currentTime = startime;
    OPrime.debug("Cueing audio to "
        + document.getElementById(divid).currentTime);
    document.getElementById(divid).play();
    OPrime.playingInterval = true;
    document.getElementById(divid).addEventListener("timeupdate", function() {
      if (this.currentTime >= endtime && OPrime.playingInterval) {
        OPrime.debug("CurrentTime: " + this.currentTime);
        this.pause();
        OPrime.playingInterval = false; /*
         * workaround for not being able to
         * remove events
         */
      }
    });
  }
  if (typeof callback == "function") {
    callback();
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
      OPrime.debug("In callbackRecordingCompleted: " + message);
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
      OPrime.debug("In callbackRecordingStarted: " + message);
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
    alert("Recording audio only works on Android, because it has a microphone, and your computer might not.\n\n Faking that it was sucessful")
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
      OPrime.debug("In callbackRecordingStopped: " + message);
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
    alert("Recording audio only works on Android, because it has a microphone, and your computer might not.\n\n Faking that stopped and saved sucessfully")
    // fake publish it was sucessfully started
    resultfilename = "chime.mp3"
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
      OPrime.debug("In callbackPictureCaptureStarted: " + message);
      OPrime.hub.unsubscribe("pictureCaptureSucessfullyStarted", null,
          callingcontextself);
    };
  }
  if (!callbackPictureCaptureCompleted) {
    callbackPictureCaptureCompleted = function(message) {
      OPrime.debug("In callbackPictureCaptureCompleted: " + message);
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
    alert("Taking a picture only works on Android, because it has a camera, and your computer might not.\n\n Faking that taken a picture and saved sucessfully");
    // fake publish it was sucessfully started
    resultfilename = "happyface.png";
    this.hub.publish('pictureCaptureSucessfullyStarted', resultfilename);
    this.hub.publish('pictureCaptureSucessfullyCompleted', resultfilename);
  }
};

/*
 * Initialize the debugging output, taking control from the Android side.
 */
OPrime.debug("Intializing OPrime Javascript library. \n" + "The user agent is "
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
    OPrime.debug("This is an Android.");
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
    OPrime.debug("This is an Android.");
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
  if (OPrime.runFromTouchDBOnAndroidInLocalNetwork()) {
    return true;
  }
  return false;
};

OPrime.checkToSeeIfCouchAppIsReady = function(urlIsCouchAppReady,
    readycallback, failcallback) {
  if (readycallback) {
    OPrime.checkToSeeIfCouchAppIsReadyreadycallback = readycallback;
  }
  if (!$) {
    OPrime.bug("Can't check if DB is ready.");
    console
        .warn("Can't check if DB is ready, checkToSeeIfCouchAppIsReady function depends on JQuery at the moment...");
    return;
  }
  $
      .ajax({
        type : 'GET',
        url : urlIsCouchAppReady,
        data : {},
        beforeSend : function(xhr) {
          // alert("before send" + JSON.stringify(xhr));
          xhr.setRequestHeader('Accept', 'application/json');
        },
        complete : function(e, f, g) {
          console.log(e, f, g);
          // alert("Completed contacting the server.");
        },
        success : function(serverResults) {
          console.log("serverResults" + JSON.stringify(serverResults));
          alert("Your database is ready.");
          if (typeof readycallback == "function") {
            readycallback();
          }
        },// end successful fetch
        error : function(response) {
          // alert("Error contacting the server.");

          console.log("error response." + JSON.stringify(response));
          // alert("error response." + JSON.stringify(response));

          if (response.responseText) {
            if (response.responseText.indexOf("<html") >= 0) {
              localStorage.setItem("urlIsCouchAppReady", urlIsCouchAppReady);
              alert("Your database is ready.");
              if (typeof OPrime.checkToSeeIfCouchAppIsReadyreadycallback == "function") {
                OPrime.checkToSeeIfCouchAppIsReadyreadycallback();
              }
              // window.location.replace(urlIsCouchAppReady);
              return;
            }
            var error = JSON.parse(response.responseText);
            if (error.error == "unauthorized") {
              alert("CouchDB ready but you need to get a session token, this can only happen when you are online.");
            } else {
              alert("Waiting for database to be created...");
              // Loop every 2 sec waiting for the database to load
            }
          }
          window.setTimeout(failcallback, 2000);

          // $("#user-welcome-modal").modal("show");

        },
        dataType : "json"
      });

};

/*
 * Initialize pub sub
 */
OPrime.hub = {};
OPrime.makePublisher(OPrime.hub);
