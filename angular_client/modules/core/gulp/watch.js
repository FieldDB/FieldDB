"use strict";

var path = require("path");
var gulp = require("gulp");
var conf = require("./conf");

var browserSync = require("browser-sync");

var WATCH_AS_BOWER_COMPONENT_WHICH_MUST_BUILD_FULLY = true;

function isOnlyChange(event) {
  return event.type === "changed";
}

gulp.task("watch", ["inject"], function() {

  gulp.watch([path.join(conf.paths.src, "/*.html"), "bower.json"], ["inject-reload"]);

  gulp.watch(path.join(conf.paths.src, "/app/**/*.css"), function(event) {
    if (WATCH_AS_BOWER_COMPONENT_WHICH_MUST_BUILD_FULLY) {
      gulp.start('build');
    } else {
      if (isOnlyChange(event)) {
        browserSync.reload(event.path);
      } else {
        gulp.start("inject-reload");
      }
    }
  });

  gulp.watch(path.join(conf.paths.src, "/app/**/*.js", 'bower_components/fielddb/fielddb.js'), function(event) {
    if (WATCH_AS_BOWER_COMPONENT_WHICH_MUST_BUILD_FULLY) {
      gulp.start('build');
    } else {
      if (isOnlyChange(event)) {
        gulp.start("scripts-reload");
      } else {
        gulp.start("inject-reload");
      }
    }
  });

  gulp.watch(path.join(conf.paths.src, "/app/**/*.html"), function(event) {
    if (WATCH_AS_BOWER_COMPONENT_WHICH_MUST_BUILD_FULLY) {
      gulp.start('build');
    } else {
      browserSync.reload(event.path);
    }
  });
});
