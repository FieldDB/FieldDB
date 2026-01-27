echo "Building couchapps"
echo "It is preferable to replicate these databases from the production server to maintain continuity with the version numbers"
echo " Implemented in npm run setup in https://github.com/FieldDB/AuthenticationWebService/blob/150c1b5b1945761a3e197de6c65755d4c8d4c746/package.json#L81  "
echo "If these databases are not availbible from the production server, this file can be used to create new databases using the map reduces "
cd $FIELDDB_HOME/FieldDB
./scripts/build_fielddb_minified.sh
./scripts/build_activity_feed.sh

URL=$1
# URL="http://admin:none@localhost:5984"
CORPUS_DB="new_corpus"

# Install CMSCouchapp which works with Python 3 and couchdb 1.6
# https://github.com/couchapp/couchapp/compare/master...amaltaro:couchapp:master
python3 -m venv myenv
source myenv/bin/activate
pip install CMSCouchapp

echo "Deploy deprecated map reduces"
cd couchapp_minified
CMSCouchapp push -p `pwd -P` -c $URL"/"$CORPUS_DB

echo "Deploy data map reduces"
cd $FIELDDB_HOME/FieldDB/map_reduce_data
CMSCouchapp push -p `pwd -P` -c $URL"/"$CORPUS_DB


CORPUS_DB="new_testing_corpus"

echo "Deploy deprecated map reduces"
cd $FIELDDB_HOME/FieldDB/couchapp_minified
CMSCouchapp push -p `pwd -P` -c $URL"/"$CORPUS_DB

echo "Deploy data map reduces"
cd $FIELDDB_HOME/FieldDB/map_reduce_data
CMSCouchapp push -p `pwd -P` -c $URL"/"$CORPUS_DB


echo "Deploy template activity feeds"
cd $FIELDDB_HOME/FieldDB/map_reduce_activities
CMSCouchapp push -p `pwd -P` -c $URL"/new_corpus_activity_feed"
CMSCouchapp push -p `pwd -P` -c $URL"/new_user_activity_feed"


echo "Deploy prototype pages"
cd $FIELDDB_HOME/FieldDB/couchapp_prototype
CMSCouchapp push -p `pwd -P` -c $URL"/prototype"

echo "Deploy prototype pages"
cd $FIELDDB_HOME/FieldDB/couchapp_prototype
CMSCouchapp push -p `pwd -P` -c $URL"/prototypedev"

echo "Deploy gamify template"
cd $FIELDDB_HOME/FieldDB/map_reduce_gamify
CMSCouchapp push -p `pwd -P` -c $URL"/new_gamify_corpus"

echo "Deploy learnx template"
cd $FIELDDB_HOME/FieldDB/map_reduce_learnx
CMSCouchapp push -p `pwd -P` -c $URL"/new_learnx_corpus"

echo "Deploy wordcloud template"
cd $FIELDDB_HOME/FieldDB/map_reduce_wordcloud
CMSCouchapp push -p `pwd -P` -c $URL"/new_wordcloud_corpus"


echo "Deploy lexicon template"
cd $FIELDDB_HOME/FieldDB/map_reduce_lexicon
CMSCouchapp push -p `pwd -P` -c $URL"/new_lexicon"

echo "Deploy export template"
cd $FIELDDB_HOME/FieldDB/map_reduce_export
CMSCouchapp push -p `pwd -P` -c $URL"/new_export"
