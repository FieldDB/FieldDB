// Set the RequireJS configuration
require.config({
    baseUrl: "./../public",
    
    paths : {
        "use" : "libs/use",
   //     "jasmine-jquery-spec": "jasmine-jquery-spec",
        "sinon":"./tests/sinon",
        "text" : "libs/text",
        "jquery" : "libs/jquery",
        "underscore" : "libs/underscore",
        "backbone" : "libs/backbone",
        "handlebars" : "libs/handlebars-1.0.0.beta.6",
        "crypto" : "libs/Crypto_AES",
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
        },
        "crypto" :{
        	attach: "CryptoJS"
        }
    }
});

// Run the tests!
require([
    // Put all your tests here. Otherwise they won't run
//   "../tests/confidentiality_encryption/ConfidentialTest",
 //  "../tests/datum_menu/DatumMenuTest",
 //  "../tests/user_generic/UserGenericTest",
//    "../tests/permission/PermissionTest",
 //   "../tests/datum/DatumCollectionTest",
//   "../tests/data_list/DataListTest",
//    "../tests/datum/DatumTest",
 //   "../tests/informant/InformantTest",
 //   "../tests/dashboard/DashboardTest",
    "../tests/datum_menu/DatumMenuViewTest"
], function() {
    // Standard Jasmine initialization
    (function() {
        var jasmineEnv = jasmine.getEnv();
        jasmineEnv.up  
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
