/* globals confirm, prompt */

'use strict';

/**
 * @ngdoc directive
 * @name spreadsheetApp.directive:spreadsheetAdaptingColumnarTemplateEdit
 * @description
 * # spreadsheetAdaptingColumnarTemplateEdit
 */
angular.module('spreadsheetApp').directive('spreadsheetAdaptingColumnarTemplateEdit', function() {
  var controller = function($scope, $rootScope) {

    $scope.adminPermissions = $rootScope.adminPermissions;
    $scope.readPermissions = $rootScope.readPermissions;
    $scope.writePermissions = $rootScope.writePermissions;
    $scope.commentPermissions = $rootScope.commentPermissions;
    $scope.show = $rootScope.show;

    $scope.markAsNotSaved = function(datum) {
      datum.unsaved = true;
      $rootScope.application.corpus.currentSession.docs.unsaved = true;
    };

    $scope.markAsEdited = function(utterance, datum, $event) {

      // Update activity feed
      var indirectObjectString = "in <a href='#corpus/" +
        $rootScope.application.corpus.dbname + "'>" +
        $rootScope.application.corpus.title +
        "</a>";
      $scope.addActivity([{
        verb: "modified",
        verbicon: "icon-pencil",
        directobjecticon: "icon-list",
        directobject: "<a href='#corpus/" +
          $rootScope.application.corpus.dbname +
          "/datum/" + datum.id + "'>" +
          utterance +
          "</a> ",
        indirectobject: indirectObjectString,
        teamOrPersonal: "personal"
      }, {
        verb: "modified",
        verbicon: "icon-pencil",
        directobjecticon: "icon-list",
        directobject: "<a href='#corpus/" +
          $rootScope.application.corpus.dbname +
          "/datum/" + datum.id + "'>" +
          utterance +
          "</a> ",
        indirectobject: indirectObjectString,
        teamOrPersonal: "team"
      }]);
      datum.unsaved = true;
      $rootScope.application.corpus.currentSession.docs.unsaved = true;

      if ($event && $event.type && $event.type === "submit") {
        datum.save();
        $scope.selectRow($scope.activeDatumIndex + 1);
      }
    };

    $scope.addComment = function(datum) {
      var newComment = prompt("Enter new comment.");
      if (newComment === "" || newComment === null) {
        return;
      }
      var comment = {};
      comment.text = newComment;
      comment.username = $rootScope.application.authentication.user.username;
      comment.timestamp = Date.now();
      comment.gravatar = $rootScope.application.authentication.user.gravatar || "0df69960706112e38332395a4f2e7542";
      comment.timestampModified = Date.now();
      if (!datum.comments) {
        datum.comments = [];
      }
      datum.comments.add(comment);
      datum.unsaved = true;
      // $rootScope.application.corpus.currentSession.docs.unsaved = true;
      datum.dateModified = JSON.parse(JSON.stringify(new Date()));
      datum.timestamp = Date.now();
      datum.lastModifiedBy = $rootScope.application.authentication.user.username;
      // $rootScope.currentPage = 0;
      // $rootScope.editsHaveBeenMade = true;

      var indirectObjectString = "on <a href='#data/" + datum.id + "'><i class='icon-pushpin'></i> " + $rootScope.application.corpus.title + "</a>";
      // Update activity feed
      $scope.addActivity([{
        verb: "commented",
        verbicon: "icon-comment",
        directobjecticon: "icon-list",
        directobject: comment.text,
        indirectobject: indirectObjectString,
        teamOrPersonal: "personal"
      }, {
        verb: "commented",
        verbicon: "icon-comment",
        directobjecticon: "icon-list",
        directobject: comment.text,
        indirectobject: indirectObjectString,
        teamOrPersonal: "team"
      }]);
      datum.hasComments = true;
    };

    $scope.deleteComment = function(comment, datum) {
      if ($rootScope.commentPermissions === false) {
        $rootScope.notificationMessage = "You do not have permission to delete comments.";
        $rootScope.openNotification();
        return;
      }
      if (comment.username !== $rootScope.application.authentication.user.username) {
        $rootScope.notificationMessage = "You may only delete comments created by you.";
        $rootScope.openNotification();
        return;
      }
      var verifyCommentDelete = confirm("Are you sure you want to remove the comment '" + comment.text + "'?");
      if (verifyCommentDelete === true) {
        for (var i in datum.comments) {
          if (datum.comments[i] === comment) {
            datum.comments.splice(i, 1);
          }
        }
      }
    };

    $scope.deleteRecord = function(datum) {
      var r;
      if (!datum.id) {
        r = confirm("This datum has never been saved. If you delete it you won't be able to recover it. Are you sure you want to delete it?");
        if (!r) {
          return;
        }
        $rootScope.application.corpus.currentSession.docs.remove(datum);
        return;
      }

      r = confirm("Are you sure you want to put this datum in the trash?");
      if (!r) {
        return;
      }
      var reason;
      while (!reason) {
        reason = prompt("Please add a short explaination of why are you putting this in the trash?");
      }

      var indirectObjectString = "in <a href='#corpus/" + $rootScope.application.corpus.dbname + "'>" + $rootScope.application.corpus.title + "</a>";
      $scope.addActivity([{
        verb: "deleted",
        verbicon: "icon-trash",
        directobjecticon: "icon-list",
        directobject: "<a href='#data/" + datum.id + "'>a datum</a> ",
        indirectobject: indirectObjectString,
        teamOrPersonal: "personal"
      }, {
        verb: "deleted",
        verbicon: "icon-trash",
        directobjecticon: "icon-list",
        directobject: "<a href='#data/" + datum.id + "'>a datum</a> ",
        indirectobject: indirectObjectString,
        teamOrPersonal: "team"
      }], "uploadnow");


      datum.trash(reason).then(function() {
        $rootScope.application.corpus.currentSession.docs.remove(datum);
        $scope.activeDatumIndex = null;
      }, function(error) {
        console.warn(error);
        $rootScope.application.bug("Error deleting record.");
      });
    };

    $scope.flagAsDeleted = function(json, datum) {
      json.trashed = "deleted";
      datum.unsaved = true;
    };

  };

  return {
    templateUrl: 'views/adapting-columnar-template-edit.html',
    restrict: 'A',
    transclude: false,
    controller: controller,
    // replace: true,
    // scope: {
    //   corpus: '=json'
    // },
    // controller: function($scope, $element, $attrs, $transclude) {},
    link: function postLink() {}
  };
});
