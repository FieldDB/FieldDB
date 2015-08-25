"use strict";

/**
 * Sets focus on the element if it is rendered.
 * 
 * http://stackoverflow.com/questions/14833326/how-to-set-focus-on-input-field
 * 
 * @return {Directive}               [description]
 */
angular.module("fielddbAngular").directive("fielddbAutoFocus", function($timeout) {
	return {
		restrict: "AC",
		link: function(scope, element) {
			$timeout(function() {
				if (element && element[0] && typeof element[0].focus === "function") {
					element[0].focus();
				}
			}, 0);
		}
	};
});
