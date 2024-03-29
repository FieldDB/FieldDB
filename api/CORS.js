/* globals window, XDomainRequest, XMLHttpRequest, FormData, FieldDB, document */
"use strict";
var Q;

try {
  Q = document.Q || FieldDB.Q;
} catch (exception) {
  if (!Q) {
    Q = require("q");
  }
}

var CORS = {
  OFFLINE: {
    CODE: 600,
    MESSAGE: "Unable to contact URL, you appear to be offline."
  },
  CLIENT_TIMEOUT: {
    CODE: 500,
    MESSAGE: "The request to URL timed out, please try again. If this happens again, please report this."
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
      if (a) {
        console.log("CORS-DEBUG: " + a);
      }
      if (b) {
        console.log(b);
      }
      if (c) {
        console.log(c);
      }
    }
  },
  warn: function(message, b, c) {
    if (this.warnMessage && this.warnMessage.indexOf("message") > -1) {
      return;
    } else {
      this.warnMessage = this.warnMessage + message;
    }
    console.warn("CORS-WARN: " + message);
    if (b) {
      console.log(b);
    }
    if (c) {
      console.log(c);
    }
    // throw message;
  },
  bug: function(message) {
    console.warn("CORS-BUG: " + message);
  },
  render: function() {
    this.debug("Render requested for CORS, but it doesnt know how to render itself.");
  },
  clearCookies: function(hostname) {
    this.warn("TODO clear cookies requested for " + hostname);
  },
  preprocess: function(options) {
    this.debug("\n\n\npreprocess " + options.url + " " + options.complete);
    options.complete = false;
    options.percentComplete = 0;

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
    if (options.complete) {
      // options = null;
      return;
    }
    this.debug(options.url + " " + options.complete + ":   handleResponse " + options.url);

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
      this.debug("done " + options.url + " " + options.complete + "\n\n\n");
      options.complete = true;
      options.percentComplete = 100;
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

    this.handleError(options, err, deferred);
  },
  handleError: function(options, err, deferred) {
    if (options.complete) {
      // options = null;
      return;
    }
    this.debug(options.url + " " + options.complete + ":   handleError " + options.url);
    var response;

    // this.warn(options.url  + " " +  options.complete + ": was unsuccesful ");
    this.debug(err.stack);

    var referrer = "node";
    try {
      referrer = window.location.href;
    } catch(err){
      // not running in a browser
    }

    response = {
      userFriendlyErrors: err.userFriendlyErrors || [err.message || "There was an error contacting URL from " + referrer + " the app will not function normally. Please report this."],
      status: err.status || 610,
      error: err
    };

    if (response.userFriendlyErrors[0] === "missing") {
      response.userFriendlyErrors.unshift("The server replied that " + options.url.replace(/\/[^:]+:.+@/i, "/_:_@") + " is missing, please report this.");
    } else if (response.userFriendlyErrors[0] === "no_db_file") {
      response.userFriendlyErrors.unshift("That database doesn't exist. Are you sure this is the database you wanted to open: " + options.url.replace(/\/[^:]+:.+@/i, "/_:_@"));
    }

    if (response.status === 401) {
      if (CORS.application && CORS.application.authentication && CORS.application.authentication.dispatchEvent) {
        CORS.application.authentication.dispatchEvent("unauthorized");
      }
    }

    // Tell the user if they are offline
    if (response.status >= 500) {
      try {
        if (window && window.navigator && !window.navigator.onLine) {
          response.userFriendlyErrors.unshift(CORS.OFFLINE.MESSAGE);
          response.status = CORS.OFFLINE.CODE;
        } else if (err && err.srcElement && err.srcElement.status !== undefined) {
          response.status = err.srcElement.status;
        }
      } catch (e) {}
    }

    response.userFriendlyErrors[0] = response.userFriendlyErrors[0].replace("URL", options.url.replace(/\/[^:]+:.+@/i, "/_:_@"));
    this.bug(response.userFriendlyErrors[0]);

    response.details = options;
    response.details.url = options.url.replace(/\/[^:]+:.+@/i, "/_:_@");
    if (response.details && response.details.xhr) {
      this.debug(options.url + " " + options.complete + ":  cleaning up ", options.url);
      options.status = options.status || options.xhr.status;
      delete options.xhr;
    }
    this.debug(options.url + " " + options.complete + ": done " + options.url + "\n\n\n");
    options.complete = true;
    deferred.reject(response);
  },
  setHeader: function(xhr, key, value) {
    xhr.setRequestHeader(key, value);
  },
  ontimeout: function(options, evt, deferred) {
    var err = new Error(this.CLIENT_TIMEOUT.MESSAGE);
    this.debug(options.url + " " + options.complete + ": timed out.");

    err.status = this.CLIENT_TIMEOUT.CODE;
    this.handleError(options, err, deferred);
  },
  onabort: function(options, evt, deferred) {
    var err = new Error(this.CONNECTION_ABORTED.MESSAGE);
    this.debug(options.url + " " + options.complete + ": was aborted.");

    err.status = this.CONNECTION_ABORTED.CODE;
    this.handleError(options, err, deferred);
  },
  onerror: function(options, evt, deferred) {
    var err = new Error(this.CONNECTION_ERRORED.MESSAGE);
    this.debug(options.url + " " + options.complete + ": errored.");

    if (options.xhr && options.xhr.status) {
      err.status = options.xhr.status;
    } else if (options.status) {
      err.status = options.status;
    } else {
      err.status = this.CONNECTION_ERRORED.CODE;
    }

    this.handleError(options, err, deferred);
  },
  onload: function(options, evt, deferred) {
    this.handleResponse(options, deferred);
  },
  onprogress: function(options, evt) {
    this.debug(options.url + " " + options.complete + ":  onprogress " + options.url + " " + options.complete, evt);
    if (evt.lengthComputable) {
      var percentComplete = (evt.loaded / evt.total) * 100;
      this.debug(options.url + " " + options.complete + ":  percentComplete " + options.url, percentComplete);
      this.debug("Percent complete " + options.url.replace(/\/[^:]+:.+@/i, "/_:_@") + " : " + percentComplete);
      if (!options.complete) {
        options.percentComplete = percentComplete;
      }
    }
    if (options.onprogress && typeof options.onprogress === "function") {
      options.onprogress(evt);
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
      console.log("CORS exception", exception);
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

  if (options.timeout || this.timeout) {
    xhr.timeout = options.timeout || this.timeout;
  }

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
  options.url = options.url.replace("corpusdev", "corpus");
  options.url = options.url.replace("authdev", "auth");
  options.url = options.url.replace("localhost:6984", "corpus.lingsync.org");
  options.url = options.url.replace("localhost:5984", "corpus.lingsync.org");

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
      self.debug(options.url + " " + options.complete + ": sending ", data);
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
  if (!document) {}
  // console.log(document);
} catch (e) {
  var CORSNode = require("./CORSNode").CORS;
  console.warn("REST requests: enabled");
  exports.CORS = CORSNode || CORS;
}
