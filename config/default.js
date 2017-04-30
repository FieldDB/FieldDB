var Connection = require("fielddb/api/corpus/Connection").Connection;
var fs = require("fs");
var offline = process.env.OFFLINE;

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

Connection.knownConnections.thisserver = Connection.knownConnections[process.env.NODE_ENV];
if (process.env.NODE_ENV === "test" && !Connection.knownConnections.thisserver) {
  Connection.knownConnections.thisserver = Connection.knownConnections["development"];
}
// Connection.knownConnections.thisserver.debugMode=true;
// console.log("Connection.knownConnections.thisserver.corpusUrls", Connection.knownConnections.thisserver.corpusUrls);
exports.externalOrigin = Connection.knownConnections.thisserver.authUrls[0];

Connection.knownConnections.testing = Connection.knownConnections.beta;

Connection.knownConnections.dyslexdisorth = Connection.knownConnections.thisserver.clone();
Connection.knownConnections.dyslexdisorth.userFriendlyServerName = "DyslexDisorth";
Connection.knownConnections.dyslexdisorth.brandLowerCase = "dyslexdisorth";
Connection.knownConnections.dyslexdisorth.serverLabel = "dyslexdisorth";

Connection.knownConnections.kartulispeechrecognition = Connection.knownConnections.thisserver.clone();
Connection.knownConnections.kartulispeechrecognition.userFriendlyServerName = "http://batumi.github.io";
Connection.knownConnections.kartulispeechrecognition.brandLowerCase = "kartulispeechrecognition";
Connection.knownConnections.kartulispeechrecognition.serverLabel = "kartulispeechrecognition";

Connection.knownConnections.learnx = Connection.knownConnections.thisserver.clone();
Connection.knownConnections.learnx.userFriendlyServerName = "Learn X";
Connection.knownConnections.learnx.brandLowerCase = "learnx";
Connection.knownConnections.learnx.serverLabel = "learnx";

Connection.knownConnections.georgiantogether = Connection.knownConnections.thisserver.clone();
Connection.knownConnections.georgiantogether.userFriendlyServerName = "Learn X";
Connection.knownConnections.georgiantogether.brandLowerCase = "georgiantogether";
Connection.knownConnections.georgiantogether.serverLabel = "georgiantogether";

var config = {
  offline: offline,
  app: {
    public: {
      connection: Connection.knownConnections.thisserver
    }
  },
  // You can choose the port you want to server from
  // If you choose 80 or 443 you might be able to access the server
  // from the outside world.
  // If you choose a non standard port (ie 3182), there might be some universities and
  // companies which will block access to your web service.
  url: "https://localhost:3182",
  public: {
    url: "https://localhost:3182"
  },

  // This is used to configure the server in https
  // if you do not have a proxy (Nginx/Apache)
  // which is providing https to the users
  //
  // production example:
  // exports.httpsOptions = {
  //   key: "/home/fielddb/ssl/www/key.key",
  //   cert: "/home/fielddb/ssl/www/key.crt",
  // };
  ssl: {
    key: fs.readFileSync(__dirname + "/fielddb_debug.key", "utf8"),
    cert: fs.readFileSync(__dirname + "/fielddb_debug.crt", "utf8")
  },

  // This should be customized in production to another string
  session_key: "uwotm8",

  // This creates a url to look up the
  // corpus details for the user's pages. It is possible to use http instead of
  // https if you are unable to set up your local CouchDB for SSL.
  corpus: {
    url: "http://admin:none@localhost:5984",
    public: {
      url: "https://public:none@localhost:6984"
    },
    databases: {
      users: "theuserscouch",
    }
  },
  lexicon: {
    public: {
      url: "https://localhost:3185"
    },
    url: "https://localhost:3185"
  },
  search: {
    public: {
      url: "http://localhost:9200"
    },
    url: "http://admin:none@localhost:9200"
  },
  speech: {
    public: {
      url: "http://localhost:3184"
    }
  }
};

process.env.API_BASE_URL = config.url;

console.log("Loaded default config");
module.exports = config;
