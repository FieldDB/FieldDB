#!/bin/bash
CURRENTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/.."

cd angular_client/modules/core &&
# rm -rf node_modules
# rm -rf bower_components

npm install || exit 1;

echo "Using local fielddb commonjs";
bower link fielddb || {
  bower install fielddb;
  rm bower_components/fielddb/fielddb.js;
  rm bower_components/fielddb/fielddb.min.js;
  ln -s $CURRENTDIR/fielddb.js $CURRENTDIR/angular_client/modules/core/bower_components/fielddb/fielddb.js;
  ln -s $CURRENTDIR/fielddb.min.js $CURRENTDIR/angular_client/modules/core/bower_components/fielddb/fielddb.min.js;
  ls -al $CURRENTDIR/angular_client/modules/core/bower_components/fielddb/
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
