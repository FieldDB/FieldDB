/* globals window, XDomainRequest, XMLHttpRequest */

var Q = require("q");

var CORS = {
  debugMode: true,
  debug: function(a, b, c) {
    if (this.debugMode) {
      console.log(a, b, c);
    }
  },
  bug: function(message) {
    console.warn(message);
    // throw message;
  }
};

/*
 * Helper function which handles IE
 */
CORS.supportCORSandIE = function(method, url) {
  var xhrCors;
  try {
    xhrCors = new XMLHttpRequest();
  } catch (e) {
    console.warn("XMLHttpRequest is not defined, nothign will happen.", e);
    xhrCors = {};
  }
  if ("withCredentials" in xhrCors) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhrCors.open(method, url, true);
  } else if (typeof XDomainRequest !== "undefined") {
    // XDomainRequest for IE.
    xhrCors = new XDomainRequest();
    xhrCors.open(method, url);
  } else {
    // CORS not supported.
    xhrCors = null;
  }
  return xhrCors;
};

/*
 * Functions for well formed CORS requests
 */
CORS.makeCORSRequest = function(options) {
  var self = this,
    deferred = Q.defer(),
    xhr;

  this.debugMode = true;
  if (!options.method) {
    options.method = options.type || "GET";
  }
  if (!options.url) {
    this.bug("There was an error. Please report this.");
  }
  if (!options.data) {
    options.data = "";
  }
  if (options.method === "GET" && options.data) {
    options.dataToSend = JSON.stringify(options.data).replace(/,/g, "&").replace(/:/g, "=").replace(/"/g, "").replace(/[}{]/g, "");
    options.url = options.url + "?" + options.dataToSend;
  }

  xhr = this.supportCORSandIE(options.method, options.url);
  if (!xhr) {
    this.bug("CORS not supported, your browser is unable to contact the database.");
    Q.nextTick(function() {
      deferred.reject("CORS not supported, your browser is unable to contact the database.");
    });
    return deferred.promise;
  }

  //  if(options.method === "POST"){
  //xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.withCredentials = true;
  //  }

  xhr.onload = function(e, f, g) {
    var response = xhr.response || xhr.responseText;
    if (self.debugMode) {
      self.debug("Response from CORS request to " + options.url + ": " + response);
    }
    if (response) {
      try {
        response = JSON.parse(response);
      } catch (e) {
        console.log("Response was not json.");
      }
      deferred.resolve(response);
    } else {
      self.bug("There was no content in the server's response text. Please report this.");
      console.log(e, f, g);
      // deferred.reject(e);
    }
    if (xhr.status >= 400) {
      console.log("The request was unsuccesful " + xhr.statusText);
      deferred.reject(response);
    } else {
      deferred.resolve(response);
    }

    self.debugMode = false;
  };

  xhr.onerror = function(e, f, g) {
    if (self.debugMode) {
      self.debug(e, f, g);
    }
    self.bug("There was an error making the CORS request to " + options.url + " from " + window.location.href + " the app will not function normally. Please report this.");
    deferred.reject(e);
  };
  if (options.data) {
    xhr.send(JSON.stringify(options.data));
  } else {
    xhr.send();
  }

  return deferred.promise;
};

exports.CORS = CORS;
