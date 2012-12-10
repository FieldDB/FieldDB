#!/bin/bash

echo ""
echo ""
echo "Put the Chrome app source into debug mode to see the debugging output."
sed 's/Utils.debugMode *= *false/Utils.debugMode = true/' public/libs/Utils.js  > output
mv output public/libs/Utils.js

echo ""
echo ""
echo "Put the dev analytics code."
sed 's/_AnalyticsCode = "UA-[0123456789]*-1";/_AnalyticsCode = "UA-32705284-1";/' public/libs/analytics.js  > output
mv output public/libs/analytics.js

echo ""
echo ""
echo "Tell the Chrome app to contact the local webservices."
sed 's/webservicesconfig_[^,]*/webservicesconfig_local"/' public/corpus_dashboard.js  > output
mv output public/corpus_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_local"/' public/lingllama_dashboard.js  > output
mv output public/lingllama_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_local"/' public/user_dashboard.js  > output
mv output public/user_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_local"/' public/welcome_dashboard.js  > output
mv output public/welcome_dashboard.js

echo ""
echo ""
echo "Putting the Chrome app's manifest into the local manifest for testing local webservices running on the same computer as the chrome extension"
cp public/manifest_local.json public/manifest.json
cp public/icon128_local.png public/icon.png

echo ""
echo ""
echo "Now running in local/offline developer mode using the localhost webservices"

