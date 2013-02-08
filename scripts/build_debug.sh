#!/bin/bash

bash scripts/build_templates.sh


bash scripts/build_activity_feed.sh
#cd ../AndroidFieldDB/assets
#bash build_debug.sh

#cd ../../FieldDB/couchapp

./scripts/build_fielddb_minified.sh

#cd couchapp
cd couchapp_minified

couchapp push . https://admin:none@localhost:6984/public-firstcorpus
#couchapp push . https://public:none@corpusdev.lingsync.org/public-firstcorpus
#couchapp push . https://public:none@corpus.lingsync.org/public-firstcorpus

# Deploy app to the template corpus
couchapp push . https://admin:none@localhost:6984/new_corpus

# Deploy app to the testing corpuses
couchapp push . https://admin:none@localhost:6984/ginalocal4-secondcorpus
#couchapp push . https://devgina:test@corpusdev.lingsync.org/devgina-secondcorpus

# deploy activity feed too
cd ../couchapp_activities

couchapp push . https://admin:none@localhost:6984/new_user_activity_feed
couchapp push . https://admin:none@localhost:6984/new_corpus_activity_feed

#couchapp push . https://admin:none@localhost:6984/ginalocal4-secondcorpus-activity_feed
#couchapp push . https://admin:none@localhost:6984/ginalocal4-activity_feed
