#!/bin/bash

# Dependancies:
# nodejs installed from source and on your PATH
# requirejs installed locally in the FieldDB project

# This script expects you to have installed requirejs in the root of FieldDB (which expects you have npm installed which expects you have nodejs installed)
# $ cd FieldDB
# $ npm install requirejs
#
# Note: If you have requirejs installed globally, replace the node_modules/requirejs/bin/r.js below with the global executable

# Concatinate/minify the activity feed module
backbone_client/node_modules/requirejs/bin/r.js -o  angular_client/modules/activity/client/build_activity_feed.js

cp angular_client/modules/activity/release/js/main.js angular_client/modules/activity/client/libs/fielddb_activity_feed_widget.js
cp angular_client/modules/activity/release/js/main.js backbone_client/activity/libs/fielddb_activity_feed_widget.js

#putting the activity feed widgets into the minified couchapp
cp angular_client/modules/activity/release/js/main.js couchapp_minified/_attachments/activity/libs/fielddb_activity_feed_widget.js

# Putting activity feed files into the couchapp_activities which can host the activity feeds
rm -rf couchapp_activities/_attachments
cp -r angular_client/modules/activity/release couchapp_activities/_attachments

