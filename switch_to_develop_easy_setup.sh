#!/bin/bash

echo ""
echo ""
echo "Put the Chrome app source into debug mode to see the debugging output."
sed 's/OPrime.debugMode *= *true/OPrime.debugMode = false/' couchapp/_attachments/libs/OPrime.js  > output
mv output couchapp/_attachments/libs/OPrime.js


echo ""
echo ""
echo "Put the dev analytics code."
sed 's/_AnalyticsCode = "UA-[0123456789]*-1";/_AnalyticsCode = "UA-32705284-1";/' couchapp/_attachments/libs/analytics.js  > output
mv output couchapp/_attachments/libs/analytics.js

echo ""
echo ""
echo "Tell the Chrome app to contact the dev webservices."
sed 's/webservicesconfig_[^,]*/webservicesconfig_devserver"/' couchapp/_attachments/corpus_dashboard.js  > output
mv output couchapp/_attachments/corpus_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_devserver"/' couchapp/_attachments/lingllama_dashboard.js  > output
mv output couchapp/_attachments/lingllama_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_devserver"/' couchapp/_attachments/user_dashboard.js  > output
mv output couchapp/_attachments/user_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_devserver"/' couchapp/_attachments/welcome_dashboard.js  > output
mv output couchapp/_attachments/welcome_dashboard.js

sed 's/webservicesconfig_[^,]*/webservicesconfig_devserver"/' couchapp/_attachments/corpus_online_dashboard.js  > output
mv output couchapp/_attachments/corpus_online_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_devserver"/' couchapp/_attachments/user_online_dashboard.js  > output
mv output couchapp/_attachments/user_online_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_devserver"/' couchapp/_attachments/welcome_online_dashboard.js  > output
mv output couchapp/_attachments/welcome_online_dashboard.js
echo ""
echo ""
echo "Putting the Chrome app's manifest into the dev manifest for release into the Chrome store as the unstable bleeding egde chromeapp  for users who like to be on the bleeding edge"
cp couchapp/_attachments/manifest_dev.json couchapp/_attachments/manifest.json
cp couchapp/_attachments/images/icon128_dev.png couchapp/_attachments/images/icon.png

echo ""
echo ""
echo "Now running in developer mode using the dev webservices. You can now create your Chrome extension to deploy the unstable/bleeding edge app for users who want to be on the unstable branch."

