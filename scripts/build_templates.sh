#!/bin/bash

# Dependancies:
# nodejs installed from source and on your PATH
# handlebars installed locally in the FieldDB project (use the other build_templates_global.sh script if you want to use handlebars installed globally )

# This script expects you to have installed handlebars in the root of FieldDB (which expects you have npm installed which expects you have nodejs installed)
# $ cd FieldDB
# $ npm install  handlebars


cd backbone_client
rm libs/compiled_handlebars.js

find . -name '*.handlebars' -type f |
while read NAME ;
	do
		echo "Compiling "${NAME}
		../backbone_client/node_modules/handlebars/bin/handlebars "${NAME}" -f "${NAME}.js" ;
		cat "${NAME}.js" >> libs/compiled_handlebars.js;
		rm "${NAME}.js"
	done

date;
