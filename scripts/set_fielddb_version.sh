#!/bin/bash

BIRTHDAY="Tue Apr 20 12:00:00 EDT 2012";
BIRTHDAY_TIMESTAMP=1334941200;

today="$(echo `date`)"
todayTimestamp="$(echo `date  +%s`)"

echo ""
echo "____========== Getting the version code for today =============_______"
echo " Birthday: $BIRTHDAY"
echo " Today: $today"
echo " Birthday: $BIRTHDAY_TIMESTAMP "
echo " Today: $todayTimestamp"
echo ""
echo ""

let WEEK_DIFF=`expr $todayTimestamp - $BIRTHDAY_TIMESTAMP`/60/60/24/7 || exit 4;

if [ "$WEEK_DIFF" -gt 208 ]
  then
  YEAR_DIFF=4
  WEEK_DIFF=`expr $WEEK_DIFF - 209`
elif [ "$WEEK_DIFF" -gt 155 ]
  then
  YEAR_DIFF=3
  WEEK_DIFF=`expr $WEEK_DIFF - 156`
elif [ "$WEEK_DIFF" -gt 104 ]
  then
  YEAR_DIFF=2
  WEEK_DIFF=`expr $WEEK_DIFF - 105`
elif [ "$WEEK_DIFF" -gt 52 ]
  then
  YEAR_DIFF=1
  WEEK_DIFF=`expr $WEEK_DIFF - 53`
else
  YEAR_DIFF=0
fi
# NOW=`date +%Y.%m.%d.%H.%M`
MINOR_VERSION=`date +%d.%H.%M`
DAY=`date +%d`

SHORT_VERSION="$YEAR_DIFF.$WEEK_DIFF.$DAY"
version="$YEAR_DIFF.$WEEK_DIFF.$MINOR_VERSION"
echo " Birthday: $BIRTHDAY"
echo " Today: $today"
echo " Years: $YEAR_DIFF"
echo " Weeks: $WEEK_DIFF"
echo "  ->    Version: $version"
echo ""

echo "... setting version on fielddb bower"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' bower.json  > output
mv output bower.json
echo "... setting version on fielddb npm"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' package.json  > output
mv output package.json
echo "... setting version on fielddb chrome"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' manifest.json  > output
mv output manifest.json

echo "... setting version on fielddb-angular bower"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' angular_client/modules/core/bower.json  > output
mv output angular_client/modules/core/bower.json
echo "... setting version on fielddb-angular npm"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' angular_client/modules/core/package.json  > output
mv output angular_client/modules/core/package.json

echo "... setting version on fielddb-corpus-pages-app bower"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' angular_client/modules/corpuspages/bower.json  > output
mv output angular_client/modules/corpuspages/bower.json
echo "... setting version on fielddb-corpus-pages-app npm"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' angular_client/modules/corpuspages/package.json  > output
mv output angular_client/modules/corpuspages/package.json

echo "... setting version on fielddb-spreadsheet bower"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' angular_client/modules/spreadsheet/bower.json  > output
mv output angular_client/modules/spreadsheet/bower.json
echo "... setting version on fielddb-spreadsheet npm"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' angular_client/modules/spreadsheet/package.json  > output
mv output angular_client/modules/spreadsheet/package.json

echo "... setting version on fielddb-spreadsheet controller"
sed 's/appVersion = "[^,]*ss"/appVersion = "'$version'ss"/' angular_client/modules/spreadsheet/app/scripts/controllers/SpreadsheetController.js  > output
mv output angular_client/modules/spreadsheet/app/scripts/controllers/SpreadsheetController.js


