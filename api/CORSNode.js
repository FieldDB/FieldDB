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

    res.on("data", function(chunk) {
      output += chunk;
      self.onprogress.apply(self, [options, {
        lengthComputable: true,
        loaded: output.length - chunk.length,
        total: output.length
      }, deferred]);
    });

    res.on("end", function() {
      xhr.responseText = output;
      xhr.status = res.statusCode;
      self.onload.apply(self, [options, {}, deferred]);

      // Save cookies
      if (res.headers && res.headers["set-cookie"]) {
        COOKIE_JAR[urlObject.host] = res.headers["set-cookie"];
        self.debug("cookies", COOKIE_JAR);
      }
      self.debug("response headers", res.headers);
      if (options.method === "DELETE" && urlObject.path === "/_session") {
        console.warn("Logged user out.");
        self.clearCookies(urlObject.host);
      }
    });
  });

  // Include cookies
  if (COOKIE_JAR[urlObject.host]) {
    xhr.setHeader("Cookie", COOKIE_JAR[urlObject.host].join(";"));
  }
  self.debug("request cookies" + xhr.getHeader("cookie"));

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
      self.debug("sending ", data);
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
