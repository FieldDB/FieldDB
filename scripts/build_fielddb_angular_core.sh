#!/bin/bash
CURRENTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/.."

cd angular_client/modules/core &&
rm -rf node_modules
rm -rf app/bower_components

npm install || exit 1;
bower install || exit 1;
echo "Using local fielddb commonjs";
rm app/bower_components/fielddb/fielddb.js;
ln -s $CURRENTDIR/fielddb.js $CURRENTDIR/angular_client/modules/core/app/bower_components/fielddb/fielddb.js;
ls -al $CURRENTDIR/angular_client/modules/core/app/bower_components/fielddb/
grunt
