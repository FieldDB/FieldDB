var Q = require("q");
var CORS = CORS || {};

CORS.bug = function(message) {
  console.log(message);
};
CORS.setXMLHttpRequestLocal = function(xmlhttp) {
  CORS.XMLHttpRequestLocal = xmlhttp;
};
CORS.getXMLHttpRequestLocal = function() {
  if (!CORS.XMLHttpRequestLocal) {
    return new window.XMLHttpRequest();
  } else {
    return new CORS.XMLHttpRequestLocal();
  }
};
CORS.makeCORSRequest = function(options) {
  var deffered = Q.defer();

  if (!options.method) {
    options.method = options.type || "GET";
  }
  if (!options.url) {
    CORS.bug("There was an error. Please report this.");
  }
  if (!options.data) {
    options.data = "";
  }
  options.dataToSend = JSON.stringify(options.data).replace(/,/g, "&").replace(/:/g, "=").replace(/"/g, "").replace(/[}{]/g, "");

  if (options.method === "GET" && options.data) {
    options.url = options.url + "?" + options.dataToSend;
  }
  /*
   * Helper function which handles IE
   */
  var createCORSRequest = function(method, url) {
    var xhr = CORS.getXMLHttpRequestLocal();
    if ("withCredentials" in xhr) {
      // XHR for Chrome/Firefox/Opera/Safari.
      xhr.open(method, url, true);
    } else if (typeof XDomainRequest !== "undefined") {
      // XDomainRequest for IE.
      xhr = new XDomainRequest();
      xhr.open(method, url);
    } else {
      // CORS not supported.
      xhr = null;
    }
    return xhr;
  };

  var xhr = createCORSRequest(options.method, options.url);
  if (!xhr) {
    CORS.bug('CORS not supported, your browser is unable to contact the database.');
    deffered.reject('CORS not supported, your browser is unable to contact the database.');
    return;
  }

  //  if(options.method === "POST"){
  //xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.withCredentials = true;
  //  }

  xhr.onload = function(e, f, g) {
    console.log("Server response, ",xhr);
    var response = xhr.response;
    try{
      response = JSON.parse(xhr.response);
    }catch(e){
      console.log("Server already sent json");
    }
    if (xhr.status >= 400) {
      console.log("The request was unsuccesful "+ xhr.statusText);
      deffered.reject(response);
    } else {
      deffered.resolve(response);
    }
  };

  xhr.onerror = function(e, f, g) {
    console.log(e, f, g);
    CORS.bug('There was an error making the CORS request to ' + options.url + " from " + window.location.href + " the app will not function normally. Please report this.");
    deffered.reject(e);
  };
  if (options.method === "POST") {
    xhr.send(JSON.stringify(options.data));
  } else {
    xhr.send();
  }
  return deffered.promise;
};

if (exports) {
  exports.CORS = CORS;
}
