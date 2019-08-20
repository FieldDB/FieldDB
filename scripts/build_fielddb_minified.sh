#!/bin/bash

# Dependancies:
# nodejs installed from source and on your PATH
# requirejs installed locally in the FieldDB project

# This script expects you to have installed requirejs in the root of FieldDB (which expects you have npm installed which expects you have nodejs installed)
# $ cd FieldDB
# $ npm install requirejs
#
# Note: If you have requirejs installed globally, replace the backbone_client/node_modules/requirejs/bin/r.js below with the global executable
npm run build
echo "Installing dependancies"
cd backbone_client
npm install
npm install bower --no-save
npm run optionalPostinstall

echo "Compiling templates (so that the app doesnt need to use eval() )"
cd ../
./scripts/build_templates.sh

echo "Copying a local copy of the fielddb commonjs"
rm backbone_client/bower_components/fielddb/fielddb.js
cp ./fielddb.js backbone_client/bower_components/fielddb/fielddb.js


sed 's/\/\/# sourceMappingURL=jquery.min.map//' backbone_client/bower_components/jquery/dist/jquery.min.js  > output
mv output backbone_client/bower_components/jquery/dist/jquery.min.js



#welcome is just a redirect to either user or corpus
rm -rf couchapp_prototype/_attachments

mkdir -p couchapp_prototype/_attachments/user
mkdir -p couchapp_prototype/_attachments/user
mkdir -p couchapp_prototype/_attachments/images
mkdir -p couchapp_prototype/_attachments/bower_components/requirejs
mkdir -p couchapp_prototype/_attachments/bower_components/fielddb
# mkdir -p couchapp_prototype/_attachments/bower_components/d3
mkdir -p couchapp_prototype/_attachments/app
mkdir -p couchapp_prototype/_attachments/libs/bootstrap/css


# backbone_client/node_modules/requirejs/bin/r.js -o  backbone_client/build_backup_pouches_dashboard.js
# cp release/backup_pouches_dashboard.js couchapp_prototype/_attachments/
echo "Building user_online_dashboard using require.js "
backbone_client/node_modules/requirejs/bin/r.js -o  backbone_client/build_user_online_dashboard.js
cp release/user_online_dashboard.js couchapp_prototype/_attachments/
echo "Building corpus_online_dashboard using require.js "
backbone_client/node_modules/requirejs/bin/r.js -o  backbone_client/build_corpus_online_dashboard.js
cp release/corpus_online_dashboard.js couchapp_prototype/_attachments/




cp -R backbone_client/activity couchapp_prototype/_attachments/activity

cp backbone_client/app/*.css couchapp_prototype/_attachments/app/

cp backbone_client/corpus.html couchapp_prototype/_attachments/corpus.html
cp backbone_client/user.html couchapp_prototype/_attachments/user.html

cp backbone_client/images/and_venn_diagram.png couchapp_prototype/_attachments/images/and_venn_diagram.png

cp backbone_client/manifest.json couchapp_prototype/_attachments/manifest.json
cp backbone_client/images/icon.png couchapp_prototype/_attachments/images/icon.png
cp backbone_client/favicon.ico couchapp_prototype/_attachments/favicon.ico
cp backbone_client/images/*dev.png couchapp_prototype/_attachments/images/
cp backbone_client/images/loader.gif couchapp_prototype/_attachments/images/loader.gif
cp backbone_client/images/spinner.gif couchapp_prototype/_attachments/images/spinner.gif
cp backbone_client/images/or_venn_diagram.png couchapp_prototype/_attachments/images/or_venn_diagram.png

cp backbone_client/libs/bootstrap/css/*.css couchapp_prototype/_attachments/libs/bootstrap/css/
# cp backbone_client/bower_components/d3/d3.js couchapp_prototype/_attachments/bower_components/d3/d3.js
cp -R backbone_client/libs/font_awesome couchapp_prototype/_attachments/libs/font_awesome
cp backbone_client/bower_components/requirejs/require.js couchapp_prototype/_attachments/bower_components/requirejs/require.js
cp backbone_client/libs/analytics.js couchapp_prototype/_attachments/libs/analytics.js

cp backbone_client/bower_components/fielddb/fielddb.js couchapp_prototype/_attachments/bower_components/fielddb/fielddb.js

cp backbone_client/manifest.json couchapp_prototype/_attachments/manifest.json

cp -R backbone_client/user/layouts couchapp_prototype/_attachments/user/layouts

cp -R backbone_client/user/skins couchapp_prototype/_attachments/user/skins

rm -rf release
