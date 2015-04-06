// Generated on 2014-09-22 using generator-angular 0.9.7
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Configurable paths for the application
  var appConfig = {
    app: require('./bower.json').appPath || 'app',
    dist: 'dist',
    version: require('./bower.json').version
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: appConfig,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      // bower: {
      //   files: ['bower.json'],
      //   tasks: ['wiredep']
      // },
      vendor: {
        files: ['bower_components/fielddb-angular/dist/scripts/{,*/}*.js'],
        tasks: ['build'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      js: {
        files: ['<%= yeoman.app %>/scripts/{,*/}*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      templates: {
        files: ['index.html', '<%= yeoman.app %>/views/{,*/}*.html'],
        tasks: ['ngtemplates', 'copy:templates'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma:unit']
      },
      styles: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.css', 'bower_components/fielddb-angular/dist/styles/main.css'],
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
          '<%= yeoman.dist %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
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
          middleware: function(connect) {
            return [
              connect.static('.tmp'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      test: {
        options: {
          port: 9001,
          middleware: function(connect) {
            return [
              connect.static('.tmp'),
              connect.static('test'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      dist: {
        options: {
          open: true,
          base: '<%= yeoman.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish'),
        ignores: [
          '<%= yeoman.app %>/scripts/templates.js'
        ]
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%= yeoman.app %>/scripts/{,*/}*.js'
        ],
        ignores: [
          '<%= yeoman.app %>/scripts/templates.js'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/{,*/}*',
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
    wiredep: {
      options: {
        // cwd: '<%= yeoman.app %>'
      },
      app: {
        src: ['<%= yeoman.app %>/index.html'],
        ignorePath: /\.\.\//
      }
    },

    // Renames files for browser caching purposes
    filerev: {
      dist: {
        src: [
          '<%= yeoman.dist %>/scripts/{,*/}*.js',
          '<%= yeoman.dist %>/styles/{,*/}*.css',
          '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= yeoman.dist %>/styles/fonts/*'
        ]
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>',
        flow: {
          html: {
            steps: {
              js: ['concat'],
              // js: ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    // Performs rewrites based on filerev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= yeoman.dist %>', '<%= yeoman.dist %>/images']
      }
    },

    // The following *-min tasks will produce minified files in the dist folder
    // By default, your `index.html`'s <!-- Usemin block --> will take care of
    // minification. These next options are pre-configured if you do not wish
    // to use the Usemin blocks.
    // cssmin: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/styles/main.css': [
    //         '.tmp/styles/{,*/}*.css'
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
    //   dist: {}
    // },

    // imagemin: {
    //   dist: {
    //     files: [{
    //       expand: true,
    //       cwd: '<%= yeoman.app %>/images',
    //       src: '{,*/}*.{png,jpg,jpeg,gif}',
    //       dest: '<%= yeoman.dist %>/images'
    //     }]
    //   }
    // },

    // svgmin: {
    //   dist: {
    //     files: [{
    //       expand: true,
    //       cwd: '<%= yeoman.app %>/images',
    //       src: '{,*/}*.svg',
    //       dest: '<%= yeoman.dist %>/images'
    //     }]
    //   }
    // },

    ngtemplates: {
      app: {
        options: {
          htmlmin: {
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            removeCommentsFromCDATA: true,
            removeOptionalTags: true
          },
          module: 'spreadsheetApp',
        },
        cwd: 'app',
        src: 'views/**.html',
        dest: '<%= yeoman.dist %>/scripts/templates.js'
      }
    },

    // ngmin tries to make the code safe for minification automatically by
    // using the Angular long form for dependency injection. It doesn't work on
    // things like resolve or inject so those have to be done manually.
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
            // 'styles/*.css',
            'data/*.json',
            'locales/*/*.json',
            // 'views/{,*/}*.html',
            'images/*.png',
            'images/*.gif'
            // 'fonts/*'
          ]
        }, {
          expand: true,
          cwd: '',
          dest: '<%= yeoman.dist %>',
          // src: ['bower_components/recordmp3js/js/*.js','bower_components/recordmp3js/css/fonts/icomoon.woff']
          src: ['bower_components/recordmp3js/js/*.js']
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/images',
          src: ['generated/*']
        }, {
          expand: true,
          cwd: 'bower_components/bootstrap/dist',
          src: 'fonts/*',
          dest: '<%= yeoman.dist %>'
        }]
      },
      templates: {
        src:['<%= yeoman.dist %>/scripts/templates.js'],
        dest: '<%= yeoman.app %>/scripts/templates.js'
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
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
        // 'imagemin',
        // 'svgmin'
      ]
    },

    // Test settings
    karma: {
      unit: {
        configFile: "test/karma.conf.js",
        singleRun: true,
        logLevel: "ERROR",
        /* https://github.com/karma-runner/grunt-karma/issues/102 */
        client: {
          captureConsole: false
        },
        browsers: ["PhantomJS"]
      },
      watch: {
        configFile: "test/karma.conf.js",
        singleRun: false,
        autoWatch: true,
        browsers: ["Chrome"]
      }
    },

    compress: {
      dist: {
        options: {
          archive: '../../../../Releases/spreadsheet_app_v<%= yeoman.version + new Date()%>.zip'
        },
        files: [{
          expand: true,
          cwd: 'dist/',
          src: ['**'],
          dest: ''
        }]
      }
    }
  });


  grunt.registerTask('serve', 'Compile then start a connect web server', function(target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      // 'wiredep',
      'concurrent:server',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function(target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve:' + target]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma:unit'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    // 'wiredep',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'copy:dist',
    'concat',
    'ngmin',
    // 'cdnify',
    'cssmin',
    'ngtemplates',
    // 'copy:templates',
    // 'uglify',
    // 'filerev',
    'usemin',
    // 'htmlmin',
    // 'compress'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);

  grunt.registerTask('dist', [
    'jshint',
    'test',
    'build',
    'compress'
  ]);
};
