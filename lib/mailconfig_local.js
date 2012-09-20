exports.mailConnection = {
  service : "",
  auth : {
    user : "",
    pass : ""
  }
}

exports.newUserMailOptions = {
  from : "", // sender address
  to : "", // list of receivers
  subject : "Welcome to Localhost!", // Subject line
  text : "", // plaintext // body
  html : "" // html body(
}

exports.suspendedUserMailOptions = {
  from : "", // sender address
  to : "", // list of receivers
  subject : "New Temporary Password for Localhost!", // Subject line
  text : "", // plaintext // body
  html : "" // html body(
}