"use strict";

/**
 * @ngdoc filter
 * @name fielddbAngular.filter:fielddbAgoDate
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
 * Filter in the fielddbAngular.
 */
angular.module("fielddbAngular").filter("fielddbAgoDate", function() {
  return function(input) {
    if (!input) {
      return "--";
    }
    if (input.replace) {
      input = input.replace(/\"/g, "");
    }
    if (input.trim) {
      input = input.trim();
    }
    if (!input) {
      return "--";
    }
    // For unknown historical reasons in the spreadsheet app
    // there were some dates that were unknown and were set
    // to a random? date like this:
    if (input === "2000-09-06T16:31:30.988Z" || (input >= new Date("2000-09-06T16:31:30.000Z") && input <= new Date("2000-09-06T16:31:31.000Z"))) {
      return "N/A";
    }
    if (!input.toLocaleDateString) {
      input = new Date(input);
    }

    var greenwichdate = new Date();
    var minuteDiff = ((greenwichdate.getTime() - input.getTime()) / 1000);
    var dayDiff = Math.floor(minuteDiff / 86400);

    var prefix;
    var suffix;

    if (isNaN(dayDiff) || dayDiff < 0) {
      prefix = "in ";
      suffix = "";
    } else {
      prefix = "";
      suffix = " ago";
    }
    dayDiff = Math.abs(dayDiff);
    if (dayDiff >= 1430) {
      return prefix + (Math.round(dayDiff / 365) + " years" + suffix);
    }
    if (dayDiff >= 1278) {
      return prefix + "3.5 years" + suffix;
    }
    if (dayDiff >= 1065) {
      return prefix + "3 years" + suffix;
    }
    if (dayDiff >= 913) {
      return prefix + "2.5 years" + suffix;
    }
    if (dayDiff >= 730) {
      return prefix + "2 years" + suffix;
    }
    if (dayDiff >= 540) {
      return prefix + "1.5 years" + suffix;
    }
    if (dayDiff >= 50) {
      return prefix + (Math.round(dayDiff / 31) + " months" + suffix);
    }
    if (dayDiff >= 48) {
      return prefix + "1.5 months" + suffix;
    }
    if (dayDiff >= 40) {
      return prefix + "1 month" + suffix;
    }
    if (dayDiff >= 16) {
      return prefix + (Math.round(dayDiff / 7) + " weeks" + suffix).replace("1 weeks", "1 week");
    }
    if (dayDiff >= 2) {
      return prefix + (Math.round(dayDiff / 1) + " days" + suffix).replace("1 days", "1 day");
    }
    if (dayDiff >= 1) {
      return prefix + "Yesterday";
    }

    if (minuteDiff >= 5000) {
      return prefix + (Math.floor(minuteDiff / 3600) + " hours" + suffix).replace("1 hours", "1.5 hours");
    }

    if (minuteDiff >= 4000) {
      return prefix + "1 hour" + suffix;
    }
    //  if(minuteDiff >= 7200 ){
    //    Math.floor(minuteDiff / 3600) + " 1 hour" + suffix;
    //  }
    if (minuteDiff >= 70) {
      return prefix + Math.floor(minuteDiff / 60) + " minutes" + suffix;
    }
    if (minuteDiff >= 120) {
      return prefix + "1 minute" + suffix;
    }
    return "just now";

  };
});