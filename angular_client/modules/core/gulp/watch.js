'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');

var WATCH_AS_BOWER_COMPONENT_WHICH_MUST_BUILD_FULLY = true;

function isOnlyChange(event) {
  return event.type === 'changed';
}

module.exports = function(options) {
  gulp.task('watch', ['inject'], function() {

    gulp.watch([options.src + '/*.html', 'bower.json'], ['inject']);

    gulp.watch(options.src + '/{app,components}/**/*.css', function(event) {
      if (WATCH_AS_BOWER_COMPONENT_WHICH_MUST_BUILD_FULLY) {
        gulp.start('build');
      } else {
        if (isOnlyChange(event)) {
          browserSync.reload(event.path);
        } else {
          gulp.start('inject');
        }
      }
    });

    gulp.watch([
      options.src + '/{app,components}/**/*.js',
      'bower_components/fielddb/fielddb.js'
    ], function(event) {
      if (WATCH_AS_BOWER_COMPONENT_WHICH_MUST_BUILD_FULLY) {
        gulp.start('build');
      } else {
        if (isOnlyChange(event)) {
          gulp.start('scripts');
        } else {
          gulp.start('inject');
        }
      }
    });

    gulp.watch(options.src + '/{app,components}/**/*.html', function(event) {
      if (WATCH_AS_BOWER_COMPONENT_WHICH_MUST_BUILD_FULLY) {
        gulp.start('build');
      } else {
        browserSync.reload(event.path);
      }
    });
  });
};
