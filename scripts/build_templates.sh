#!/bin/bash

cd couchapp/_attachments
rm libs/compiled_handlebars.js

find . -name '*.handlebars' -type f | 
while read NAME ; 
	do 
		echo "Compiling "${NAME}
		../../node_modules/handlebars/bin/handlebars "${NAME}" -f "${NAME}.js" ;
		cat "${NAME}.js" >> libs/compiled_handlebars.js; 
		rm "${NAME}.js" 
	done

date;
