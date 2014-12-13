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
            parent: $scope.parent
            // corpus: this.corpus
          });
        }
        // $scope.importer = $scope.application.importer;
        if ($scope.locale) {
          /*jshint camelcase: false */
          $scope.locale.locale_Import = "Import audio, video, images";
        }

      }

      $scope.recordability = {
        canRecordVideo: true,
        canRecordAudio: true,
        cantRecordVideo: false,
        cantRecordAudio: false,
        isRecordingAudio: false,
        isRecordingVideo: false,
        isPausedAudio: false,
        isPausedVideo: false,
        isProcessing: false
      };
      $scope.canRecord = true;
      $scope.description = "Recorded using online app";

      var onAudioFail = function(e) {
        $scope.recordability = {
          canRecordVideo: false,
          canRecordAudio: false,
          cantRecordVideo: true,
          cantRecordAudio: true,
          isRecordingAudio: false,
          isRecordingVideo: false,
          isPausedAudio: false,
          isPausedVideo: false,
          isProcessing: false
        };

        console.log("Audio Rejected!", e);
        $scope.errorMessage = "Unable to record audio.";
        if (!$scope.$$phase) {
          $scope.$digest(); //$digest or $apply
        }
      };
      var audioRecordingInterval;

      var monitorAudioLength = function() {
        $scope.timeLeftForAudio = "5 minutes 0 seconds";
        // Begin countdown
        var minutes = 5;
        var seconds = 0;
        audioRecordingInterval = setInterval(function() {
          if (seconds === 0) {
            if (minutes === 0) {
              clearInterval(audioRecordingInterval);
              $scope.stopRecording();
              return;
            } else {
              minutes--;
              seconds = 59;
            }
          }
          var minuteText;
          if (minutes > 0) {
            minuteText = minutes + (minutes > 1 ? " minutes" : " minute");
          } else {
            minuteText = "";
          }
          var secondText = seconds + (seconds > 1 ? " seconds" : " second");
          seconds--;
          $scope.$apply(function() {
            $scope.timeLeftForAudio = minuteText + " " + secondText;
          });
        }, 1000);
      };

      var onAudioSuccess = function(s) {
        console.log("On audio sucess ", s);
        monitorAudioLength();
        $scope.recordability = {
          canRecordVideo: true,
          canRecordAudio: true,
          cantRecordVideo: false,
          cantRecordAudio: false,
          isRecordingAudio: $scope.audioRecorder.type === "audio",
          isRecordingVideo: $scope.audioRecorder.type === "video",
          isPausedAudio: false,
          isPausedVideo: false,
          isProcessing: false
        };
        if (!$scope.$$phase) {
          $scope.$digest(); //$digest or $apply
        }
      };

      $scope.startRecording = function(type) {
        if (!$scope.audioRecorder && FieldDB) {
          $scope.audioRecorder = new FieldDB.AudioVideoRecorder();
        }
        if (type === "video") {
          type = true;
        } else {
          type = false;
        }
        $scope.audioRecorder.periphialsCheck(type, {
          image: $scope.element.find("img")[1],
          video: $scope.element.find("video")[0],
          canvas: $scope.element.find("canvas")[0]
        }).then(onAudioSuccess, onAudioFail);
      };

      $scope.stopRecording = function() {
        $scope.recordability = {
          canRecordVideo: true,
          canRecordAudio: true,
          cantRecordVideo: true,
          cantRecordAudio: true,
          isRecordingAudio: false,
          isRecordingVideo: false,
          isPausedAudio: false,
          isPausedVideo: false,
          isProcessing: true
        };

        $scope.audioRecorder.stop().then(function() {
          $scope.recordability = {
            canRecordVideo: true,
            canRecordAudio: true,
            cantRecordVideo: false,
            cantRecordAudio: false,
            isRecordingAudio: false,
            isRecordingVideo: false,
            isPausedAudio: false,
            isPausedVideo: false,
            isProcessing: false
          };

          $scope.audioRecorder.exportRecording("mp3")
            .then(function(s) {
              $scope.uploadFile(s);
            }, function(error) {
              console.warn("export audio failed", error);
              if (!$scope.$$phase) {
                $scope.$digest(); //$digest or $apply
              }
            });

        }, function() {
          $scope.status = "Record doesn't appear to be working currently in your browser";
          $scope.recordability = {
            canRecordVideo: true,
            canRecordAudio: true,
            cantRecordVideo: false,
            cantRecordAudio: false,
            isRecordingAudio: false,
            isRecordingVideo: false,
            isPausedAudio: false,
            isPausedVideo: false,
            isProcessing: false
          };
          if (!$scope.$$phase) {
            $scope.$digest(); //$digest or $apply
          }
        });
        clearInterval(audioRecordingInterval);
      };

      $scope.toogleRecording = function(type) {
        if ($scope.isRecording) {
          $scope.stopRecording(type);
        } else {
          $scope.startRecording(type);
        }
      };

      $scope.uploadFile = function() {
        $scope.recordability = {
          canRecordVideo: true,
          canRecordAudio: true,
          cantRecordVideo: true,
          cantRecordAudio: true,
          isRecordingAudio: false,
          isRecordingVideo: false,
          isPausedAudio: false,
          isPausedVideo: false,
          isProcessing: true
        };

        $scope.audioRecorder.uploadFile(function(resultingFile) {
          $scope.recordability = {
            canRecordVideo: true,
            canRecordAudio: true,
            cantRecordVideo: false,
            cantRecordAudio: false,
            isRecordingAudio: false,
            isRecordingVideo: false,
            isPausedAudio: false,
            isPausedVideo: false,
            isProcessing: false
          };
          // document.getElementById("form_" + inputBoxPrefix + "_audio-file").reset();
          $scope.parent.audioVideo = $scope.parent.audioVideo || [];
          var newAudioFile = {
            "filename": resultingFile.filename,
            "description": $scope.description,
            "URL": resultingFile.filename,
            "type": "audio"
          };
          $scope.parent.audioVideo.push(newAudioFile);
          if (!$scope.$$phase) {
            $scope.$digest(); //$digest or $apply
          }

        }, function(error) {
          $scope.recordability = {
            canRecordVideo: true,
            canRecordAudio: true,
            cantRecordVideo: false,
            cantRecordAudio: false,
            isRecordingAudio: false,
            isRecordingVideo: false,
            isPausedAudio: false,
            isPausedVideo: false,
            isProcessing: false
          };
          console.log("error uploading file ", error);
          if (!$scope.$$phase) {
            $scope.$digest(); //$digest or $apply
          }
        });
      };
    },
    link: function postLink(scope, el) {
      console.log("keeping a reference to this element");
      scope.element = el;
    }
  };
});
