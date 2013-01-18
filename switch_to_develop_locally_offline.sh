#!/bin/bash

echo ""
echo ""
echo "Put the Chrome app source into debug mode to see the debugging output."
sed 's/Utils.debugMode *= *false/Utils.debugMode = true/' couchapp/_attachments/libs/Utils.js  > output
mv output couchapp/_attachments/libs/Utils.js

echo ""
echo ""
echo "Put the dev analytics code."
sed 's/_AnalyticsCode = "UA-[0123456789]*-1";/_AnalyticsCode = "UA-32705284-1";/' couchapp/_attachments/libs/analytics.js  > output
mv output couchapp/_attachments/libs/analytics.js

echo ""
echo ""
echo "Tell the Chrome app to contact the local webservices."
sed 's/webservicesconfig_[^,]*/webservicesconfig_local"/' couchapp/_attachments/corpus_dashboard.js  > output
mv output couchapp/_attachments/corpus_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_local"/' couchapp/_attachments/lingllama_dashboard.js  > output
mv output couchapp/_attachments/lingllama_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_local"/' couchapp/_attachments/user_dashboard.js  > output
mv output couchapp/_attachments/user_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_local"/' couchapp/_attachments/welcome_dashboard.js  > output
mv output couchapp/_attachments/welcome_dashboard.js

echo ""
echo ""
echo "Putting the Chrome app's manifest into the local manifest for testing local webservices running on the same computer as the chrome extension"
cp couchapp/_attachments/manifest_local.json couchapp/_attachments/manifest.json
cp couchapp/_attachments/images/icon128_local.png couchapp/_attachments/images/icon.png

echo ""
echo ""
echo "Now running in local/offline developer mode using the localhost webservices"

