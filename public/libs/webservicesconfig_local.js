/* Extends the Utils class */
var Utils = Utils || {};

Utils.authUrl = "https://localhost:3183";
Utils.defaultCouchConnection = function() {
  return {
    protocol : "http://",
    domain : "localhost",
    port : "5984",
    pouchname : "default"
  }; 
};