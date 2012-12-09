#!/bin/bash


cd ../AndroidFieldDB/assets
bash build_debug.sh

cd ../../FieldDB/couchapp
couchapp push . https://admin:none@localhost:6984/devgina-firstcorpus

