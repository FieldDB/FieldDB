#!/bin/bash

cd app
rm lib/fielddb_activity_feed_widget.js
rm lib/fielddb_activity_feed_widget.min.js
find . -name '*.js' -type f | 
while read NAME ; 
	do 
		echo "Compiling "${NAME}
		cat "${NAME}" >> lib/fielddb_activity_feed_widget.js; 
		#rm "${NAME}.js" 
	done

../../node_modules/uglify-js/bin/uglifyjs lib/fielddb_activity_feed_widget.js > lib/fielddb_activity_feed_widget.min.js
date;
