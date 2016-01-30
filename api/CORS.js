/* globals window, XDomainRequest, XMLHttpRequest, FormData, FieldDB, document */
"use strict";
var Q;

try {
  Q = document.Q || FieldDB.Q;
} catch (exception) {
  if (!Q) {
    Q = require("Q");
  }
}

var CORS = {
  OFFLINE: {
    CODE: 600,
    MESSAGE: "Unable to contact URL, you appear to be offline."
  },
  CLIENT_TIMEOUT: {
    CODE: 500,
    MESSAGE: "The request to URL timed out, please try again."
  },
  CONNECTION_ABORTED: {
    CODE: 500,
    MESSAGE: "The request to URL was aborted by the server, please report this."
  },
  CONNECTION_ERRORED: {
    CODE: 500,
    MESSAGE: "Server is not responding for URL, please report this."
  },
  INTERNAL_SERVER_ERROR: {
    CODE: 500
  },
  CLIENT_ERROR: {
    CODE: 400
  },
  fieldDBtype: "CORS",
  timeout: 30 * 1000,
  debugMode: false,
  debug: function(a, b, c) {
    if (this.debugMode) {
      console.log(a, b, c);
    }
  },
  warn: function(message) {
    if (this.warnMessage && this.warnMessage.indexOf("message") > -1) {
      return;
    } else {
      this.warnMessage = this.warnMessage + message;
    }
    console.warn("CORS-WARN: " + message);
    // throw message;
  },
  bug: function(message) {
    console.warn("CORS-BUG: " + message);
  },
  render: function() {
    this.debug("Render requested but this object has no render defined.");
  },
  preprocess: function(options) {
    this.debug("preprocess", options);
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
  },
  handleResponse: function(options, deferred) {
    var err,
      status,
      attr;

    // this.debug("handleResponse", options);

    var response = options.xhr.responseJSON || options.xhr.responseText || options.xhr.response;
    // this.debug("Response from CORS request to " + options.url + ": " + response);

    try {
      response = JSON.parse(response);
    } catch (e) {}
    if (!response) {
      response = {};
    }
    if (response.reason) {
      response.message = response.reason;
      delete response.reason;
    }
    status = response.status || options.xhr.status;

    if (status < 400) {
      deferred.resolve(response);
      return;
    }

    if (typeof response !== "object") {
      response = {
        message: response
      };
    }

    err = new Error(response.userFriendlyErrors ? response.userFriendlyErrors[0] : response.message);
    for (attr in response) {
      if (response.hasOwnProperty(attr)) {
        err[attr] = response[attr];
      }
    }
    err.status = status;

    delete options.xhr;
    this.handleError(options, err, deferred);
  },
  handleError: function(options, err, deferred) {
    var response;

    // this.warn("The request to " + options.url + " was unsuccesful ");
    this.debug(err.stack);

    response = {
      userFriendlyErrors: err.userFriendlyErrors || [err.message || "There was an error contacting URL from " + window.location.href + " the app will not function normally. Please report this."],
      status: err.status || 610,
      error: err
    };

    if (response.userFriendlyErrors[0] === "missing") {
      response.userFriendlyErrors = ["The server replied that " + options.url + " is missing, please report this."];
    } else if (response.userFriendlyErrors[0] === "no_db_file") {
      response.userFriendlyErrors = ["That database doesn't exist. Are you sure this is the database you wanted to open: " + options.url];
    }

    if (response.status === 401) {
      if (CORS.application && CORS.application.authentication && CORS.application.authentication.dispatchEvent) {
        CORS.application.authentication.dispatchEvent("unauthorized");
      }
    }

    try {
      if (window && window.navigator && !window.navigator.onLine) {
        response.userFriendlyErrors = [CORS.OFFLINE.MESSAGE];
        response.status = CORS.OFFLINE.CODE;
      } else if (err && err.srcElement && err.srcElement.status !== undefined) {
        response.status = err.srcElement.status;
      }
    } catch (e) {}

    response.userFriendlyErrors[0] = response.userFriendlyErrors[0].replace("URL", options.url);
    this.bug(response.userFriendlyErrors.join(" "));

    response.details = options;
    deferred.reject(response);
  },
  setHeader: function(xhr, key, value) {
    xhr.setRequestHeader(key, value);
  },
  ontimeout: function(options, evt, deferred) {
    var err = new Error(this.CLIENT_TIMEOUT.MESSAGE);
    this.debug("The request to " + options.url + " timed out.", evt);

    err.status = this.CLIENT_TIMEOUT.CODE;
    this.handleError(options, err, deferred);
  },
  onabort: function(options, evt, deferred) {
    var err = new Error(this.CONNECTION_ABORTED.MESSAGE);
    this.debug("The request to " + options.url + " was aborted.", evt);

    err.status = this.CONNECTION_ABORTED.CODE;
    this.handleError(options, err, deferred);
  },
  onerror: function(options, evt, deferred) {
    var err = new Error(this.CONNECTION_ERRORED.MESSAGE);
    this.debug("The request to " + options.url + " errored.", evt);

    err.status = options.xhr.status || this.CONNECTION_ERRORED.CODE;
    this.handleError(options, err, deferred);
  },
  onload: function(options, evt, deferred) {
    this.handleResponse(options, deferred);
  },
  onprogress: function(options, evt, deferred) {
    if (evt.lengthComputable) {
      var percentComplete = (evt.loaded / evt.total) * 100;
      console.log("percentComplete", percentComplete);
    }
    if (options.onprogress && typeof options.onprogress === "function") {
      options.onprogress(evt);
    }
    if (deferred && deferred.progress) {
      deferred.progress(evt);
    }
  }
};

