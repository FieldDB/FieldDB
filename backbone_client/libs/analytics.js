/*
 New info for chrome packaged apps

 https://github.com/GoogleChrome/chrome-platform-analytics/tree/master/src/example/javascript

 wont work in the chroem app

 Refused to load the image 'http://www.google-analytics.com/__utm.gif?utmwv=5.6.3&utms=12&utmn=17408427…ccn%3D(direct)%7Cutmcmd%3D(none)%3B&utmjid=&utmu=qAAAAAAAAAAAAAAAAAAAAAAE~' because it violates the following Content Security Policy directive: "default-src 'self' https://*.lingsync.org https://secure.gravatar.com https://soundcloud.com https://ssl.google-analytics.com https://*.mcgill.ca https://*.concordia.ca https://docs.google.com https://support.apple.com https://themes.googleusercontent.com https://localhost:* https://ssl.google-analytics.com". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback.
 */


/**
 * Moved analytics out of in-line code to respect new Content Security Policy of extension manifest  version 2
 */
// var _AnalyticsCode = "UA-35422317-1";

/**
 * Below is a modified version of the Google Analytics asynchronous tracking
 * code snippet.  It has been modified to pull the HTTPS version of ga.js
 * instead of the default HTTP version.  It is recommended that you use this
 * snippet instead of the standard tracking snippet provided when setting up
 * a Google Analytics account.
 *
 * http://code.google.com/chrome/extensions/samples.html#analytics
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', _AnalyticsCode]);
  _gaq.push(['_trackPageview']);
 */


/**
 * dont need this if we are loading it in the .html This is another version of the code from chrome extension tutorial
  (function() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
  })();
 */


/*
this is the current code from google
*/

(function(i, s, o, g, r, a, m) {
  i['GoogleAnalyticsObject'] = r;
  i[r] = i[r] || function() {
    (i[r].q = i[r].q || []).push(arguments)
  }, i[r].l = 1 * new Date();
  a = s.createElement(o),
    m = s.getElementsByTagName(o)[0];
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

// ga('create', 'UA-35422317-1', 'auto'
// );

// https://productforums.google.com/forum/#!topic/analytics/KNz8TimivXo
ga('create', 'UA-35422317-1', {
  'cookieDomain': 'none'
});
ga('set', 'checkProtocolTask', function() { /* nothing */ });
ga('set', 'page', 'chrome-protoype' + window.location.href.replace(window.location.protocol, "").replace(/^\//,""));
// ga('set', 'page', 'chrome-protoype');
ga('send', 'pageview');


/*
this is an attept to use a local version loaded asycnronously in the html

    // (function(window, document, script, g, r, a, m) {
    (function() {
      window['GoogleAnalyticsObject'] = 'ga';
      window['ga'] = window['ga'] || function() {
        (window['ga'].q = window['ga'].q || []).push(arguments)
      }, window['ga'].l = 1 * new Date();
      a = document.createElement('script'),
        m = document.getElementsByTagName('script')[0];
      a.async = 1;
      a.src = 'libs/ga.js';
      // m.parentNode.insertBefore(a, m)
    })();
    // // })(window, document, 'script', 'libs/ga.js', 'ga');
    ga('create', _AnalyticsCode, 'auto');
    ga('send', 'pageview');

    // (function(i, s, o, g, r, a, m) {
    //   i['GoogleAnalyticsObject'] = r;
    //   i[r] = i[r] || function() {
    //     (i[r].q = i[r].q || []).push(arguments)
    //   }, i[r].l = 1 * new Date();
    //   a = s.createElement(o),
    //     m = s.getElementsByTagName(o)[0];
    //   a.async = 1;
    //   a.src = g;
    //   m.parentNode.insertBefore(a, m)
    // })(window, document, 'script', 'libs/ga.js', 'ga');

*/


/**
 * Track a click on a button using the asynchronous tracking API.
 *
 * See http://code.google.com/apis/analytics/docs/tracking/asyncTracking.html
 * for information on how to use the asynchronous tracking API.
 */
//  function trackButtonClick(e) {
//    _gaq.push(['_trackEvent', e.target.id, 'clicked']);
//  }

/**
 * Now set up your event handlers for the popup's `button` elements once the
 * popup's DOM has loaded.
 */
//  document.addEventListener('DOMContentLoaded', function () {
//    var buttons = document.querySelectorAll('button');
//    for (var i = 0; i < buttons.length; i++) {
//      buttons[i].addEventListener('click', trackButtonClick);
//    }
//  });

/**
 * Use search analytics example
 */
//  var pageTracker = _gat._getTracker(_AnalyticsCode);
//  pageTracker._initData();
//  pageTracker._trackPageview('/search_results.php?q=searchterm');


//  var gaJsHost =  "https://ssl." ;
//  document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
//  console.log("Attempting to load "+ gaJsHost + "google-analytics.com/ga.js");
//Chrome manifest 2 doesnt work so put a static ga.js into the project.
// var hndl = window.setTimeout(function() {
//   StartTracking();
// }, 100);

// function StartTracking() {
//   if (typeof(_gat) == 'object') {
//     window.clearTimeout(hndl);
//     window.pageTracker = _gat._getTracker(_AnalyticsCode);
//     window.pageTracker._initData();
//     window.pageTracker._trackPageview();
//   } else {
//     hndl = window.setTimeout(function() {
//       StartTracking();
//     }, 1000);
//   }
// }
