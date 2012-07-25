/**
 * @class Utils provides a number of utility functions which are handy
 *        around the app.
 * 
 * @property {Boolean} debugMode This boolean can be changed from true to
 *           false for production mode to speed up the app.
 *
 * @constructs
 */
var Utils = Utils || {};

Utils.debugMode = true;


Utils.couchUrl = "https://ilanguage.iriscouch.com/default";
/**
 * The address of the TouchDB-Android database on the Android.
 */
Utils.touchUrl = "http://localhost:8888/db";

/**
 * The address of the PouchDB database on the browser.
 */
Utils.pouchUrl = "idb://db";


Utils.activityFeedCouchUrl = "https://ilanguage.iriscouch.com/activity_feed";
/**
 * The address of the TouchDB-Android database on the Android.
 */
Utils.activityFeedTouchUrl = "http://localhost:8888/activity_feed_db";

/**
 * The address of the PouchDB database on the browser.
 */
Utils.activityFeedPouchUrl = "idb://activity_feed_db";

/**
 * The url of the authentication server.
 */
Utils.authUrl = "https://localhost:3001"; //"https://ifield.fieldlinguist.com";//"https://localhost:3001";
/**
 * The parameters of the default couch server.
 */
Utils.defaultCouchConnection = function() {
  return {
    protocol : "https://",
    domain : "ilanguage.iriscouch.com",
    port : "443",
    corpusname : "default"
  }; 
};
/**
 * A message for users if they need help which brings them to our contact us form
 */
Utils.contactUs = "<a href='https://docs.google.com/spreadsheet/viewform?formkey=dGFyREp4WmhBRURYNzFkcWZMTnpkV2c6MQ'>Contact Us</a>";

/**
 * Console logs out, if not on Internet Explorer. Only logs out if
 * debugMode is true.
 */
Utils.debug = function(message) {
	if(navigator.appName == 'Microsoft Internet Explorer') {
		return;
	}
	if(this.debugMode) {
		console.log(message);
	}
};

/**
 * Simple Pub/sub plugin to create a decoupled javascript app
 * http://answers.oreilly.com/topic/2190-two-examples-of-the-observer-pattern-in-javascript/
 * 
 * How to use it:
var hub = {};
makePublisher(hub);

hub.subscribe(
  "probeCommand",
  function(arg) {
    debug("Receiving command " + arg);
  }, self);
    
hub.publish(
    "probeResponse",
"Command not valid.")
    
var right = document.getElementById("rightSideReading");
hub.unsubscribe('probeResponse', null, center);
hub.subscribe('probeResponse', function(arg) {
  debug("Putting probe's response in the right input field.");
  var cleanedMessage = arg.replace(/[^0-9]/g, "");
  debug("Cleaned message: " + arg + " to: " + cleanedMessage);
  right.value = cleanedMessage;
}, right);
    
hub.subscribe('changeLogo',function(arg){
  debug("Putting the logo from the user. This is the path: "+ arg);
  img.setAttribute("src",storage.getItem("userLogo"));
},img);
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
        subscribers[i].fn.call(subscribers[i].context, arg);
      } else {
        if (subscribers[i].context === context) {
          subscribers.splice(i, 1);
          Utils.debug("Removed subscribers");

        } else {
          Utils.debug("Not removing subscriber" + i);

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
 * http://www.w3schools.com/js/js_cookies.asp
 * name of the cookie, the value of the cookie, and the number of days until the cookie expires.
 * 
 * @param c_name
 * @param value
 * @param exdays
 */
Utils.setCookie = function(c_name, value, exdays){
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
  document.cookie = c_name + "=" + c_value;
};
Utils.getCookie = function(c_name){
  var i, x, y, ARRcookies = document.cookie.split(";");
  for (i = 0; i < ARRcookies.length; i++){
    x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
    y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
    x = x.replace(/^\s+|\s+$/g,"");
    if (x == c_name){
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
 * If not running offline on an android or in a chrome extension,
 * assume we are online.
 *
 * @returns {Boolean} true if not on offline Android or on a Chrome
 *          Extension
 */
Utils.onlineOnly = function() {
	return !this.androidApp() && !this.chromeApp();
};

Utils.hasClass = function(ele, cls) {
	return ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
};

Utils.addClass = function(ele, cls) {
	if(!this.hasClass(ele, cls))
		ele.className += " " + cls;
};

Utils.removeClass = function(ele, cls) {
	if(this.hasClass(ele, cls)) {
		var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)', 'g');
		ele.className = ele.className.replace(reg, ' ');
	}
};


