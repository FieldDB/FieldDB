var Q = require("q");
var http = require("http");
var https = require("https");
var url = require("url");

var CORS = require("./CORS").CORS;

/*
 * Helper function which handles IE
 */
CORS.buildXhr = function() {};
CORS.setHeader = function(xhr, key, value) {
  xhr.setHeader(key, value);
};

var COOKIE_JAR = {};

CORS.clearCookies = function(hostname) {
  if (!hostname) {
    return;
  }

  this.warn("clearing cookies on " + hostname);
  delete COOKIE_JAR[hostname];
};
/*
 * Functions for well formed CORS requests
 */
CORS.makeCORSRequest = function(options) {
  var self = this,
    deferred = Q.defer(),
    data = "",
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
  var urlObject = url.parse(options.url);

  var httpOrHttps = http;
  if (urlObject.protocol === "https:") {
    httpOrHttps = https;
    urlObject.port = urlObject.port || 443;
  }
  delete urlObject.protocol;

  urlObject.method = options.method || "GET";
  xhr = httpOrHttps.request(urlObject, function(res) {
    var output = "";
    res.setEncoding("utf8");

    self.debug(options.url + " " + options.complete + ":  requesting ");

    res.on("data", function(chunk) {
      output += chunk;
      self.debug(options.url + " " + options.complete + ":  ondata ");
      self.onprogress.apply(self, [options, {
        lengthComputable: true,
        loaded: output.length - chunk.length,
        total: output.length
      }, deferred]);
    });

    res.on("end", function() {
      xhr.responseText = output;
      xhr.status = res.statusCode;

      // Save cookies
      if (res.headers && res.headers["set-cookie"]) {
        COOKIE_JAR[urlObject.host] = res.headers["set-cookie"];
        self.debug(options.url + " " + options.complete + ": cookies", COOKIE_JAR);
      }

      // Remove cookies
      self.debug(options.url + " " + options.complete + ":  response headers " + options.url, res.headers);
      if (options.method === "DELETE" && urlObject.path === "/_session") {
        self.clearCookies(urlObject.host);
      }

      // Final progress event
      self.onprogress.apply(self, [options, {
        lengthComputable: true,
        loaded: output.length,
        total: output.length
      }, deferred]);

      self.onload.apply(self, [options, {}, deferred]);
    });
  });

  // Include cookies
  if (COOKIE_JAR[urlObject.host]) {
    xhr.setHeader("Cookie", COOKIE_JAR[urlObject.host].join(";"));
  }
  self.debug(options.url + " " + options.complete + ": request cookies " + xhr.getHeader("cookie"));

  xhr.setHeader("Content-type", "application/json");

  xhr.setTimeout(options.timeout || this.timeout);

  // If it contains files, make it into a mulitpart upload
  if (options && options.data && options.data.files) {
    // console.log("converting to formdata ", options.data);

    // data = new FormData();
    // for (var part in options.data) {
    //   if (options.data.hasOwnProperty(part)) {
    //     data.append(part, options.data[part]);
    //   }
    // }
    // data = data;
    // xhr.setHeader("Content-Type", "multipart/form-data");
  } else {
    if (options.data) {
      data = JSON.stringify(options.data);
    }
  }

  xhr.on("error", function(err) {
    self.onerror.apply(self, [options, err, deferred]);
  });

  xhr.on("timeout", function(err) {
    self.ontimeout.apply(self, [options, err, deferred]);
  });

  options.xhr = xhr;
  try {
    if (data) {
      self.debug(options.url + " " + options.complete + ": sending ", data);
      xhr.write(data);
    } else {
      xhr.write("");
    }
    xhr.end();
  } catch (e) {
    self.warn("Caught an exception when calling send on xhr", e.stack);
    e.details = options;
    deferred.reject(e);
  }

  return deferred.promise;
};

if (exports) {
  exports.CORS = CORS;
}
