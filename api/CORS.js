var Q = require("q");
var CORS = CORS || {};

CORS.bug = function(message) {
  console.log(message);
};

CORS.makeCORSRequest = function(options) {
  var deferred = Q.defer();

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
    var xhr = new window.XMLHttpRequest();
    if ("withCredentials" in xhr) {
      // XHR for Chrome/Firefox/Opera/Safari.
      xhr.open(method, url, true);
    } else if (typeof XDomainRequest !== "undefined") {
      // XDomainRequest for IE.
      xhr = new XDomainRequest();
      xhr.open(method, url);
    } else {
      // console.log(xhr);
      // CORS not supported.
      xhr = null;
    }
    return xhr;
  };

  var xhr = createCORSRequest(options.method, options.url);
  if (!xhr) {
    CORS.bug('CORS not supported, your browser is unable to contact the database.');
    deferred.reject('CORS not supported, your browser is unable to contact the database.');
    return deferred.promise;
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
      deferred.reject(response);
    } else {
      deferred.resolve(response);
    }
  };

  xhr.onerror = function(e, f, g) {
    console.log(e, f, g);
    CORS.bug('There was an error making the CORS request to ' + options.url + " from " + window.location.href + " the app will not function normally. Please report this.");
    deferred.reject(e);
  };
  if (options.data) {
    xhr.send(JSON.stringify(options.data));
  } else {
    xhr.send();
  }
  return deferred.promise;
};

if (exports) {
  exports.CORS = CORS;
}
