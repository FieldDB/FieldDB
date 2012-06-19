// Set the RequireJS configuration

require.config({
  baseUrl: "./../public",
  
  paths : {
      "use" : "libs/use",
      "text" : "libs/text",
      "jquery" : "libs/jquery",
      "hotkeys" : "libs/jquery.hotkeys",
      "underscore" : "libs/underscore",
      "backbone" : "libs/backbone",
      "modalview" : "libs/backbone.modaldialog",
      "handlebars" : "libs/handlebars-1.0.0.beta.6",
      "paginator" : "libs/backbone.paginator",
      "crypto" : "libs/Crypto_AES",
      "pouch" : "libs/pouch.alpha"

     // "jquery.couch" : "libs/jquery.couch"
  },
  use : {
      "underscore" : {
          attach : "_"
      },

      "backbone" : {
          deps : ["use!underscore", "jquery", "libs/backbone-pouchdb", "libs/backbone-couchdb"],
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
        deps : ["use!underscore", "use!backbone", "jquery", "libs/backbone-couchdb"],
        attach: "paginator"
      },
      
      "hotkeys":{
          deps : ["jquery"],
          attach: "hotkeys"
        },
        
      "modalview":{
              deps : ["use!backbone"],
              attach: "ModalView"
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
