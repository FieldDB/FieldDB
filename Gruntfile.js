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
      }
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
      options: {
        match: ".",
        matchall: false,
        extensions: "js",
        specNameMatcher: "Test",
        projectRoot: "./",
        requirejs: false,
        forceExit: true,
        isVerbose: true,
        showColors: true,
        jUnit: {
          report: true,
          savePath: "./build/reports/jasmine/",
          consolidate: true,
          useDotNotation: false
        }
      },
      all: ["tests/"]
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
          jshintrc: ".jshintrc"
        },
        src: [
          "api/fielddb.js",
          "api/FieldDBObject.js",
          "api/Collection.js",
          "api/CORS.js",
          "api/FieldDBConnection.js",
          "api/activity/Activites.js",
          "api/activity/Activity.js",
          "api/app/App.js",
          "api/audio_video/AudioPlayer.js",
          "api/audio_video/AudioVideo.js",
          "api/audio_video/AudioVideoRecorder.js",
          "api/audio_video/AudioVideos.js",
          "api/audio_video/HTML5Audio.js",
          "api/authentication/Authentication.js",
          "api/comment/Comment.js",
          "api/comment/Comments.js",
          "api/confidentiality_encryption/Confidential.js",
          "api/corpus/Corpus.js",
          "api/corpus/CorpusConnection.js",
          // "api/corpus/Corpuses.js",
          "api/corpus/CorpusMask.js",
          "api/corpus/Database.js",
          "api/corpus/PsycholinguisticsDatabase.js",
          "api/data_list/DataList.js",
          // "api/data_list/DataLists.js",
          "api/data_list/SubExperimentDataList.js",
          "api/datum/Datum.js",
          "api/datum/DatumField.js",
          "api/datum/DatumFields.js",
          "api/datum/DatumState.js",
          "api/datum/DatumStates.js",
          "api/datum/DatumTag.js",
          "api/datum/DatumTags.js",
          "api/datum/Document.js",
          "api/datum/DocumentCollection.js",
          "api/datum/Response.js",
          // "api/datum/Session.js",
          // "api/datum/Session.js",
          "api/datum/Stimulus.js",
          "api/export/Export.js",
          "api/hotkey/HotKey.js",
          "api/hotkey/HotKeys.js",
          "api/image/Image.js",
          "api/image/Images.js",
          "api/import/Import.js",
          "api/locales/ContextualizableObject.js",
          "api/locales/Contextualizer.js",
          "api/locales/ELanguages.js",
          "api/permission/Permission.js",
          "api/permission/Permissions.js",
          "api/search/Search.js",
          "api/unicode/UnicodeSymbol.js",
          "api/unicode/UnicodeSymbols.js",
          "api/user/Consultant.js",
          "api/user/Participant.js",
          "api/user/Speaker.js",
          "api/user/Team.js",
          "api/user/User.js",
          "api/user/UserMask.js",
          "api/user/UserPreference.js",
          "api/user/Users.js",
        ]
      },
      test: {
        options: {
          jshintrc: "tests/.jshintrc",
          ignores: ["tests/libs/**/*js"]
        },
        src: [
          "tests/FieldDBTest.js",
          "tests/FieldDBObjectTest.js",
          "tests/CollectionTest.js",
          "tests/activity/*.js",
          "tests/app/*.js",
          "tests/audioVideo/*.js",
          "tests/authentication/*.js",
          "tests/comment/*.js",
          "tests/confidentiality_encryption/*.js",
          "tests/corpus/*.js",
          "tests/data_list/*.js",
          "tests/datum/*.js",
          "tests/export/*.js",
          "tests/glosser/*.js",
          "tests/hotkey/*.js",
          "tests/image/*.js",
          "tests/import/*.js",
          "tests/insert_unicode/*.js",
          "tests/locales/*.js",
          "tests/lexicon/*.js",
          "tests/permission/*.js",
          "tests/search/*.js",
          "tests/user/*.js"
        ]
      },
    },
    jsdoc: {
      dist: {
        jsdoc: "node_modules/.bin/jsdoc",
        src: ["api/**/*.js"],
        // src: ["api/**/*.js", "!tests/libs/**/*.js", "tests/**/*.js"],
        options: {
          destination: "docs/javascript"
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
        tasks: ["newer:jshint:test", "newer:jasmine_node"]
      },
    },
    exec: {
      buildFieldDBAngularCore: {
        cmd: function() {
          return "bash scripts/build_fielddb_angular_core.sh";
        }
      },
      buildSpreadsheetAngular: {
        cmd: function() {
          return "bash scripts/build_spreadsheet_angular.sh";
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
  grunt.loadNpmTasks("grunt-jasmine-node");
  grunt.loadNpmTasks("grunt-jsdoc");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-watch");

  // Default task.
  grunt.registerTask("docs", ["jsdoc"]);
  grunt.registerTask("build", ["jshint", "browserify"]);
  grunt.registerTask("dist", ["jshint", "jasmine_node", "exec:updateFieldDBVersion", "browserify", "uglify"]);
  grunt.registerTask("default", ["dist"]);
  grunt.registerTask("fielddb-angular", ["exec:buildFieldDBAngularCore"]);
  grunt.registerTask("spreadsheet-angular", ["exec:buildSpreadsheetAngular"]);
  grunt.registerTask("travis", ["exec:jasmineAllTestsErrorWorkaround", "exec:updateFieldDBVersion", "jshint", "jasmine_node", "browserify", "uglify", "docs", "fielddb-angular", "spreadsheet-angular"]);

};
