#!/bin/bash

cd app
rm lib/fielddb_activity_feed_widget.js

find . -name '*.js' -type f | 
while read NAME ; 
	do 
		echo "Compiling "${NAME}
		cat "${NAME}" >> lib/fielddb_activity_feed_widget.js; 
		#rm "${NAME}.js" 
	done

date;
