#!/bin/bash

rm -rf jsdocs
java -jar jsrun.jar jsdocsrun.js couchapp/_attachments/ -t=templates/jsdoc -d=jsdocs
date;
