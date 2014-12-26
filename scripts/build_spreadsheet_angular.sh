#!/bin/bash
CURRENTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/.."

cd angular_client/modules/spreadsheet &&
npm install || exit 1;
bower install || exit 1;
echo "Using local fielddb angular";
rm -rf bower_components/fielddb-angular/dist
ln -s $CURRENTDIR/angular_client/modules/core/dist $CURRENTDIR/angular_client/modules/spreadsheet/bower_components/fielddb-angular/dist;
ls -al $CURRENTDIR/angular_client/modules/spreadsheet/bower_components/fielddb-angular/
grunt
