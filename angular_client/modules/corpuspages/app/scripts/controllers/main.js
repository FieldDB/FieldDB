'use strict';

angular.module('corpuspagesApp').controller('FieldDBCorpusPagesController', function($scope) {
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

  var corpus = {
    pouchname: 'glossersample-quechua'
  };
  $scope.corpus = corpus;
  corpus.gravatar = 'https://secure.gravatar.com/avatar/948814f0b1bc8bebd701a9732ab3ebbd.jpg?s=96&d=retro&r=pg';
  corpus.title = 'CommunityCorpus';
  corpus.description = 'This is a corpus which is editable by anyone in the LingSync community. You can add comments to data, import data, leave graffiti and help suggestions for other community members. We think that \'graffiti can give us a unique view into the daily life and customs of a people, for their casual expression encourages the recording of details that more formal writing would tend to ignore\' ref: http://nemingha.hubpages.com/hub/History-of-Graffiti';
  corpus.termsOfUse = {
    'humanReadable': 'Sample: The materials included in this corpus are available for research and educational use. If you want to use the materials for commercial purposes, please notify the author(s) of the corpus (myemail@myemail.org) prior to the use of the materials. Users of this corpus can copy and redistribute the materials included in this corpus, under the condition that the materials copied/redistributed are properly attributed.  Modification of the data in any copied/redistributed work is not allowed unless the data source is properly cited and the details of the modification is clearly mentioned in the work. Some of the items included in this corpus may be subject to further access conditions specified by the owners of the data and/or the authors of the corpus.'
  };
  corpus.license = {
    'title': 'Default: Creative Commons Attribution-ShareAlike (CC BY-SA).',
    'humanReadable': 'This license lets others remix, tweak, and build upon your work even for commercial purposes, as long as they credit you and license their new creations under the identical terms. This license is often compared to “copyleft” free and open source software licenses. All new works based on yours will carry the same license, so any derivatives will also allow commercial use. This is the license used by Wikipedia, and is recommended for materials that would benefit from incorporating content from Wikipedia and similarly licensed projects.',
    'link': 'http://creativecommons.org/licenses/by-sa/3.0/',
    'imgURL': '//i.creativecommons.org/l/by-sa/3.0/88x31.png'
  };
  corpus.copyright = 'Default: Add names of the copyright holders of the corpus.';

  $scope.corpora = null;
  $scope.thisyear = (new Date()).getFullYear();
});
