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


Utils.couchUrl = "http://localhost:5984/test_insert";
/**
 * The address of the TouchDB-Android database on the Android.
 */
Utils.touchUrl = "http://localhost:8888/db";

/**
 * The address of the PouchDB database on the browser.
 */
Utils.pouchUrl = "idb://db";


Utils.activityFeedCouchUrl = "http://trisapeace.iriscouch.com/activity_feed";
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
Utils.authUrl = "https://localhost:3001";
/**
 * The parameters of the default couch server.
 */
Utils.defaultCouchConnection = function() {
  // return {protocol: "https://", domain:"localhost", port:"6984"}; //https
  return {
    protocol : "http://",
    domain : "localhost",
    port : "5984",
    corpusname : "test_insert"
  }; // http because pouch doesnt support https
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
 * Detects whether we are running offline on an Android app.
 *
 * Note: to Android app developers, append this to your user agent
 * string to take advantage of the offline functionality of this
 * app.
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


