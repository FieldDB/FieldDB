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
          cwd: 'libs/bootstrap/',
          src: ['**'],
          dest: 'release/libs/bootstrap/'
        }, {
          src: ['libs/require.min.js'],
          dest: 'release/'
        }, {
          src: ['libs/recorderjs/recorderWorker.js'],
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
    cssmin: {
      dist: {
        options: {
          report: 'min'
        },
        files: {
          'release/css/main.css': [
            'css/main.css'
          ]
        }
      }
    },
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: [{
          expand: true,
          cwd: './',
          src: ['*.html', 'partials/**/*.html'],
          dest: 'release/'
        }]
      }
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
    jasmine: {

      src: [
        'js/**/*.js'
      ],
      options: {
        specs: 'test/*.test.js',
        junit: {
          path: 'test/output/testresults'
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
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  grunt.registerTask('test', ['jshint', 'jasmine']);

  grunt.registerTask('build-only', ['requirejs', 'copy:spreadsheet', 'copy:spreadsheet_build_only', 'htmlmin', 'cssmin']);

  grunt.registerTask('default', ['jshint', 'jasmine', 'requirejs', 'uglify', 'copy:spreadsheet', 'htmlmin', 'cssmin']);

};