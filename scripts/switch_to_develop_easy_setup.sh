#!/bin/bash

echo ""
echo ""
echo "Put the Chrome app source into debug mode to see the debugging output."
sed 's/Utils.debugMode *= *true/Utils.debugMode = false/' client/libs/Utils.js  > output
mv output client/libs/Utils.js


echo ""
echo ""
echo "Put the dev analytics code."
sed 's/_AnalyticsCode = "UA-[0123456789]*-1";/_AnalyticsCode = "UA-32705284-1";/' client/libs/analytics.js  > output
mv output client/libs/analytics.js

echo ""
echo ""
echo "Tell the Chrome app to contact the dev webservices."
sed 's/webservicesconfig_[^,]*/webservicesconfig_devserver"/' client/corpus_dashboard.js  > output
mv output client/corpus_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_devserver"/' client/user_dashboard.js  > output
mv output client/user_dashboard.js

echo ""
echo ""
echo "Putting the Chrome app's manifest into the dev manifest for release into the Chrome store as the unstable bleeding egde chromeapp  for users who like to be on the bleeding edge"
cp client/manifest_dev.json client/manifest.json
cp client/images/icon128_dev.png client/images/icon.png

echo ""
echo ""
echo "Now running in developer mode using the dev webservices. You can now create your Chrome extension to deploy the unstable/bleeding edge app for users who want to be on the unstable branch."

