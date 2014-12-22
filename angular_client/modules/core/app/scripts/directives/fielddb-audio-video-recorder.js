"use strict";

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbAudioVideoRecorder
 * @description
 * # fielddbAudioVideoRecorder
 */
angular.module("fielddbAngularApp").directive("fielddbAudioVideoRecorder", function() {

  return {
    templateUrl: "views/audio-video-recorder.html",
    restrict: "A",
    transclude: false,
    scope: {
      parent: "=parent"
    },
    controller: function($scope) {
      var debugging = true;
      if (debugging) {
        console.log("loading fielddbAudioVideoRecorder", $scope.parent);
      }

      if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application) {
        $scope.application = FieldDB.FieldDBObject.application;
        if (!$scope.importer) {
          $scope.importer = new FieldDB.Import({
            importType: "audioVideo",
            parent: $scope.parent,
            dbname: $scope.parent.pouchname,
            corpus: FieldDB.FieldDBObject.application.corpus
          });
        }
        // $scope.importer = $scope.application.importer;
        if ($scope.locale) {
          /*jshint camelcase: false */
          $scope.locale.locale_Import = "Import audio, video, images";
        }

      }

      var onAudioFail = function(e) {
        $scope.datum.warn("Audio peripheralsCheck failed", e);
        if (!$scope.$$phase) {
          $scope.$digest(); //$digest or $apply
        }
      };
      var onAudioSuccess = function(s) {
        console.log("On audio sucess ", s);
        $scope.audioRecorder.element = $scope.audioRecorder.element || angular.element($scope.element.find("p")[0])[0];
        $scope.audioRecorder.parent = {
          addFile: $scope.addFile
          // dbname: $scope.parent.pouchname
        };

        if (!$scope.$$phase) {
          $scope.$digest(); //$digest or $apply
        }
      };

      $scope.peripheralsCheck = function(type) {
        if (!$scope.audioRecorder && FieldDB) {
          $scope.audioRecorder = new FieldDB.AudioVideoRecorder({});
        }
        if (type === "video") {
          type = true;
          $scope.mutedAudioInstructions = true;
        } else if (type === "picture") {
          type = true;
          $scope.showPictureInstructions = true;
        } else {
          type = false;
          $scope.mutedAudioInstructions = true;
        }
        $scope.audioRecorder.peripheralsCheck(type, {
          image: $scope.element.find("img")[1],
          audio: $scope.element.find("audio")[0],
          video: $scope.element.find("video")[0],
          canvas: $scope.element.find("canvas")[0]
        }).then(onAudioSuccess, onAudioFail);
      };

      /* hack for add file since spreadsheet datum dont have addFile function */
      $scope.addFile = function(newAudioFile) {
        $scope.parent.audioVideo = $scope.parent.audioVideo || [];
        $scope.parent.images = $scope.parent.images || [];
        $scope.parent.relatedData = $scope.parent.relatedData || [];

        if (!newAudioFile.filename) {
          console.warn("Filename not specified.");
          return;
        }
        newAudioFile.dbname = $scope.parent.pouchname;
        var audioVideoImageOrOtherFile = new FieldDB.AudioVideo(newAudioFile).toJSON();
        delete audioVideoImageOrOtherFile.data;

        $scope.importer.corpus = FieldDB.FieldDBObject.application.corpus;
        $scope.importer.uploadFiles(newAudioFile.data);

        // if (audioVideoImageOrOtherFile.type.indexOf("audio") === 0) {
        //   $scope.parent.audioVideo.add(audioVideoImageOrOtherFile);
        // } else if (audioVideoImageOrOtherFile.type.indexOf("video") === 0) {
        //   $scope.parent.audioVideo.add(audioVideoImageOrOtherFile);
        // } else if (audioVideoImageOrOtherFile.type.indexOf("images") === 0) {
        //   $scope.parent.images.push(audioVideoImageOrOtherFile);
        // } else {
        //   $scope.parent.relatedData.push(audioVideoImageOrOtherFile);
        // }

        if (!$scope.$$phase) {
          $scope.$digest(); //$digest or $apply
        }
      };

    },
    link: function postLink(scope, el) {
      console.log("keeping a reference to this element");
      scope.element = el;
      // if (FieldDB && FieldDB.AudioVideoRecorder && FieldDB.AudioVideoRecorder.Recorder) {
      //   FieldDB.AudioVideoRecorder.Recorder.initRecorder();
      // }
    }
  };
});
