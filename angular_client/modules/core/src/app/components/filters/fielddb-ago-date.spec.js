"use strict";

describe("Filter: fielddbAgoDate", function() {
  var oneminute = 60000;
  var onehour = 3600000;
  var sixhours = 21600000;
  var oneday = 86400000;
  var oneweek = 604800000;
  var onemonth = 2.62974e9;
  // load the filter"s module
  beforeEach(module("fielddbAngular"));

  // initialize a new instance of the filter before each test
  var fielddbAgoDate;
  beforeEach(inject(function($filter) {
    fielddbAgoDate = $filter("fielddbAgoDate");
  }));

  describe("today", function() {

    it("should detect in the past 2 minutes is just now", function() {
      var inputDate = Date.now() - oneminute;
      expect(fielddbAgoDate(inputDate)).toBe("just now");
    });

    it("should detect 2 minutes ago", function() {
      var inputDate = Date.now() - oneminute * 2;
      expect(fielddbAgoDate(inputDate)).toBe("2 minutes ago");
    });

    it("should detect 30 minutes ago", function() {
      var inputDate = Date.now() - oneminute * 30;
      expect(fielddbAgoDate(inputDate)).toBe("30 minutes ago");
    });

    it("should detect 59 mintues ago", function() {
      var inputDate = Date.now() - onehour + oneminute;
      expect(fielddbAgoDate(inputDate)).toBe("59 minutes ago");
    });

    it("should detect 60 minutes ago", function() {
      var inputDate = Date.now() - onehour;
      expect(fielddbAgoDate(inputDate)).toBe("60 minutes ago");
    });

    it("should detect 63 minutes ago", function() {
      var inputDate = Date.now() - onehour - oneminute * 3;
      expect(fielddbAgoDate(inputDate)).toBe("63 minutes ago");
    });

    it("should detect over 70 minutes is one hour ago", function() {
      var inputDate = Date.now() - onehour - oneminute * 10;
      expect(fielddbAgoDate(inputDate)).toBe("1 hour ago");
    });

    it("should detect 1:31 is 1.5 hours ago", function() {
      var inputDate = Date.now() - onehour - oneminute * 31;
      expect(fielddbAgoDate(inputDate)).toBe("1.5 hours ago");
    });

    it("should detect 1.45 is 1.5 hours ago", function() {
      var inputDate = Date.now() - onehour * 1.8;
      expect(fielddbAgoDate(inputDate)).toBe("1.5 hours ago");
    });

    it("should detect 18 hours ago", function() {
      var inputDate = Date.now() - oneday + sixhours;
      expect(fielddbAgoDate(inputDate)).toBe("18 hours ago");
    });


    it("should detect 23 hours ago", function() {
      var inputDate = Date.now() - oneday + onehour;
      expect(fielddbAgoDate(inputDate)).toBe("23 hours ago");
    });

  });

  describe("yesterday", function() {

    it("should detect yesterday", function() {
      var inputDate = Date.now() - oneday;
      expect(fielddbAgoDate(inputDate)).toBe("Yesterday");
    });

    it("should detect yesterday-ish", function() {
      var inputDate = Date.now() - oneday - sixhours;
      expect(fielddbAgoDate(inputDate)).toBe("Yesterday");
    });


    it("should detect yesterday-ish", function() {
      var inputDate = Date.now() - oneday * 1.5;
      expect(fielddbAgoDate(inputDate)).toBe("Yesterday");
    });

    it("should detect yesterday-ish", function() {
      var inputDate = Date.now() - oneday * 1.8;
      expect(fielddbAgoDate(inputDate)).toBe("Yesterday");
    });

  });

  describe("recent past", function() {

    it("should detect 2 days", function() {
      var inputDate = Date.now() - oneday * 2;
      expect(fielddbAgoDate(inputDate)).toBe("2 days ago");
    });

    it("should detect 7 days", function() {
      var inputDate = Date.now() - oneday * 7;
      expect(fielddbAgoDate(inputDate)).toBe("7 days ago");
    });

    it("should detect 8 days", function() {
      var inputDate = Date.now() - oneday * 8;
      expect(fielddbAgoDate(inputDate)).toBe("8 days ago");
    });

    it("should detect over a week ago", function() {
      var inputDate = Date.now() - oneweek * 1.5;
      expect(fielddbAgoDate(inputDate)).toBe("10 days ago");
    });

    it("should detect over a week ago", function() {
      var inputDate = Date.now() - oneweek * 2 - oneday;
      expect(fielddbAgoDate(inputDate)).toBe("15 days ago");
    });

    it("should detect 16 days ago is 2 weeks ago", function() {
      var inputDate = Date.now() - oneweek * 2 - oneday * 2;
      expect(fielddbAgoDate(inputDate)).toBe("2 weeks ago");
    });

    it("should detect 2.8 weeks ago is 3 week ago", function() {
      var inputDate = Date.now() - oneweek * 2.8;
      expect(fielddbAgoDate(inputDate)).toBe("3 weeks ago");
    });

    it("should detect 5 weeks ago is 5 week ago", function() {
      var inputDate = Date.now() - oneweek * 5;
      expect(fielddbAgoDate(inputDate)).toBe("5 weeks ago");
    });

    it("should detect 7 weeks ago is 1.5 months ago", function() {
      var inputDate = Date.now() - oneweek * 7;
      expect(fielddbAgoDate(inputDate)).toBe("1.5 months ago");
    });

  });

  describe("in the past year and a half", function() {

    it("should detect 8 weeks ago is 2 months ago", function() {
      var inputDate = Date.now() - oneweek * 8;
      expect(fielddbAgoDate(inputDate)).toBe("2 months ago");
    });

    it("should detect 9 weeks ago is 2 months ago", function() {
      var inputDate = Date.now() - oneweek * 9;
      expect(fielddbAgoDate(inputDate)).toBe("2 months ago");
    });

    it("should detect 13 weeks ago is 3 months ago", function() {
      var inputDate = Date.now() - oneweek * 13;
      expect(fielddbAgoDate(inputDate)).toBe("3 months ago");
    });

    it("should detect 8 months ago ", function() {
      var inputDate = Date.now() - onemonth * 8.18;
      expect(fielddbAgoDate(inputDate)).toBe("8 months ago");
    });

    it("should detect 16 months ago ", function() {
      var inputDate = Date.now() - onemonth * 16.18;
      expect(fielddbAgoDate(inputDate)).toBe("16 months ago");
    });

  });

  describe("over a year and a half ago", function() {

    it("should detect 18 months ago is 1.5 years ago", function() {
      var inputDate = Date.now() - onemonth * 18;
      expect(fielddbAgoDate(inputDate)).toBe("1.5 years ago");
    });

    it("should detect 24 months ago is 2 years ago", function() {
      var inputDate = Date.now() - onemonth * 24;
      expect(fielddbAgoDate(inputDate)).toBe("2 years ago");
    });

    it("should detect 31 months ago is 2.5 years ago", function() {
      var inputDate = Date.now() - onemonth * 31;
      expect(fielddbAgoDate(inputDate)).toBe("2.5 years ago");
    });

    it("should detect almost 3 years ago is 3 years ago", function() {
      var inputDate = Date.now() - onemonth * 35;
      expect(fielddbAgoDate(inputDate)).toBe("3 years ago");
    });

    it("should detect 3.5 years ago is 3.5 years ago", function() {
      var inputDate = Date.now() - onemonth * 42;
      expect(fielddbAgoDate(inputDate)).toBe("3.5 years ago");
    });

    it("should detect almost 4 years ago is 4 years ago", function() {
      var inputDate = Date.now() - onemonth * 47;
      expect(fielddbAgoDate(inputDate)).toBe("4 years ago");
    });

  });

  describe("diverse inputs", function() {
    var inputDate = JSON.stringify(new Date(Date.now() - onemonth * 2));

    it("should convert json dates with escaped quotes into ago", function() {
      inputDate = "\"" + inputDate + "\"";
      expect(fielddbAgoDate(inputDate)).toBe("2 months ago");
    });

    it("should convert json dates with quotes into ago", function() {
      inputDate = "\"" + inputDate + "\"";
      expect(fielddbAgoDate(inputDate)).toBe("2 months ago");
    });

    it("should convert json dates into ago", function() {
      expect(fielddbAgoDate(inputDate)).toBe("2 months ago");
    });

    it("should convert timestamps into ago", function() {
      inputDate = Date.now() - onemonth * 2;
      expect(fielddbAgoDate(inputDate)).toBe("2 months ago");
    });

    it("should convert dates into ago", function() {
      inputDate = new Date(Date.now() - onemonth * 2);
      expect(fielddbAgoDate(inputDate)).toBe("2 months ago");
    });

  });

  describe("future", function(){

    it("should support any future, same as the past", function() {
      var inputDate = new Date(Date.now() + onemonth * 2);
      expect(fielddbAgoDate(inputDate)).toBe("in 2 months");
    });

  });

});
