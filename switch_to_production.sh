#!/bin/bash

echo ""
echo ""
echo "Put the Backbone source into production mode"
sed 's/Utils.debugMode *= *true/Utils.debugMode = false/' public/libs/Utils.js  > output
mv output public/libs/Utils.js
sed 's/Utils.productionMode *= *false/Utils.productionMode = true/' public/libs/Utils.js  > output
mv output public/libs/Utils.js
sed 's/Utils.easyDevelopmentMode *= *true/Utils.easyDevelopmentMode = false/' public/libs/Utils.js  > output
mv output public/libs/Utils.js

echo ""
echo ""
echo "Put the Node server into production mode"
sed 's/var productionMode *= *false/var productionMode = true/' app.js  > output
mv output app.js
sed 's/var productionMode *= *false/var productionMode = true/' lib/restfullmongooseusers.js  > output
mv output lib/restfullmongooseusers.js
