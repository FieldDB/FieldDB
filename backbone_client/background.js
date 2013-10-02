chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('corpus.html', {
    'width': 900,
    'height': 900
  });
});