/* globals window, XDomainRequest, XMLHttpRequest */

var Q = require("q");

var CORS = {
  fieldDBtype: "CORS",
  debugMode: false,
  debug: function(a, b, c) {
    if (this.debugMode) {
      console.log(a, b, c);
    }
  },
  warn: function(message) {
    console.warn("CORS-WARN: " + message);
    // throw message;
  },
  bug: function(message) {
    console.warn("CORS-BUG: " + message);
  },
  render: function() {
    this.debug("Render requested but this object has no render defined.");
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
    this.warn("XMLHttpRequest is not defined, nothign will happen.", e);
    xhrCors = {};
  }
  if ("withCredentials" in xhrCors) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhrCors.open(method, url, true);
    // https://mathiasbynens.be/notes/xhr-responsetype-json
    // xhrCors.responseType = "json";
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

  // this.debugMode = true;
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
  if (options.withCredentials !== false) {
    xhr.withCredentials = true;
  }
  //  }

  xhr.onload = function(e, f, g) {
    var response = xhr.responseJSON || xhr.responseText || xhr.response;
    self.debug("Response from CORS request to " + options.url + ": " + response);
    if (xhr.status >= 400) {
      self.warn("The request was unsuccesful " + xhr.statusText);
      deferred.reject(response);
      return;
    }
    if (response) {
      try {
        response = JSON.parse(response);
      } catch (e) {
        self.debug("Response was already json.", e);
      }
      deferred.resolve(response);
    } else {
      self.bug("There was no content in the server's response text. Please report this.");
      self.warn(e, f, g);
      deferred.reject(e);
    }
    // self.debugMode = false;
  };

  xhr.onerror = function(e, f, g) {
    self.debug(e, f, g);
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
