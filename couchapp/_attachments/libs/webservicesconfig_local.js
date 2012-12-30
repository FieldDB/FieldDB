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
  var d = {
    protocol : "https://",
    domain : "localhost",
    port : "6984",
    pouchname : "default",
    path : ""
  };
  /*
   * If its a couch app, it can only contact databases on its same origin, so modify the domain to be that origin. the
   * chrome extension can contact any authorized server that is authorized in
   * the chrome app's manifest
   */
  if(OPrime.isCouchApp()){
    d.domain = window.location.origin.replace("https://","").replace("http://","");
  }
  return d; 

};

OPrime.contactUs = "<a href='https://docs.google.com/spreadsheet/viewform?formkey=dGFyREp4WmhBRURYNzFkcWZMTnpkV2c6MQ' target='_blank'>Contact Us</a>";
