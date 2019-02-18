"use strict";

//Set the RequireJS configuration
require.config({
  baseUrl: "",

  paths: {
    "jasmine": ["test/bower_components/jasmine/lib/jasmine-core/jasmine"],
    "jasmine-html": ["test/bower_components/jasmine/lib/jasmine-core/jasmine-html"],
    "jasmine-boot": ["test/bower_components/jasmine/lib/jasmine-core/boot"],

    "sinon": "test/bower_components/sinon-1.17.2/index",

    /* Additional matchers for testing jquery */
    "jasmine-jquery": "test/bower_components/jasmine-jquery/lib/jasmine-jquery",

    /* Additional Jasmine runner files for XML and console output */
    "JUnitReporter": "test/libs/jasmine-reporters/src/jasmine.junit_reporter",
    "ConsoleReporter": "test/libs/jasmine-reporters/src/jasmine.console_reporter",
    "TerminalReporter": "test/libs/jasmine-reporters/src/jasmine.terminal_reporter",

    /*  Bootstrap kills click events in jquery, so dont include in tests */
    "bootstrap": "libs/bootstrap/js/bootstrap.min",

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

    "jasmine-jquery": {
      deps: ["jquery","jasmine-html"]
    },

    "xml2json": {
      deps: ["jquery"],
      exports: "X2JS"
    },

    "wikitext": {
      deps: ["jquery"],
      exports: "jquery"
    },

    "FieldDB": {
      exports: "FieldDB"
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

  /* Test dependancies, only run these once in a while */
  "test/libs/backbone/BackboneModelTest",
  "test/libs/backbone/BackboneCouchdbTest",
  "test/libs/backbone/JQueryTest",

  /* Test DOM manipulation, only run these (199 tests) once in a while */
  "test/libs/backbone/jasmine-jquery-spec",

  "app/AppTest",
  "activity/ActivityTest",
  "authentication/AuthenticationTest",
  "comment/CommentTest",
  "confidentiality_encryption/ConfidentialTest",
  "corpus/CorpusTest",
  "datum/DatumTest",
  "datum/DatumTagTest",
  "datum/DatumStatusTest",
  "datum/DatumsTest",
  "data_list/DataListTest",
  "export/ExportTest",
  "glosser/GlosserTest",
  "glosser/LexiconTest",
  "hotkey/HotKeyTest",
  "import/ImportTest",
  "insert_unicode/InsertUnicodeTest",
  "permission/PermissionTest",
  "search/SearchTest",
  "datum/SessionTest",
  "user/UserGenericTest",
  "user/UserTest",
  "user/TeamTest",
  "user/SpeakerTest",
  "user/BotTest",
  "user/UserPreferenceTest",

  // "JUnitReporter",
  // "ConsoleReporter",
  // "TerminalReporter",
  "OPrime"
], function(
  causing_jasmine_boot_to_load,
  PlayerSpec,
  RequireTest,
  BackboneModelTest,
  BackboneCouchdbTest,
  JQueryTest,
  JasmineJqueryTest,
  AppTest,
  ActivityTest,
  AuthenticationTest,
  CommentTest,
  ConfidentialTest,
  CorpusTest,
  DatumTest,
  DatumTagTest,
  DatumStatusTest,
  DatumsTest,
  DataListTest,
  ExportTest,
  GlosserTest,
  LexiconTest,
  HotKeyTest,
  ImportTest,
  InsertUnicodeTest,
  PermissionTest,
  SearchTest,
  SessionTest,
  UserGenericTest,
  UserTest,
  TeamTest,
  SpeakerTest,
  BotTest,
  UserPreferenceTest
) {
  OPrime.debugMode = true;
  FieldDB.Connection.otherwise = 'production';

  // Run the Describe functions
  RequireTest.describe();
  PlayerSpec.describe();
  BackboneModelTest.describe();
  BackboneCouchdbTest.describe();
  JQueryTest.describe();
  // JasmineJqueryTest.describe();

  AppTest.describe();
  ActivityTest.describe();
  AuthenticationTest.describe();
  CommentTest.describe();
  ConfidentialTest.describe();
  CorpusTest.describe();
  DatumTest.describe();
  DatumTagTest.describe();
  DatumStatusTest.describe();
  DatumsTest.describe();
  DataListTest.describe();
  ExportTest.describe();
  GlosserTest.describe();
  LexiconTest.describe();
  HotKeyTest.describe();
  ImportTest.describe();
  InsertUnicodeTest.describe();
  PermissionTest.describe();
  SearchTest.describe();
  SessionTest.describe();

  UserGenericTest.describe();
  UserTest.describe();
  TeamTest.describe();
  SpeakerTest.describe();
  BotTest.describe();
  UserPreferenceTest.describe();

  // Trigger Jasmine (provided by jasmine-boot)
  window.onload();
});
