/*
 * Hide HTML5 audio controls on Android
 */
if (!OPrime.isAndroidApp()) {
  document.getElementById("audio_stimuli_file").setAttribute("controls",
      "controls");
}
/*
 * Handle the play/pause stimuli button
 */
document.getElementById("play_stimulus_button").onclick = function(e) {
  if ($(e.target)[0].classList.toString().indexOf("icon-pause") == -1) {
    OPrime.playAudioFile('audio_stimuli_file', function() {
      // oncomplete change the text of the button to play
      $($(e.target)[0]).toggleClass("icon-pause icon-play");
    });
    $($(e.target)[0]).toggleClass("icon-play icon-pause");
  } else {
    OPrime.pauseAudioFile('audio_stimuli_file');
    $($(e.target)[0]).toggleClass("icon-pause icon-play");
  }
};

/*
 * Handle the stop stimuli button
 */
document.getElementById("stop_stimulus_button").onclick = function(e) {
  OPrime.stopAudioFile('audio_stimuli_file');
  if (document.getElementById("play_stimulus_button").classList.toString()
      .indexOf("icon-play") == -1) {
    $(document.getElementById("play_stimulus_button")).toggleClass(
        "icon-play icon-pause");
  }
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
OPrime.hub
    .subscribe(
        "playbackCompleted",
        function(filename) {
          window.userHistory[filename] = window.userHistory[filename]
              || [];
          window.userHistory[filename].push(JSON
              .stringify(new Date()));
          window.saveUser();
        }, userHistory);

window.saveUser = function() {
  localStorage.setItem("userHistory", JSON.stringify(window.userHistory));
  if (OPrime.debugMode) OPrime.debug(JSON.stringify(window.userHistory));
};

// Android WebView is not calling the onbeforeunload to save the userHistory.
window.onbeforeunload = window.saveUser;