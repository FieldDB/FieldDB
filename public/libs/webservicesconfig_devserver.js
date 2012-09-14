/* Extends the Utils class */
var Utils = Utils || {};


Utils.authUrl = "https://ifielddevs.fieldlinguist.com:3183";
Utils.defaultCouchConnection = function() {
  return {
    protocol : "https://",
    domain : "ifielddevs.iriscouch.com",
    port : "443",
    pouchname : "default"
  }; 
};