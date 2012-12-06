#!/bin/bash

echo ""
echo ""
echo "Put the Chrome app source into non debug mode to not see the debugging output. This makes the app faster."
sed 's/Utils.debugMode *= *true/Utils.debugMode = false/' public/libs/Utils.js  > output
mv output public/libs/Utils.js


echo ""
echo ""
echo "Put the production analytics code."
sed 's/_AnalyticsCode = "UA-[0123456789]*-1";/_AnalyticsCode = "UA-35422317-1";/' public/libs/analytics.js  > output
mv output public/libs/analytics.js

echo ""
echo ""
echo "Tell the Chrome app to contact the production webservices."
sed 's/webservicesconfig_[^,]*/webservicesconfig_production"/' public/corpus_dashboard.js  > output
mv output public/corpus_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_production"/' public/lingllama_dashboard.js  > output
mv output public/lingllama_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_production"/' public/user_dashboard.js  > output
mv output public/user_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_production"/' public/welcome_dashboard.js  > output
mv output public/welcome_dashboard.js

echo ""
echo ""
echo "Putting the Chrome app's manifest into the production manifest for release into the Chrome store as the stable (branded) version of the app."
cp public/manifest_production.json public/manifest.json
cp public/icon128_production.png public/icon.png

echo ""
echo ""
echo "Now running in production mode using the production webservices. You can now create your Chrome extension for production deployment."


