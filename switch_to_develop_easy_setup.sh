#!/bin/bash

echo ""
echo ""
echo "Put the Chrome app source into debug mode to see the debugging output."
sed 's/Utils.debugMode *= *false/Utils.debugMode = true/' public/libs/Utils.js  > output
mv output public/libs/Utils.js

echo "Tell the Chrome app to contact the dev webservices."
sed 's/webservicesconfig_[^,]*/webservicesconfig_devserver"/' public/main_dashboard.js  > output
mv output public/main_dashboard.js

echo ""
echo ""
echo "Put the Node server to act as the development server"
sed 's/nodeconfig_[^)]*)/nodeconfig_devserver")/' app.js  > output
mv output app.js

sed 's/nodeconfig_[^)]*)/nodeconfig_devserver")/' lib/restfullmongooseusers.js  > output
mv output lib/restfullmongooseusers.js
sed 's/everyauthconfig_[^)]*)/everyauthconfig_devserver")/' lib/restfullmongooseusers.js  > output
mv output lib/restfullmongooseusers.js
sed 's/couchkeys_[^)]*)/couchkeys_devserver")/' lib/restfullmongooseusers.js  > output
mv output lib/restfullmongooseusers.js