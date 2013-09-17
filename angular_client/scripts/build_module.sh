#!/bin/bash
if [ $# -lt 1 ]
then
  echo "You must specify a module to build [spreadsheet]."
  date;
  exit 65
fi

THISROOT=$HOME/git/FieldDB/angular_client/
cd $THISROOT


MODULE=$1

echo "Building Angular HTML5 Client - $MODULE Module"
../node_modules/requirejs/bin/r.js -o  "modules/$MODULE/$MODULE""_build_config.js"
../node_modules/requirejs/bin/r.js -o "cssIn=modules/$MODULE/css/main.css" "out=release/main.min.css"
echo "Cleaning up extra path in css "
sed 's/\.\.\/\.\.\/[^/]*\/\.\.\/\.\.\///' release/main.min.css > output
mv output release/main.min.css
# Turning html into a  min.html
sed "s/modules.*\.css/main.min.css/" release/$MODULE.html | sed "s/modules.*\SpreadsheetStyleDataEntry.js/SpreadsheetStyleDataEntry.min.js/"  > output
mv output release/$MODULE.html

echo "Done building $MODULE"
date;

if [ $# -lt 2 ]
then
  echo "No optional deployment staging area specified for module $MODULE. Done setting up minified release in $OUTPUTDIR, you may now copy assets to your deployment staging by hand"
  date;
  exit 0
fi

OUTPUTDIR="../$2"
echo "Copying over $MODULE Module to staging ground in $OUTPUTDIR"
mkdir -p $OUTPUTDIR/modules/$MODULE/partials/
cp release/modules/$MODULE/partials/* $OUTPUTDIR/modules/$MODULE/partials/
cp release/$MODULE.html $OUTPUTDIR/
cp release/modules/$MODULE/main.js $OUTPUTDIR/$MODULE.min.js
cp release/$MODULE.min.css $OUTPUTDIR/
