#!/bin/bash

CURRENTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../"
OUTPUTDIR="release_spreadsheet/_attachments"


echo "Minifiying app and putting it into the $OUTPUTDIR"
rm -rf $OUTPUTDIR/*
./angular_client/scripts/build_minified.sh spreadsheet $OUTPUTDIR

echo "Pushing to the LingSync spreadsheet database"
cd $CURRENTDIR


cd $OUTPUTDIR
PS1="\[\033[0;31m\][\$(date +%H%M)][\u@\h:\w]$\[\033[0m\] "
read -p "Are you sure? DO NOT deploy to the real login unless you intend to deploy to users' databases. (erica push lingsyncspreadsheet)" -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]
then
  # do dangerous stuff
erica push lingsyncspreadsheet
fi

echo "Switching back to the current directory $CURRENTDIR"
cd $CURRENTDIR