/*
 * Helper function which handles IE
 */
CORS.buildXhr = function(options) {
  var xhr;
  try {
    xhr = new XMLHttpRequest();
  } catch (e) {
    this.warn("XMLHttpRequest is not defined, nothing will happen.", e);
    return null;
  }
  if ("withCredentials" in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
    try {
      xhr.open(options.method, options.url, true);
    } catch (exception) {
      console.log(exception);
      this.error = exception.message;
      return null;
    }
    // https://mathiasbynens.be/notes/xhr-responsetype-json
    // xhr.responseType = "json";
  } else if (typeof XDomainRequest !== "undefined") {
    // XDomainRequest for IE.
    xhr = new XDomainRequest();
    xhr.open(options.method, options.url);
  } else {
    // CORS not supported.
    xhr = null;
  }

  if (!xhr) {
    return;
  }

  this.setHeader(xhr, "Content-type", "application/json");
  if (options.withCredentials !== false) {
    xhr.withCredentials = true;
    // Dont use CORS if its a file
    if (options.url.lastIndexOf(".") > options.url.lastIndexOf("/") && options.url.substring(options.url.lastIndexOf(".")).indexOf("htm") !== 0) {
      xhr.withCredentials = false;
    }
  }

  xhr.timeout = options.timeout || this.timeout;

  return xhr;
};

/*
 * Functions for well formed CORS requests
 */
CORS.makeCORSRequest = function(options) {
  var self = this,
    deferred = Q.defer(),
    data,
    xhr;

  if (!options || !options.url) {
    Q.nextTick(function() {
      deferred.reject({
        status: 400,
        details: options,
        userFriendlyErrors: ["Url must be defined"]
      });
    });
    return deferred.promise;
  }

  this.preprocess(options, deferred);

  //forcing production server
  // options.url = options.url.replace("corpusdev", "corpus");

  xhr = this.buildXhr(options);
  if (!xhr) {
    var message = this.error || "CORS not supported, your device will be unable to contact " + options.url;
    this.bug(message);
    Q.nextTick(function() {
      deferred.reject({
        status: 620,
        details: options,
        userFriendlyErrors: [message]
      });
    });
    return deferred.promise;
  }

  // If it contains files, make it into a mulitpart upload
  if (options && options.data && options.data.files) {
    console.log("converting to formdata ", options.data);

    data = new FormData();
    for (var part in options.data) {
      if (options.data.hasOwnProperty(part)) {
        data.append(part, options.data[part]);
      }
    }
    data = data;
    this.setHeader(xhr, "Content-Type", "multipart/form-data");
  } else {
    if (options.data) {
      data = JSON.stringify(options.data);
    }
  }

  xhr.onprogress = function(evt) {
    self.onprogress(options, evt, deferred);
  };
  xhr.onload = function(evt) {
    self.onload(options, evt, deferred);
  };
  xhr.onerror = function(evt) {
    self.onerror(options, evt, deferred);
  };
  xhr.onabort = function(evt) {
    self.onabort(options, evt, deferred);
  };
  xhr.ontimeout = function(evt) {
    self.ontimeout(options, evt, deferred);
  };

  options.xhr = xhr;
  try {
    if (data) {
      self.debug("sending ", data);
      xhr.send(data);
    } else {
      xhr.send();
    }
  } catch (e) {
    self.warn("Caught an exception when calling send on xhr", e);
    e.details = options;
    deferred.reject(e);
  }

  return deferred.promise;
};

try {
  exports.CORS = CORS;
} catch (e) {}

try {
  if (!window) {}
} catch (e) {
  var CORSNode = require("./CORSNode").CORS;
  console.warn("REST requests: enabled");
  exports.CORS = CORSNode || CORS;
}
