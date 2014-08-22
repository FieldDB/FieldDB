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
    var xhrCors = new XMLHttpRequest();
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
        promiseForData = Q.defer(),
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
        promiseForData.reject("CORS not supported, your browser is unable to contact the database.");
        return;
    }

    //  if(options.method === "POST"){
    //xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.withCredentials = true;
    //  }

    xhr.onload = function(e, f, g) {
        var text = xhr.responseText;
        if (self.debugMode) {
            self.debug("Response from CORS request to " + options.url + ": " + text);
        }
        if (text) {
            try {
                text = JSON.parse(text);
            } catch (e) {
                console.log("Response was not json.");
            }
            promiseForData.resolve(text);
        } else {
            self.bug("There was no content in the server's response text. Please report this.");
            console.log(e, f, g);
            promiseForData.reject(e);
        }
        self.debugMode = false;
    };

    xhr.onerror = function(e, f, g) {
        if (self.debugMode) {
            self.debug(e, f, g);
        }
        self.bug("There was an error making the CORS request to " + options.url + " from " + window.location.href + " the app will not function normally. Please report this.");
        promiseForData.reject(e);
    };
    if (options.method === "POST") {
        xhr.send(JSON.stringify(options.data));
    } else {
        xhr.send();
    }

    return promiseForData.promise;
};

exports.CORS = CORS;
