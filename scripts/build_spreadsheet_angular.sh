#!/bin/bash
CURRENTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../"

cd angular_client/modules/spreadsheet &&
npm install || exit 1;
bower install || exit 1;
# echo "Using local fielddb angular";
# ls app/bower_components/fielddb/fielddb.js || {
#   mkdir app/bower_components/fielddb;
#   ln -s $CURRENTDIR/fielddb.js $CURRENTDIR/angular_client/modules/spreadsheet/app/bower_components/fielddb/fielddb.js;
# } &&
grunt
