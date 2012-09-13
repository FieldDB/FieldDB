#!/bin/bash

echo ""
echo ""
echo "Put the Chrome app source into non debug mode to not see the debugging output. This makes the app faster."
sed 's/Utils.debugMode *= *true/Utils.debugMode = false/' public/libs/Utils.js  > output
mv output public/libs/Utils.js

echo "Tell the Chrome app to contact the production webservices."
sed 's/webservicesconfig_[^"]*)/webservicesconfig_production)/' public/main_dashboard.js  > output
mv output public/main_dashboard.js

echo ""
echo ""
echo "Put the Node server to act as the production server"
sed 's/nodeconfig_[^)]*)/nodeconfig_production")/' app.js  > output
mv output app.js

sed 's/nodeconfig_[^)]*)/nodeconfig_production")/' lib/restfullmongooseusers.js  > output
mv output lib/restfullmongooseusers.js
sed 's/everyauthconfig_[^)]*)/everyauthconfig_production")/' lib/restfullmongooseusers.js  > output
mv output lib/restfullmongooseusers.js
sed 's/couchkeys_[^)]*)/couchkeys_production")/' lib/restfullmongooseusers.js  > output
mv output lib/restfullmongooseusers.js