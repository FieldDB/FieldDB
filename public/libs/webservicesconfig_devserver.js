/* Extends the Utils class */
var Utils = Utils || {};


Utils.websiteUrl = "https://wwwdev.fieldlinguist.com:3182";
Utils.authUrl = "https://authdev.fieldlinguist.com:3183";
Utils.audioUrl = "https://audiodev.fieldlinguist.com:3184";
Utils.lexiconUrl = "https://lexicondev.fieldlinguist.com:3185";
Utils.corpusUrl = "https://corpusdev.fieldlinguist.com:3186";
Utils.activityUrl = "https://activitydev.fieldlinguist.com:3187";
Utils.widgetUrl = "https://widgetdev.fieldlinguist.com:3188";

/*
 * Use the current app's chrome url, assuming if its a dev, they will have their
 * own url that is not from the market, and if its a bleeding edge user, they
 * will have the market one. In both cases it is save to return the
 * window.location.href but this code is added to be clear that there is also a
 * bleeding edge url for users.
 */
Utils.chromeClientUrl = function(){
  if (window.location.origin != "chrome-extension://eeipnabdeimobhlkfaiohienhibfcfpa"){
    return window.location.origin;
  }else{
    return "chrome-extension://eeipnabdeimobhlkfaiohienhibfcfpa";
  }
};
  
Utils.defaultCouchConnection = function() {
  return {
    protocol : "https://",
    domain : "ifielddevs.iriscouch.com",
    port : "6984",
    pouchname : "default",
    path : ""
  }; 
};
