

document.getElementById("save_new_exercise").onclick = function(e) {
  window.userHistory.userCreatedExercises = window.userHistory.userCreatedExercises
      || [];
  var newexercise = {};
  newexercise.userid = window.userHistory.id;
  newexercise.dateCreated = JSON.stringify(new Date());
  newexercise.audio_stimuli = document.getElementById("audio_response_file").src;
  newexercise.image_stimuli = document.getElementById("image_stimuli_file").src;
  newexercise.stimuli_transcription = document
      .getElementById("audio_stimuli_transcription").value;
  newexercise.stimuli_translation = document
      .getElementById("audio_stimuli_translation").value;
  if (OPrime.debugMode) OPrime.debug(JSON.stringify(newexercise));
  window.userHistory.userCreatedExercises.push(newexercise);
  alert("I saved your lesson to localstorage as JSON (normally I would put it in a database, but this is just a clickable prototype): "
      + JSON.stringify(newexercise));
};

document.getElementById("capture_image_stimuli_button").onclick = function(e) {
  e.stopPropagation();
  var responsefilename = document.getElementById("audio_stimuli_transcription").value
      .replace(/\W/g, "_")
      + "_stimuli_" + Date.now() + ".png";
  OPrime.capturePhoto(responsefilename, /* started */null, /* completed */
      function(imageUrl) {
        if (OPrime.debugMode) OPrime.debug("\nPicture capture successfully completed " + imageUrl);
        document.getElementById("image_stimuli_file").src = imageUrl;
      });
};


/*
 * Hide HTML5 audio controls on Android
 */
if (!OPrime.isAndroidApp()) {

  document.getElementById("audio_response_file").setAttribute("controls",
      "controls");
}

/*
 * Handle the record/stop response button
 */
document.getElementById("record_vocab_response_button").onclick = function(e) {
  e.stopPropagation();
  var responsefilename = document.getElementById("audio_stimuli_transcription").value
      .replace(/\W/g, "_")
      + "_stimuli_" + Date.now() + ".mp3";
  if (document.getElementById("record_vocab_response_button").classList
      .toString().indexOf("icon-stop") == -1) {
    OPrime.captureAudio(responsefilename, /* started */function(audioUrl) {
      if (OPrime.debugMode) OPrime.debug("\nRecording successfully started " + audioUrl);

      // Only change the icons once.
      if (document.getElementById("record_vocab_response_button").classList
          .toString().indexOf("icon-record") > -1) {
        $(document.getElementById("record_vocab_response_button")).toggleClass(
            "icon-record icon-stop");// set class to stop
        $(document.getElementById("record_vocab_response_button")).html("");
      }

    }, /* Recording complete */function(audioUrl) {
      if (OPrime.debugMode) OPrime.debug("Attaching sucessful recording to the result audio div "
          + audioUrl);
      document.getElementById("audio_response_file").src = audioUrl;
      document.getElementById("record_vocab_response_button").removeAttribute(
          "disabled", "disabled");
      // Play recorded audio
      OPrime.playAudioFile('audio_response_file');
    });
  } else {
    document.getElementById("record_vocab_response_button").setAttribute(
        "disabled", "disabled");
    OPrime.stopAndSaveAudio(responsefilename, /* stopped */function(audioUrl) {
      if (document.getElementById("record_vocab_response_button").classList
          .toString().indexOf("icon-stop") > -1) {
        $(document.getElementById("record_vocab_response_button")).toggleClass(
            "icon-stop icon-record");// set class to record
        $(document.getElementById("record_vocab_response_button")).html(
            '<img src="mic_white.png" />');
      }

      if (OPrime.debugMode) OPrime.debug("\nRecording successfully stopped " + audioUrl);
    });
  }
};

/*
 * Handle the play response button
 */
document.getElementById("play_response_button").onclick = function(e) {
  OPrime.playAudioFile('audio_response_file');
};

/*
 * Capturing user's play back of audio, and saving it and restoring it from
 * localstorage
 */
var userHistory = localStorage.getItem("userHistory");
if (userHistory) {
  userHistory = JSON.parse(userHistory);
  if (OPrime.debugMode) OPrime.debug("Welcome back userid " + userHistory.id);
} else {
  userHistory = {};
  userHistory.id = Date.now();
}
OPrime.hub.subscribe("playbackCompleted", function(filename) {
  window.userHistory[filename] = window.userHistory[filename] || [];
  window.userHistory[filename].push(JSON.stringify(new Date()));
  window.saveUser();
}, userHistory);

window.saveUser = function() {
  localStorage.setItem("userHistory", JSON.stringify(window.userHistory));
  if (OPrime.debugMode) OPrime.debug(JSON.stringify(window.userHistory));
};

// Android WebView is not calling the onbeforeunload to save the userHistory.
window.onbeforeunload = window.saveUser;