/* If they have an old link, redirect them */
if (window.location.origin.indexOf("ifielddevs.iriscouch.com") >= 0) {
  var newTestingServerWithCORS = window.location.href.replace(
      "ifielddevs.iriscouch.com", "corpus.lingsync.org");
  if (window.location.protocol == "http:") {
    newTestingServerWithCORS = newTestingServerWithCORS
        .replace("http", "https");
  }
  window.location.replace(newTestingServerWithCORS);
}
/* If they have an old link, redirect them */
if (window.location.origin.indexOf("corpusdev.lingsync.org") >= 0) {
  var newTestingServerWithCORS = window.location.href.replace(
      "corpusdev.lingsync.org", "corpus.lingsync.org");
  if (window.location.protocol == "http:") {
    newTestingServerWithCORS = newTestingServerWithCORS
        .replace("http", "https");
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
    "jquery": "bower_components/jquery/jquery",
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
require(["user/UserApp", "OPrime", "FieldDB"], function(App) {
  try {
    var pieces = window.location.pathname.replace(/^\//, "").split("/");
    var dbname = pieces[0];
    // Handle McGill server which runs out of a virtual directory
    if (dbname == "corpus") {
      dbname = pieces[1];
    }
    Backbone.couch_connector.config.db_name = dbname;
  } catch (e) {
    if (OPrime.debugMode)
      OPrime.debug("Couldn't set the databse name off of the url.");
  }

  window.app = new App({
    filledWithDefaults : true
  });
});

// // Initialization
// require([
// "user/UserApp",
// "user/UserAppView",
// "user/UserRouter",
// "compiledTemplates",
// "backbone",
// "backbone_pouchdb",
// "libs/webservicesconfig_devserver",
// "libs/OPrime"
// ], function(
// UserApp,
// UserAppView,
// UserRouter,
// compiledTemplates,
// Backbone,
// forcingpouchtoloadonbackboneearly
// ) {
//
// /*
// * Start the pub sub hub
// */
// window.hub = {};
// OPrime.makePublisher(window.hub);
//
// /*
// * Check for user's cookie and the dashboard so we can load it
// */
// var username = OPrime.getCookie("username");
// if (username != null && username != "") {
//
// window.app = new UserApp();
// var auth = window.app.get("authentication");
// var u = localStorage.getItem("encryptedUser");
// auth.loadEncryptedUser(u, function(success, errors){
// if(success == null){
// alert("Bug: We couldnt log you in."+errors.join("<br/>") + " " +
// OPrime.contactUs);
// OPrime.setCookie("username","");
// document.location.href='corpus.html';
// return;
// }else{
// // alert("We logged you in." + OPrime.contactUs);
// window.appView = new UserAppView({model: window.app});
// window.appView.render();
// app.router = new UserRouter();
// Backbone.history.start();
// }
// });
//
// } else {
// // new user, let them register or login as themselves or lingllama
// document.location.href='corpus.html';
// }
//
// });
