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
exports.welcomeToCorpusTeamMailOptions = function() {
  return {
    from : "none@localhost", // sender address
    to : "", // list of receivers
    subject : "[LingSync.org] Someone has granted you access to their corpus", // Subject line
    text : "The new corpus's identifier is: ", // plaintext // body
    html : "The new corpus's identifier is: "
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
