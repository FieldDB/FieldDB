#!/bin/bash

echo ""
echo "Put the Node server to act as the localhost server"
sed 's/nodeconfig_[^)]*)/nodeconfig_local")/' server.js  > output
mv output server.js
sed 's/couchkeys_[^)]*)/couchkeys_local")/' server.js  > output
mv output server.js

echo "Now running in local/offline developer mode using the localhost."

