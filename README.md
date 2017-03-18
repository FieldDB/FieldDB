[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-url]][daviddm-image]


FieldDB is a modular, open source project developed collectively by field linguists and software developers to make an expandable user-friendly app which can be used to collect, search and share your data, both online and offline. It is fundamentally an app written in 100% Javascript which runs entirely client side, backed by a NoSQL database (we are currently using CouchDB and its offline browser wrapper PouchDB alpha). It has a number of webservices which it connects to in order to allow users to perform tasks which require the internet/cloud (ie, syncing data between devices and users, sharing data publicly, running CPU intensive processes to analyze/extract/search audio/video/text). While the app was designed for "field linguists" it can be used by anyone collecting text/audio/video data or collecting highly structured data where the fields on each data point require encryption and/or customization from user to user, and where the schema/structure of the data is expected to evolve over the course of data collection while in the "field."

FieldDB was officially launched in Spanish on August 1st 2012 in Patzun, Guatemala as iCampo an app for fieldlinguists. Since then more than 500 users at [50+ universities](https://github.com/FieldDB/FieldDB/issues/1766#issuecomment-67926709) that we know of have started using and giving us [feedback](https://github.com/FieldDB/FieldDB/milestones?state=closed) about the app. You can find a tutorial and goals of the project on its website [LingSync.org](http://lingsync.org) or find "technical" details about the project on the [Dev site](http://fielddb.github.io/FieldDB/). You can also watch screencasts which demo how parts of the app & infrastructure work by [searching on YouTube](https://www.youtube.com/results?search_query=lingsync+).


## Client apps/libraries:

There are quite a few client apps which use FieldDB api/corpora. Each project is designed with a particular user type (student, researcher, lab manager, scripter, power user) and context (field, lab, classroom) in mind. Each project has build/install/use instruction and example code in it's own README.md 

* The [Prototype](https://github.com/FieldDB/FieldDB/tree/master/backbone_client) This app is where we prototyped all the features needed for collaborative data management of evolving data.<br>
<img src="https://cloud.githubusercontent.com/assets/196199/6283103/08d15ce0-b912-11e4-852c-b4c1d9adb243.png"  height="200" />
<img src="https://cloud.githubusercontent.com/assets/196199/6283117/301332ce-b912-11e4-8b7d-99ea1fc83ddf.png"  height="200" />
* The [Spreadsheet](https://github.com/FieldDB/FieldDB/tree/master/angular_client/modules/spreadsheet) This is a student project to build an app that can be used with very little training or experience. It is focused on data entry and has only basic search/export/import/customization and can't handle large data sets. It has keybindings like a spreadsheets.
 <br>
 
<img src="https://cloud.githubusercontent.com/assets/196199/6282997/7a9048fc-b910-11e4-90f6-709bfa068f1f.png" height="200">

* [Dative](https://github.com/jrwdunham/dative) This app is designed for research teams who are going to be searching and cleaning their data, it is the next app to use after you find the Spreadsheet app too limited.

<img src="https://raw.githubusercontent.com/jrwdunham/dative/master/dative-screenshot.png" height="200">

* The [Psycholinguistics Dashboard](https://github.com/ProjetDeRechercheSurLecriture/DyslexDisorthGame) This app is used to import participant lists and run experiements (games) and view their results.

<img src="https://cloud.githubusercontent.com/assets/196199/4587030/b0326662-5023-11e4-91fe-596a4a1aa8d0.png" height="200">

* The [Psycholinguistics MontageJS library](https://github.com/ProjetDeRechercheSurLecriture/oprime-montage) This library has functionality for displaying/running and building experiements in the Montage.js framework.

<img src="https://cloud.githubusercontent.com/assets/196199/4506891/8bad9030-4b07-11e4-9643-7a3e1748e633.png" height="200">
* The [Activity Feed widget](https://github.com/FieldDB/FieldDB/tree/master/angular_client/modules/activity) This app lets you view the activity feed of a corpus.<br>

<img src="https://cloud.githubusercontent.com/assets/196199/6282469/527dc6b2-b908-11e4-8790-4df19acbd163.png"  height="200" />
* The [Learn X app](https://github.com/FieldDB/AndroidLanguageLearningClientForFielddb) This is an Android app which lets you turn your corpus into a collaborative language learning app so that heritage speakers can use field methods to collect stories and analyze them.

<img src="https://f.cloud.github.com/assets/196199/2483261/6c4e6442-b0fe-11e3-93df-e74309100571.png" height="200">
* The Android [Elicitation Session Recorder](https://github.com/FieldDB/AndroidFieldDBElicitationRecorder) This app lets you record video sessions and upload them to the audio server for processing straight from your Android. This was also a student project and has a force closeon Android 4.4.
* The Android [Speech Recognition Trainer App](https://github.com/batumi/AndroidSpeechRecognitionTrainer) This app uses pocketsphinx on Android. It lets native speakers of low resource languages speak training data to their device which is used to build their voice model. Any corpus can be used as training data and as the data grows the user' language model improves and the app can recognize more words. We tested the app on ქართული (Georgian) we had little expectations for the recognition to work or be useable but we have reasonably okay results for SMS messages. This app can also be used for produciton experiments (it presents a visual and text representation which the user should read).<br>
<img src="https://cloud.githubusercontent.com/assets/196199/3277961/25a67bb0-f39d-11e3-8ff2-917b06069261.png"  height="200" />
* The [My Dictionary](https://github.com/FieldDB/DictionaryChromeExtension) This is a chrome extension which can be customized for any langauge which has a wiktionary. It is able to look up the word in the wiktionary and display the word's information to you on any website. Useful for browsing Facebook in your heritage language.
<img src="https://cloud.githubusercontent.com/assets/196199/6282739/1cb609a0-b90c-11e4-99c1-03a5c4c519e7.png" height="200">
* The [Lexicon Browser](https://github.com/FieldDB/FieldDBLexicon) This app displays the lexicon of a corpus as a connected graph of morphemes. You can edit the morphemes, and clean the data where the morphemes are used. You can add discussion and linking between morphemes.
<img src="https://f.cloud.github.com/assets/196199/2366164/8555cb70-a6f3-11e3-93ec-140fcaad2294.png" height="200">
* The [Word Cloud Visualizer](https://github.com/FieldDB/FieldDBWordCloudChromeApp) This app uses D3 to display the words in a corpus in a word cloud. You can use this interface to lematize morphemes and play with the data in a frequency oriented way where the most frequent words pop out at the user.
<img src="https://cloud.githubusercontent.com/assets/196199/6282934/6bc5fb10-b90f-11e4-8e4c-8fb9bbf0799f.png" height="200">
* You can [add others](https://github.com/FieldDB/FieldDB/edit/master/README.md) if there any missing in this list...


# Building a new server

We created two scripts to simplify the process of downloading and building the FieldDB dependancies into one directory. (There is also a Windows port of the script which you can use for setting up a new windows development machine, some key data manipulation libraries (Canvas and ImageMagic) dont run on Windows so we wouldn't encourage trying to use a Windows machine as a server.)

* [Mac developer script](https://raw.githubusercontent.com/FieldDB/FieldDB/master/install_mac_download_and_set_up_fielddb_servers_for_new_developers_quick_start.sh)
<pre>
$ cd $HOME/Downloads && curl -O --retry 999 --retry-max-time 0 -C - https://raw.githubusercontent.com/FieldDB/FieldDB/master/install_mac_download_and_set_up_fielddb_servers_for_new_developers_quick_start.sh && bash install_mac_download_and_set_up_fielddb_servers_for_new_developers_quick_start.sh
</pre>
* [Linux developer script](https://raw.githubusercontent.com/FieldDB/FieldDB/master/install_linux_download_and_set_up_fielddb_servers_for_new_developers_quick_start.sh) 
<pre>
$ cd $HOME/Downloads && wget https://raw.githubusercontent.com/FieldDB/FieldDB/master/install_linux_download_and_set_up_fielddb_servers_for_new_developers_quick_start.sh && bash install_linux_download_and_set_up_fielddb_servers_for_new_developers_quick_start.sh
</pre>

## Core webservices:

These are the webservices which the FieldDB clients use, and which make up the complete FieldDB architecture. If you fork the project, you might also be intersted in forking these repositories and adapting them to your needs. 

* [Authentication webservice](https://github.com/FieldDB/AuthenticationWebService) (for creation of new users and their accounts on the various webservices)
* [FieldDB Webserver](https://github.com/FieldDB/FieldDBWebServer) (for public URLs)
* [Database webservice](http://couchdb.apache.org/) (we are using pure CouchDB for this webservice)

## Optional webservices
* [Audio webservice](https://github.com/FieldDB/AudioWebService) (for hosting audio files and running processes such as the ProsodyLab's Aligner)
* [Lexicon webservice](https://github.com/FieldDB/LexiconWebService) (for search functionality, and glosser functionality if you are a linguist)


# How to Help

We are very friendly and welcome newbies who want to learn more about scripting and data processing. We use Javascript for almost everything in the project so that it is easier for non-programmers to learn how to program so feel free to ask us questions or make feature requests. We will help you figure out if you can do that feature, or at least work on part of it.

Easy way

1. [Signup for a GitHub account](https://github.com/signup/free) (GitHub is free for OpenSource)
1. Click on the "Fork" button to create your own copy.
1. Leave us a note in our [issue tracker](https://github.com/FieldDB/FieldDB/issues) to tell us a bit about the feature/bug you want to work on.
1. You can [follow the 4 GitHub Help Tutorials](http://help.github.com/) to install and use Git on your computer.
1. Feel free to ask us questions in our [issue tracker](https://github.com/FieldDB/FieldDB/issues), we're friendly and welcome Open Source newbies.
1. Clone the code to your computer (you can use the [GitHub Desktop app](https://desktop.github.com)).
1. You can watch/search the videos on [YouTube dev playlist](https://www.youtube.com/playlist?list=PLUrH6CNxFDrO3zLHtHAMW-8u_v7TSvE-H) and/or in the [Developer's Blog](https://wwwdev.lingsync.org/dev.html) to find out how the codebase works, and to find where is the code that you want to edit. You might also like the [user tutorial screencasts](https://www.youtube.com/playlist?list=PLUrH6CNxFDrMtraL8hTLbLsQwdw1117FT) to see how the app is supposed to behave. Feel free to ask us questions in our [issue tracker](https://github.com/FieldDB/FieldDB/issues), we're friendly and welcome Open Source newbies.
1. Search for a word or string that will help you find the relevant code on your computer (We use [Sublime Text](https://github.com/FieldDB/FieldDB/issues/1542) which helps alot). Edit the code on your computer, commit your changes referencing the issue #xxxx you created ("fixes #xxxx i changed blah blah...") and click Sync in the GitHub app to sync changes to your origin.
1. Click on the ["Pull Request" button](https://github.com/FieldDB/FieldDB/compare), and leave us a note about what you changed. We will look at your changes and help you bring them into the project!

Advanced way

1. Click on the "Fork" button to create your own copy.
1. Clone the code to your computer
1. You should also try to run the tests `$ npm install` and `$ grunt test` it should say something like `Finished in 10.388 seconds 732 tests, 2308 assertions, 0 failures, 0 skipped` 
![screen shot 2015-02-20 at 11 53 50 am](https://cloud.githubusercontent.com/assets/196199/6281625/301ea14c-b8f7-11e4-9682-dfa4a102a722.png) 
Then you can also run the entire build `$ grunt travis` to make sure your changes dont affect other parts of the app. If any of these parts errors, ask us for help in the [issue tracker](https://github.com/FieldDB/FieldDB/issues). 
1. Create a new branch for new fixes or features, this is easier to build a fix/feature specific pull request than if you work in your `master` branch directly.
1. Run `grunt watch` which will run the tests as you make changes.
1. Add failing tests for the change you want to make. Run `grunt test` to see the tests fail.
1. Fix stuff.
1. Look at the terminal output (assuming you ran `grunt watch`) to see if the tests pass. Repeat steps 2-4 until done.
1. Open `$ open tests/SpecRunner.html` unit test file(s) in actual browser(s) (Chrome Canary, Firefox, Safari) to ensure tests pass everywhere.
1. Update the documentation to reflect any changes.
1. Push to your fork and submit a [pull request](https://github.com/FieldDB/FieldDB/compare) and leave us a note about what you changed. We will look at your changes and help you bring them into the project!
s

# Interns and Development Team

* [Louisa Bielig](https://www.lingsync.org/louisabielig) (McGill)
* [M.E. Cathcart](http://udel.edu/~mdotedot/) (U Delaware)
* [Gina Chiodo](http://gina.ilanguage.ca/) (iLanguage Lab Ltd)
* [Theresa Deering](http://trisapeace.angelfire.com/) (Visit Scotland, Aquafadas)
* [Joel Dunham](http://lingserver.arts.ubc.ca/linguistics/people/jdunham/) (Concordia, UBC)
* [Josh Horner](http://www.jdhorner.com/) (Amilia)
* [Yuliya Manyakina](http://ymanyakina.github.io/) (McGill)
* [Elise McClay](https://github.com/Kedersha) (McGill)
* [Hisako Noguchi](http://linguistics.concordia.ca/gazette.html) (Concordia)
* [Jesse Pollak](http://jessepollak.me/) (Pomona College)
* [Tobin Skinner](http://tobinskinner.com) (Amilia, McGill)
* [Xianli Sun](http://myaamiacenter.org/) (Miami University)

# Funding

We would like to thank SSHRC Connection Grant (\#611-2012-0001) and SSHRC Standard Research Grant (\#410-2011-2401) which advocates open-source approaches to knowledge mobilization and partially funded the students who have doubled as fieldwork research assistants and interns on the project. We would like to thank numerous other granting agencies which have funded the RAs and TAs who have also contributed to the project as interns. If you have a student/RA who you would like to customize the project for your needs, contact us at support @ lingsync . org 

# License 

This project is released under the [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0.html) license, which is an very non-restrictive open source license which basically says you can adapt the code to any use you see fit. 

[npm-url]: https://npmjs.org/package/fielddb
[npm-image]: https://badge.fury.io/js/fielddb.svg
[travis-url]: https://travis-ci.org/FieldDB/FieldDB
[travis-image]: https://travis-ci.org/FieldDB/FieldDB.svg?branch=master
[daviddm-url]: https://david-dm.org/FieldDB/FieldDB.svg?theme=shields.io
[daviddm-image]: https://david-dm.org/FieldDB/FieldDB
