define("libs/Utils", [
], function() {
	/**
	 * @class Utils provides a number of utility functions which are handy
	 *        around the app.
	 * @property {Boolean} debugMode This boolean can be changed from true to
	 *           false for production mode to speed up the app.
	 * 
	 * @constructs
	 */
	return function Utils() {
		this.debugMode = true;
		/**
		 * Console logs out, if not on Internet Explorer. Only logs out if
		 * debugMode is true.
		 */
		this.debug = function(message) {
			if (navigator.appName == 'Microsoft Internet Explorer') {
				return;
			}
			if (this.debugMode) {
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
		this.androidApp = function() {
			return navigator.userAgent.indexOf("OfflineAndroidApp") > -1;
		};
		/**
		 * Detects whether we are running offline in chrome extension.
		 * 
		 * @returns {Boolean} true if using a Chrome Extension
		 */
		this.chromeApp = function() {
			return window.location.href.indexOf("chrome-extension") > -1;
		};
		/**
		 * If not running offline on an android or in a chrome extension,
		 * assume we are online.
		 * 
		 * @returns {Boolean} true if not on offline Android or on a Chrome
		 *          Extension
		 */
		this.onlineOnly = function() {
			return !this.androidApp() && !this.chromeApp();
		};
	};
});
