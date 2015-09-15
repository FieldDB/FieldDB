var cleanErrorStatus = function(status) {
  if (status && status < 600) {
    return status;
  }
  return "";
};

var nanoErrorHandler = function(error, defaultUserFriendlyErrors) {
  error = error || {};
  error.status = cleanErrorStatus(error.statusCode) || 500;

  var rejectReason = {
    status: error.status,
    error: error.error,
    userFriendlyErrors: defaultUserFriendlyErrors
  };

  if (error.code === "ECONNREFUSED") {
    rejectReason.userFriendlyErrors = ["Server errored, please report this 6339"];
  } else if (error.code === "ETIMEDOUT") {
    error.status = 500;
    rejectReason.userFriendlyErrors = ["Server timed out, please try again later"];
  } else if (error.statusCode === 502) {
    error.status = 500;
    rejectReason.userFriendlyErrors = ["Server errored, please report this 36339"];
  } else if (error.statusCode === 401) {
    error.status = 500;
    rejectReason.userFriendlyErrors = ["Server errored, please report this 7234"];
  } else if (error.code === "ENOTFOUND" && error.syscall === "getaddrinfo") {
    error.status = 500;
    rejectReason.userFriendlyErrors = ["Server connection timed out, please try again later"];
  } else if (error.code === "EPROTO") {
    rejectReason.userFriendlyErrors = ["Server errored, please report this 9234"];
  } else if (error.code === "DEPTH_ZERO_SELF_SIGNED_CERT") {
    // see also https://github.com/request/request/issues/418
    rejectReason.userFriendlyErrors = ["Server errored, please report this 23829"];
  } else {
    console.log("The server errored in an unkwnown way  ", error);
  }
  return rejectReason;
};

exports.nanoErrorHandler = nanoErrorHandler;
