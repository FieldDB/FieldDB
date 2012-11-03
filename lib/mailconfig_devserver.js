exports.mailConnection = {
  service : "",
  auth : {
    user : "",
    pass : ""
  }
};

exports.newUserMailOptions = function() {
  return {
    from : "none@localhost", // sender address
    to : "", // list of receivers
    subject : "Welcome to localhost!", // Subject line
    text : "Your username is: ", // plaintext // body
    html : "Your username is: "
  };
};
exports.suspendedUserMailOptions = function() {
  return {
    from : "none@localhost", // sender address
    to : "", // list of receivers
    subject : "New Temporary Password", // Subject line
    text : "Your username is: ", // plaintext // body
    html : "Your username is: "
  };
};
