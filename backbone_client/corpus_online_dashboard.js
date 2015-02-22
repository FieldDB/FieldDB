/* If they have an old link, redirect them */
if (window.location.origin.indexOf("ifielddevs.iriscouch.com") >= 0) {
  var newTestingServerWithCORS = window.location.href.replace("ifielddevs.iriscouch.com", "corpus.lingsync.org");
  if (window.location.protocol == "http:") {
    newTestingServerWithCORS = newTestingServerWithCORS.replace("http", "https");
  }
  window.location.replace(newTestingServerWithCORS);
}
/* If they have an old link, redirect them */
if (window.location.origin.indexOf("corpusdev.lingsync.org") >= 0) {
  var newTestingServerWithCORS = window.location.href.replace("corpusdev.lingsync.org", "corpus.lingsync.org");
  if (window.location.protocol == "http:") {
    newTestingServerWithCORS = newTestingServerWithCORS.replace("http", "https");
  }
  window.location.replace(newTestingServerWithCORS);
}

/* Make sure they use the https versions, if they are on a couchapp */
if (window.location.origin.indexOf("localhost") == -1) {
  if (window.location.protocol == "http:") {
    window.location.replace(window.location.href.replace("http", "https"));
  }
}

// Set the RequireJS configuration
require.config({
  paths: {
    /* Bootstrap user interface javascript files */
    "bootstrap": "libs/bootstrap/js/bootstrap.min",

    "CryptoJS": "libs/Crypto_AES",

    /* jQuery and jQuery plugins */
    "jquery": "bower_components/jquery/dist/jquery.min",
    "wikitext": "libs/jquery-wikitext",

    /* Handlebars html templating libraries and compiled templates */
    "handlebars": "libs/compiled_handlebars",
    "handlebarsjs": "bower_components/handlebars/handlebars.runtime",

    /* Backbone Model View Controller framework and its plugins and dependencies */
    "_": "bower_components/underscore/underscore",
    "underscore": "bower_components/underscore/underscore",
    "backbone": "bower_components/backbone/backbone",
    "jquerycouch": "libs/backbone_couchdb/jquery.couch",

    "terminal": "libs/terminal/terminal",

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
    "handlebarsjs": {
      deps: ["backbone", "jquery"],
      exports: "Handlebars"
    },
    "handlebars": {
      deps: ["handlebarsjs"],
      exports: "Handlebars"
    },
    // "backbone": {
    //   deps: ["_", "jquerycouch", "handlebars"],
    //   exports: "Backbone"
    // },

    "terminal": {
      deps: ["bootstrap", "jquery"],
      exports: "Terminal"
    }

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

  window.app = new App({
    filledWithDefaults: true
  });

  window.uploadAndGenerateTextGrid = function(files) {
    //    document.getElementById("uploadAudioForTextGridform").filesToUpload = files;
    //    alert("I'm going to submit the upload form.");
    //    document.getElementById("uploadAudioForTextGridform").submit();
  };


});
