"use strict";

//Set the RequireJS configuration
require.config({
  baseUrl: "",

  paths: {
    'jasmine': ['test/bower_components/jasmine/lib/jasmine-core/jasmine'],
    'jasmine-html': ['test/bower_components/jasmine/lib/jasmine-core/jasmine-html'],
    'jasmine-boot': ['test/bower_components/jasmine/lib/jasmine-core/boot'],

    "sinon": "test/bower_components/sinon-1.17.2/index",

    /* Additional Jasmine runner files for XML and console output */
    "JUnitReporter": "test/libs/jasmine-reporters/src/jasmine.junit_reporter",
    "ConsoleReporter": "test/libs/jasmine-reporters/src/jasmine.console_reporter",
    "TerminalReporter": "test/libs/jasmine-reporters/src/jasmine.terminal_reporter",

    /*  Bootstrap kills click events in jquery, so dont include in tests */
    // "bootstrap": "libs/bootstrap/js/bootstrap.min",

    "CryptoJS": "libs/Crypto_AES",

    /* jQuery and jQuery plugins */
    "jquery": "bower_components/jquery/dist/jquery",
    "wikitext": "libs/jquery-wikitext",

    /* Handlebars html templating libraries and compiled templates */
    "handlebars.runtime": "bower_components/handlebars/handlebars.runtime.amd",

    /* Backbone Model View Controller framework and its plugins and dependencies */
    "_": "bower_components/underscore/underscore",
    "underscore": "bower_components/underscore/underscore",
    "backbone": "bower_components/backbone/backbone",
    "jquerycouch": "libs/backbone_couchdb/jquery.couch",

    "terminal": "libs/terminal/terminal",

    "text": "libs/text",

    "xml2json": "libs/xml2json",

    "FieldDB": "bower_components/fielddb/fielddb",
    "oprime": "libs/OPrime",
    "OPrime": "libs/webservicesconfig_devserver"

    /* load tests for dependencies */
    // "jasmine-jquery": "test/libs/backbone/jasmine-jquery",
    // "jasmine-ajax": "test/libs/backbone/mock-ajax",
    // "jasmine-jquery-spec": "test/libs/backbone/jasmine-jquery-spec",
  },
  shim: {
    'jasmine-html': {
      deps: ['jasmine']
    },

    'jasmine-boot': {
      deps: ['jasmine', 'jasmine-html']
    },

    "JUnitReporter": {
      deps: ["jasmine-html"],
      exports: "jasmine"
    },

    "sinon": {
      deps: ["jasmine-html"],
      exports: "sinon"
    },

    "xml2json": {
      deps: ["jquery"],
      exports: "X2JS"
    },

    "wikitext": {
      deps: ["jquery"],
      exports: "jquery"
    },

    "OPrime": {
      deps: ["oprime"],
      exports: "OPrime"
    },

    "jquerycouch": {
      deps: ["wikitext"],
      exports: "jquery"
    },

    "bootstrap": {
      deps: ["jquerycouch"],
      exports: "bootstrap"
    },

    "handlebars.runtime": {
      deps: ["backbone", "jquery"],
      exports: "Handlebars"
    },

    "terminal": {
      deps: ["bootstrap", "jquery"],
      exports: "Terminal"
    }
  }
});

/*
 * Run the tests
 */
require([
  'jasmine-boot',

  /* Tests to ensure jasmine is running */
  "test/libs/require/RequireTest",
  "test/libs/jasmine/spec/PlayerSpec",
  "test/libs/backbone/BackboneModelTest",
  // "test/libs/backbone/JQueryTest",

  /* FieldDB tests */
  //          "../tests/audioVideo/AudioWebServiceTest",

  // "app/AppTest",
  // "activity/ActivityTest",
  // "authentication/AuthenticationTest",
  // "comment/CommentTest",
  // "confidentiality_encryption/ConfidentialTest",
  // "corpus/CorpusTest",
  // //    "corpus/CorpusWebServiceTest",
  // "export/ExportTest",
  // "glosser/GlosserTest",
  // "hotkey/HotKeyTest",
  // "import/ImportTest",
  // "insert_unicode/InsertUnicodeTest",
  // "permission/PermissionTest",
  // "search/SearchTest",
  // "datum/SessionTest",
  // "user/UserTest",

  /* Test dependancies, only run these once in a while */
  //    "test/libs/backbone/BackboneModelTest",
  //    "test/libs/backbone/BackboneCouchdbTest",

  /* Test DOM manipulation, only run these (199 tests) once in a while */
  //    "jasmine-jquery-spec",
  // "JUnitReporter",
  // "ConsoleReporter",
  // "TerminalReporter",
  "OPrime"
], function(
  causing_jasmine_boot_to_load,
  PlayerSpec,
  RequireTest,
  BackboneModelTest
) {

  OPrime.debugMode = true;

  // Run the Describe functions
  RequireTest.describe();
  PlayerSpec.describe();
  BackboneModelTest.describe();

  // Trigger Jasmine (provided by jasmine-boot)
  window.onload();
});
