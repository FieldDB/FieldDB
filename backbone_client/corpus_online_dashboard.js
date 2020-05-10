/* Make sure they use the https versions, if they are not on localhost */
if (window.location.protocol === "http:" && window.location.origin.indexOf("localhost") === -1) {
  window.location.replace(window.location.href.replace("http", "https"));
}

// Set the RequireJS configuration
require.config({
  paths: {
    /* Bootstrap user interface javascript files */
    "bootstrap": "libs/bootstrap/js/bootstrap",

    "CryptoJS": "libs/Crypto_AES",

    /* jQuery and jQuery plugins */
    "jquery": "bower_components/jquery/dist/jquery",
    "wikitext": "libs/jquery-wikitext",

    /* Handlebars html templating libraries and compiled templates */
    "handlebars.runtime": "bower_components/handlebars/handlebars.runtime.amd",

    /* Backbone Model View Controller framework and its plugins and dependencies */
    "_": "bower_components/underscore/underscore",
    "underscore": "bower_components/underscore/underscore",
    "backbone": "bower_components/backbone/backbone",
    "jquerycouch": "libs/backbone_couchdb/jquery.couch",

    "text": "libs/text",

    "xml2json": "libs/xml2json",

    "FieldDB": "bower_components/fielddb/fielddb",
    "oprime": "libs/OPrime",
    "OPrime": "libs/webservicesconfig_devserver"
  },
  shim: {

    "xml2json": {
      deps: ["jquery"],
      exports: "X2JS"
    },

    "wikitext": {
      deps: ["jquery"],
      exports: "jquery"
    },

    "FieldDB": {
      exports: "FieldDB"
    },

    "OPrime": {
      deps: ["oprime"],
      exports: "OPrime"
    },

    "jquerycouch": {
      deps: ["wikitext"],
      exports: "jquery"
    },

    "bootstrap": {
      deps: ["jquerycouch"],
      exports: "bootstrap"
    },

    // "backbonejs": {
    //   deps: ["underscore", "bootstrap"],
    //   exports: "Backbone"
    // },
    "handlebars.runtime": {
      deps: ["backbone", "jquery"],
      exports: "Handlebars"
    },
    // "backbone": {
    //   deps: ["_", "jquerycouch", "handlebars"],
    //   exports: "Backbone"
    // },

  }
});

// Initialization
require(["app/App", "OPrime", "FieldDB"], function(App) {

  console.warn("removing old lexicons to reduce storage use, and force fresh");
  for (var i = 0; i < localStorage.length; i++) {
    var localStorageKey = localStorage.key(i)
    if (localStorageKey.indexOf("lexiconResults") > -1 || localStorageKey.indexOf("precendenceRules") > -1 || localStorageKey.indexOf("reducedRules") > -1) {
      localStorage.removeItem(localStorageKey);
      console.log("cleaned " + localStorageKey);
    }
  }

  FieldDB.FieldDBObject.bug = function(message) {
    if (window.appView && typeof window.appView.toastUser === "function") {
      window.appView.toastUser(message, "alert-danger");
    }
  };
  FieldDB.FieldDBObject.prompt = FieldDB.FieldDBObject.confirm = function(message, optionalLocale) {
    var deferred = FieldDB.Q.defer();
    console.warn(message);
    FieldDB.Q.nextTick(function() {
      // always reject until these merges make sense.
      deferred.reject({
        message: message,
        optionalLocale: optionalLocale,
        response: null
      });
    });
    return deferred.promise;
  };
  FieldDB.Connection.otherwise = 'production';
  FieldDB.User.loadPublicUserIfNoUserAlready()
    .then(function() {
      window.app = new App();
      window.app.fillWithDefaults();
    });
  window.uploadAndGenerateTextGrid = function(files) {
    //    document.getElementById("uploadAudioForTextGridform").filesToUpload = files;
    //    alert("I'm going to submit the upload form.");
    //    document.getElementById("uploadAudioForTextGridform").submit();
  };
});
