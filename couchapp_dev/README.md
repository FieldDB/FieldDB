This is the whole FieldDB App Client.

You can run it in 3 ways:

## Chrome Extension  

If you want to debug the app, this is the best way to go. You can modify the source, refresh the browser and you have the new code. To install this app go to chrome://chrome/extensions, check
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

If you want to deploy the app, the fastest way is to push it to a couchdb.
You can use the couchapp_minified folder, and the minification script.

## Android App

If you want to run the app as an Native Android app you can use the AndroidFieldDB project combined with the build_release_android.sh script. 

Running on Android is farely complex as it requires you to set up 5 Android libraries, 3 for TouchDB (a local http server which implements the couchdb API) and 2 for OPrime (an offline Android data management/psycholinguistics experimentation library).
