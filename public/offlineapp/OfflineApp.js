/*
 * This library declares an app with truth values for whether it is installed on android, chrome or online only.
 * 
 */

var App = App || {};
App.prototype.androidApp =  navigator.userAgent.indexOf("InstalledAndroidApp") > -1;
App.prototype.chromeApp = window.location.href.indexOf("chrome-extension") > -1;
App.prototype.onlineOnly = ! this.isAndroid() && ! this.isChromeExtension();