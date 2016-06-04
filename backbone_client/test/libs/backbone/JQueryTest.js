require([ "sinon", "$" ], function() {
  describe("JQuery DOM manipulation and Sinon timers", function() {
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

    it("should call callback after 100ms", function() {
      var callback = sinon.spy();
      var throttled = throttle(callback);

      throttled();

      clock.tick(99);
      expect(callback.notCalled).toBeTruthy();

      clock.tick(1);
      expect(callback.calledOnce).toBeTruthy();

      // Also:
      // assert.equals(new Date().getTime(), 100);
    });
    /*
     * Can test DOM/UserInterface maniulation times
     * http://msdn.microsoft.com/en-us/magazine//gg649850.aspx
     */
    it("should animate quicker than 510ms (1/2 second)", function() {
      /* :DOC += */
      var element = jQuery(document.createElement("div"));
      element.animate({
        height : "100px"
      }, 500);

      clock.tick(510);
      expect("100px").toEqual(element.css("height"));

    });

  });

});
