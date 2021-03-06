"use strict";

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON("package.json"),
    /*jshint quotmark: single */
    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> \n\t<%= pkg.contributors.join("\\n\\t")  %>\n' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    /*jshint quotmark: double */

    // Task configuration.
    browserify: {
      data: {
        src: ["sample_data/index.js"],
        dest: "backbone_client/data.js",
        options: {
          // ignore: ["fs"],
          basedir: "./"
        }
      },
      src: {
        src: ["api/fielddb.js"],
        dest: "<%= pkg.name %>.js",
        options: {
          banner: "<%= banner %>",
          // transform: ["es6ify"], // http://dontkry.com/posts/code/browserify-and-the-universal-module-definition.html
          ignore: [],
          shim: {},
          basedir: "./"
        }
      },
      // srcForTest: {
      //   src: ["tests/fieldb_jasmine_injector.js"],
      //   dest: "dist/<%= pkg.name %>_injected.js",
      //   options: {
      //     banner: "<%= banner %>",
      //     ignore: [],
      //     shim: {},
      //     basedir: "./"
      //   }
      // },
      // https://github.com/amitayd/grunt-browserify-jasmine-node-example/blob/master/Gruntfile.js
      test: {
        src: [
          "tests/**/*spec.js",
          // "tests/FieldDBObject-spec.js",
          // "tests/Collection-spec.js",
          // "tests/activity/*.js",
          // "tests/app/*.js",
          // "tests/audio_video/*.js",
          // "tests/authentication/*.js",
          // "tests/comment/*.js",
          // "tests/confidentiality_encryption/*.js",
          // "tests/corpus/Database-spec.js",
          // "tests/corpus/*-spec.js",
          // "tests/data_list/*.js",
          // "tests/datum/*.js",
          // "tests/export/*.js",
          // "tests/glosser/*.js",
          // "tests/hotkey/*.js",
          // "tests/image/*.js",
          // "tests/import/*.js",
          // "tests/insert_unicode/*.js",
          // "tests/lexicon/*.js",
          // "tests/locales/*.js",
          // "tests/permission/*.js",
          // "tests/search/*.js",
          // "tests/user/User-spec.js",
        ],
        dest: "dist/<%= pkg.name %>-spec.js",
        options: {
          external: ["memory", "./CORSNode", "atob", "btoa", "jsdom", "mkdirp", "fs"],
          basedir: "./api/"
        }
      },
    },
    uglify: {
      options: {
        banner: "<%= banner %>"
      },
      dist: {
        src: "<%= browserify.src.dest %>",
        dest: "<%= pkg.name %>.min.js"
      },
    },
    // to run one folder of tests only: $ jasmine-node tests/corpus --matchall
    jasmine_node: {
      dev: {
        options: {
          coverage: {},
          forceExit: true,
          match: ".",
          matchAll: false,
          specFolders: ["tests"],
          extensions: "js",
          specNameMatcher: "spec",
          captureExceptions: true,
          junitreport: {
            report: false,
            savePath: "./build/reports/jasmine/",
            useDotNotation: true,
            // consolidate: true
          }
        },
        src: ["api/**/*.js"]
      },
      travis: {
        options: {
          coverage: {},
          forceExit: true,
          isVerbose: false,
          showColors: false,
          match: ".",
          matchAll: false,
          specFolders: ["tests"],
          extensions: "js",
          specNameMatcher: "spec",
          captureExceptions: true,
          junitreport: {
            report: false,
            savePath: "./build/reports/jasmine/",
            useDotNotation: true,
            consolidate: true
          }
        },
        src: ["api/**/*.js"]
      }
    },
    jasmine: {
      src: "<%= browserify.src.dest %>",
      options: {
        specs: "<%= browserify.test.dest %>",
        // vendor: ["libs/jquery-1.9.1.js"]
      }
    },

    jshint: {
      options: {
        jshintrc: ".jshintrc"
      },
      gruntfile: {
        src: "Gruntfile.js"
      },
      lib: {
        options: {
          jshintrc: ".jshintrc",
          ignores: [
            "api/app/AppRouter.js",
            "api/bot/CleaningBot.js",
            "api/bot/InuktitutSyllabicsTransliteratorBot.js",
            "api/confidentiality_encryption/Crypto_AES.js",
            "api/conversation/Conversation.js",
            "api/conversation/Conversations.js",
            "api/data_list/DataLists.js",
            "api/datum/Sessions.js",
            "api/glosser/Tree.js",
            "api/lessons_corpus/Exercise.js",
            "api/lexicon/LexiconNodes.js",
            "api/user/Consultants.js",
            "api/user/ReportBot.js",
            "api/user/UserApp.js",
            "api/user/UserRouter.js"
          ]
        },

        src: [
          "api/**/*.js"
        ]
      },
      test: {
        options: {
          jshintrc: "tests/.jshintrc"
        },
        src: [
          "tests/**/*-spec.js"
        ]
      },
    },
    jsdoc: {
      dist: {
        jsdoc: "node_modules/.bin/jsdoc",
        src: ["api/**/*.js"],
        // src: ["api/**/*.js", "!tests/libs/**/*.js", "tests/**/*.js"],
        options: {
          destination: "docs/javascript",
          template: "node_modules/docdash",
          recurse: true,
          docdash: {
              static: true,  // Display the static members inside the navbar
              sort: true     // Sort the methods in the navbar
          },
          encoding: "utf8",
          plugins: ["node_modules/jsdoc-inheritance-diagram"],
          opts: {
            "inheritance-diagram": {
              externalLinks: {
                ExtClass: "http://link.to/external/class/documentation.html"
              },
              css: ".parent rect {fill: lightgray;}",
              node: {
                dimensions: {
                  width: 40
                }
              }
            }
          },
          templates: {
              cleverLinks: false,
              monospaceLinks: false
          }
        }
      }
    },
    watch: {
      gruntfile: {
        files: "<%= jshint.gruntfile.src %>",
        tasks: ["jshint:gruntfile"]
      },
      lib: {
        files: "<%= jshint.lib.src %>",
        tasks: ["newer:jshint:lib", "browserify"]
      },
      test: {
        files: "<%= jshint.test.src %>",
        tasks: ["newer:jshint:test", "newer:browserify:test", "newer:jasmine_node:dev"]
      },
    },
    exec: {
      buildFieldDBAngularCore: {
        cmd: function() {
          return "bash scripts/build_fielddb_angular_core.sh";
        }
      },
      buildCorpusPagesApp: {
        cmd: function() {
          return "bash scripts/build_corpuspages_angular.sh";
        }
      },
      buildSpreadsheetApp: {
        cmd: function() {
          return "bash scripts/build_spreadsheet_angular.sh";
        }
      },
      buildChromeApp: {
        cmd: function() {
          return "bash scripts/build_fielddb_minified.sh";
        }
      },
      copyDistToBackbone: {
        cmd: function() {
          return "cp fielddb.js backbone_client/bower_components/fielddb/fielddb.js";
        }
      },
      updateFieldDBVersion: {
        cmd: function() {
          return "echo n | bash scripts/set_fielddb_version.sh";
        }
      },
      jasmineAllTestsErrorWorkaround: {
        cmd: function() {
          return "echo y | bash scripts/jasmine_all_tests_workaround.sh";
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks("grunt-newer");
  grunt.loadNpmTasks("grunt-exec");
  grunt.loadNpmTasks("grunt-browserify");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-jasmine-node-coverage");
  grunt.loadNpmTasks("grunt-contrib-jasmine");
  grunt.loadNpmTasks("grunt-jsdoc");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-watch");

  // Default task.
  grunt.registerTask("docs", ["jsdoc"]);
  grunt.registerTask("test", ["jasmine_node:dev", "browserify", "jasmine"]);
  grunt.registerTask("build", ["jshint", "browserify:src"]);
  grunt.registerTask("dist", ["jshint", "jasmine_node:dev", "exec:updateFieldDBVersion", "browserify:src", "uglify"]);
  grunt.registerTask("default", ["dist"]);
  grunt.registerTask("backbone", ["browserify:src", "exec:copyDistToBackbone"]);
  grunt.registerTask("chromeapp", ["browserify:src", "exec:buildChromeApp"]);
  grunt.registerTask("fielddb-angular", ["exec:buildFieldDBAngularCore"]);
  grunt.registerTask("corpuspages-angular", ["exec:buildCorpusPagesApp"]);
  grunt.registerTask("spreadsheet-angular", ["exec:buildSpreadsheetApp"]);
  grunt.registerTask("travis", ["exec:jasmineAllTestsErrorWorkaround", "exec:updateFieldDBVersion", "jshint", "jasmine_node:travis", "browserify:src", "uglify", "docs", "fielddb-angular"]);

};
