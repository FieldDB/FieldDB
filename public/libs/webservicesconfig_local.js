/* Extends the Utils class */
var Utils = Utils || {};

Utils.authUrl = "https://localhost:3183";
Utils.defaultCouchConnection = function() {
  return {
    protocol : "https://",
    domain : "localhost",
    port : "6984",
    pouchname : "default"
  }; 
};