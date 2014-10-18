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
      datum: "=json"
    },
    controller: function($scope) {
      var debugging = true;
      if (debugging) {
        console.log("loading fielddbAudioVideoRecorder", $scope.datum);
      }
      $scope.status = "Record";
      $scope.recordingButtonClass = "btn btn-success";
      $scope.recordingIcon = "fa-microphone";
      $scope.showAudioFeatures = false;
      $scope.description = "Recorded using online app";

      var onAudioFail = function(e) {
        $scope.status = "Record";
        $scope.recordingButtonClass = "btn btn-success";
        $scope.recordingIcon = "fa-microphone";
        console.log("Audio Rejected!", e);
        $scope.errorMessage = "Unable to record audio.";
        $scope.openNotification();
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
        $scope.recordingButtonClass = "btn btn-success disabled";
        $scope.status = "Recording";
        $scope.recordingIcon = "fa fa-rss";
      };

      $scope.startRecording = function() {
        if (!$scope.audioRecorder && FieldDB) {
          $scope.audioRecorder = new FieldDB.AudioVideoRecorder();
        }
        $scope.audioRecorder.periphialsCheck(true, {
          image: angular.element("img")[0],
          video: angular.element("video")[0],
          canvas: angular.element("canvas")[0]
        }).then(onAudioSuccess, onAudioFail);
      };

      $scope.stopRecording = function() {
        $scope.audioRecorder.stop().then(function() {
          $scope.status = "Record";
          $scope.recordingButtonClass = "btn btn-success";
          $scope.recordingIcon = "fa-microphone";
          if ($scope.processingAudio) {
            return; //avoid double events which were leading to double audio.
          }
          $scope.processingAudio = true;

          $scope.audioRecorder.exportRecording("mp3")
            .then(function(s) {
              $scope.uploadFile(s);
            }, function(error) {
              console.warn("export audio failed", error);
            });
        }, function() {
          $scope.status = "Record doesn't appear to be working currently in your browser";
          $scope.recordingButtonClass = "btn";
          $scope.recordingIcon = "fa-microphone-slash";
        });
        clearInterval(audioRecordingInterval);
      };

      $scope.uploadFile = function() {
        $scope.processingAudio = true;

        $scope.audioRecorder.uploadFile(function(resultingFile) {
          $scope.processingAudio = false;
          // document.getElementById("form_" + inputBoxPrefix + "_audio-file").reset();
          $scope.datum.audioVideo = $scope.datum.audioVideo || [];
          var newAudioFile = {
            "filename": resultingFile.filename,
            "description": $scope.description,
            "URL": resultingFile.filename,
            "type": "audio"
          };
          $scope.datum.audioVideo.push(newAudioFile);
        }, function(error) {
          $scope.processingAudio = false;
          console.log("error uploading file ", error);
        });
      };
    },
    link: function postLink() {}
  };
});
