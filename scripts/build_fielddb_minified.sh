#!/bin/bash

#welcome is just a redirect to either user or corpus
node_modules/requirejs/bin/r.js -o  couchapp/_attachments/build_backup_pouches_dashboard.js 
cp couchapp/release/backup_pouches_dashboard.js couchapp_minified/_attachments/

node_modules/requirejs/bin/r.js -o  couchapp/_attachments/build_user_online_dashboard.js
cp couchapp/release/user_online_dashboard.js couchapp_minified/_attachments/

node_modules/requirejs/bin/r.js -o  couchapp/_attachments/build_corpus_online_dashboard.js
cp couchapp/release/corpus_online_dashboard.js couchapp_minified/_attachments/

cp couchapp/_attachments/app/app.css couchapp_minified/_attachments/app/app.css

cp couchapp/_attachments/manifest.json couchapp_minified/_attachments/manifest.json
