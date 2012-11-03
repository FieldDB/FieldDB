#!/bin/bash

echo ""
echo ""
echo "Put the Chrome app source into debug mode to see the debugging output."
sed 's/Utils.debugMode *= *true/Utils.debugMode = false/' public/libs/Utils.js  > output
mv output public/libs/Utils.js


echo ""
echo ""
echo "Put the dev analytics code."
sed 's/_AnalyticsCode = "UA-[0123456789]*-1";/_AnalyticsCode = "UA-32705284-1";/' public/libs/analytics.js  > output
mv output public/libs/analytics.js

echo ""
echo ""
echo "Tell the Chrome app to contact the dev webservices."
sed 's/webservicesconfig_[^,]*/webservicesconfig_devserver"/' public/corpus_dashboard.js  > output
mv output public/corpus_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_devserver"/' public/lingllama_dashboard.js  > output
mv output public/lingllama_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_devserver"/' public/user_dashboard.js  > output
mv output public/user_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_devserver"/' public/welcome_dashboard.js  > output
mv output public/welcome_dashboard.js

echo ""
echo ""
echo "Putting the Chrome app's manifest into the dev manifest for release into the Chrome store as the unstable bleeding egde chromeapp  for users who like to be on the bleeding edge"
cp public/manifest_dev.json public/manifest.json
cp public/icon128_dev.png public/icon.png

echo ""
echo ""
echo "Now running in developer mode using the dev webservices. You can now create your Chrome extension to deploy the unstable/bleeding edge app for users who want to be on the unstable branch."

