module.exports = function(grunt) {

  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    requirejs: {
      app: {
        options: {
          findNestedDependencies: true,
          mainConfigFile: 'SpreadsheetStyleDataEntry.js',
          baseUrl: './',
          name: 'SpreadsheetStyleDataEntry',
          out: 'spreadsheet_build_dev/SpreadsheetStyleDataEntry.js',
          optimize: 'none'
        }
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
        mangle: false
      },
      release: {
        files: {
          'release/SpreadsheetStyleDataEntry.js': ['spreadsheet_build_dev/SpreadsheetStyleDataEntry.js']
        }
      }
    },
    copy: {
      spreadsheet: {
        files: [{
          expand: true,
          cwd: 'css/',
          src: ['**'],
          dest: 'release/css/'
        }, {
          expand: true,
          cwd: 'data/',
          src: ['**'],
          dest: 'release/data/'
        }, {
          expand: true,
          cwd: 'img/',
          src: ['**'],
          dest: 'release/img/'
        }, {
          expand: true,
          cwd: 'partials/',
          src: ['**'],
          dest: 'release/partials/'
        }, {
          expand: true,
          cwd: 'libs/bootstrap/',
          src: ['**'],
          dest: 'release/libs/bootstrap/'
        }, {
          src: ['libs/require.min.js'],
          dest: 'release/'
        }, {
          src: ['index.html'],
          dest: 'release/'
        }, {
          src: ['manifest-build.json'],
          dest: 'release/manifest.json'
        }]
      },
      spreadsheet_build_only: {
        files: [{
          src: ['spreadsheet_build_dev/SpreadsheetStyleDataEntry.js'],
          dest: 'release/SpreadsheetStyleDataEntry.js'
        }]
      }
    },
    qunit: {
      files: ['test/**/*.html']
    },
    jshint: {
      files: ['Gruntfile.js', 'js/**/*.js', 'test/**/*.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'qunit']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.registerTask('test', ['jshint', 'qunit']);

  grunt.registerTask('build-only', ['requirejs', 'copy:spreadsheet', 'copy:spreadsheet_build_only']);

  grunt.registerTask('default', ['jshint', 'qunit', 'requirejs', 'uglify', 'copy:spreadsheet']);

};