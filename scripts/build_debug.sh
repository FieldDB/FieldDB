#!/bin/bash
cd couchapp
couchapp push . https://devgina:test@localhost:6984/devgina-firstcorpus


cd ../../AndroidFieldDB/assets
bash build_debug.sh
