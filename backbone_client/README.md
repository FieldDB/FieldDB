This is the backbone client, where most of the code base was in 2012. Since then we have ported this code to [CommonJS](https://github.com/OpenSourceFieldlinguistics/FieldDB/tree/master/api) so that it can be used in any Javascript framework.

You can see the Prototype in action by installing it from the [Chrome Store](https://chrome.google.com/webstore/detail/lingsync-prototype/eeipnabdeimobhlkfaiohienhibfcfpa?authuser)


![screen shot 2015-02-20 at 3 04 33 pm](https://cloud.githubusercontent.com/assets/196199/6283103/08d15ce0-b912-11e4-852c-b4c1d9adb243.png)

![screen shot 2015-02-20 at 3 05 44 pm](https://cloud.githubusercontent.com/assets/196199/6283117/301332ce-b912-11e4-8b7d-99ea1fc83ddf.png)

You can run this code in 3 ways:

## Chrome Extension  

If you want to debug the app, this is the best way to go. You can modify the source, refresh the browser and you have the new code. To install this app go to chrome://chrome/extensions, check
'developer mode', then click on 'Load unpacked extensions...' and
select the subfolder _attachments here.

If you get a blank black screen, look at the developer console and if it says

Failed to load resource chrome-extension://chpphlmbdnlddgbhiplfpolgfhpadfip/libs/compiled_handlebars.js

you will need to go to the top level folder (above this folder), do

    $ cd FieldDB
    $ npm install
    $ bash scripts/build_templates.sh

(you need to do this only once when you first download the codebase, and run build_templates.sh every time you change the handlebars templates)


## CouchApp

If you want to deploy the app so that it can run online on URL, the fastest way is to push it to a couchdb.
You can use the couchapp_dev folder and the build_debug.sh script, or the couchapp_minified folder, and the build_fielddb_minified.sh script.

## Android App

If you want to run the app as an Native Android app you can use the AndroidFieldDB project, combined with the build_release_android.sh script. 

Running on Android is farely complex as it requires you to set up 5 Android libraries, 3 for TouchDB (a local http server which implements the couchdb API) and 2 for OPrime (an offline Android data management/psycholinguistics experimentation library).



## Release History

For up-to-date details see the milestones

* December 2014 work began on [Dative](https://github.com/jrwdunham/dative) which will  replace both the Spreadsheet and the Prototype as the default app
* December 2013 was replaced with the Spreadhseet app for field methods classes
* January 2013 became online by default (so that students wouldnt have to learn how to use the sync buttons)
* August 2012 launched at the CAML workshop [videos](https://www.youtube.com/watch?v=eRTHu-5KvSQ&index=23&list=PLUrH6CNxFDrMtraL8hTLbLsQwdw1117FT) 


## Related apps

If you are interested in the Prototype app, you might be interested in some other  client apps which also use FieldDB.

* The [Psycholinguistics Dashboard](https://github.com/ProjetDeRechercheSurLecriture/DyslexDisorthGame)
* The [Learn X app](https://github.com/opensourcefieldlinguistics/AndroidLanguageLearningClientForFielddb)
* The Android [Elicitation Session Recorder](https://github.com/OpenSourceFieldlinguistics/AndroidFieldDBElicitationRecorder)
* The Android [Speech Recognition Trainer App](https://github.com/batumi/AndroidSpeechRecognitionTrainer)
* The [My Dictionary](https://github.com/OpenSourceFieldlinguistics/DictionaryChromeExtension) Chrome app
* The [Lexicon Browser](https://github.com/OpenSourceFieldlinguistics/FieldDBLexicon)
* The [Word Cloud Visualizer](https://github.com/OpenSourceFieldlinguistics/FieldDBWordCloudChromeApp)
