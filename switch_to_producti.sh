#!/bin/bash

echo ""
echo "Put the Node server to act as the production server"
sed 's/nodeconfig_[^)]*)/nodeconfig_production")/' server.js  > output
mv output server.js
sed 's/couchkeys_[^)]*)/couchkeys_production")/' server.js  > output
mv output server.js
sed 's/nodeconfig_[^)]*)/nodeconfig_production")/' httpredirectapp.js  > output
mv output httpredirectapp.js

echo "Now running in production mode. "
