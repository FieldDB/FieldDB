/*
 * Hide HTML5 audio controls on Android
 */
if (!OPrime.isAndroidApp()) {
  document.getElementById("vocab_audio_stimuli").setAttribute("controls",
      "controls");
}
/*
 * Handle the play/pause stimuli button
 */
document.getElementById("play_stimulus_button").onclick = function(e) {
  if ($(e.target)[0].classList.toString().indexOf("icon-pause") == -1) {
    OPrime.playAudioFile('vocab_audio_stimuli', function() {
      // oncomplete change the text of the button to play
      $($(e.target)[0]).toggleClass("icon-pause icon-play");
    });
    $($(e.target)[0]).toggleClass("icon-play icon-pause");
  } else {
    OPrime.pauseAudioFile('vocab_audio_stimuli');
    $($(e.target)[0]).toggleClass("icon-pause icon-play");
  }
};

/*
 * Handle the stop stimuli button
 */
document.getElementById("stop_stimulus_button").onclick = function(e) {
  OPrime.stopAudioFile('vocab_audio_stimuli');
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
  OPrime.debug("Welcome back userid " + userHistory.id);
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
  OPrime.debug(JSON.stringify(window.userHistory));
};

// Android WebView is not calling the onbeforeunload to save the userHistory.
window.onbeforeunload = window.saveUser;