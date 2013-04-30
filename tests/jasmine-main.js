//Set the RequireJS configuration

require.config({
  baseUrl : "../backbone_client/",

  paths : {
    "jasmine" : "../tests/libs/jasmine/jasmine",
    "jasmine-html" : "../tests/libs/jasmine/jasmine-html",
    /* Tests to ensure jasmine is running */
    "Player" : "../tests/libs/jasmine/src/Player",
    "Song" : "../tests/libs/jasmine/src/Song",
    "PlayerSpec" : "../tests/libs/jasmine/spec/PlayerSpec",
    "SpecHelper" : "../tests/libs/jasmine/spec/SpecHelper",

    "sinon" : "../tests/libs/sinon/sinon",

    /* load Backbone dependencies */
    "handlebars" : "libs/handlebars.runtime",
    "compiledTemplates" : "libs/compiled_handlebars",
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
    "jasmine-html" : {
      deps : [ "jasmine" ],
      exports : "jasmine"
    },
    "SpecHelper" : {
      deps : [ "jasmine-html" ],
      exports : "jasmine"
    },
    "PlayerSpec" : {
      deps : [ "SpecHelper", "Player", "Song" ],
      exports : "PlayerSpec"
    },
    "sinon" : {
      deps : [ "jasmine-html" ],
      exports : "sinon"
    },

    /* Shim Backbone dependencies for use in require statements */
    "jquery-couch" : {
      deps : [ "$" ],
      exports : "$"
    },
    "backbonejs" : {
      deps : [ "_", "$", "OPrime" ],
      exports : "Backbone"
    },
    "handlebars" : {
      deps : [ "backbonejs", "$" ],
      exports : "Handlebars"
    },
    "compiledTemplates" : {
      deps : [ "handlebars" ],
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
      deps : [ "jasmine-html", "$" ],
      exports : "jasmine"
    },
    "jasmine-ajax" : {
      deps : [ "jasmine-jquery", "jasmine-html", "$" ],
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
require([ "jasmine-html", "backbone", "compiledTemplates",
/*
 * For some mysterious reason as yet unknown to us, these tests need to run
 * (first), or no FieldDB tests will run
 */
"PlayerSpec", "../tests/libs/backbone/JQueryTest",
/* FieldDB tests */
"../tests/app/AppTest", "../tests/activity/ActivityTest",
    "../tests/authentication/AuthenticationTest",
    "../tests/comment/CommentTest",
    "../tests/confidentiality_encryption/ConfidentialTest",
    // "../tests/corpus/CorpusTest",
    "../tests/export/ExportTest", "../tests/glosser/GlosserTest",
    "../tests/hotkey/HotKeyTest",
// "../tests/import/ImportTest",

/* Test dependancies, only run these once in a while */
// "../tests/libs/backbone/BackboneModelTest",
// "../tests/libs/backbone/BackboneCouchdbTest",
/* Test DOM manipulation, only run these (199 tests) once in a while */
// "jasmine-jquery-spec"
], function(jasmine, Backbone) {

  OPrime.debugMode = true;

  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.updateInterval = 1000;

  var htmlReporter = new jasmine.HtmlReporter();

  jasmineEnv.addReporter(htmlReporter);

  jasmineEnv.specFilter = function(spec) {
    return htmlReporter.specFilter(spec);
  };

  jasmineEnv.execute();

});
