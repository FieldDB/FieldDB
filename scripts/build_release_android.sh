#!/bin/bash

# Build and minify the angular app
#cp -r angular_app/client release_android/client

# Push just the authentication to the Android assets?


# Push minified angular app to the wentworth fake couch
rm -rf  release_couchapp/_attachments
cp -r angular_app/client release_couchapp/_attachments
cd release_couchapp
couchapp push wentworth
