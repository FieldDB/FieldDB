#!/bin/bash

node_modules/requirejs/bin/r.js -o  angular_client/modules/activity/client/build_activity_feed.js 

cp angular_client/modules/activity/release/js/main.js angular_client/modules/activity/client/libs/fielddb_activity_feed_widget.js

cp angular_client/modules/activity/release/js/main.js couchapp/_attachments/activity/libs/fielddb_activity_feed_widget.js 
cp angular_client/modules/activity/release/js/main.js couchapp_minified/_attachments/activity/libs/fielddb_activity_feed_widget.js
# Putting activity feed files into the couchapp
rm -rf couchapp_activities/_attachments

cp -r angular_client/modules/activity/release couchapp_activities/_attachments

