// Set the RequireJS configuration
require.config({
    baseUrl: "./../public",
    
    paths : {
        "use" : "libs/use",
        "text" : "libs/text",
        "jquery" : "libs/jquery",
        "underscore" : "libs/underscore",
        "backbone" : "libs/backbone",
        "handlebars" : "libs/handlebars-1.0.0.beta.6"
    },
    use : {
        "underscore" : {
            attach : "_"
        },

        "backbone" : {
            deps : ["use!underscore", "jquery"],
            attach : function(_, $) {
                return Backbone;
            }
        },

        "handlebars" : {
            attach : "Handlebars"
        }
    }
});

// Run the tests!
require([
    // Put all your tests here. Otherwise they won't run
    "../tests/datum_menu/DatumMenuTest",
    "../tests/datum/DatumTest"
   // "../tests/permission/PermissionTest"
//    "../tests/informant/InformantTest"
], function() {
    // Standard Jasmine initialization
    (function() {
        var jasmineEnv = jasmine.getEnv();
        jasmineEnv.updateInterval = 1000;

        // Decent HTML output for local testing
        var trivialReporter = new jasmine.TrivialReporter();
        jasmineEnv.addReporter(trivialReporter);
        
        // JUnit-formatted output for Jenkins
        var junitReporter = new jasmine.JUnitXmlReporter();
        jasmineEnv.addReporter(junitReporter);
        
        // Output to console.log, just to make sure multiple reporters work
        var consoleReporter = new jasmine.ConsoleReporter();
        jasmineEnv.addReporter(consoleReporter);

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
