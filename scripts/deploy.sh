#!/bin/bash

bash ~/IMPORTANTSTUFF/fielddb/deploy.sh

exit 0

# Notes :
# This script runs a private script that looks a little like this:

# Declare our servers
TESTING=https://topsecret:password@ourcouch.iriscouch.com
MCGILL=http://topsecret:password@localhost:5984
LOCALHOST=https://admin:none@localhost:6984

COUCHAPPDIR="couchapp_minified"

echo "============================================="
echo "======== Deploying User's Couchapps ========="
echo "============================================="

cd ~/fielddbworkspace/FieldDB
./switch_to_develop_easy_setup.sh
./scripts/build_templates.sh
./scripts/build_fielddb_minified.sh

cd $COUCHAPPDIR
echo "Deploying key corpora on the testing couch"

BETAUSERSCORPORA="some space seperated beta users databases here"
for db in $BETAUSERSCORPORA; do
  couchapp push . $TESTING/$db
done

echo "Building activity feeds"
cd ../
./scripts/build_activity_feed.sh
cd couchapp_activities/
echo "Deploying key activity feeds on the testing couch"

BETAUSERSACTIVITYFEEDS="some space seperated beta users databases here"
for db in $BETAUSERSACTIVITYFEEDS; do
  couchapp push . $TESTING/$db
done

# Only deploy to beta testers
exit 0


echo "Deploying to normal users on the testing couch"

cd ../
cd $COUCHAPPDIR

USERSCORPORA="some users databases here"
for db in $USERSCORPORA; do
  couchapp push . $TESTING/$db
done

echo "Building activity feeds"
cd ../
./scripts/build_activity_feed.sh
cd couchapp_activities/

USERSACTIVITYFEEDS="some users databases here"
for db in $USERSACTIVITYFEEDS; do
  couchapp push . $TESTING/$db
done