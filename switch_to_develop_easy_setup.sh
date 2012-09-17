#!/bin/bash

echo ""
echo ""
echo "Put the Node server to act as the development server"
sed 's/nodeconfig_[^)]*)/nodeconfig_devserver")/' service.js  > output
mv output service.js

sed 's/nodeconfig_[^)]*)/nodeconfig_devserver")/' lib/restfullmongooseusers.js  > output
mv output lib/restfullmongooseusers.js
sed 's/everyauthconfig_[^)]*)/everyauthconfig_devserver")/' lib/restfullmongooseusers.js  > output
mv output lib/restfullmongooseusers.js
sed 's/couchkeys_[^)]*)/couchkeys_devserver")/' lib/restfullmongooseusers.js  > output
mv output lib/restfullmongooseusers.js


echo ""
echo ""
echo "Now running in developer mode."

