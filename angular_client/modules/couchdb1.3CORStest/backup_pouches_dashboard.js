
// Create the XHR object.
function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // XDomainRequest for IE.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
}

// Make the actual CORS request.
function makeCorsRequest(uri) {
  console.log("got uri: " + uri);
  var xhr = createCORSRequest('GET', uri);
  if (!xhr) {
    alert('CORS not supported');
    return;
  }

  // Response handlers.
  xhr.onload = function() {
    console.log('Response from CORS request to ' + uri + ': '
        + xhr.responseText);
  };

  xhr.onerror = function() {
    console.log('Woops, there was an error making the request to ' + uri + '.');
  };

  xhr.send();
}

$(document).ready(function() {
  makeCorsRequest('https://corpusdev.lingsync.org/_session');
  
  /* Get a session token for the database */
  var corpusloginparams = {
    name : "lingllama",
    password : "phoneme"
  };
  
  OPrime.makeCORSRequest({
    type : 'POST',
    url : "https://corpusdev.lingsync.org/_session",
    data : corpusloginparams,
    success : function(serverResults) {
      console.log("success",serverResults);
      
      
      OPrime.makeCORSRequest({
        type : 'POST',
        url : "https://corpusdev.lingsync.org/lingllama-activity_feed",
        data : {_id: "testdoc" + Date.now(), "stuff": "here is some stuff uploaded from CORS."},
        success : function(serverResults) {
          console.log("success",serverResults);
          
          
          
        },
        error : function(serverResults) {
          alert("There was a problem uploading a doc for you.");
        }
      });
      
      
    },
    error : function(serverResults) {
      alert("There was a problem contacting the server to automatically back up your databases so you can use version 1.38 and greater. Please contact us at opensource@lingsync.org, someone will help you back up your data manually.");
    }
  });
  
});
