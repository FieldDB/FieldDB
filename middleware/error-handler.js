"use strict";
var debug = require("debug")("middleware:error");

var cleanErrorStatus = function(status) {
  if (status && status < 600) {
    return status;
  }
  return "";
};

/*jshint -W098 */
var errorHandler = function(err, req, res, next) {
  /*jshint +W098 */
  var data;

  if (["development", "test", "local"].indexOf(process.env.NODE_ENV) > -1) {
    // expose stack traces
    data = {
      message: err.message,
      error: err
    };
    if (err.details && err.details.url) {
      delete err.details.url;
    }
  } else {
    // production error handler
    data = {
      message: err.message,
      error: {}
    };
  }
  data.status = cleanErrorStatus(err.statusCode || err.status) || 500;

  if (err.code === "ECONNREFUSED") {
    data.userFriendlyErrors = ["Server erred, please report this 6339"];
  } else if (err.code === "ETIMEDOUT") {
    data.status = 500;
    data.userFriendlyErrors = ["Server timed out, please try again later"];
  } else if (data.status === 502) {
    data.status = 500;
    data.userFriendlyErrors = ["Server erred, please report this 36339"];
  } else if (data.status === 401) {
    data.status = 500;
    data.userFriendlyErrors = ["Server erred, please report this 7234"];
  } else if (data.status === 404) {
    data.status = 404;
    data.userFriendlyErrors = err.userFriendlyErrors || [data.message];
  } else if (err.code === "ENOTFOUND" && err.syscall === "getaddrinfo") {
    data.status = 500;
    data.userFriendlyErrors = ["Server connection timed out, please try again later"];
  } else if (err.code === "EPROTO") {
    data.userFriendlyErrors = ["Server erred, please report this 9234"];
  } else if (err.code === "DEPTH_ZERO_SELF_SIGNED_CERT") {
    // see also https://github.com/request/request/issues/418
    data.userFriendlyErrors = ["Server erred, please report this 23829"];
  } else {
    console.log("The server erred in an unkwnown way  ");
  }

  res.status(data.status);

  if (data.status >= 500) {
    console.log(new Date() + "There was an error " + process.env.NODE_ENV + req.url, err);
  }

  if (req.headers["x-requested-with"] === "XMLHttpRequest" || /application\/json/.test(req.headers["content-type"])) {
    return res.json(data);
  }

  return res.render(data.status + "", {
    status: data.status,
    userFriendlyErrors: data.userFriendlyErrors,
  });
};

exports.errorHandler = errorHandler;
