#!/bin/bash

rm -rf jsdocs
java -jar jsrun.jar jsdocsrun.js public/ -t=templates/jsdoc -d=jsdocs
date;
