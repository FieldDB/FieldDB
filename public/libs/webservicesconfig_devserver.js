/* Extends the Utils class */
var Utils = Utils || {};


Utils.websiteUrl = "https://prosody.linguistics.mcgill.ca/www/";
Utils.authUrl = "https://prosody.linguistics.mcgill.ca/auth/";
Utils.audioUrl = "https://prosody.linguistics.mcgill.ca/audio/";
Utils.lexiconUrl = "https://prosody.linguistics.mcgill.ca/lexicon/";
Utils.corpusUrl = "https://prosody.linguistics.mcgill.ca/corpus/";
Utils.activityUrl = "https://prosody.linguistics.mcgill.ca/activity/";
Utils.widgetUrl = "https://prosody.linguistics.mcgill.ca/widget/";

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
    domain : "prosody.linguistics.mcgill.ca",
    port : "443",
    pouchname : "default",
    path : "/corpus/"
  }; 
};
