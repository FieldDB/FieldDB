"use strict";

/*
 *
 * Spies are functions that keep track of how and often they were called, and what values were returned. This is phenomenally useful in asynchronous and event-driven applications as you can send a spy function off to keep track of what’s going on inside your methods, even if those methods are anonymous or closed off from direct inspection.
 */

define([
  "jquery",
  "sinon"
], function(jQuery) {
  function registerTests() {
    describe("JQuery DOM manipulation", function() {
      it("should animate", function(done) {
        jQuery("#view").append("<div id='test-jquery-dom-manipulation' style='background-color:black;'>.</div>");

        var element = jQuery("#test-jquery-dom-manipulation");
        element.animate({
          height: "49px"
        }, 50);

        setTimeout(function() {
          expect(element.css("height")).toEqual("49px");

          done();
        }, 50)
      });

      it("should not animate", function() {
        jQuery.fx.off = true

        jQuery("#view").append("<div id='test-sinon-timing' style='background-color:grey;'>.</div>");

        var element = jQuery("#test-sinon-timing");
        element.animate({
          height: "50px"
        }, 100);

        expect(element.css("height")).toEqual("50px");
        jQuery.fx.off = false
      });
    });

    describe("JQuery DOM manipulation cant be controleld by Sinon timers", function() {
      var clock;

      function throttle(callback) {
        var timer;
        return function() {
          clearTimeout(timer);
          var args = [].slice.call(arguments);
          timer = setTimeout(function() {
            callback.apply(this, args);
          }, 100);
        };
      }

      beforeEach(function() {
        clock = sinon.useFakeTimers();
      });

      afterEach(function() {
        clock.restore();
      });

      it("should run faster than real time", function() {
        var callback = sinon.spy();
        var throttled = throttle(callback);

        throttled();

        clock.tick(99);
        expect(callback.notCalled).toBeTruthy();

        clock.tick(1);
        expect(callback.calledOnce).toBeTruthy();

        // Also:
        expect(new Date().getTime()).toEqual(100);
      });

      /*
      http://stackoverflow.com/questions/7324043/how-do-i-fake-time-a-jquery-animation-using-sinon-in-a-jasmine-unit-test
       */
      it("should cant change timer on requestAnimationFrame", function() {
        window.requestAnimationFrame = sinon.spy();

        var el = jQuery("<div></div>");
        el.appendTo(document.body);

        el.animate({
          height: "200px",
          width: "200px"
        });
        clock.tick(510);

        expect(window.requestAnimationFrame.notCalled).toBeTruthy();
        expect(el.css("height").replace('px',"")).toBeLessThan(3);
      });
    });
  }

  return {
    describe: registerTests
  };
});
