/* Extends the Utils class */
var Utils = Utils || {};

Utils.websiteUrl = "https://localhost:3182";
Utils.authUrl = "https://localhost:3183";
Utils.audioUrl = "https://localhost:3184";
Utils.lexiconUrl = "https://localhost:3185";
Utils.corpusUrl = "https://localhost:3186";
Utils.activityUrl = "https://localhost:3187";
Utils.widgetUrl = "https://localhost:3188";
Utils.chromeClientUrl = function() {
  return window.location.origin;
};

/*
 * not using secure couch because it would require extra set up for developers
 * to run locally which is unneccesary
 */
Utils.defaultCouchConnection = function() {
  return {
    protocol : "https://",
    domain : "localhost",
    port : "6984",
    pouchname : "default",
    path : ""
  };
};