//Set the RequireJS configuration

require.config({
  baseUrl : "../backbone_client/",

  paths : {
    // "jasmine" : "../tests/libs/jasmine/jasmine",
    // "jasmine-html" : "../tests/libs/jasmine/jasmine-html",
    /* Tests to ensure jasmine is running */
    "Player" : "../tests/libs/jasmine/src/Player",
    "Song" : "../tests/libs/jasmine/src/Song",
    "PlayerSpec" : "../tests/libs/jasmine/spec/PlayerSpec",
    "SpecHelper" : "../tests/libs/jasmine/spec/SpecHelper",

    "sinon" : "../tests/libs/sinon/sinon",

    /* Additional Jasmine runner files for XML and console output */
    "JUnitReporter" : "../tests/libs/jasmine-reporters/src/jasmine.junit_reporter",
    "ConsoleReporter" : "../tests/libs/jasmine-reporters/src/jasmine.console_reporter",
    "TerminalReporter" : "../tests/libs/jasmine-reporters/src/jasmine.terminal_reporter",

    /* load Backbone dependencies */
    "handlebarsjs" : "libs/handlebars.runtime",
    "handlebars" : "libs/compiled_handlebars",
    "$" : "libs/jquery",
    "_" : "libs/underscore",
    "backbonejs" : "libs/backbone",
    "jquery-couch" : "libs/backbone_couchdb/jquery.couch",
    "backbone" : "libs/backbone_couchdb/backbone-couchdb",

    /* load FieldDB dependencies */
    "text" : "libs/text",
    "CryptoJS" : "libs/Crypto_AES",
    "terminal" : "libs/terminal/terminal",
    "xml2json" : "libs/xml2json",
    "oprime" : "libs/OPrime",
    "OPrime" : "libs/webservicesconfig_devserver",
    // Bootstrap kills click events in jquery, so dont include in tests
    // "bootstrap" : "libs/bootstrap/js/bootstrap.min",

    /* load tests for dependencies */
    "jasmine-jquery" : "../tests/libs/backbone/jasmine-jquery",
    "jasmine-ajax" : "../tests/libs/backbone/mock-ajax",
    "jasmine-jquery-spec" : "../tests/libs/backbone/jasmine-jquery-spec",

  },
  shim : {
    // "jasmine-html" : {
    // deps : [ "jasmine" ],
    // exports : "jasmine"
    // },
    // "SpecHelper" : {
    // deps : [ "jasmine-html" ],
    // exports : "jasmine"
    // },

    "PlayerSpec" : {
      deps : [ "SpecHelper", "Player", "Song" ],
      exports : "PlayerSpec"
    },
//     "JUnitReporter" : {
//     deps : [ "jasmine-html" ],
//     exports : "jasmine"
//     },
    // "sinon" : {
    // deps : [ "jasmine-html" ],
    // exports : "sinon"
    // },

    /* Shim Backbone dependencies for use in require statements */
    "jquery-couch" : {
      deps : [ "$" ],
      exports : "$"
    },
    "backbonejs" : {
      deps : [ "_", "$", "OPrime" ],
      exports : "Backbone"
    },
    "handlebarsjs" : {
      deps : [ "backbonejs", "$" ],
      exports : "Handlebars"
    },
    "handlebars" : {
      deps : [ "handlebarsjs" ],
      exports : "Handlebars"
    },
    "backbone" : {
      deps : [ "backbonejs", "jquery-couch" ],
      exports : "Backbone"
    },

    /* Shim FieldDB dependencies for use in require statements */
    "xml2json" : {
      deps : [ "$" ],
      exports : "X2JS"
    },
    "OPrime" : {
      deps : [ "oprime" ],
      exports : "OPrime"
    },
    "terminal" : {
      deps : [ "$" ],
      exports : "Terminal"
    },

    /* Shim jquery test dependencies to get them to load in the right order */
    "jasmine-jquery" : {
      deps : [ "$" ],
      exports : "jasmine"
    },
    "jasmine-ajax" : {
      deps : [ "jasmine-jquery", "$" ],
      exports : "jasmine"
    },
    "jasmine-jquery-spec" : {
      deps : [ "jasmine-ajax" ],
      exports : "jasmine"
    },
  }

});
/*
 * Initialize Jasmine, and run the tests
 */
require([ //"handlebars",
          "OPrime",
/*
 * For some mysterious reason as yet unknown to us, these tests need to run
 * (first), or no FieldDB tests will run
 */
          "PlayerSpec", 
          "../tests/libs/jasmine/spec/AsyncSpec", 
//    "../tests/libs/backbone/JQueryTest",

    /* FieldDB tests */
//          "../tests/audioVideo/AudioWebServiceTest", 

	"../tests/app/AppTest", 
	"../tests/activity/ActivityTest",
	"../tests/authentication/AuthenticationTest",
    "../tests/comment/CommentTest",
    "../tests/confidentiality_encryption/ConfidentialTest",
    "../tests/corpus/CorpusTest", 
//    "../tests/corpus/CorpusWebServiceTest", 
    "../tests/export/ExportTest",
    "../tests/glosser/GlosserTest", 
    "../tests/hotkey/HotKeyTest",
    "../tests/import/ImportTest", 
    "../tests/insert_unicode/InsertUnicodeTest",
    "../tests/lexicon/LexiconTest", 
    "../tests/permission/PermissionTest",
    "../tests/search/SearchTest", 
    "../tests/datum/SessionTest",
    "../tests/user/UserTest",

    /* Test dependancies, only run these once in a while */
//    "../tests/libs/backbone/BackboneModelTest",
//    "../tests/libs/backbone/BackboneCouchdbTest",

    /* Test DOM manipulation, only run these (199 tests) once in a while */
//    "jasmine-jquery-spec",
    "JUnitReporter" , "ConsoleReporter", "TerminalReporter"], function() {
  

  OPrime.debugMode = false;

  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.updateInterval = 1000;

  if (/PhantomJS/.test(navigator.userAgent)) {
    jasmineEnv.addReporter(new jasmine.TrivialReporter());
//    jasmineEnv.addReporter(new jasmine.ConsoleReporter());
//    jasmineEnv.addReporter(new jasmine.TerminalReporter());
    jasmineEnv.addReporter(new jasmine.JUnitXmlReporter());
  } else {
    var htmlReporter = new jasmine.HtmlReporter();

    jasmineEnv.addReporter(htmlReporter);

    jasmineEnv.specFilter = function(spec) {
      return htmlReporter.specFilter(spec);
    };
//    jasmineEnv.addReporter(new jasmine.TrivialReporter());
////    jasmineEnv.addReporter(new jasmine.ConsoleReporter());
////    jasmineEnv.addReporter(new jasmine.TerminalReporter());
//    jasmineEnv.addReporter(new jasmine.JUnitXmlReporter());
  }

  jasmineEnv.execute();

});
