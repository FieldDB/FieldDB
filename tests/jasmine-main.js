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
    "../tests/permission/PermissionTest"
], function() {
    // Standard Jasmine initialization
    (function() {
        var jasmineEnv = jasmine.getEnv();
        jasmineEnv.updateInterval = 1000;

        var reporter = new jasmine.TrivialReporter();

        jasmineEnv.addReporter(reporter);

        jasmineEnv.specFilter = function(spec) {
            return reporter.specFilter(spec);
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
