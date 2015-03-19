#!/bin/bash

# Dependancies:
# nodejs installed from source and on your PATH
# requirejs installed locally in the FieldDB project

# This script expects you to have installed requirejs in the root of FieldDB (which expects you have npm installed which expects you have nodejs installed)
# $ cd FieldDB
# $ npm install requirejs
#
# Note: If you have requirejs installed globally, replace the backbone_client/node_modules/requirejs/bin/r.js below with the global executable
grunt browserify

rm backbone_client/bower_components/fielddb/fielddb.js
ln -s $FIELDDB_HOME/FieldDB/fielddb.js backbone_client/bower_components/fielddb/fielddb.js


sed 's/\/\/# sourceMappingURL=jquery.min.map//' backbone_client/bower_components/jquery/dist/jquery.min.js  > output
mv output backbone_client/bower_components/jquery/dist/jquery.min.js



#welcome is just a redirect to either user or corpus
rm -rf couchapp_minified/_attachments

mkdir -p couchapp_minified/_attachments/user
mkdir -p couchapp_minified/_attachments/user
mkdir -p couchapp_minified/_attachments/images
mkdir -p couchapp_minified/_attachments/app
mkdir -p couchapp_minified/_attachments/libs/bootstrap/css


# backbone_client/node_modules/requirejs/bin/r.js -o  backbone_client/build_backup_pouches_dashboard.js
# cp release/backup_pouches_dashboard.js couchapp_minified/_attachments/

backbone_client/node_modules/requirejs/bin/r.js -o  backbone_client/build_user_online_dashboard.js
cp release/user_online_dashboard.js couchapp_minified/_attachments/

backbone_client/node_modules/requirejs/bin/r.js -o  backbone_client/build_corpus_online_dashboard.js
cp release/corpus_online_dashboard.js couchapp_minified/_attachments/




cp -R backbone_client/activity couchapp_minified/_attachments/activity

cp backbone_client/app/*.css couchapp_minified/_attachments/app/

cp backbone_client/corpus.html couchapp_minified/_attachments/corpus.html
cp backbone_client/user.html couchapp_minified/_attachments/user.html

cp backbone_client/images/and_venn_diagram.png couchapp_minified/_attachments/images/and_venn_diagram.png

cp backbone_client/manifest.json couchapp_minified/_attachments/manifest.json
cp backbone_client/images/icon.png couchapp_minified/_attachments/images/icon.png
cp backbone_client/favicon.ico couchapp_minified/_attachments/favicon.ico
cp backbone_client/images/*dev.png couchapp_minified/_attachments/images/
cp backbone_client/images/loader.gif couchapp_minified/_attachments/images/loader.gif
cp backbone_client/images/spinner.gif couchapp_minified/_attachments/images/spinner.gif
cp backbone_client/images/or_venn_diagram.png couchapp_minified/_attachments/images/or_venn_diagram.png

cp backbone_client/libs/bootstrap/css/*.css couchapp_minified/_attachments/libs/bootstrap/css/
cp backbone_client/libs/d3.v2.js couchapp_minified/_attachments/libs/d3.v2.js
cp -R backbone_client/libs/font_awesome couchapp_minified/_attachments/libs/font_awesome
cp backbone_client/libs/require.js couchapp_minified/_attachments/libs/require.js
cp backbone_client/libs/analytics.js couchapp_minified/_attachments/libs/analytics.js
cp -R backbone_client/libs/terminal couchapp_minified/_attachments/libs/terminal/

cp backbone_client/manifest.json couchapp_minified/_attachments/manifest.json

cp -R backbone_client/user/layouts couchapp_minified/_attachments/user/layouts

cp -R backbone_client/user/skins couchapp_minified/_attachments/user/skins



rm -rf couchapp_minified/lists
cp -R couchapp_dev/lists couchapp_minified/lists

rm -rf couchapp_minified/views
cp -R couchapp_dev/views couchapp_minified/views

rm -rf release


echo " If you cant build because core.js is missing, comment out atob and crypto in api/Confidential.js "
echo '   /* globals window */'
echo '   var AES = {}; //require("crypto-js/aes");'
echo '   var CryptoEncoding = {};// require("crypto-js/enc-utf8");'
echo '   var FieldDBObject = require("./../FieldDBObject").FieldDBObject;'
echo '   '
echo '   try {'
echo '     if (!window.atob) {'
echo '       console.log("ATOB is not defined, loading from npm");'
echo '     }'
echo '   } catch (e) {'
echo '     console.log(e);'
echo '     /*jshint -W020 */'
echo '     window = {};'
echo '     // window.atob = require("atob");'
echo '     // window.btoa = require("btoa");'
echo '   }'
