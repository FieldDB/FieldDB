console.log("Loading Webservices info");
/* Extends the OPrime class */
var OPrime = OPrime || {};


OPrime.websiteUrl = "https://localhost:3182";
OPrime.authUrl = "https://localhost:3183";
OPrime.audioUrl = "https://localhost:3184";
OPrime.lexiconUrl = "https://localhost:3185";
OPrime.corpusUrl = "https://localhost:3186";
OPrime.activityUrl = "https://localhost:3187";
OPrime.widgetUrl = "https://localhost:3188";
OPrime.chromeClientUrl = function() {
  return window.location.origin;
};

/*
 * not using secure couch because it would require extra set up for developers
 * to run locally which is unneccesary
 */
OPrime.defaultCouchConnection = function() {
  return {
    protocol : "https://",
    domain : "localhost",
    port : "6984",
    pouchname : "default",
    path : ""
  };
};

OPrime.contactUs = "<a href='https://docs.google.com/spreadsheet/viewform?formkey=dGFyREp4WmhBRURYNzFkcWZMTnpkV2c6MQ' target='_blank'>Contact Us</a>";
