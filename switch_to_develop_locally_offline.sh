#!/bin/bash

echo ""
echo ""
echo "Put the Node server to act as the localhost server"
sed 's/nodeconfig_[^)]*)/nodeconfig_local")/' service.js  > output
mv output service.js

sed 's/nodeconfig_[^)]*)/nodeconfig_local")/' lib/restfullmongooseusers.js  > output
mv output lib/restfullmongooseusers.js
sed 's/everyauthconfig_[^)]*)/everyauthconfig_local")/' lib/restfullmongooseusers.js  > output
mv output lib/restfullmongooseusers.js
sed 's/couchkeys_[^)]*)/couchkeys_local")/' lib/restfullmongooseusers.js  > output
mv output lib/restfullmongooseusers.js

echo ""
echo ""
echo "Now running in local/offline developer mode using the localhost."

