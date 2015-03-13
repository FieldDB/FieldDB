// Set the RequireJS configuration
require.config({
  paths : {
    /* Bootstrap user interface javascript files */
    "bootstrap" : "libs/bootstrap/js/bootstrap.min",

    "CryptoJS" : "libs/Crypto_AES",

    /* jQuery and jQuery plugins */
    "jquery" : "bower_components/jquery/jquery",

    /* Handlebars html templating libraries and compiled templates */
    "compiledTemplates" : "libs/compiled_handlebars",
    "handlebars" : "libs/handlebars.runtime",

    /* Backbone Model View Controller framework and its plugins and dependencies */
    "backbone" : "libs/backbone",
    "backbone_pouchdb" : "libs/backbone-pouchdb",
    "backbone_couchdb" : "libs/backbone-couchdb",
    "pouch" : "libs/pouch.alpha",
    "underscore" : "libs/underscore",

    "terminal" : "libs/terminal/terminal",

    "text" : "libs/text",

    "xml2json" : "libs/xml2json",

    "oprime" : "libs/OPrime",
    "OPrime" : "libs/webservicesconfig_devserver"
  },
  shim : {
    "underscore" : {
      exports : "_"
    },

    "jquery" : {
      exports : "$"
    },

    "xml2json" : {
      deps : [ "jquery" ],
      exports : "X2JS"
    },

    "oprime" : {
      exports : "OPrime"
    },
    "webservicesconfig" : {
      deps : [ "oprime" ],
      exports : "OPrime"
    },

    "bootstrap" : {
      deps : [ "jquery" ],
      exports : "bootstrap"
    },

    "pouch" : {
      exports : "Pouch"
    },
    "backbone" : {
      deps : [ "underscore", "bootstrap", "compiledTemplates" ],
      exports : "Backbone"
    },
    "backbone_pouchdb" : {
      deps : [ "backbone", "pouch", "backbone_couchdb" ],
      exports : "Backbone"
    },
    "backbone_couchdb" : {
      deps : [ "backbone", "pouch" ],
      exports : "Backbone"
    },

    "handlebars" : {
      deps : [ "bootstrap", "jquery" ],
      exports : "Handlebars"
    },

    "compiledTemplates" : {
      deps : [ "handlebars" ],
      exports : "Handlebars"
    },
    "terminal" : {
      deps : [ "bootstrap", "jquery" ],
      exports : "Terminal"
    }


  }
});

//Initialization
require([ 
      "user/UserApp",  
      "backbone_pouchdb",
      "OPrime"
      ], function(
          App,
          forcingpouchtoloadearly
      ) {
window.app = new App({filledWithDefaults: true});
});


//// Initialization
//require([
//    "user/UserApp",
//    "user/UserAppView",
//    "user/UserRouter",
//    "compiledTemplates",
//    "backbone",
//    "backbone_pouchdb",
//    "libs/webservicesconfig_devserver",
//    "libs/OPrime"
//], function(
//    UserApp,
//    UserAppView,
//    UserRouter,
//    compiledTemplates,
//    Backbone,
//    forcingpouchtoloadonbackboneearly
//) {
//  
//  /*
//   * Start the pub sub hub
//   */
//  window.hub = {};
//  OPrime.makePublisher(window.hub);
// 
//  /*
//   * Check for user's cookie and the dashboard so we can load it
//   */
//  var username = OPrime.getCookie("username");
//  if (username != null && username != "") {
//
//    window.app = new UserApp();
//    var auth = window.app.get("authentication");
//    var u = localStorage.getItem("encryptedUser");
//    auth.loadEncryptedUser(u, function(success, errors){
//      if(success == null){
//        alert("Bug: We couldnt log you in."+errors.join("<br/>") + " " + OPrime.contactUs);  
//        OPrime.setCookie("username","");
//        document.location.href='corpus.html';
//        return;
//      }else{
////        alert("We logged you in." + OPrime.contactUs);  
//        window.appView = new UserAppView({model: window.app}); 
//        window.appView.render();
//        app.router = new UserRouter();
//        Backbone.history.start();
//      }
//    });
//    
//  } else {
//    // new user, let them register or login as themselves or lingllama
//    document.location.href='corpus.html';
//  }
//  
//});
