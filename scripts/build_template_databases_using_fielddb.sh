echo "Building couchapps"
cd $FIELDDB_HOME/FieldDB
./scripts/build_fielddb_minified.sh
./scripts/build_activity_feed.sh

URL=$1
# URL="http://admin:none@localhost:5984"
CORPUS_DB="new_corpus"

echo "Deploy deprecated map reduces"
cd couchapp_minified
couchapp push $URL"/"$CORPUS_DB

echo "Deploy data map reduces"
cd $FIELDDB_HOME/FieldDB/map_reduce_data
couchapp push $URL"/"$CORPUS_DB


CORPUS_DB="new_testing_corpus"

echo "Deploy deprecated map reduces"
cd $FIELDDB_HOME/FieldDB/couchapp_minified
couchapp push $URL"/"$CORPUS_DB

echo "Deploy data map reduces"
cd $FIELDDB_HOME/FieldDB/map_reduce_data
couchapp push $URL"/"$CORPUS_DB


echo "Deploy template activity feeds"
cd $FIELDDB_HOME/FieldDB/map_reduce_activities
couchapp push $URL"/new_corpus_activity_feed"
couchapp push $URL"/new_user_activity_feed"


echo "Deploy prototype pages"
cd $FIELDDB_HOME/FieldDB/couchapp_prototype
couchapp push $URL"/prototype"


echo "Deploy gamify template"
cd $FIELDDB_HOME/FieldDB/map_reduce_gamify
couchapp push $URL"/new_gamify_corpus"

echo "Deploy learnx template"
cd $FIELDDB_HOME/FieldDB/map_reduce_learnx
couchapp push $URL"/new_learnx_corpus"

echo "Deploy wordcloud template"
cd $FIELDDB_HOME/FieldDB/map_reduce_wordcloud
couchapp push $URL"/new_wordcloud_corpus"


echo "Deploy lexicon template"
cd $FIELDDB_HOME/FieldDB/map_reduce_lexicon
couchapp push $URL"/new_lexicon"

echo "Deploy export template"
cd $FIELDDB_HOME/FieldDB/map_reduce_export
couchapp push $URL"/new_export"
