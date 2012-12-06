/**
 * @class Utils provides a number of utility functions which are handy around
 *        the app.
 * 
 * @property {Boolean} debugMode This boolean can be changed from true to false
 *           for production mode to speed up the app.
 * @property {Boolean} productionMode This boolean can be changed from false to
 *           true to point the app to production servers rather than development
 *           servers.
 * @constructs
 */

var Utils = Utils || {};

/*
 * Turn this off to make the app run faster. If it is on, you can see a lot of
 * debugging output whcih can be useful as a developer to find out what the app
 * is doing, how control flows through the app and also to debug new features or
 * bugs.
 */
Utils.debugMode = false;

/**
 * The address of the TouchDB-Android database on the Android.
 */
Utils.touchUrl = "http://localhost:8888/db";

/**
 * The address of the PouchDB database on the browser.
 */
Utils.pouchUrl = "idb://db";

/**
 * The address of the TouchDB-Android database on the Android.
 * 
 * @Deprecated now using pouchUrl for all
 */
// Utils.activityFeedTouchUrl = "http://localhost:8888/activity_feed_db";
/**
 * The address of the PouchDB database on the browser.
 * 
 * @Deprecated now using pouchUrl for all
 */
// Utils.activityFeedPouchUrl = "idb://activity_feed_db";
/**
 * A message for users if they need help which brings them to our contact us
 * form
 */
Utils.contactUs = "<a href='https://docs.google.com/spreadsheet/viewform?formkey=dGFyREp4WmhBRURYNzFkcWZMTnpkV2c6MQ' target='_blank'>Contact Us</a>";

/**
 * Console logs out, if not on Internet Explorer. Only logs out if debugMode is
 * true.
 */
Utils.debug = function(message, secondmessage) {
  if (navigator.appName == 'Microsoft Internet Explorer') {
    return;
  }
  if (this.debugMode) {
    console.log(message);
    if (secondmessage) {
      console.log(secondmessage);
    }
  }
};

/**
 * Simple Pub/sub plugin to create a decoupled javascript app
 * http://answers.oreilly.com/topic/2190-two-examples-of-the-observer-pattern-in-javascript/
 * 
 * How to use it: var hub = {}; makePublisher(hub);
 * 
 * hub.subscribe( "probeCommand", function(arg) { debug("Receiving command " +
 * arg); }, self);
 * 
 * hub.publish( "probeResponse", "Command not valid.")
 * 
 * var right = document.getElementById("rightSideReading");
 * hub.unsubscribe('probeResponse', null, center);
 * hub.subscribe('probeResponse', function(arg) { debug("Putting probe's
 * response in the right input field."); var cleanedMessage =
 * arg.replace(/[^0-9]/g, ""); debug("Cleaned message: " + arg + " to: " +
 * cleanedMessage); right.value = cleanedMessage; }, right);
 * 
 * hub.subscribe('changeLogo',function(arg){ debug("Putting the logo from the
 * user. This is the path: "+ arg);
 * img.setAttribute("src",storage.getItem("userLogo")); },img);
 * 
 */

