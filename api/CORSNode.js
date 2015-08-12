var Q = require("q");
var http = require("http");
var https = require("https");
var url = require("url");

var CORS = CORS || {};
CORS.bug = function(message) {
  console.log(message);
};

CORS.makeCORSRequest = function(options) {
  var deferred = Q.defer();
  var data = options.data;
  if (!options.method) {
    options.method = options.type || "GET";
  }
  if (!options.url) {
    CORS.bug("There was an error. Please report this.");
  }
  if (!data) {
    data = "";
  } else {
    data = JSON.stringify(data);
    console.log("data to send" + data);
  }

  var urlObject = url.parse(options.url);
  if (options.dataType === "json") {
    urlObject.headers = {
      "content-type": "application/json",
      "accept": "application/json"
    };
  }
  urlObject.method = options.method;

  var httpOrHttps = http;
  if (urlObject.protocol === "https://") {
    httpOrHttps = https;
  }
  delete urlObject.protocol;

  var req = httpOrHttps.request(urlObject, function(res) {
    var output = "";
    res.setEncoding("utf8");

    res.on("data", function(chunk) {
      output += chunk;
    });

    res.on("end", function() {
      var response;
      // console.log("Server response ended." + output);
      try {
        response = JSON.parse(output);
      } catch (e) {
        console.log("Unexpected server response");
        response = {
          error: output
        };
        deferred.reject(response);
        return;
      }
      console.log("Server response, "+ response);
      deferred.resolve(response);
    });
  });

  req.on("error", function(err) {
    console.log("Error requesting " + JSON.stringify(urlObject));
    console.log(err);
    deferred.reject(err);
  });

  if (data) {
    console.log("sending data to http connection", data);
    req.write(data, "utf8");
    req.end();
  } else {
    console.log("sending no data to http connection");
    req.end();
  }

  return deferred.promise;
};

if (exports) {
  exports.CORS = CORS;
}
