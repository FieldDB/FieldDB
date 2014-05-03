'use strict';

angular.module('corpuspagesApp').controller('FieldDBCorpusPagesController', ['$scope', 'FieldDBCorpusMaskFactory', 'Servers',
  function($scope, FieldDBCorpusMaskFactory, Servers) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    var team = {};
    $scope.team = team;
    team.firstname = 'Linggg';
    team.lastname = 'Llama';
    team.name = 'LingLlama';
    team.username = 'lingllama';
    team.gravatar = 'https://secure.gravatar.com/avatar/54b53868cb4d555b804125f1a3969e87.jpg?s=200&d=identicon&r=pg';
    team.description = 'Hi! I\'m a sample user, anyone can log in as me (my password is phoneme, \'cause I like memes).';
    team.researchInterest = 'Memes';
    team.affiliation = 'http://lingllama.tumblr.com';

    var corpus = new FieldDBCorpusMaskFactory({
      dbname: 'gina-georgian',
    });
    console.log(corpus.toJSON());
    $scope.corpus = corpus;
    if (!$scope.corpus.title) {
      corpus.fetch(Servers.getServiceUrl(null, "corpus")).then(function(result) {
        console.log("Suceeded to download corpus public details.", result);
      }, function(result) {
        console.log("Failed to download corpus public details.", result);
      });
    }
    $scope.corpora = null;
    $scope.thisyear = (new Date()).getFullYear();
  }
]);
