#!/bin/bash

echo ""
echo ""
echo "Put the Chrome app source into debug mode to see the debugging output."
sed 's/Utils.debugMode *= *false/Utils.debugMode = true/' client/libs/Utils.js  > output
mv output client/libs/Utils.js

echo ""
echo ""
echo "Put the dev analytics code."
sed 's/_AnalyticsCode = "UA-[0123456789]*-1";/_AnalyticsCode = "UA-32705284-1";/' client/libs/analytics.js  > output
mv output client/libs/analytics.js

echo ""
echo ""
echo "Tell the Chrome app to contact the local webservices."
sed 's/webservicesconfig_[^,]*/webservicesconfig_local"/' client/corpus_dashboard.js  > output
mv output client/corpus_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_local"/' client/user_dashboard.js  > output
mv output client/user_dashboard.js

echo ""
echo ""
echo "Putting the Chrome app's manifest into the local manifest for testing local webservices running on the same computer as the chrome extension"
cp client/manifest_local.json client/manifest.json
cp client/images/icon128_local.png client/images/icon.png

echo ""
echo ""
echo "Now running in local/offline developer mode using the localhost webservices"

