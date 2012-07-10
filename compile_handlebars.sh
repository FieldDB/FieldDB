#!/bin/bash

cd public
rm libs/compiled_handlebars.js

find . -name '*.handlebars' -type f | 
while read NAME ; 
	do 
		echo "Compiling "${NAME}
		handlebars "${NAME}" -f "${NAME}.js" ;
		cat "${NAME}.js" >> libs/compiled_handlebars.js; 
		rm "${NAME}.js" 
	done
