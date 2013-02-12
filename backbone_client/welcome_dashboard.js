// Set the RequireJS configuration
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
    "backbone" : "libs/backbone",
    "backbone_pouchdb" : "libs/backbone-pouchdb",
    "backbone_couchdb" : "libs/backbone-couchdb",
    "pouch" : "libs/pouch.alpha",
    "underscore" : "libs/underscore",

    "terminal" : "libs/terminal/terminal",

    "text" : "libs/text",

    "xml2json" : "libs/xml2json",

    "oprime" : "libs/OPrime",
    "webservicesconfig" : "libs/webservicesconfig_devserver"
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

    "crypto" : {
      exports : "CryptoJS"
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


// Initialization
require([
    "app/App",
    "user/User",
    "user/UserWelcomeView",
    "compiledTemplates",
    "backbone",
    "backbone_pouchdb",
    "libs/webservicesconfig_devserver",
    "libs/OPrime"
], function(
    App,
    User,
    UserWelcomeView,
    compiledTemplates,
    Backbone,
    forcingpouchtoloadonbackboneearly
) {
  /*
   * Helper functions
   */
  loadFreshApp = function(){
//    document.location.href='lingllama_corpus.html';

    if (OPrime.debugMode) OPrime.debug("Loading fresh app");
    // Create a UserWelcomeView modal
    var welcomeUserView = new UserWelcomeView();
    welcomeUserView.render();
    
    var modal_width = ($(document).width() * .8 );
    if(modal_width > 600){
      modal_width = 600;
    }
    var modal_height = ($(document).height() * .8 );
//    if(modal_height > 400){
//      modal_height = 400;
//    }
    
    $('#user-welcome-modal').modal({
      backdrop : true,
      keyboard : true
    }).css({
      'width' : function() {
        return modal_width + 'px';
      },
      'height' : function() {
        return modal_height + 'px';
      },
      'margin-left' : function() {
        return -($(this).width() * .5 );
      },
      'margin-top' : function() {
        return -($(this).height() * .5 );
      }
    });
    $('#user-welcome-modal').modal("show");
  };
  /*
   * End functions
   */
  
  /*
   * Start the pub sub hub
   */
  window.hub = {};
  OPrime.makePublisher(window.hub);
 
    
  /*
   * Check for user's cookie and the dashboard so we can load it
   */
  var username = OPrime.getCookie("username");
  if (username != null && username != "") {
//    alert("Welcome again " + username); //Dont need to tell them this anymore, it seems perfectly stable.
    var appjson = localStorage.getItem("mostRecentDashboard");
    appjson = JSON.parse(appjson);
    if (appjson == null){
//      alert("We don't know what corpus dashbaord to load for you. Please login and it should fix this problem.");
      document.location.href='user.html';
      return;
    }else if (appjson.length < 3) {
//      alert("There was something inconsistent with your prevous corpus dashboard. ");
      document.location.href='user.html';
      return;
    }else{
      if (OPrime.debugMode) OPrime.debug("Loading app from localStorage");
      var couchConnection = appjson.couchConnection;
      if(couchConnection == "undefined" || couchConnection == undefined || couchConnection ==  null){
//        alert("We can't accurately guess which corpus to load.");
        document.location.href='user.html';
        return;
      }else{
        if(!localStorage.getItem("encryptedUser")){
          alert("Your corpus is here, but your user details are missing. Please login and it should fix this problem.");
          OPrime.setCookie("username","");
          document.location.href='index.html';
          return;
        }else{
          a = new App({filledWithDefaults: true});
          window.app = a;
          var auth = a.get("authentication");
          var u = localStorage.getItem("encryptedUser");
          auth.loadEncryptedUser(u, function(success, errors){
            if(success == null){
              alert("We couldn't load your user."+errors.join("<br/>") + " " + OPrime.contactUs);  
              loadFreshApp();
              return;
            }else{
              document.location.href='corpus.html';
            }
          });
        }
      }
    }
  } else {
    //new user, let them register or login as themselves or lingllama
    loadFreshApp();

 }
  
  
});
