// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html
'use strict';

module.exports = function(config) {

  var configuration = {

    plugins: [
      // 'karma-chrome-launcher',
      // 'karma-firefox-launcher',
      'karma-phantomjs-launcher',
      'karma-jasmine',
      'karma-ng-html2js-preprocessor'
    ],

    // base path, that will be used to resolve files and exclude
    // basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],


    preprocessors: {
      'src/**/*.html': ['ng-html2js']
    },

    ngHtml2JsPreprocessor: {
      stripPrefix: 'src/',
      moduleName: 'fielddbAngular'
    },


    // list of files / patterns to exclude
    // exclude: [],

    // // web server port
    // port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    // logLevel: config.LOG_DISABLE,

    // https://groups.google.com/forum/#!topic/karma-users/B-E7nLphNHQ
    // // browserNoActivityTimeout: 60000,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    // browsers: ['Chrome', 'ChromeCanary', 'Firefox', 'Safari'],
    browsers: ['PhantomJS'],



    // // Continuous Integration mode
    // // if true, it capture browsers, run tests and exit
    // singleRun: true

  };

  // This block is needed to execute Chrome on Travis
  // If you ever plan to use Chrome and Travis, you can keep it
  // If not, you can safely remove it
  // https://github.com/karma-runner/karma/issues/1144#issuecomment-53633076
  if (configuration.browsers[0] === 'Chrome' && process.env.TRAVIS) {
    configuration.customLaunchers = {
      'chrome-travis-ci': {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    };
    configuration.browsers = ['chrome-travis-ci'];
  }


  config.set(configuration);
};
