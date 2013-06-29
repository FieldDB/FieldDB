#!/bin/bash
OUTPUTDIR=$1
if [ $# -lt 1 ]
then
  OUTPUTDIR=""
fi

THISROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../"
cd $THISROOT

echo "Cleaning up from previous build"
rm -rf release

echo "Building Angular HTML5 Client - Spreadsheet Module"
./scripts/build_module.sh spreadsheet $OUTPUTDIR


if [ $# -lt 1 ]
then
  echo "No optional deployment staging area specified. Done setting up minified release in $OUTPUTDIR, you may now copy assets to your deployment staging by hand"
  date;
  exit 0
fi
OUTPUTDIR="../$1"

cd $THISROOT
pwd
echo "Copying over libraries to staging ground in $OUTPUTDIR"
cp release/manifest.json $OUTPUTDIR/manifest.json
mkdir -p $OUTPUTDIR/img
cp release/img/logo.png $OUTPUTDIR/img/
cp release/img/loading-spinner.gif $OUTPUTDIR/img/
cp release/libs/require.min.js $OUTPUTDIR/libs/


echo "Done setting up minified release in $OUTPUTDIR, you may now copy assets to your deployment staging"
date;

