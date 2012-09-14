/* Extends the Utils class */
var Utils = Utils || {};

Utils.authUrl = "https://localhost:3183";
/*
 * not using secure couch because it would require extra set up for developers
 * to run locally which is unneccesary
 */
Utils.defaultCouchConnection = function() {
  return {
    protocol : "http://",
    domain : "localhost",
    port : "5984",
    pouchname : "default"
  }; 
};