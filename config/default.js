var fs = require("fs");

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

var config = {
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
