/**
   * Moved analytics out of in-line code to respect new Content Security Policy of extension manifest  version 2
   */
  var _AnalyticsCode = 'UA-32705284-1';

  /**
   * Below is a modified version of the Google Analytics asynchronous tracking
   * code snippet.  It has been modified to pull the HTTPS version of ga.js
   * instead of the default HTTP version.  It is recommended that you use this
   * snippet instead of the standard tracking snippet provided when setting up
   * a Google Analytics account.
   * 
   * http://code.google.com/chrome/extensions/samples.html#analytics
   */
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', _AnalyticsCode]);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
  })();
  
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
  
  
  var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
  document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
  var hndl = window.setTimeout("StartTracking()", 100);
  function StartTracking(){
    if (typeof(_gat) == 'object')
    {
      window.clearTimeout(hndl);
      window.pageTracker =_gat._getTracker(_AnalyticsCode);
      window.pageTracker._initData();
      window.pageTracker._trackPageview();
    } else {
      hndl = window.setTimeout("StartTracking()", 1000);
    }
  }