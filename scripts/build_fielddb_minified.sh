#!/bin/bash

# Dependancies:
# nodejs installed from source and on your PATH
# requirejs installed locally in the FieldDB project

# This script expects you to have installed requirejs in the root of FieldDB (which expects you have npm installed which expects you have nodejs installed)
# $ cd FieldDB
# $ npm install requirejs
# 
# Note: If you have requirejs installed globally, replace the node_modules/requirejs/bin/r.js below with the global executable

#welcome is just a redirect to either user or corpus
node_modules/requirejs/bin/r.js -o  backbone_client/build_backup_pouches_dashboard.js 
cp release/backup_pouches_dashboard.js couchapp_minified/_attachments/

node_modules/requirejs/bin/r.js -o  backbone_client/build_user_online_dashboard.js
cp release/user_online_dashboard.js couchapp_minified/_attachments/

node_modules/requirejs/bin/r.js -o  backbone_client/build_corpus_online_dashboard.js
cp release/corpus_online_dashboard.js couchapp_minified/_attachments/

cp backbone_client/app/app.css couchapp_minified/_attachments/app/app.css

cp backbone_client/manifest.json couchapp_minified/_attachments/manifest.json
