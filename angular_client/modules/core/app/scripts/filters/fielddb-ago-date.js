'use strict';

/**
 * @ngdoc filter
 * @name fielddbAngularApp.filter:fielddbAgoDate
 * @function
 * @description
 *
 * JavaScript Pretty Date Copyright (c) 2011 John Resig (ejohn.org) Licensed
 * under the MIT and GPL licenses.
 *
 * Takes an ISO time and returns a string representing how
 * long ago the date represents.
 * modified by FieldDB team to take in Greenwich time which is what we are using
 * for our time stamps so that users in differnt time zones will get real times,
 * not strangely futureistic times
 * we have been using JSON.stringify(new Date()) to create our timestamps
 * instead of unix epoch seconds (not sure why we werent using unix epoch), so
 * this function is modified from the original in that it expects dates that
 * were created using
 * JSON.stringify(new Date())
 *
 * # fielddbAgoDate
 * Filter in the fielddbAngularApp.
 */
angular.module('fielddbAngularApp').filter('fielddbAgoDate', function() {
  return function(input) {
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

    if (isNaN(day_diff) || day_diff < 0) {
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
    if (diff >= 4000) {
      return Math.floor(diff / 3600) + " hours ago";
    }
    //  if(diff >= 7200 ){
    //    Math.floor(diff / 3600) + " 1 hour ago";
    //  }
    if (diff >= 70) {
      return Math.floor(diff / 60) + " minutes ago";
    }
    if (diff >= 120) {
      return "1 minute ago";
    }
    return "just now";
  };
});
