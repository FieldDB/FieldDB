#!/bin/bash

if [ $# -lt 2 ]
then
  echo "Usage: `basename $0` {arg}"
  echo "SORRY: To use this script you need to supply the couchurl and a user name which you would like to test with "
  echo "Exiting..."
  echo ""
  exit 65
fi

SERVER=$1

# Dependancies:
# couchdb : an http dataservice installed locally on your machine and running on https (http://couchdb.apache.org/)
# couchapp : a deployment tool installed on your machine and availiable on the PATH (https://github.com/couchapp/couchapp)
# nodejs : a javascript server and package manager most recent version and installed from source and on your PATH (http://nodejs.org/download/)
# handlebars : a templating engine installed locally in the FieldDB project (see build_templates.sh for more details)

# Optional Dependancies for the minification (see build_fielddb_minified.sh for more details):
# requirejs installed locally in the FieldDB project (use the Node Package Manager, NPM)

# We will debug on the testing couchdb
bash scripts/switch_to_develop_easy_setup.sh

# Optionally, if you have made changes to the html (handlebars templates)
bash scripts/build_templates.sh

# Optionally, if you have made changes to the activity feed widgets
bash scripts/build_activity_feed.sh

# Optionally, minify if you want to test with minification
bash scripts/build_fielddb_minified.sh

cd couchapp_minified

TESTUSERNAME=$2

couchapp push . $SERVER/public-firstcorpus

# Deploy app to the template corpus
couchapp push . $SERVER/new_corpus

# Deploy app to the testing corpora
couchapp push . $SERVER/$TESTUSERNAME-firstcorpus

# deploy activity feeds too
cd ../couchapp_activities

couchapp push . $SERVER/public-firstcorpus-activity_feed
couchapp push . $SERVER/public-activity_feed

couchapp push . $SERVER/new_user_activity_feed
couchapp push . $SERVER/new_corpus_activity_feed

couchapp push . $SERVER/$TESTUSERNAME-firstcorpus-activity_feed
couchapp push . $SERVER/$TESTUSERNAME-activity_feed
