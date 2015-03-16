//Set the RequireJS configuration

// require.config({
//   baseUrl : "../api",

//   paths : {
//     "jasmine" : "../tests/libs/jasmine/jasmine",
//     "jasmine-html" : "../tests/libs/jasmine/jasmine-html",

//     /* Tests to ensure jasmine is running */
//     "../../backbone_client/libs/OPrime" : "../backbone_client/libs/OPrime",
//     // "Song" : "../tests/libs/jasmine/src/Song",
//     "PlayerSpec" : "../tests/libs/jasmine/spec/PlayerSpec",
//     "SpecHelper" : "../tests/libs/jasmine/spec/SpecHelper",

//     "sinon" : "../tests/libs/sinon/sinon",

//     /* Additional Jasmine runner files for XML and console output */
//     "JUnitReporter" : "../tests/libs/jasmine-reporters/src/jasmine.junit_reporter",
//     "ConsoleReporter" : "../tests/libs/jasmine-reporters/src/jasmine.console_reporter",
//     "TerminalReporter" : "../tests/libs/jasmine-reporters/src/jasmine.terminal_reporter"

//   },
//   shim: {
//     "jasmine-html": {
//       deps: ["jasmine", "../../backbone_client/libs/OPrime"],
//       exports: "jasmine"
//     },
//     "SpecHelper": {
//       deps: ["jasmine-html"],
//       exports: "jasmine"
//     },

//     // "PlayerSpec": {
//     //   deps: ["SpecHelper", "Player", "Song"],
//     //   exports: "PlayerSpec"
//     // },
//     "JUnitReporter": {
//       deps: ["jasmine-html"],
//       exports: "jasmine"
//     },
//      "ConsoleReporter": {
//       deps: ["jasmine-html"],
//       exports: "jasmine"
//     },
//      "TerminalReporter": {
//       deps: ["jasmine-html"],
//       exports: "jasmine"
//     },
//     "sinon": {
//       deps: ["jasmine-html"],
//       exports: "sinon"
//     }

//   }

// });
// /*
//  * Initialize Jasmine, and run the tests
//  */
// require([ 
// /*
//  * For some mysterious reason as yet unknown to us, these tests need to run
//  * (first), or no FieldDB tests will run
//  */
//           "SpecHelper", 
//           // "OPrime",
          
//     /* FieldDB tests */
//     // "../tests/activity/ActivityTest",
//     "../../backbone_client/libs/OPrime",
//     "../tests/app/AppTest",


//     /* Test dependancies, only run these once in a while */

//     "JUnitReporter" , "ConsoleReporter", "TerminalReporter"], function() {
  


  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.updateInterval = 1000;

  if (/PhantomJS/.test(navigator.userAgent)) {
    jasmineEnv.addReporter(new jasmine.TrivialReporter());
    jasmineEnv.addReporter(new jasmine.JUnitXmlReporter());
  } else {
    var htmlReporter = new jasmine.HtmlReporter();

    jasmineEnv.addReporter(htmlReporter);

    jasmineEnv.specFilter = function(spec) {
      return htmlReporter.specFilter(spec);
    };
   jasmineEnv.addReporter(new jasmine.TrivialReporter());
   // jasmineEnv.addReporter(new jasmine.ConsoleReporter());
   // jasmineEnv.addReporter(new jasmine.TerminalReporter());
   // jasmineEnv.addReporter(new jasmine.JUnitXmlReporter());
  }

  jasmineEnv.execute();

// });
