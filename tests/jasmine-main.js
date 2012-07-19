// Set the RequireJS configuration

require.config({
  baseUrl: "./../public",
  
  paths : {
    "text" : "libs/text",
    "jquery" : "libs/jquery",
    "hotkeys" : "libs/jquery.hotkeys",
    "terminal" : "libs/terminal/terminal",
    "underscore" : "libs/underscore",
    "backbone" : "libs/backbone",
    "handlebars" : "libs/handlebars.runtime",
    "compiledTemplates" : "libs/compiled_handlebars",
    "crypto" : "libs/Crypto_AES",
    "pouch" : "libs/pouch.alpha",
    "backbone_pouchdb" : "libs/backbone-pouchdb",
    "backbone_couchdb" : "libs/backbone-couchdb",
    "bootstrap" : "bootstrap/js/bootstrap",
    "bootstrap-transition" : "bootstrap/js/bootstrap-transition",
    "bootstrap-alert" : "bootstrap/js/bootstrap-alert",
    "bootstrap-modal" : "bootstrap/js/bootstrap-modal",
    "bootstrap-dropdown" : "bootstrap/js/bootstrap-dropdown",
    "bootstrap-scrollspy" : "bootstrap/js/bootstrap-scrollspy",
    "bootstrap-tab" : "bootstrap/js/bootstrap-tab",
    "bootstrap-tooltip" : "bootstrap/js/bootstrap-tooltip",
    "bootstrap-popover" : "bootstrap/js/bootstrap-popover",
    "bootstrap-button" : "bootstrap/js/bootstrap-button",
    "bootstrap-collapse" : "bootstrap/js/bootstrap-collapse",
    "bootstrap-carousel" : "bootstrap/js/bootstrap-carousel",
    "bootstrap-typeahead" : "bootstrap/js/bootstrap-typeahead"

     // "jquery.couch" : "libs/jquery.couch"
  },
  shim : {
    "underscore" : {
      exports : "_"
    },
    
    "jquery" : {
      exports : "$"
    },

    "bootstrap" :{
      deps : [ "jquery" ],
      exports : function($) {
        return $;
      }
    },
    
    "bootstrap-typeahead" :{
      deps : [ "jquery", "bootstrap","bootstrap-transition", "bootstrap-alert",
          "bootstrap-modal", "bootstrap-dropdown", "bootstrap-scrollspy",
          "bootstrap-tab", "bootstrap-tooltip", "bootstrap-popover",
          "bootstrap-button", "bootstrap-collapse", "bootstrap-carousel"
           ],
      exports : function($) {
        return $;
      }
    },
    
    "pouch" :{
      exports: "Pouch"
    },

    "backbone" : {
      deps : [ "underscore", "jquery", "compiledTemplates" ],
      exports : function(_, $) {
        return Backbone;
      }
    },
    "backbone_pouchdb" :{
      deps : ["backbone", "pouch", "backbone_couchdb"],
      exports : function(Backbone, Pouch, backbone_couchdb) {
        return Backbone;
      }
    },
    
    "backbone_couchdb" :{
      deps : ["backbone", "pouch"],
      exports : function(Backbone, Pouch) {
        return Backbone;
      }
    },

    "handlebars" : {
      deps : ["bootstrap","jquery"],
      exports : "Handlebars"
    },

    "crypto" : {
      exports : "CryptoJS"
    },

    "compiledTemplates" : {
      deps : [ "handlebars" ],
      exports : function(Handlebars) {
        return Handlebars;
      }
    },
    "terminal" : {
      deps : ["bootstrap","jquery"],
      exports : "Terminal"
    }
    
  }
});
// Run the tests!
require([
    // Put all your tests here. Otherwise they won't run
    "../tests/activity/ActivityTest",
    "../tests/authentication/AuthenticationTest",
    "../tests/comment/CommentTest",
   "../tests/confidentiality_encryption/ConfidentialTest", 
   "../tests/corpus/CorpusTest",
// "../tests/dashboard/DashboardTest",
   "../tests/data_list/DataListTest",
   "../tests/datum/DatumTest",
   "../tests/export/ExportTest",
   "../tests/glosser/GlosserTest",
   "../tests/hotkey/HotKeyTest",
   "../tests/import/ImportTest",
   "../tests/insert_unicode/InsertUnicodeTest",
   "../tests/lexicon/LexiconTest",
   "../tests/permission/PermissionTest",
   "../tests/user/UserPreferenceTest",
   "../tests/search/SearchTest",
  "../tests/session/SessionTest",
   "../tests/user/UserGenericTest",


], function() {
    // Standard Jasmine initialization
    (function() {
        var jasmineEnv = jasmine.getEnv();
        jasmineEnv.up  ,
        dateInterval = 1000;

        // Decent HTML output for local testing
        var trivialReporter = new jasmine.TrivialReporter();
        jasmineEnv.addReporter(trivialReporter);
        
        // JUnit-formatted output for Jenkins
        var junitReporter = new jasmine.PhantomJSReporter();
        jasmineEnv.addReporter(junitReporter);

        jasmineEnv.specFilter = function(spec) {
            return trivialReporter.specFilter(spec);
        };

        var currentWindowOnload = window.onload;

        window.onload = function() {
            if(currentWindowOnload) {
                currentWindowOnload();
            }
            execJasmine();
        };

        function execJasmine() {
            jasmineEnv.execute();
        }
    })();
});
