#!/bin/bash

cd angular_client/modules/core &&
npm install &&
bower install &&
echo "Using local fielddb commonjs"
mkdir app/bower_components/fielddb;
ln -s ../../../fielddb.js app/bower_components/fielddb/fielddb.js;

grunt
