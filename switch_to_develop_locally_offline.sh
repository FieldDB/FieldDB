#!/bin/bash

echo ""
echo ""
echo "Put the Chrome app source into debug mode to see the debugging output."
sed 's/Utils.debugMode *= *false/Utils.debugMode = true/' public/libs/Utils.js  > output
mv output public/libs/Utils.js

echo "Tell the Chrome app to contact the local webservices."
sed 's/webservicesconfig_[^,]*/webservicesconfig_local"/' public/main_dashboard.js  > output
mv output public/main_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_local"/' public/main.js  > output
mv output public/main.js

echo ""
echo ""
echo "Put the Node server to act as the localhost server"
sed 's/nodeconfig_[^)]*)/nodeconfig_local")/' app.js  > output
mv output app.js

sed 's/nodeconfig_[^)]*)/nodeconfig_local")/' lib/restfullmongooseusers.js  > output
mv output lib/restfullmongooseusers.js
sed 's/everyauthconfig_[^)]*)/everyauthconfig_local")/' lib/restfullmongooseusers.js  > output
mv output lib/restfullmongooseusers.js
sed 's/couchkeys_[^)]*)/couchkeys_local")/' lib/restfullmongooseusers.js  > output
mv output lib/restfullmongooseusers.js

echo ""
echo ""
echo "Putting the Chrome app's manifest into the local manifest for testing local webservices running on the same computer as the chrome extension"
cp public/manifest_local.json public/manifest.json

echo ""
echo ""
echo "Now running in local/offline developer mode using the localhost webservices"

