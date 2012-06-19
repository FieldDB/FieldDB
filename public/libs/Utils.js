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


Utils.couchUrl = "http://trisapeace.iriscouch.com/datum_test4";
/**
 * The address of the TouchDB-Android database on the Android.
 */
Utils.touchUrl = "http://localhost:8888/db";

/**
 * The address of the PouchDB database on the browser.
 */
Utils.pouchUrl = "idb://db";

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
