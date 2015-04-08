"use strict";

var gulp = require("gulp");

var $ = require("gulp-load-plugins")();

var wiredep = require("wiredep");
var karma = require("karma");
var concat = require("concat-stream");
var _ = require("lodash");

module.exports = function(options) {

  function listFiles(sourceOrDistribution, callback) {
    var bowerDeps = wiredep({
      directory: "bower_components",
      exclude: [/bootstrap\.js/],
      dependencies: true,
      devDependencies: true
    });

    var specFiles = [
      options.src + "/**/*.spec.js",
      options.src + "/**/*.mock.js"
    ];

    var htmlFiles = [
      options.src + "/**/*.html"
    ];

    var srcFiles = [
      options.src + "/{app,components}/**/*.js"
    ].concat(specFiles.map(function(file) {
      return "!" + file;
    }));

    if (sourceOrDistribution === "compiled") {
      srcFiles = ["dist/scripts/fielddb-angular.js"];
      bowerDeps.js = ["dist/scripts/vendor.js","bower_components/angular-mocks/angular-mocks.js"];
      htmlFiles = [];
    }

    gulp.src(srcFiles)
      .pipe(concat(function(files) {
        callback(bowerDeps.js
          .concat(_.pluck(files, "path"))
          .concat(htmlFiles)
          .concat(specFiles));
      }));
  }

  function runTests(done) {
    listFiles("src", function(files) {
      karma.server.start({
        configFile: __dirname + "/../karma.conf.js",
        files: files,
        singleRun: true,
        browsers: ["PhantomJS"],
        autowatch: false,
        plugins: [
          "karma-phantomjs-launcher",
          "karma-jasmine",
          "karma-ng-html2js-preprocessor"
        ]
      }, done);
    });
  }

  function distTests(done) {
    listFiles("compiled", function(files) {
      karma.server.start({
        configFile: __dirname + "/../karma.conf.js",
        files: files,
        singleRun: true,
        browsers: ["PhantomJS"],
        autowatch: false,
        plugins: [
          "karma-phantomjs-launcher",
          "karma-jasmine",
          "karma-ng-html2js-preprocessor"
        ]
      }, done);
    });
  }

  function watchTests(done) {
    listFiles("src", function(files) {
      karma.server.start({
        configFile: __dirname + "/../karma.conf.js",
        files: files,
        singleRun: false
      }, done);
    });
  }

  gulp.task("test", ["scripts"], function(done) {
    runTests(done);
  });

  gulp.task("test:src", ["scripts"], function(done) {
    runTests(done);
  });

  gulp.task("test:dist", ["scripts"], function(done) {
    distTests(done);
  });

  gulp.task("test:watch", ["watch"], function(done) {
    watchTests(done);
  });
};
