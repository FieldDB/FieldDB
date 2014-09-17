'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> \n\t<%= pkg.contributors.join("\\n\\t")  %>\n' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    browserify: {
      src: {
        src: ['api/fielddb.js'],
        dest: '<%= pkg.name %>.js',
        options: {
          banner: '<%= banner %>',
          // transform: ['es6ify'], // http://dontkry.com/posts/code/browserify-and-the-universal-module-definition.html
          ignore: [],
          shim: {},
          basedir: './'
        }
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= browserify.src.dest %>',
        dest: '<%= pkg.name %>.min.js'
      },
    },
    // to run one folder of tests only: $ jasmine-node tests/corpus --matchall
    jasmine_node: {
      options: {
        match: '.',
        matchall: false,
        extensions: 'js',
        specNameMatcher: 'Test',
        projectRoot: './',
        requirejs: false,
        forceExit: true,
        isVerbose: true,
        showColors: true,
        jUnit: {
          report: true,
          savePath: './build/reports/jasmine/',
          consolidate: true,
          useDotNotation: false
        }
      },
      all: ['tests/']
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: ['api/fielddb.js', 'api/FieldDBObject.js', 'api/Collection.js', 'api/CORS.js', 'api/FieldDBConnection.js',  'api/app/App.js', 'api/confidentiality_encryption/Confidential.js', 'api/corpus/Corpus.js', 'api/corpus/PsycholinguisticsDatabase.js', 'api/datum/DatumTag.js', 'api/datum/DatumTags.js', 'api/datum/DatumField.js', 'api/datum/Document.js',  'api/datum/DocumentCollection.js',  'api/data_list/DataList.js', 'api/corpus/Database.js', 'api/import/Import.js', 'api/user/UserMask.js', 'api/user/User.js', 'api/user/Speaker.js', 'api/user/Consultant.js', 'api/user/Participant.js', 'api/corpus/CorpusMask.js']
      },
      test: {
        options: {
          jshintrc: 'tests/.jshintrc',
          ignores: ['tests/libs/**/*js']
        },
        src: ['tests/FieldDBTest.js', 'tests/FieldDBObjectTest.js', 'tests/CollectionTest.js', 'tests/activity/*.js', 'tests/app/*.js', 'tests/audioVideo/*.js', 'tests/authentication/*.js', 'tests/comment/*.js', 'tests/confidentiality_encryption/*.js', 'tests/corpus/*.js', 'tests/data_list/*.js', 'tests/datum/*.js', 'tests/export/*.js', 'tests/glosser/*.js', 'tests/hotkey/*.js', 'tests/image/*.js', 'tests/import/*.js', 'tests/insert_unicode/*.js', 'tests/lexicon/*.js', 'tests/permission/*.js', 'tests/search/*.js', 'tests/user/*.js']
      },
    },
    jsdoc: {
      dist: {
        jsdoc: 'node_modules/.bin/jsdoc',
        src: ['api/**/*.js'],
        // src: ['api/**/*.js', '!tests/libs/**/*.js', 'tests/**/*.js'],
        options: {
          destination: 'docs/javascript'
        }
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib: {
        files: '<%= jshint.lib.src %>',
        tasks: ['jshint:lib', 'jasmine_node', 'browserify']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'jasmine_node']
      },
    },
    exec: {
      buildFieldDBAngularCore: {
        cmd: function() {
          return "bash scripts/build_fielddb_angular_core.sh";
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('docs', ['jsdoc']);
  grunt.registerTask('build', ['jshint', 'browserify', 'uglify']);
  grunt.registerTask('default', ['jshint', 'jasmine_node', 'browserify', 'uglify']);
  grunt.registerTask('default', ['jasmine_node', 'browserify', 'uglify']);
  grunt.registerTask('travis', ['jasmine_node', 'browserify', 'uglify', 'docs', 'exec:buildFieldDBAngularCore']);
  grunt.registerTask('fielddb-angular', ['exec:buildFieldDBAngularCore']);

};
