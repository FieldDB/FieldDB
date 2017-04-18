var fs = require("fs");
var Q = require("q");
var CORS = require("fielddb/api/CORSNode").CORS;
var fixtures = require("fixturefiles");
var offline = process.env.OFFLINE;

if (offline) {
  CORS.makeCORSRequest = function(options) {
    console.log('makeCORSRequest', options);
    var deferred = Q.defer();
    Q.nextTick(function() {
      if (options.url.includes('lingllama-communitycorpus/team')) {
        return deferred.resolve(fixtures.team.lingllama);
      }
      if (options.url.includes('lingllama-communitycorpus/corpus')) {
        return deferred.resolve(fixtures.corpus['lingllama-communitycorpus']);
      }
      if (options.url.includes('/lingllama')) {
        return deferred.resolve(fixtures.user.lingllama);
      }

      return deferred.reject({
        message: 'Not found',
        status: 404
      });
    });
    return deferred.promise;
  }
}

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

var config = {
  offline: offline,
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
