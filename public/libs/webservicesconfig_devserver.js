/* Extends the Utils class */
var Utils = Utils || {};


Utils.authUrl = "https://authdev.fieldlinguist.com:3183";
Utils.audioUrl = "https://audiodev.fieldlinguist.com:3184";
Utils.lexiconUrl = "https://lexicondev.fieldlinguist.com:3185";
Utils.corpusUrl = "https://corpusdev.fieldlinguist.com:3186";
Utils.activityUrl = "https://activitydev.fieldlinguist.com:3187";
Utils.widgetUrl = "https://widgetdev.fieldlinguist.com:3188";

Utils.defaultCouchConnection = function() {
  return {
    protocol : "https://",
    domain : "ifielddevs.iriscouch.com",
    port : "443",
    pouchname : "default"
  }; 
};