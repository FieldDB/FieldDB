This was the backbone client, where most of the code base was prototyped. 

It is now on its way to becomming common js files you can read to build new FieldDB clients and to help you test your clients to make sure they are contributing to high quality data using EMELD and DataOne best practices. 

This code is like compilable documentation, and helps explain how different components of the system work together.

You can run this codebase in 3 (or more) ways:

## Chrome Extension  

If you want to load the javascript, put breakpoints and poke around, this is the best way to go. You can modify the source, refresh the browser and you have the new code. To install this app go to chrome://chrome/extensions, check
'developer mode', then click on 'Load unpacked extensions...' and
select the subfolder _attachments here.

If you get a blank black screen, look at the developer console and if it says

Failed to load resource chrome-extension://chpphlmbdnlddgbhiplfpolgfhpadfip/libs/compiled_handlebars.js

you will need to go to the top level folder (above this folder), do

    $ cd FieldDB
    $ npm install handlebars
    $ bash scripts/build_templates.sh

(you need to do this only once when you first download the codebase, and run build_templates.sh every time you change the handlebars templates)


## CouchApp

If you want to test bots or widgets which run in the database you can deploy the app in a couchapp so that it can run online on URL.
You can use the couchapp_dev folder and the build_debug.sh script, or the couchapp_minified folder, and the build_fielddb_minified.sh script.

## Node.js

Most of these models are built to be shared by FielDB webservices. details to come.
