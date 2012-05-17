define([ "use!backbone" ], function(Backbone) {
	/**
	 * @class Utils provides a number of utility functions which are handy
	 *        around the app.
	 * @property {Boolean} debugMode This boolean can be changed from true to
	 *           false for production mode to speed up the app.
	 * 
	 * @constructs
	 */
	var Utils = function() {
		debugMode = true;
		/**
		 * Console logs out, if not on Internet Explorer. Only logs out if
		 * debugMode is true.
		 */
		debug = function(message) {
			if (navigator.appName == 'Microsoft Internet Explorer') {
				return;
			}
			if (debugMode) {
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
		androidApp = function() {
			return navigator.userAgent.indexOf("OfflineAndroidApp") > -1;
		};
		/**
		 * Detects whether we are running offline in chrome extension.
		 * 
		 * @returns {Boolean} true if using a Chrome Extension
		 */
		chromeApp = function() {
			return window.location.href.indexOf("chrome-extension") > -1;
		};
		/**
		 * If not running offline on an android or in a chrome extension,
		 * assume we are online.
		 * 
		 * @returns {Boolean} true if not on offline Android or on a Chrome
		 *          Extension
		 */
		onlineOnly = function() {
			return !androidApp() && !chromeApp();
		};
	};

	return Utils;
});
