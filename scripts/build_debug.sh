#!/bin/bash

bash scripts/build_templates.sh


bash scripts/build_activity_feed.sh
#cd ../AndroidFieldDB/assets
#bash build_debug.sh

#cd ../../FieldDB/couchapp
cd couchapp
couchapp push . https://admin:none@localhost:6984/devgina-firstcorpus
couchapp push . https://devgina:test@ifielddevs.iriscouch.com/devgina-firstcorpus
