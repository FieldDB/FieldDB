#!/bin/bash

rm public/libs/compiled_handlebars.js

find . -name '*.handlebars' -type f | 
while read NAME ; 
	do 
		handlebars "${NAME}" -f "${NAME}.js" ;
		cat "${NAME}.js" >> public/libs/compiled_handlebars.js; 
		rm "${NAME}.js" 
	done
