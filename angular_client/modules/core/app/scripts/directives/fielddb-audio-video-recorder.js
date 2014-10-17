/* globals  AudioContext, Recorder, confirm */
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
    controller: function($scope, $rootScope) {
      var debugging = true;
      var Data = {};
      console.log("loading fielddbAudioVideoRecorder", $scope.datum);
      $scope.recordingStatus = "Record";
      $scope.recordingButtonClass = "btn btn-success";
      $scope.recordingIcon = "fa-microphone";
      $scope.showAudioFeatures = false;


      // Audio recording
      var hasGetUserMedia = function() {
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia || navigator.msGetUserMedia);
      };

      if (hasGetUserMedia()) {
        $rootScope.audioCompatible = true;
      } else {
        $rootScope.audioCompatible = false;
      }

      var onAudioFail = function(e) {
        $scope.recordingStatus = "Record";
        $scope.recordingButtonClass = "btn btn-success";
        $scope.recordingIcon = "fa-microphone";
        console.log("Audio Rejected!", e);
        $rootScope.notificationMessage = "Unable to record audio.";
        $rootScope.openNotification();
      };

      var onAudioSuccess = function(s) {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        var context = new AudioContext();
        var mediaStreamSource = context.createMediaStreamSource(s);
        try {
          recorder = new Recorder(mediaStreamSource);
          recorder.record();
        } catch (error) {
          onAudioFail(error);
        }
      };

      window.URL = window.URL || window.webkitURL;
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia;

      var recorder;

      // Functions to open/close audio warning modal
      var openAudioWarning = function() {
        $scope.audioWarningShouldBeOpen = true;
      };

      $scope.closeAudioWarning = function() {
        $scope.audioWarningShouldBeOpen = false;
      };

      var audioRecordingInterval;

      $scope.startRecording = function(datum) {
        if (navigator.getUserMedia) {
          $scope.datumForAudio = datum;
          openAudioWarning();
          $scope.timeLeftForAudio = "5 minutes 0 seconds";
          // Begin countdown
          var minutes = 5;
          var seconds = 0;
          audioRecordingInterval = setInterval(function() {
            if (seconds === 0) {
              if (minutes === 0) {
                clearInterval(audioRecordingInterval);
                $scope.stopRecording(datum);
                $scope.audioWarningShouldBeOpen = false;
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
          $scope.recordingButtonClass = "btn btn-success disabled";
          $scope.recordingStatus = "Recording";
          $scope.recordingIcon = "fa fa-rss";
          navigator.getUserMedia({
            audio: true
          }, onAudioSuccess, onAudioFail);
        } else {
          $scope.recordingStatus = "Record";
          console.log("navigator.getUserMedia not present");
        }
      };

      $scope.stopRecording = function(datum) {
        if (recorder) {
          recorder.stop();
          $scope.closeAudioWarning();
          clearInterval(audioRecordingInterval);
          $scope.recordingStatus = "Record";
          $scope.recordingButtonClass = "btn btn-success";
          $scope.recordingIcon = "fa-microphone";
          if ($scope.processingAudio) {
            return; //avoid double events which were leading to double audio.
          }
          $scope.processingAudio = true;

          recorder.exportWAV(function(s) {
            $scope.uploadFile(datum, s);
          });
        } else {
          $scope.closeAudioWarning();
          $scope.recordingStatus = "Record doesn't appear to be working currently in your browser";
          $scope.recordingButtonClass = "btn";
          $scope.recordingIcon = "fa-microphone-slash";
        }
      };

      $scope.uploadFile = function(datum, file) {
        if (!datum || !datum.id) {
          $rootScope.newRecordHasBeenEdited = true;
        }

        // if($scope.processingAudio){
        //   return; //avoid double events which were leading to double audio.
        // }
        $scope.processingAudio = true;

        var blobToBase64 = function(blob, cb) {
          var reader = new FileReader();
          reader.onload = function() {
            var dataUrl = reader.result;
            var base64 = dataUrl.split(",")[1];
            cb(base64);
          };
          reader.readAsDataURL(blob);
        };

        var base64File;
        var inputBoxPrefix;
        // Test to see if this is a new datum
        if (!datum || !datum.id) {
          inputBoxPrefix = "new_datum";
        } else {
          inputBoxPrefix = datum.id;
        }

        // Create attachments

        var newAttachments = {};

        // // If a new file, set up attachments structure, to be saved later
        if (!datum || !datum.id) {
          if (!datum) {
            datum = {};
          }
          datum._attachments = {};
          datum.audioVideo = [];
        }

        var numberOfFiles;
        if (file) {
          numberOfFiles = 1;
        } else {
          numberOfFiles = document.getElementById(inputBoxPrefix + "_audio-file").files.length;
          // Disable upload button after uploading file(s) once in new datum; cannot reset file input in non-async task
          if (!datum || !datum.id) {
            $scope.newDatumHasAudioToUpload = true;
          }
        }

        // Check to see if user has clicked on upload without recording or uploading files
        if (numberOfFiles === 0 || numberOfFiles === null) {
          // $rootScope.editsHaveBeenMade = false;
          $scope.processingAudio = false;
          $scope.newDatumHasAudioToUpload = false;
          document.getElementById("form_" + inputBoxPrefix + "_audio-file").reset();
          $rootScope.notificationMessage = "Please record or select audio to upload.";
          $rootScope.openNotification();
          return;
        }
        var doSomethingWithAudio = function(index) {
          blobToBase64(file || document.getElementById(inputBoxPrefix + "_audio-file").files[index], function(x) {
            base64File = x;
            var filename;
            var description;
            var contentType;
            if (file) {
              filename = Date.now() + ".wav";
              contentType = "audio\/wav";
              description = "";
            } else {
              // Test to see if this is a new datum
              var fileExt;
              if (!datum || !datum.id) {
                fileExt = document.getElementById("new_datum_audio-file").files[index].type.split("\/").pop();
              } else {
                fileExt = document.getElementById(datum.id + "_audio-file").files[index].type.split("\/").pop();
              }
              if (fileExt !== ("mp3" || "mpeg" || "wav" || "ogg")) {
                $rootScope.notificationMessage = "Upload is turned off for this release."; //You can only upload audio files with extensions '.mp3', '.mpeg', '.wav', or '.ogg'.";
                $rootScope.openNotification();
                return;
              }
              filename = Date.now() + "" + index + "." + fileExt; // appending index in case of super-rapid processing on multi-file upload, to avoid duplicate filenames
              contentType = "audio\/" + fileExt;
              description = document.getElementById(inputBoxPrefix + "_audio-file").files[index].name;
            }

            var newAttachment = {};
            newAttachment = {
              "contentType": contentType,
              "data": base64File
            };
            // if(newAttachments[filename]){
            //   return; //try to avoid double of the same file...
            // }
            newAttachments[filename] = newAttachment;
            newAttachments[filename].description = description;

            // Push attachment to scope if new record, to be saved later
            if (!datum || !datum.id) {
              var newScopeAttachment = {
                "filename": filename,
                "description": newAttachments[filename].description,
                "URL": $rootScope.server + "/" + $rootScope.DB.pouchname + "/" + datum.id + "/" + filename,
                "type": "audio"
              };

              $scope.$apply(function() {
                if (datum._attachments[filename]) {
                  return; //try to avoid double of the same file...
                }
                datum._attachments[filename] = newAttachments[filename];
                if (!Array.isArray(datum.audioVideo)) {
                  console.log("Upgrading audioVideo to a collection", datum.audioVideo);
                  var audioVideoArray = [];
                  if (datum.audioVideo.URL) {
                    var audioVideoURL = datum.audioVideo.URL;
                    var fileFromUrl = audioVideoURL.substring(audioVideoURL.lastIndexOf("/"));
                    audioVideoArray.push({
                      "filename": fileFromUrl,
                      "description": fileFromUrl,
                      "URL": audioVideoURL,
                      "type": "audio"
                    });
                  }
                  datum.audioVideo = audioVideoArray;
                }
                datum.audioVideo.push(newScopeAttachment);
              });
            }
          });
        };
        for (var i = 0; i < numberOfFiles; i++) {
          doSomethingWithAudio(i);
        }

        // Stop here if new datum record (i.e. do not upload yet)
        if (!datum || !datum.id) {

          // Force digest after recording audio
          if (file) {
            $scope.$apply(function() {
              $scope.newFieldDatahasAudio = true;
              $scope.processingAudio = false;
            });
          } else {
            $scope.newFieldDatahasAudio = true;
            $scope.processingAudio = false;
          }
          return;
        }

        // Save new attachments for existing record
        Data.async($rootScope.DB.pouchname, datum.id)
          .then(function(originalDoc) {
            var rev = originalDoc._rev;
            console.log(rev);
            var key;
            if (originalDoc._attachments === undefined) {
              originalDoc._attachments = {};
            }

            for (key in newAttachments) {
              originalDoc._attachments[key] = newAttachments[key];
            }
            // Update scope attachments
            if (!datum.audioVideo) {
              datum.audioVideo = [];
            }
            if (!Array.isArray(datum.audioVideo)) {
              console.log("Upgrading audioVideo to a collection", datum.audioVideo);
              var audioVideoArray = [];
              for (var audioVideoItem in datum.audioVideo) {
                if (datum.audioVideo.hasOwnProperty(audioVideoItem) && datum.audioVideo.audioVideoItem.URL) {
                  var audioVideoURL = datum.audioVideo.audioVideoItem.URL;
                  var fileFromUrl = audioVideoURL.substring(audioVideoURL.lastIndexOf("/"));
                  audioVideoArray.push({
                    "filename": fileFromUrl,
                    "description": fileFromUrl,
                    "URL": audioVideoURL,
                    "type": "audio"
                  });
                }
              }
              datum.audioVideo = audioVideoArray;
            }
            for (key in newAttachments) {
              var newScopeAttachment = {
                "filename": key,
                "description": newAttachments[key].description,
                "URL": $rootScope.server + "/" + $rootScope.DB.pouchname + "/" + datum.id + "/" + key,
                "type": "audio"
              };

              datum.audioVideo.push(newScopeAttachment);

              var indirectObjectString = "in <a href='#corpus/" + $rootScope.DB.pouchname + "'>" + $rootScope.DB.title + "</a>";
              $scope.addActivity([{
                verb: "recorded",
                verbicon: "icon-plus",
                directobjecticon: "icon-list",
                directobject: "<a href='#data/" + datum.id + "/" + newScopeAttachment.filename + "'>the audio file " + newScopeAttachment.description + " (" + newScopeAttachment.filename + ") on " + datum.utterance + "</a> ",
                indirectobject: indirectObjectString,
                teamOrPersonal: "personal"
              }, {
                verb: "recorded",
                verbicon: "icon-plus",
                directobjecticon: "icon-list",
                directobject: "<a href='#data/" + datum.id + "/" + newScopeAttachment.filename + "'>the audio file " + newScopeAttachment.description + " (" + newScopeAttachment.filename + ") on " + datum.utterance + "</a> ",
                indirectobject: indirectObjectString,
                teamOrPersonal: "team"
              }], "uploadnow");
            }
            datum.hasAudio = true;
            originalDoc.audioVideo = datum.audioVideo;
            //Upgrade to v1.90
            if (originalDoc.attachmentInfo) {
              delete originalDoc.attachmentInfo;
            }
            // console.log(originalDoc.audioVideo);
            Data.saveCouchDoc($rootScope.DB.pouchname, originalDoc)
              .then(function(response) {
                console.log("Successfully uploaded attachment.");
                if (debugging) {
                  console.log(response);
                }


                // Reset file input field
                document.getElementById("form_" + inputBoxPrefix + "_audio-file").reset();

                $scope.processingAudio = false;
              });
          });
      };

      $scope.deleteAttachmentFromCorpus = function(datum, filename, description) {
        if ($rootScope.writePermissions === false) {
          $rootScope.notificationMessage = "You do not have permission to delete attachments.";
          $rootScope.openNotification();
          return;
        }
        var r = confirm("Are you sure you want to put the file " + description + " (" + filename + ") in the trash?");
        if (r === true) {
          var record = datum.id + "/" + filename;
          console.log(record);
          Data.async($rootScope.DB.pouchname, datum.id)
            .then(function(originalRecord) {
              // mark as trashed in scope
              var inDatumAudioFiles = false;
              for (var i in datum.audioVideo) {
                if (datum.audioVideo[i].filename === filename) {
                  datum.audioVideo[i].description = datum.audioVideo[i].description + ":::Trashed " + Date.now() + " by " + $rootScope.user.username;
                  datum.audioVideo[i].trashed = "deleted";
                  inDatumAudioFiles = true;
                  // mark as trashed in database record
                  for (var k in originalRecord.audioVideo) {
                    if (originalRecord.audioVideo[k].filename === filename) {
                      originalRecord.audioVideo[k] = datum.audioVideo[i];
                    }
                  }
                }
              }
              if (datum.audioVideo.length === 0) {
                datum.hasAudio = false;
              }
              originalRecord.audioVideo = datum.audioVideo;
              //Upgrade to v1.90
              if (originalRecord.attachmentInfo) {
                delete originalRecord.attachmentInfo;
              }
              // console.log(originalRecord);
              Data.saveCouchDoc($rootScope.DB.pouchname, originalRecord)
                .then(function(response) {
                  console.log("Saved attachment as trashed.");
                  if (debugging) {
                    console.log(response);
                  }
                  var indirectObjectString = "in <a href='#corpus/" + $rootScope.DB.pouchname + "'>" + $rootScope.DB.title + "</a>";
                  $scope.addActivity([{
                    verb: "deleted",
                    verbicon: "icon-trash",
                    directobjecticon: "icon-list",
                    directobject: "<a href='#data/" + datum.id + "/" + filename + "'>the audio file " + description + " (" + filename + ") on " + datum.utterance + "</a> ",
                    indirectobject: indirectObjectString,
                    teamOrPersonal: "personal"
                  }, {
                    verb: "deleted",
                    verbicon: "icon-trash",
                    directobjecticon: "icon-list",
                    directobject: "<a href='#data/" + datum.id + "/" + filename + "'>an audio file on " + datum.utterance + "</a> ",
                    indirectobject: indirectObjectString,
                    teamOrPersonal: "team"
                  }], "uploadnow");

                  // Dont actually let users delete data...
                  // Data.async($rootScope.DB.pouchname, datum.id)
                  // .then(function(record) {
                  //   // Delete attachment info for deleted record
                  //   for (var key in record.attachmentInfo) {
                  //     if (key === filename) {
                  //       delete record.attachmentInfo[key];
                  //     }
                  //   }
                  //   Data.saveCouchDoc($rootScope.DB.pouchname, datum.id, record, record._rev)
                  // .then(function(response) {
                  //     if (datum.audioVideo.length === 0) {
                  //       datum.hasAudio = false;
                  //     }
                  //     console.log("File successfully deleted.");
                  //   });
                  // });
                });
            });
        }
      };



    },
    link: function postLink() {}
  };
});
