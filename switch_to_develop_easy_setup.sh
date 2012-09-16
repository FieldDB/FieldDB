#!/bin/bash

echo ""
echo ""
echo "Put the Chrome app source into debug mode to see the debugging output."
sed 's/Utils.debugMode *= *false/Utils.debugMode = true/' public/libs/Utils.js  > output
mv output public/libs/Utils.js

echo ""
echo ""
echo "Tell the Chrome app to contact the dev webservices."
sed 's/webservicesconfig_[^,]*/webservicesconfig_devserver"/' public/main_dashboard.js  > output
mv output public/main_dashboard.js
sed 's/webservicesconfig_[^,]*/webservicesconfig_devserver"/' public/main.js  > output
mv output public/main.js

echo ""
echo ""
echo "Putting the Chrome app's manifest into the dev manifest for release into the Chrome store as the unstable bleeding egde chromeapp  for users who like to be on the bleeding edge"
cp public/manifest_dev.json public/manifest.json

echo ""
echo ""
echo "Now running in developer mode using the dev webservices. You can now create your Chrome extension to deploy the unstable/bleeding edge app for users who want to be on the unstable branch."

