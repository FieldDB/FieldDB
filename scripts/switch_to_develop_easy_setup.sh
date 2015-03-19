#!/bin/bash

echo ""
echo ""
echo "Put the Chrome app source into debug mode to see the debugging output."
sed 's/OPrime.debugMode *= *true/OPrime.debugMode = false/' backbone_client/libs/OPrime.js  > output
mv output backbone_client/libs/OPrime.js


echo ""
echo ""
# echo "Put the dev analytics code."
# sed 's/_AnalyticsCode = "UA-[0123456789]*-1";/_AnalyticsCode = "UA-32705284-1";/' backbone_client/libs/analytics.js  > output
# mv output backbone_client/libs/analytics.js

echo ""
echo ""
echo "Tell the Chrome app to contact the dev webservices."
sed 's/webservicesconfig_[^,]*/webservicesconfig_devserver"/' backbone_client/corpus_dashboard.js  > output
mv output backbone_client/corpus_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_devserver"/' backbone_client/lingllama_dashboard.js  > output
mv output backbone_client/lingllama_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_devserver"/' backbone_client/user_dashboard.js  > output
mv output backbone_client/user_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_devserver"/' backbone_client/welcome_dashboard.js  > output
mv output backbone_client/welcome_dashboard.js

sed 's/webservicesconfig_[^,]*/webservicesconfig_devserver"/' backbone_client/corpus_online_dashboard.js  > output
mv output backbone_client/corpus_online_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_devserver"/' backbone_client/user_online_dashboard.js  > output
mv output backbone_client/user_online_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_devserver"/' backbone_client/welcome_online_dashboard.js  > output
mv output backbone_client/welcome_online_dashboard.js


echo ""
echo ""
echo "Putting the Chrome app's manifest into the dev manifest for release into the Chrome store as the unstable bleeding egde chromeapp  for users who like to be on the bleeding edge"
cp backbone_client/manifest_dev.json backbone_client/manifest.json
cp backbone_client/images/icon128_dev.png backbone_client/images/icon.png

echo ""
echo ""
echo "Now running in developer mode using the dev webservices. You can now create your Chrome extension to deploy the unstable/bleeding edge app for users who want to be on the unstable branch."

