console.log("Loading Webservices info");
/* Extends the OPrime class */
var OPrime = OPrime || {};


OPrime.websiteUrl = "https://wwwdev.fieldlinguist.com:3182";
OPrime.authUrl = "https://authdev.fieldlinguist.com:3183";
OPrime.audioUrl = "https://audiodev.fieldlinguist.com:3184";
OPrime.lexiconUrl = "https://lexicondev.fieldlinguist.com:3185";
OPrime.corpusUrl = "https://corpusdev.fieldlinguist.com:3186";
OPrime.activityUrl = "https://activitydev.fieldlinguist.com:3187";
OPrime.widgetUrl = "https://widgetdev.fieldlinguist.com:3188";

/*
 * Use the current app's chrome url, assuming if its a dev, they will have their
 * own url that is not from the market, and if its a bleeding edge user, they
 * will have the market one. In both cases it is save to return the
 * window.location.href but this code is added to be clear that there is also a
 * bleeding edge url for users.
 */
OPrime.chromeClientUrl = function(){
  if (window.location.origin != "chrome-extension://eeipnabdeimobhlkfaiohienhibfcfpa"){
    return window.location.origin;
  }else{
    return "chrome-extension://eeipnabdeimobhlkfaiohienhibfcfpa";
  }
};
  
OPrime.defaultCouchConnection = function() {
  return {
    protocol : "https://",
    domain : "ifielddevs.iriscouch.com",
    port : "443",
    pouchname : "default",
    path : ""
  }; 
};

OPrime.contactUs = "<a href='https://docs.google.com/spreadsheet/viewform?formkey=dGFyREp4WmhBRURYNzFkcWZMTnpkV2c6MQ' target='_blank'>Contact Us</a>";

