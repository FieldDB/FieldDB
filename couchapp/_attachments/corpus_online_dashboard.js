/* If they have an old link, redirect them */
if (window.location.origin.indexOf("ifielddevs.iriscouch.com") >= 0 ){
  var newTestingServerWithCORS = window.location.href.replace("ifielddevs.iriscouch.com", "corpusdev.lingsync.org");
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
    "app/App",  
    "backbone",
    "libs/webservicesconfig_devserver"
    ], function(
        App,
        forcingpouchtoloadearly
    ) {
  
  window.app = new App({filledWithDefaults: true});
});
