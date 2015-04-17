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
      "app/App",
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
//    "app/App",
//    "app/AppView",
//    "app/AppRouter",
//    "corpus/Corpus",
//    "data_list/DataList",
//    "datum/Datum",
//    "datum/Session",
//    "user/User",
//    "user/UserWelcomeView",
//    "handlebars",
//    "compiledTemplates",
//    "backbone",
//    "backbone_pouchdb",
//    "xml2json",
//    "libs/webservicesconfig_devserver",
//    "libs/OPrime"
//], function(
//    App,
//    AppView,
//    AppRouter,
//    Corpus,
//    DataList,
//    Datum,
//    Session,
//    User,
//    UserWelcomeView,
//    Handlebars,
//    compiledTemplates,
//    Backbone,
//    forcingpouchtoloadonbackboneearly,
//    forcingxml2jsontobeavilible
//) {
//  /*
//   * Helper functions
//   */
//
//  /* if they are browsing online, and not using the App version, bring them to the app version */
//  if( window.location.href.indexOf("chrome-extension") == -1 ){
//    var x = window.confirm("FieldDB works best in the Chrome Store where it has unlimited space to store your data, " +
//    		"and can go online and offline. " +
//    		"\n\nNote: This is an HTML5 webapp, not a webpage. It uses a database called 'IndexedDB'." +
//    		"\n Safari doesn't let you save a database in the browser. " +
//    		"\n Firefox almost works but not quite. It might work in a year or so." +
//    		"\n Internet Exporer 10 might work, but not IE 6-9."+
//    		"\n\nClick cancel to try it out here, but we can't guarentee your data will be saved in a database. " +
//    		"\nClick OK to go to the Chrome Store App."
//    );
//    if (x){
//        window.location = "https://chrome.google.com/webstore/detail/niphooaoogiloklolkphlnhbbkdlfdlm";
//    }else{
//      //let them stay
//    }
//  }
//
//  /**
//   * This function is the only place that starts the app, notably the app view and app router.
//   * It is called either by the main.js or by the UserWelcomeView.js
//   */
//  window.startApp = function(a, callback){
//    window.app = a;
//
//    // Create and display the AppView and its dependents
//    window.appView = new AppView({model: a});
//    window.appView.render();
//
//    // Start the Router
//    app.router = new AppRouter();
//    Backbone.history.start();
//
//    if(typeof callback == "function"){
//      if (OPrime.debugMode) OPrime.debug("Calling back the startApps callback");
//      callback();
//    }
//
//  };
//  loadFreshApp = function(){
//    if (OPrime.debugMode) OPrime.debug("Loading fresh app");
//    document.location.href='user.html';
//  };
//  /*
//   * End functions
//   */
//
//
//  /*
//   * Start the pub sub hub
//   */
//  window.hub = {};
//  OPrime.makePublisher(window.hub);
//
//  /*
//   * Catch ajax errors, and re-throw them using the OPrime function
//   * http://api.jquery.com/ajaxError/ mostly to catch pouch errors
//   */
////  $(document).ajaxError(function(e, xhr, settings, exception) {
////    OPrime.catchAndThrowAjaxError(e, xhr, settings, exception);
////  });
////
////  $(document).error(function(e, xhr, settings, exception) {
////    OPrime.catchAndThrowPouchError(e, xhr, settings, exception);
////  });
//
////  window.hub.subscribe("ajaxError",function(e){
////    if (OPrime.debugMode) OPrime.debug("Ajax Error. The user is probably not logged in to their couch. ", e);
////  }, this);
////
////  window.hub.subscribe("pouchError",function(e){
////    if (OPrime.debugMode) OPrime.debug("Pouch Error: ", e);
////  }, this);
//  /*
//   * For developers: to clear the app completely to test app load
//   * TODO this doesnt completely work any more because each corpus is in a different pouch.
//   */
////  Pouch.destroy('idb://db');
////  Pouch.destroy('idb://dbdefault');
////    Pouch.destroy('idb://dblingllama-firstcorpus');
////    localStorage.clear();
////  localStorage.removeItem("appids");
////  localStorage.removeItem("dbname");
//
//  /*
//   * Check for user's cookie and the dashboard so we can load it
//   */
//  var username = OPrime.getCookie("username");
//  //if(username == "lingllama"){
//  //  loadFreshApp();
//  //  return;
//  //}
//  if (username != null && username != "") {
////    alert("Welcome again " + username); //Dont need to tell them this anymore, it seems perfectly stable.
//    var appjson = localStorage.getItem("mostRecentDashboard");
//    appjson = JSON.parse(appjson);
//    if (appjson == null){
////      alert("We don't know what dashbaord to load for you. Please login and it should fix this problem.");
//      loadFreshApp();
//      return;
//    }else if (appjson.length < 3) {
////      alert("There was something inconsistent with your prevous dashboard. Please login and it should fix the problem.");
//      loadFreshApp();
//      return;
//    }else{
//      if (OPrime.debugMode) OPrime.debug("Loading app from localStorage");
//      var couchConnection = appjson.couchConnection;
//      var dbname = couchConnection.dbname;
//      if(couchConnection == "undefined" || couchConnection == undefined || couchConnection ==  null){
////        alert("We can't accurately guess which corpus to load. Please login and it should fix the problem.");
//        loadFreshApp();
//        return;
//      }else{
//        if(!localStorage.getItem("encryptedUser")){
////          alert("Your corpus is here, but your user details are missing. Please login and it should fix this problem.");
//
//          loadFreshApp();
//          return;
//        }else{
//          a = new App();
//          window.app = a;
//          var auth = a.get("authentication");
//          var u = localStorage.getItem("encryptedUser");
//          auth.loadEncryptedUser(u, function(success, errors){
//            if(success == null){
//              alert("We couldnt log you in."+errors.join("<br/>") + " " + OPrime.contactUs);
//              loadFreshApp();
//              return;
//            }else{
//              a.createAppBackboneObjects(dbname, function(){
//                window.startApp(a, function(){
//                  window.app.loadBackboneObjectsByIdAndSetAsCurrentDashboard(couchConnection, appjson);
//                });
//              });
//            }
//          });
//        }
//      }
//    }
//  } else {
//    //new user, let them register or login as themselves or lingllama
//    loadFreshApp();
// }
//
//
//});
