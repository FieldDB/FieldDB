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


// Initialization
require([
    "app/App",
    "user/User",
    "user/UserWelcomeView",
    "compiledTemplates",
    "backbone",
    "libs/webservicesconfig_devserver",
    "libs/OPrime"
], function(
    App,
    User,
    UserWelcomeView,
    compiledTemplates,
    Backbone
) {
  try{
    var pouchName = window.location.pathname.substring(1,window.location.pathname.replace(/^\//,"").indexOf("/")+1);
    Backbone.couch_connector.config.db_name = pouchName;
  }catch(e){
    OPrime.debug("Couldn't set the databse name off of the url.");
  }
  
  /*
   * Helper functions
   */
  loadFreshApp = function(){
//    document.location.href='lingllama_corpus.html';

    OPrime.debug("Loading fresh app");
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
      OPrime.debug("Loading app from localStorage");
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
