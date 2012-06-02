// Set the RequireJS configuration
require.config({
    baseUrl: "./../public",
    
    paths : {
        "use" : "libs/use",
        "text" : "libs/text",
        "jquery" : "libs/jquery",
        "underscore" : "libs/underscore",
        "backbone" : "libs/backbone",
        "handlebars" : "libs/handlebars-1.0.0.beta.6",
        "crypto" : "libs/Crypto_AES",
        "sinon" : "./../tests/sinon"
    },
    use : {
        "underscore" : {
            attach : "_"
        },
        "sinon" :{
        	attach: "sinon"
        },

        "backbone" : {
            deps : ["use!underscore", "jquery", "sinon"],
            attach : function(_, $, sinon) {
                return Backbone;
            }
        },
        "handlebars" : {
            attach : "Handlebars"
        },
        "crypto" :{
        	attach: "CryptoJS"
        }
    }
});

// Run the tests!
require([
    // Put all your tests here. Otherwise they won't run


   "../tests/confidentiality_encryption/ConfidentialTest",
   "../tests/user_generic/UserGenericTest",
   "../tests/user/UserTest",
   "../tests/permission/PermissionTest",
    "../tests/datum/DatumsTest",
   "../tests/data_list/DataListTest",
    "../tests/datum/DatumTest",
    "../tests/informant/InformantTest",
    "../tests/authentication/AuthenticationTest",
    "../tests/activity_feed/ActivityFeedTest",
    "../tests/activity_feed/ActivityFeedViewTest",
    "../tests/lexicon/LexiconTest",
    "../tests/dashboard/DashboardTest",
    "../tests/SinonTest"
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
