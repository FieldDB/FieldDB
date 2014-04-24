'use strict';

angular.module('corpuspagesApp').directive('user', function() {
  var user = {};
  user.firstname = "Ling"
  user.lastname = "Llama"
  user.name = "LingLlama"
  user.username = "lingllama"
  user.gravatar = "https://secure.gravatar.com/avatar/54b53868cb4d555b804125f1a3969e87.jpg?s=200&d=identicon&r=pg"
  user.description = "Hi! I'm a sample user, anyone can log in as me (my password is phoneme, 'cause I like memes)."
  user.researchInterest = "Memes"
  user.affiliation = "http://lingllama.tumblr.com"
  return {
    templateUrl: 'views/user.html',
    restrict: 'A',
    transclude: true,
    scope: true,
    controller: function($scope, $element, $attrs, $transclude) {},
    link: function postLink(scope, element, attrs) {
      scope.user = user;
      console.log(attrs);
      // element.text('this is the user directive');
    }
  };
});
