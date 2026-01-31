console.log("Loading Webservices info for Localhost");
/* Extends the OPrime class */
var OPrime = OPrime || {};

OPrime.apptype = "localhost";

// Service URLs for Docker localhost setup
OPrime.websiteUrl = "https://localhost:3182";
OPrime.authUrl = "https://localhost:3183";
OPrime.audioUrl = "https://localhost:3184";
OPrime.lexiconUrl = "https://localhost:3185";
OPrime.corpusUrl = "https://localhost:6984";  // Updated to match Docker CouchDB HTTPS port
OPrime.activityUrl = "https://localhost:3187";
OPrime.widgetUrl = "https://localhost:3188";

// Option 1: Set localStorage to force localhost connection
// This has the highest priority in FieldDB.Connection.defaultConnection()
if (typeof localStorage !== 'undefined') {
  localStorage.setItem('serverLabel', 'localhost');
  localStorage.setItem('brand', 'localhost');
  console.log("Set localStorage.serverLabel to 'localhost'");
}

// Option 2: Configure jQuery.couch.urlPrefix for CouchDB API calls
// This ensures $.couch methods use the correct localhost URL
if (typeof $ !== 'undefined' && $.couch) {
  $.couch.urlPrefix = 'https://localhost:6984';
  console.log("Set $.couch.urlPrefix to 'https://localhost:6984'");
}

// Option 3: Set FieldDB.Connection.otherwise as fallback
// This is used when localStorage is not available
if (typeof FieldDB !== 'undefined' && FieldDB.Connection) {
  FieldDB.Connection.otherwise = 'localhost';
  console.log("Set FieldDB.Connection.otherwise to 'localhost'");
}

// Override OPrime.getCouchUrl to force localhost URLs
// This replaces production URLs with localhost equivalents
OPrime.getCouchUrl = function(connection, couchdbcommand) {
  if (!connection) {
    connection = FieldDB.Connection(FieldDB.Connection.defaultConnection());
    connection.debug("Using the default connection", connection);
  } else if (!(connection instanceof FieldDB.Connection)) {
    connection = new FieldDB.Connection(connection);
  }

  var url = connection.corpusUrl;
  if (couchdbcommand !== null && couchdbcommand !== undefined && connection.dbname) {
    url = url.replace("/" + connection.dbname, couchdbcommand);
  } else if (couchdbcommand === '/_session') {
    url = url + couchdbcommand;
  }

  // Force localhost URLs - replace any production URLs
  url = url.replace("corpusdev.lingsync.org", "localhost:6984");
  url = url.replace("corpus.lingsync.org", "localhost:6984");
  url = url.replace("http://localhost:5984", "https://localhost:6984"); // Ensure HTTPS for browser
  
  // For CouchDB API calls, use HTTP port 6984
  if (couchdbcommand && couchdbcommand.indexOf('/_') === 0) {
    url = url.replace("http://localhost:5984", "https://localhost:6984");
  }

  return url;
};
