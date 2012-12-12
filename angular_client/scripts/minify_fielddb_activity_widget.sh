#!/bin/bash

cd modules/activity
rm lib/fielddb_activity_feed_widget.js
rm lib/fielddb_activity_feed_widget.min.js


find . -name '*.js' -type f | 
while read NAME ; 
	do 
		echo "Compiling "${NAME}
		cat "${NAME}" >> lib/fielddb_activity_feed_widget.js; 
		#rm "${NAME}.js" 
	done

#Prepend OPrime
mv lib/fielddb_activity_feed_widget.js temp
cat lib/oprime/OPrime.js > lib/fielddb_activity_feed_widget.js
cat temp >> lib/fielddb_activity_feed_widget.js
rm temp

#Minify using uglify-js
../../../node_modules/uglify-js/bin/uglifyjs lib/fielddb_activity_feed_widget.js > lib/fielddb_activity_feed_widget.min.js
date;
