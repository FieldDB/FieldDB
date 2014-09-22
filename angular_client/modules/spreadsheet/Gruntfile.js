// Generated on 2014-01-24 using generator-angular 0.7.1

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {
  'use strict';

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);


  // Define the configuration for all the tasks
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
    // Project settings
    yeoman: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      dist: 'dist'
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      // files: ['<%= jshint.files %>'],
      // tasks: ['jshint', 'qunit'],
      js: {
        files: ['<%= yeoman.app %>/scripts/{,*/}*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: true
        }
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      styles: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
        tasks: ['newer:copy:styles', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            '<%= yeoman.app %>'
          ]
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%= yeoman.app %>'
          ]
        }
      },
      dist: {
        options: {
          base: '<%= yeoman.dist %>'
        }
      }
    },


    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },

    // Automatically inject Bower components into the app
    'bower-install': {
      app: {
        html: '<%= yeoman.app %>/index.html',
        ignorePath: '<%= yeoman.app %>/'
      }
    },



    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/styles/{,*/}*.css',
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/styles/fonts/*'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= yeoman.dist %>']
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
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
          src: ['favicon.ico'],
          dest: 'release/'
        }, {
          src: ['.htaccess'],
          dest: 'release/'
        }, {
          src: ['404.html'],
          dest: 'release/'
        }, {
          src: ['index.html'],
          dest: 'release/'
        }, {
          src: ['libs/require.min.js'],
          dest: 'release/'
        }, {
          src: ['libs/recorderjs/recorderWorker.js'],
          dest: 'release/'
        }, {
          src: ['bower_components/fielddb-glosser/fielddb-glosser.js'],
          dest: 'release/'
        }]
      },
      spreadsheet_build_only: {
        files: [{
          src: ['spreadsheet_build_dev/SpreadsheetStyleDataEntry.js'],
          dest: 'release/SpreadsheetStyleDataEntry.js'
        }]
      },
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            'views/{,*/}*.html',
            'bower_components/**/*',
            'images/{,*/}*.{webp}',
            'fonts/*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/images',
          src: ['generated/*']
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },
    cssmin: {
      release: {
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
    ngtemplates: {
      app: {
        options: {
          htmlmin: {
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            removeCommentsFromCDATA: true,
            removeOptionalTags: true
          },
          // module: 'SpreadsheetStyleDataEntry',
          bootstrap: function(module, script) {
            return 'define([], function() { return { init: function(thismodule){\n   thismodule.run(["$templateCache", function($templateCache) {  \n ' + script + ' }]);\n }\n};\n });';
          }
        },
        cwd: '',
        src: 'partials/**.html',
        dest: 'js/partials.js'
      }
    },
    htmlmin: {
      release: {
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
    // htmlmin: {
    //   dist: {
    //     options: {
    //       collapseWhitespace: true,
    //       collapseBooleanAttributes: true,
    //       removeCommentsFromCDATA: true,
    //       removeOptionalTags: true
    //     },
    //     files: [{
    //       expand: true,
    //       cwd: '<%= yeoman.dist %>',
    //       src: ['*.html', 'views/{,*/}*.html'],
    //       dest: '<%= yeoman.dist %>'
    //     }]
    //   }
    // },
    //

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      files: ['Gruntfile.js', 'js/**/*.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        },
        // Ignore functions inside of loops (to allow for closures)
        loopfunc: true
      },
      // options: {
      //   jshintrc: '.jshintrc',
      //   reporter: require('jshint-stylish')
      // },
      // all: [
      //   'Gruntfile.js',
      //   '<%= yeoman.app %>/scripts/{,*/}*.js'
      // ],
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },
    jasmine: {
      src: [
        'js/**/*.js'
      ],
      options: {
        specs: 'test/*.test.js',
        template: require('grunt-template-jasmine-requirejs'),
        templateOptions: {
          requireConfigFile: 'SpreadsheetStyleDataEntry.js'
        },
        junit: {
          path: 'test/output/testresults'
        }
      }
    },
    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'copy:styles'
      ],
      test: [
        'copy:styles'
      ],
      dist: [
        'copy:styles',
        'imagemin',
        'svgmin'
      ]
    },

    // By default, your `index.html`'s <!-- Usemin block --> will take care of
    // minification. These next options are pre-configured if you do not wish
    // to use the Usemin blocks.
    // cssmin: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/styles/main.css': [
    //         '.tmp/styles/{,*/}*.css',
    //         '<%= yeoman.app %>/styles/{,*/}*.css'
    //       ]
    //     }
    //   }
    // },
    // uglify: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/scripts/scripts.js': [
    //         '<%= yeoman.dist %>/scripts/scripts.js'
    //       ]
    //     }
    //   }
    // },
    // concat: {
    //   options: {
    //     separator: ';',
    //   },
    //   dist: {
    //     src: ['spreadsheet_build_dev/SpreadsheetStyleDataEntry.js', 'release/partials.js'],
    //     dest: 'release/SpreadsheetStyleDataEntry.js',
    //   },
    // },

    // Test settings
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
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
  grunt.loadNpmTasks('grunt-angular-jasmine');
  // grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('serve', function(target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'bower-install',
      'concurrent:server',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', function() {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });

  grunt.registerTask('test', [
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'bower-install',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'ngmin',
    'copy:dist',
    'cdnify',
    'cssmin',
    'ngtemplates',
    'uglify',
    'rev',
    'usemin'
    // 'htmlmin'
  ]);

  // grunt.registerTask('default', [
  //   'newer:jshint',
  //   'test',
  //   'build'
  // ]);


  grunt.registerTask('test', ['jshint', 'jasmine']);
  grunt.registerTask('partials', ['ngtemplates']);

  grunt.registerTask('default', ['ngtemplates', 'requirejs', 'copy:spreadsheet', 'copy:spreadsheet_build_only', 'cssmin']);

  grunt.registerTask('all', ['jshint', 'jasmine', 'ngtemplates', 'requirejs', 'uglify', 'copy:spreadsheet', 'cssmin']);

};
