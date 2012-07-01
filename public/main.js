// Set the RequireJS configuration
require.config({
  paths : {
    "use" : "libs/use",
    "text" : "libs/text",
    "jquery" : "libs/jquery",
    "hotkeys" : "libs/jquery.hotkeys",
    "terminal" : "libs/terminal/terminal",
    "underscore" : "libs/underscore",
    "backbone" : "libs/backbone",
    "handlebars" : "libs/handlebars-1.0.0.beta.6",
    "paginator" : "libs/backbone.paginator",
    "crypto" : "libs/Crypto_AES",
    "pouch" : "libs/pouch.alpha"  
  },
  use : {
    "underscore" : {
      attach : "_"
    },

    "backbone" : {
      deps : ["use!underscore", "jquery", "pouch", "libs/backbone-pouchdb", "libs/backbone-couchdb"],
      attach : function(_, $) {
        return Backbone;
      }
    },

    "handlebars" : {
      attach: "Handlebars"
    },
    
    "crypto" :{
    	attach: "CryptoJS"
    },
    
    "paginator":{
      deps : ["use!underscore", "use!backbone", "jquery"],
      attach: "Paginator"
    },

    "hotkeys":{
        deps : ["jquery"],
        attach: "hotkeys"
      },
      
     "terminal":{
       attach: "Terminal"
      }
    
  }
});

// Initialization
require([
    "app/App",
    "app/AppView",
    "app/AppRouter",
    "use!terminal",
    "corpus/Corpus",
    "data_list/DataList",
    "datum/Datum",
    "datum/Session",
    "user/User",
    "user/UserWelcomeView",
    "libs/Utils"
], function(
    App,
    AppView,
    AppRouter,
    Terminal,
    Corpus,
    DataList,
    Datum,
    Session,
    User,
    UserWelcomeView
) {
  window.loadApp= function(a, callback){
    if (a == null){
      a = new App();
      var u = new User();
      var c = new Corpus();
      a.set("corpus", c);

      var s = new Session({
        sessionFields : a.get("corpus").get("sessionFields").clone()
      });
      a.set("currentSession", s);

      var dl = new DataList();
      a.set("currentDataList", dl);
      a.get("authentication").set("user",u);
    }
    window.app = a;

    // Create and display the AppView
    window.appView = new AppView({model: a}); 
    window.appView.render();
    
    // Start the Router
    app.router = new AppRouter();
    Backbone.history.start();
    
    if(typeof callback == "function"){
      callback();
    }
    
  };
  // Load the App from localStorage
  var appjson = localStorage.getItem("appids");
  if (appjson) {
    Utils.debug("Loading app from localStorage");
    appjson = JSON.parse(appjson);
    //TODO test this
    a = new App(); 
    var u = new User();
    u.id = appjson.userid;
    u.fetch();
    
    var c = new Corpus();
    c.id = appjson.corpusid;
    c.fetch();
    a.set("corpus", c);
    
    var s = new Session();
    s.id = appjson.sessionid;
    s.fetch();
    a.set("currentSession", s);

    var dl = new DataList();
    dl.id = appjson.datalistid;
    dl.fetch();
    a.set("currentDataList", dl);
    
    a.get("authentication").set("user",u);
    window.loadApp(a);
    
  } else {
    Utils.debug("Loading fresh app");
    // Create a UserWelcomeView modal
    welcomeUserView = new UserWelcomeView();
    welcomeUserView.render();
    $('#user-welcome-modal').modal("show");
  }
  
});
