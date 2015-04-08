// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2014-09-22 using
// generator-karma 0.8.3

module.exports = function(config) {
  'use strict';

  config.set({

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'app/bower_components/jquery/dist/jquery.js',
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-animate/angular-animate.js',
      'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'app/bower_components/angular-contenteditable/angular-contenteditable.js',
      'app/bower_components/angular-cookies/angular-cookies.js',
      'app/bower_components/angular-sanitize/angular-sanitize.js',
      'app/bower_components/angular-touch/angular-touch.js',
      'app/bower_components/angular-ui-router/release/angular-ui-router.js',
      'app/bower_components/fielddb/fielddb.js',
      'app/bower_components/ng-file-upload/angular-file-upload.js',

      'app/bower_components/fielddb-angular/dist/scripts/fielddb-angular.js',
      'app/bower_components/fielddb-glosser/fielddb-glosser.js',

      'app/bower_components/angular-resource/angular-resource.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/d3/d3.js',
      'app/bower_components/underscore/underscore.js',
      'app/bower_components/q/q.js',
      'app/bower_components/sjcl/sjcl.js',

      'app/bower_components/angular-md5/angular-md5.js',
      'app/bower_components/angular-bootstrap/ui-bootstrap.js',

      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/scripts/**/*.js',
      // 'test/mock/**/*.js',
      'test/spec/**/*.js',

      //location of templates
      'app/views/**/*.html'
    ],

    preprocessors: {
      //location of templates
      'app/views/**/*.html': 'html2js'
    },

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      'PhantomJS'
    ],

    // Which plugins to enable
    plugins: [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-phantomjs-launcher',
      'karma-jasmine',
      'karma-ng-html2js-preprocessor'
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
