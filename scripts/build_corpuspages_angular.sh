#!/bin/bash
CURRENTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/.."

cd angular_client/modules/corpuspages &&
# rm -rf node_modules
# rm -rf bower_components

npm install || exit 1;

# ls app/bower_components/fielddb-angular || {
#   ln -s $FIELDDB_HOME/FieldDB/angular_client/modules/core app/bower_components/fielddb-angular
# }
# ls app/bower_components/fielddb-lexicon-angular || {
#   ln -s $FIELDDB_HOME/FieldDBLexicon app/bower_components/fielddb-lexicon-angular
# }
# ls app/bower_components/fielddb-activity-feed || {
#   ln -s $FIELDDB_HOME/FieldDBActivityFeed app/bower_components/fielddb-activity-feed
# }
# ls app/bower_components/fielddb || {
#   mkdir app/bower_components/fielddb
#   ln -s $FIELDDB_HOME/FieldDB/fielddb.js app/bower_components/fielddb/fielddb.js
# }

echo "Using local fielddb commonjs";
bower link fielddb || {
  bower install fielddb;
  rm bower_components/fielddb/fielddb.js;
  rm bower_components/fielddb/fielddb.min.js;
  ln -s $CURRENTDIR/fielddb.js $CURRENTDIR/angular_client/modules/corpuspages/bower_components/fielddb/fielddb.js;
  ln -s $CURRENTDIR/fielddb.min.js $CURRENTDIR/angular_client/modules/corpuspages/bower_components/fielddb/fielddb.min.js;
  ls -al $CURRENTDIR/angular_client/modules/corpuspages/bower_components/fielddb/
}

echo "Using local fielddb angular";
bower link fielddb-angular || {
  bower install fielddb-angular
  rm bower_components/fielddb-angular/bower.json
  rm -rf bower_components/fielddb-angular/dist
  ln -s $CURRENTDIR/angular_client/modules/core/bower.json $CURRENTDIR/angular_client/modules/corpuspages/bower_components/fielddb-angular/bower.json;
  ln -s $CURRENTDIR/angular_client/modules/core/dist $CURRENTDIR/angular_client/modules/corpuspages/bower_components/fielddb-angular/dist;
  ls -al $CURRENTDIR/angular_client/modules/corpuspages/bower_components
  ls -al $CURRENTDIR/angular_client/modules/corpuspages/bower_components/fielddb-angular/
}

gulp && {
  echo "Gulp was sucessfull";

  # gulp test && {
  #   echo "Gulp test was sucessfull";
  #   exit 0
  # } || {
  #   echo "gulp failed";
  #   exit 8
  # }
} || {
  echo "gulp failed";
  exit 8
}