Utils.publisher = {
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
    var pubtype = type || 'any', subscribers = this.subscribers[pubtype], i, max = subscribers ? subscribers.length
        : 0;

    for (i = 0; i < max; i += 1) {
      if (action === 'publish') {
        if (subscribers[i]) {
          // TODO there is a bug with the subscribers they are getting lost, and
          // it is trying to call fn of undefiend. this is a workaround until we
          // figure out why subscribers are getting lost.
          subscribers[i].fn.call(subscribers[i].context, arg);
        }
      } else {
        try {
          if (subscribers[i].context === context) {
            var removed = subscribers.splice(i, 1);
            Utils.debug("Removed subscriber from " + type, removed);
          } else {
            Utils.debug(type + " keeping subscriber " + i);
          }
        } catch (e) {
          Utils.debug("problem visiting Subscriber " + i)
        }
      }
    }
  }
};
Utils.makePublisher = function(o) {
  var i;
  for (i in Utils.publisher) {
    if (Utils.publisher.hasOwnProperty(i)
        && typeof Utils.publisher[i] === "function") {
      o[i] = Utils.publisher[i];
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
Utils.setCookie = function(c_name, value, exdays) {
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var c_value = escape(value)
      + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
  document.cookie = c_name + "=" + c_value;
};
Utils.getCookie = function(c_name) {
  var i, x, y, ARRcookies = document.cookie.split(";");
  for (i = 0; i < ARRcookies.length; i++) {
    x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
    y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
    x = x.replace(/^\s+|\s+$/g, "");
    if (x == c_name) {
      return unescape(y);
    }
  }
};

/**
 * Detects whether we are running offline on an Android app.
 * 
 * Note: to Android app developers, append this to your user agent string to
 * take advantage of the offline functionality of this app.
 * 
 * @returns {Boolean} true if using offline Android
 */
Utils.androidApp = function() {
  return navigator.userAgent.indexOf("OfflineAndroidApp") > -1;
};

/**
 * Detects whether we are running offline in chrome extension.
 * 
 * @returns {Boolean} true if using a Chrome Extension
 */
Utils.chromeApp = function() {
  return window.location.href.indexOf("chrome-extension") > -1;
};

/**
 * If not running offline on an android or in a chrome extension, assume we are
 * online.
 * 
 * @returns {Boolean} true if not on offline Android or on a Chrome Extension
 */
Utils.onlineOnly = function() {
  return !this.androidApp() && !this.chromeApp();
};

Utils.getVersion = function(callback) {
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
Utils.prettyDate = function(time) {
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

  if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31) {
    return undefined;
  }

  return day_diff == 0
      && (diff < 60 && "just now" || diff < 120 && "1 minute ago"
          || diff < 3600 && Math.floor(diff / 60) + " minutes ago"
          || diff < 7200 && "1 hour ago" || diff < 86400
          && Math.floor(diff / 3600) + " hours ago") || day_diff == 1
      && "Yesterday" || day_diff < 7 && day_diff + " days ago" || day_diff < 31
      && Math.ceil(day_diff / 7) + " weeks ago";
};
Utils.prettyTimestamp = function(timestamp) {
  var date = new Date(timestamp);
  var greenwichtimenow = new Date();
  var diff = ((greenwichtimenow.getTime() - date.getTime()) / 1000);
  var day_diff = Math.floor(diff / 86400);

  if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31) {
    return;
  }

  return day_diff == 0
      && (diff < 60 && "just now" || diff < 120 && "1 minute ago"
          || diff < 3600 && Math.floor(diff / 60) + " minutes ago"
          || diff < 7200 && "1 hour ago" || diff < 86400
          && Math.floor(diff / 3600) + " hours ago") || day_diff == 1
      && "Yesterday" || day_diff < 7 && day_diff + " days ago" || day_diff < 31
      && Math.ceil(day_diff / 7) + " weeks ago";
};
//
// // If jQuery is included in the page, adds a jQuery plugin to handle it as
// well
// if ( typeof jQuery != "undefined" )
// jQuery.fn.prettyDate = function(){
// return this.each(function(){
// var date = prettyDate(this.title);
// if ( date )
// jQuery(this).text( date );
// });
// };

Utils.catchAndThrowAjaxError = function(e, xhr, settings, exception) {
  console.log('\tAjax error in: ' + settings.url + ' \n' + 'error:\n'
      + xhr.responseText);
  window.hub.publish("ajaxError", exception);
  // throw exception; //this doesnt work, cant use normal try catches, instead
  // using pub sub
};

Utils.catchAndThrowPouchError = function(e) {
  console.log('\tCaught Error : ', e);
  if (e) {
    window.hub.publish("pouchError", e);
  }
  // throw e; //this doesnt work, cant use normal try catches, instead using pub
  // sub
};

Utils.testPouchChromeVersions = function(pouchname) {
  return;
  
  
  /*
   * Dead code follows
   */
  var chromeVersionWhenThisPouchWasCreated = localStorage.getItem(pouchname
      + "chromeCreationVersion");
  var currentChromeVersion = window.navigator.appVersion
      .match(/Chrome\/(.*?) /)[1];
  
  if (!chromeVersionWhenThisPouchWasCreated) {
    localStorage.setItem(pouchname + "chromeCreationVersion",
        currentChromeVersion);
    return;
  }
  
  if (currentChromeVersion != chromeVersionWhenThisPouchWasCreated) {
    
    if(currentChromeVersion == "23.0.1271.17"){
      alert("We need to upgrade your local database to work with 23.0.1271.17 " +
      		"version of Chrome. The app will attempt to move your local databases to a local backup, " +
      		"then log you out. When you log back in, the app will sync down your " +
      		"most recent corpora into a fresh new local database which will be compatible with 23.0.1271.17.");
      
      //TODO rename the indexeddb so that we can keep it at least
      
      //TODO log the user out
      
      
    }else{
      alert("Chrome changes really quickly, which is good because we get " +
          "an even better offline database, but also bad because it means " +
          "we need to give you special instructions.\n\n" +
          "We have discovered that Chrome version 23.0.1271.17 " +
          "changes the local offline IndexedDataBase (where your corpus is stored) " +
          "significantly enough that you won't be able to use your database " +
          "if it was created with a previous version of Chrome. " +
          "Here is the solution: before you update to Chrome 23.0.1271.17, you should sync your corpus" +
          ". We have programmed the app to log you out, and do the databse upgrade for you," +
          " but you will lose some of your data if you have not backed it up to the team server. \n\n" +
      "We have created this pop-up to remind you to sync/backup your data to the server before you upgrade your Chrome browser.");
    }
  }
};
