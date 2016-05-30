// You can choose the port you want to server from
// If you choose 80 or 443 you might be able to access the server 
// from the outside world.
// If you choose a non standard port (ie 3182), there might be some universities and
// companies which will block access to your web service. 
// 
// production example: 443
exports.port = 3182;

// This is used to configure the server in https 
// if you do not have a proxy (Nginx/Apache) 
// which is providing https to the users
// 
// production example:
// exports.httpsOptions = {
//   key: "/home/fielddb/ssl/www/key.key",
//   cert: "/home/fielddb/ssl/www/key.crt",
//   port: exports.port
// };
exports.httpsOptions = {
  key: "fielddb_debug.key",
  cert: "fielddb_debug.crt",
  port: exports.port
};

// This is used to redirect non https requests to the https server
// Change this to match what the outside world should contact 
// 
// production example: https://example.org
exports.redirectURLforHTTPS = "https://example.org:" + exports.port;

// This should be customized in production to another string
exports.session_key = "uwotm8";

// This creates a url which is contacted using nano to look up the 
// corpus details for the user's pages. It is possible to use http instead of 
// https if you are unable to set up your local CouchDB for SSL.
// 
// production example:
// exports.corpusWebService = {
//   protocol: "https://",
//   domain: "corpus.example.org",
//   port: "",
//   users: "someotherdatabase",
//   path: ""
// };
exports.corpusWebService = {
  protocol: "https://",
  domain: "localhost",
  port: "6984",
  users: "theuserscouch",
  path: ""
};

// Change localhost to production if you want to see this in your logs
console.log("Loaded localhost config");
