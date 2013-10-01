echo "Building couchapps"
cd $FIELDDB_HOME/FieldDB
./scripts/build_fielddb_minified.sh
./scripts/build_activity_feed.sh

echo "Deploy template corpus"
cd couchapp_minified
erica push . $1"/new_corpus"

echo "Deploy template activity feeds"
cd ../couchapp_activities
erica push . $1"/new_corpus_activity_feed"
erica push . $1"/new_user_activity_feed"
