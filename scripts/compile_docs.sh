#!/bin/bash

# This script builds the docs, you can also see them online here:
# http://builder.ilanguage.ca/job/FieldDB/ws/javadoc/index.html

rm -rf jsdocs
java -jar jsrun.jar jsdocsrun.js backbone_client/ -t=templates/jsdoc -d=jsdocs
date;
