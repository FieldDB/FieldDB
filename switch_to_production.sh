#!/bin/bash

echo ""
echo ""
echo "Put the Chrome app source into non debug mode to not see the debugging output. This makes the app faster."
sed 's/OPrime.debugMode *= *true/OPrime.debugMode = false/' couchapp/_attachments/libs/OPrime.js  > output
mv output couchapp/_attachments/libs/OPrime.js


echo ""
echo ""
echo "Put the production analytics code."
sed 's/_AnalyticsCode = "UA-[0123456789]*-1";/_AnalyticsCode = "UA-35422317-1";/' couchapp/_attachments/libs/analytics.js  > output
mv output couchapp/_attachments/libs/analytics.js

echo ""
echo ""
echo "Tell the Chrome app to contact the production webservices."
sed 's/webservicesconfig_[^,]*/webservicesconfig_production"/' couchapp/_attachments/corpus_dashboard.js  > output
mv output couchapp/_attachments/corpus_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_production"/' couchapp/_attachments/lingllama_dashboard.js  > output
mv output couchapp/_attachments/lingllama_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_production"/' couchapp/_attachments/user_dashboard.js  > output
mv output couchapp/_attachments/user_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_production"/' couchapp/_attachments/welcome_dashboard.js  > output

mv output couchapp/_attachments/welcome_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_production"/' couchapp/_attachments/corpus_online_dashboard.js  > output
mv output couchapp/_attachments/corpus_online_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_production"/' couchapp/_attachments/user_online_dashboard.js  > output
mv output couchapp/_attachments/user_online_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_production"/' couchapp/_attachments/welcome_online_dashboard.js  > output
mv output couchapp/_attachments/welcome_online_dashboard.js

echo ""
echo ""
echo "Putting the Chrome app's manifest into the production manifest for release into the Chrome store as the stable (branded) version of the app."
cp couchapp/_attachments/manifest_production.json couchapp/_attachments/manifest.json
cp couchapp/_attachments/images/icon128_production.png couchapp/_attachments/images/icon.png

echo ""
echo ""
echo "Now running in production mode using the production webservices. You can now create your Chrome extension for production deployment."


