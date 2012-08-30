#!/bin/bash

echo ""
echo ""
echo "Put the Backbone source into online development mode, and also into easyDevelopmentMode so that new developers don't have to know how to set up a server or databases"
sed 's/Utils.debugMode *= *false/Utils.debugMode = true/' public/libs/Utils.js  > output
mv output public/libs/Utils.js
sed 's/Utils.productionMode *= *false/Utils.productionMode = true/' public/libs/Utils.js  > output
mv output public/libs/Utils.js
sed 's/Utils.easyDevelopmentMode *= *false/Utils.easyDevelopmentMode = true/' public/libs/Utils.js  > output
mv output public/libs/Utils.js

echo ""
echo ""
echo "Put the Node server to use debug/development mode"
sed 's/var productionMode *= *true/var productionMode = false/' app.js  > output
mv output app.js
sed 's/var productionMode *= *true/var productionMode = false/' lib/restfullmongooseusers.js  > output
mv output lib/restfullmongooseusers.js