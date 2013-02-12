#!/bin/bash

echo ""
echo "Put the Node server to act as the production server"
sed 's/nodeconfig_[^)]*)/nodeconfig_production")/' service.js  > output
mv output service.js

sed 's/nodeconfig_[^)]*)/nodeconfig_production")/' lib/userauthentication.js  > output
mv output lib/userauthentication.js
sed 's/couchkeys_[^)]*)/couchkeys_production")/' lib/userauthentication.js  > output
mv output lib/userauthentication.js
sed 's/mailconfig_[^)]*)/mailconfig_production")/' lib/userauthentication.js  > output
mv output lib/userauthentication.js

sed 's/couchkeys_[^)]*)/couchkeys_production")/' lib/corpusmanagement.js  > output
mv output lib/corpusmanagement.js
sed 's/nodeconfig_[^)]*)/nodeconfig_production")/' lib/corpusmanagement.js  > output
mv output lib/corpusmanagement.js
echo "Now running in production mode. "
