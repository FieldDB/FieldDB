chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    'width': 900,
    'height': 900
  });
});