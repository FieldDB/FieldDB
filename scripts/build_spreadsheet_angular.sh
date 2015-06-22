#!/bin/bash
CURRENTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/.."

cd angular_client/modules/spreadsheet &&
# rm -rf node_modules
# rm -rf app/bower_components

cat app/scripts/private_services.js || {
  echo " Creating a private services file which you can use to change the servers the spreadsheet app contacts"
  cp app/scripts/private_services_sample.js app/scripts/private_services.js
}

npm install || exit 1;

echo "Using local fielddb commonjs";
rm app/bower_components/fielddb/fielddb.js;
rm app/bower_components/fielddb/fielddb.min.js;
ln -s $CURRENTDIR/fielddb.js $CURRENTDIR/angular_client/modules/spreadsheet/app/bower_components/fielddb/fielddb.js;
ln -s $CURRENTDIR/fielddb.min.js $CURRENTDIR/angular_client/modules/spreadsheet/app/bower_components/fielddb/fielddb.min.js;
ls -al $CURRENTDIR/angular_client/modules/spreadsheet/app/bower_components/fielddb/


echo "Using local fielddb angular";
rm app/bower_components/fielddb-angular/bower.json
rm -rf app/bower_components/fielddb-angular/dist
ln -s $CURRENTDIR/angular_client/modules/core/bower.json $CURRENTDIR/angular_client/modules/spreadsheet/app/bower_components/fielddb-angular/bower.json;
ln -s $CURRENTDIR/angular_client/modules/core/dist $CURRENTDIR/angular_client/modules/spreadsheet/app/bower_components/fielddb-angular/dist;

ls -al $CURRENTDIR/angular_client/modules/spreadsheet/app/bower_components
ls -al $CURRENTDIR/angular_client/modules/spreadsheet/app/bower_components/fielddb-angular/
ls -al $CURRENTDIR/angular_client/modules/spreadsheet/app/bower_components/fielddb-angular/dist
grunt && {
  echo "Grunt was sucessfull";
  exit 0
} || {
  echo "grunt failed";
  exit 8
}
