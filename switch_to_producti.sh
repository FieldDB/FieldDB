#!/bin/bash

echo ""
echo ""
echo "Put the Node server to act as the production server"
sed 's/nodeconfig_[^)]*)/nodeconfig_production")/' server.js  > output
mv output server.js

echo ""
echo ""
echo "Now running in production mode. "
