/*
 * Hide HTML5 audio controls on Android
 */
if (!OPrime.isAndroidApp()) {
  document.getElementById("vocab_audio_stimuli").setAttribute("controls",
      "controls");
  document.getElementById("vocab_audio_response").setAttribute("controls",
      "controls");
}
/*
 * Handle the play/pause stimuli button
 */
document.getElementById("play_vocab_stimuli_button").onclick = function(e) {
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
document.getElementById("stop_vocab_stimuli_button").onclick = function(e) {
  OPrime.stopAudioFile('vocab_audio_stimuli');
  if (document.getElementById("play_vocab_stimuli_button").classList.toString()
      .indexOf("icon-play") == -1) {
    $(document.getElementById("play_vocab_stimuli_button")).toggleClass(
        "icon-play icon-pause");
  }
};

/*
 * Handle the record/stop response button
 */
document.getElementById("record_vocab_response_button").onclick = function(e) {
  e.stopPropagation();
  var responsefilename = document.getElementById("vocab_audio_stimuli").src
      .replace(".wav", "").replace(/\/.*\//,"").replace("ogg", "").replace(".mp3", "") + "_response_"+Date.now()+".mp3";
  if (document.getElementById("record_vocab_response_button").classList
      .toString().indexOf("icon-stop") == -1) {
    OPrime.captureAudio(responsefilename, /* started */function(audioUrl) {
      OPrime.debug("\nRecording successfully started " + audioUrl);

      // Only change the icons once.
      if (document.getElementById("record_vocab_response_button").classList
          .toString().indexOf("icon-record") > -1) {
        $(document.getElementById("record_vocab_response_button")).toggleClass(
            "icon-record icon-stop");// set class to stop
        $(document.getElementById("record_vocab_response_button")).html("");
      }

    }, /* Recording complete */function(audioUrl) {
      OPrime.debug("Attaching sucessful recording to the result audio div "
          + audioUrl);
      document.getElementById("vocab_audio_response").src = audioUrl;
      document.getElementById("record_vocab_response_button").removeAttribute(
          "disabled", "disabled");
      // Play recorded audio
      OPrime.playAudioFile('vocab_audio_response');
    });
  } else {
    document.getElementById("record_vocab_response_button").setAttribute(
        "disabled", "disabled");
    OPrime.stopAndSaveAudio(responsefilename, /* stopped */function(
        audioUrl) {
      if (document.getElementById("record_vocab_response_button").classList
          .toString().indexOf("icon-stop") > -1) {
        $(document.getElementById("record_vocab_response_button")).toggleClass(
            "icon-stop icon-record");// set class to record
        $(document.getElementById("record_vocab_response_button")).html(
            '<img src="mic_white.png" />');
      }

      OPrime.debug("\nRecording successfully stopped " + audioUrl);
    });
  }
};

/*
 * Handle the play response button
 */
document.getElementById("play_vocab_response_button").onclick = function(e) {
  OPrime.playAudioFile('vocab_audio_response');
};

/*
 * Handle the cue/play syllables
 */
var syllables = document.getElementsByClassName("playable_syllable");
for ( var s in syllables) {
  syllables[s].onclick = function(e) {
    OPrime.playIntervalAudioFile('vocab_audio_stimuli', e.target.min,
        e.target.max);
    window.userHistory[e.target.value] = window.userHistory[e.target.value]
        || [];
    window.userHistory[e.target.value].push(JSON.stringify(new Date()));
    window.saveUser();
  };

}
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