#!/bin/bash

echo ""
echo ""
echo "Put the Backbone source back into debug/development mode"
sed 's/Utils.productionMode *= *true/Utils.productionMode = false/' public/libs/Utils.js  > output
mv output public/libs/Utils.js
sed 's/Utils.debugMode *= *false/Utils.debugMode = true/' public/libs/Utils.js  > output
mv output public/libs/Utils.js

echo ""
echo ""
echo "Put the Node server back into debug/development mode"
sed 's/var productionMode *= *true/var productionMode = false/' app.js  > output
mv output app.js
