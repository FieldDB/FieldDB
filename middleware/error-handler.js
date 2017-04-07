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

  debug("in the error handler " + process.env.NODE_ENV, err, err.stack);
  console.log(new Date() + "There was an error " + req.url, err);

  if (["development", "test", "local"].indexOf(process.env.NODE_ENV) > -1) {
    // expose stack traces
    data = {
      message: err.message,
      error: err
    };
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
  } else if (err.code === "ENOTFOUND" && err.syscall === "getaddrinfo") {
    data.status = 500;
    data.userFriendlyErrors = ["Server connection timed out, please try again later"];
  } else if (err.code === "EPROTO") {
    data.userFriendlyErrors = ["Server erred, please report this 9234"];
  } else if (err.code === "DEPTH_ZERO_SELF_SIGNED_CERT") {
    // see also https://github.com/request/request/issues/418
    data.userFriendlyErrors = ["Server erred, please report this 23829"];
  } else {
    console.log("The server erred in an unkwnown way  ", err);
  }

  res.status(data.status);

  if (req.headers["x-requested-with"] === "XMLHttpRequest") {
    return res.json(data);
  }

  return res.render(data.status + "", {
    status: data.status,
    userFriendlyErrors: data.userFriendlyErrors,
  });
};

exports.errorHandler = errorHandler;
