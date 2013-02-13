#!/bin/bash

# NOTE: we prefer using handlebars locally in your project, the build_templates.js 
# but if you already use nodejs for other projects, you can use this script to use the globally installed handlebars

# Dependancies:
# nodejs installed from source and on your PATH
# handlebars installed globally (use the other build_templates.sh script if you want to use handlebars locally in the FieldDB project)

# This script expects you to have installed handlebars globally (which expects you have npm installed which expects you have nodejs installed)
# $ cd FieldDB
# $ sudo npm install -g  handlebars


cd backbone_client
rm libs/compiled_handlebars.js

find . -name '*.handlebars' -type f | 
while read NAME ; 
	do 
		echo "Compiling "${NAME}
		handlebars "${NAME}" -f "${NAME}.js" ;
		cat "${NAME}.js" >> libs/compiled_handlebars.js; 
		rm "${NAME}.js" 
	done

date;