echo "... setting version on fielddb-prototype chrome manifest"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' backbone_client/manifest.json  > output
mv output backbone_client/manifest.json
echo "... setting version on fielddb-prototype chrome manifest dev"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' backbone_client/manifest_dev.json  > output
mv output backbone_client/manifest_dev.json
echo "... setting version on fielddb-prototype chrome manifest local"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' backbone_client/manifest_local.json  > output
mv output backbone_client/manifest_local.json
echo "... setting version on fielddb-prototype chrome manifest packaged"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' backbone_client/manifest_dev_packaged.json  > output
mv output backbone_client/manifest_dev_packaged.json
echo "... setting version on fielddb-prototype chrome manifest miami"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' backbone_client/manifest_miami.json  > output
mv output backbone_client/manifest_miami.json
echo "... setting version on fielddb-prototype bower"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' backbone_client/bower.json  > output
mv output backbone_client/bower.json
# echo "... setting version on fielddb-prototype npm"
# sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' backbone_client/package.json  > output
# mv output backbone_client/package.json
#
#
echo ""
read -r -p "Update version on other fielddb projects? [y/N] " response
case $response in
  [yY][eE][sS]|[yY])

;;
*)
echo "..... Done."
exit 0;
;;
esac


echo ""
echo "Commonjs libs: "
echo "... setting version on fielddb-glosser bower"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' ../FieldDBGlosser/bower.json  > output
mv output ../FieldDBGlosser/bower.json
echo "... setting version on fielddb-glosser npm"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' ../FieldDBGlosser/package.json  > output
mv output ../FieldDBGlosser/package.json

echo "... setting version on praat textgrid js lib bower"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' ../PraatTextGridJS/bower.json  > output
mv output ../PraatTextGridJS/bower.json
echo "... setting version on praat textgrid js lib npm"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' ../PraatTextGridJS/package.json  > output
mv output ../PraatTextGridJS/package.json


echo ""
echo "Android clients: "
echo "... setting version on fielddb android lib"
sed 's/android:versionName="[^,]*"/android:versionName="'$SHORT_VERSION'"/' ../AndroidFieldDB/AndroidManifest.xml  > output
mv output ../AndroidFieldDB/AndroidManifest.xml

echo "... setting version on learn x "
sed 's/android:versionName="[^,]*"/android:versionName="'$SHORT_VERSION'"/' ../AndroidLanguageLearningClientForFieldDB/AndroidManifest.xml  > output
mv output ../AndroidLanguageLearningClientForFieldDB/AndroidManifest.xml

echo "... setting version on learn x "
sed 's/android:versionName="[^,]*"/android:versionName="'$SHORT_VERSION'"/' ../../batumihome/AndroidSpeechRecognitionTrainer/AndroidManifest.xml  > output
mv output ../../batumihome/AndroidSpeechRecognitionTrainer/AndroidManifest.xml


echo ""
echo "Chrome clients: "
echo "... setting version on dictionary chrome extension"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' ../DictionaryChromeExtension/extension/manifest.json  > output
mv output ../DictionaryChromeExtension/extension/manifest.json


echo ""
echo "Node.js services: "
echo "... setting version on fielddb-audio service npm"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' ../AudioWebService/package.json  > output
mv output ../AudioWebService/package.json

echo "... setting version on fielddb-corpus service npm"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' ../CorpusWebService/package.json  > output
mv output ../CorpusWebService/package.json

echo "... setting version on fielddb-auth service npm"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' ../AuthenticationWebService/package.json  > output
mv output ../AuthenticationWebService/package.json

echo "... setting version on fielddb web server npm"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' ../FieldDBWebServer/package.json  > output
mv output ../FieldDBWebServer/package.json

echo "... setting version on fielddb-audio service npm"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' ../AudioWebService/package.json  > output
mv output ../AudioWebService/package.json

echo "... setting version on fielddb-lexicon service npm"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' ../LexiconWebService/package.json  > output
mv output ../LexiconWebService/package.json


echo ""
echo "Node.js libs: "
echo "... setting version on praat scripts npm"
sed 's/"version": "[^,]*"/"version": "'$SHORT_VERSION'"/' ../Praat-Scripts/package.json  > output
mv output ../Praat-Scripts/package.json





echo "..... Done."

exit 0;
