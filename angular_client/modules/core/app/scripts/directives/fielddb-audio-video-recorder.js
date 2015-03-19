/* globals FieldDB */
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
            corpus: FieldDB.FieldDBObject.application.corpus,
            dontShowSecondStep: true
          });
        }
        // $scope.importer = $scope.application.importer;
        if ($scope.locale) {
          /*jshint camelcase: false */
          $scope.locale.locale_Import = "Import audio, video, images";
        }

      }

      var onAudioFail = function(e) {
        if (e === "Already running") {
          return;
        }
        $scope.datum.warn("Audio peripheralsCheck failed", e);
        try {
          if (!$scope.$$phase) {
            $scope.$digest(); //$digest or $apply
          }
        } catch (e) {
          console.warn("Rendering generated an erorr", e);
        }
      };
      var onAudioSuccess = function(s) {
        console.log("On audio sucess ", s);
        $scope.audioRecorder.element = $scope.audioRecorder.element || angular.element($scope.element.find("p")[0])[0];
        $scope.audioRecorder.parent = {
          addFile: $scope.addFile
          // dbname: $scope.parent.pouchname
        };

        try {
          if (!$scope.$$phase) {
            $scope.$digest(); //$digest or $apply
          }
        } catch (e) {
          console.warn("Rendering generated an erorr", e);
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
        $scope.parent.markAsNeedsToBeSaved();
        if (!newAudioFile.filename) {
          console.warn("Filename not specified.");
          return;
        }
        newAudioFile.dbname = $scope.parent.pouchname;
        if (FieldDB && FieldDB.AudioVideo) {
          var audioVideoImageOrOtherFile = new FieldDB.AudioVideo(newAudioFile).toJSON();
          delete audioVideoImageOrOtherFile.data;
        }
        if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application && FieldDB.FieldDBObject.application.corpus) {
          $scope.importer.corpus = FieldDB.FieldDBObject.application.corpus;
          $scope.importer.uploadFiles(newAudioFile.data).then(function() {
            $scope.parent.render();
          }, function(error) {
            console.log(error);
            $scope.parent.render();
          });
        }

        // if (audioVideoImageOrOtherFile.type.indexOf("audio") === 0) {
        //   $scope.parent.audioVideo.add(audioVideoImageOrOtherFile);
        // } else if (audioVideoImageOrOtherFile.type.indexOf("video") === 0) {
        //   $scope.parent.audioVideo.add(audioVideoImageOrOtherFile);
        // } else if (audioVideoImageOrOtherFile.type.indexOf("images") === 0) {
        //   $scope.parent.images.push(audioVideoImageOrOtherFile);
        // } else {
        //   $scope.parent.relatedData.push(audioVideoImageOrOtherFile);
        // }

        // i
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
