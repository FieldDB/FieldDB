/* If they have an old link, redirect them */
if (window.location.origin.indexOf("ifielddevs.iriscouch.com") >= 0 ){
  var newTestingServerWithCORS = window.location.href.replace("ifielddevs.iriscouch.com", "corpusdev.lingsync.org");
  if (window.location.protocol == "http:") {
    newTestingServerWithCORS = newTestingServerWithCORS.replace("http", "https");
  }
  window.location.replace();
}

/* Make sure they use the https versions, if they are on a couchapp */
if (window.location.origin.indexOf("localhost") == -1) {
  if (window.location.protocol == "http:") {
    window.location.replace(window.location.href.replace("http", "https"));
  }
}


//Set the RequireJS configuration
require.config({
  paths : {
    /* Bootstrap user interface javascript files */
    "bootstrap" : "libs/bootstrap/js/bootstrap.min",

    "crypto" : "libs/Crypto_AES",

    /* jQuery and jQuery plugins */
    "jquery" : "libs/jquery",

    /* Handlebars html templating libraries and compiled templates */
    "compiledTemplates" : "libs/compiled_handlebars",
    "handlebars" : "libs/handlebars.runtime",

    /* Backbone Model View Controller framework and its plugins and dependencies */
    "underscore" : "libs/underscore",
    "backbonejs" : "libs/backbone",
    "jquery-couch" : "libs/backbone_couchdb/jquery.couch",
    "backbone" : "libs/backbone_couchdb/backbone-couchdb",

    "terminal" : "libs/terminal/terminal",

    "text" : "libs/text",

    "xml2json" : "libs/xml2json",

    "oprime" : "libs/OPrime",
    "webservicesconfig" : "libs/webservicesconfig_devserver"
  },
  shim : {
    
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
    
    "underscore" : {
      exports : "_"
    },

    "jquery" : {
      exports : "$"
    },
    
    "jquery-couch" : {
      deps : [ "jquery" ],
      exports : "$"
    },

    "bootstrap" : {
      deps : [ "jquery-couch" ],
      exports : "bootstrap"
    },
    
    "backbonejs" : {
      deps : [ "underscore", "bootstrap" ],
      exports : "Backbone"
    },
    "backbone" : {
      deps : [ "backbonejs", "jquery-couch", "compiledTemplates" ],
      exports : "Backbone"
    },

    "handlebars" : {
      deps : [ "backbonejs", "jquery" ],
      exports : "Handlebars"
    },
    "compiledTemplates" : {
      deps : [ "handlebars" ],
      exports : "Handlebars"
    },
    
    "crypto" : {
      exports : "CryptoJS"
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
      "backbone",
      "libs/webservicesconfig_devserver"
      ], function(
          App,
          forcingpouchtoloadearly
      ) {
  
  try{
    var pieces = window.location.pathname.replace(/^\//,"").split("/");
    var pouchName = pieces[0];
    //Handle McGill server which runs out of a virtual directory
    if(pouchName == "corpus"){
      pouchName = pieces[1];
    }
    Backbone.couch_connector.config.db_name = pouchName;
  }catch(e){
    if (OPrime.debugMode) OPrime.debug("Couldn't set the databse name off of the url.");
  }
  
  
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
//        document.location.href='index.html';
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
//    document.location.href='index.html';
//  }
//  
//});
