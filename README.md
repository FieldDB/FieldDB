[![Build Status](https://travis-ci.org/OpenSourceFieldlinguistics/FieldDB.png)](https://travis-ci.org/OpenSourceFieldlinguistics/FieldDB)

FieldDB is a free, modular, open source project developed collectively by field linguists and software developers to make an expandable user-friendly app which can be used to collect, search and share your data, both online and offline. It is fundamentally an app written in 100% Javascript which runs entirely client side, backed by a NoSQL database (we are currently using CouchDB and its offline browser wrapper PouchDB alpha). It has a number of webservices which it connects to in order to allow users to perform tasks which require the internet/cloud (ie, syncing data between devices and users, sharing data publicly, running CPU intensive processes to analyze/extract/search audio/video/text). While the app was designed for "field linguists" it can be used by anyone collecting text data or collecting highly structured data where the fields on each data point require encryption or customization from user to user, and where the schema of the data is expected to evolve over the course of data collection while in the "field."

FieldDB beta was officially launched in English and Spanish on August 1st 2012 in Patzun, Guatemala as an [app for fieldlinguists](https://chrome.google.com/webstore/search/lingsync). 

[more info...](http://lingsync.org)

# Interns and Development Team

* [Louisa Bielig](https://github.com/louisa-bielig) (McGill)
* [M.E. Cathcart](http://udel.edu/~mdotedot/) (U Delaware)
* [Gina Cook](http://gina.ilanguage.ca/) (iLanguage Lab Ltd)
* [Theresa Deering](http://trisapeace.angelfire.com/) (Visit Scotland)
* [Josh Horner](https://github.com/jdhorner/) (iLanguage Lab Ltd)
* [Yuliya Kondratenko](https://github.com/kondrann) (Concordia)
* [Yuliya Manyakina](http://egg.auf.net/12/people/manyakinayuliya/) (Stony Brook)
* [Elise McClay](https://github.com/Kedersha) (McGill)
* [Hisako Noguchi](http://linguistics.concordia.ca/gazette.html) (Concordia)
* [Jesse Pollak](http://jessepollak.me/) (Pomona College)
* [Tobin Skinner](http://tobinskinner.com) (iLanguage Lab Ltd, UQAM)
* [Xianli Sun](http://myaamiacenter.org/) (Miami University)


# Funding

We would like to thank SSHRC Connection Grant (\#611-2012-0001) and SSHRC Standard Research Grant (\#410-2011-2401) which advocates open-source approaches to knowledge mobilization and partially funded the students who have doubled as fieldwork research assistants and interns on the project. We would like to thank numerous other granting agencies which have funded the RAs and TAs who have also contributed to the project as interns. If you have a student/RA who you would like to customize the project for your needs, contact us at support @ lingsync . org 

# License 

This project is released under the [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0.html) license, which is an very non-restrictive open source license which basically says you can adapt the code to any use you see fit. 

# How to Contribute Code

* [Signup for a GitHub account](https://github.com/signup/free) (GitHub is free for OpenSource)
* Click on the "Fork" button to create your own copy.
* Leave us a note in our [issue tracker](https://github.com/OpenSourceFieldlinguistics/FieldDB/issues) to tell us a bit about the bug/feature you want to work on.
* You can [follow the 4 GitHub Help Tutorials](http://help.github.com/) to install and use Git on your computer.
* You can watch the videos in the [Developer's Blog](https://www.lingsync.org/dev.html) to find out how the codebase works, and to find where is the code that you want to edit. Feel free to ask us questions in our [issue tracker](https://github.com/OpenSourceFieldlinguistics/FieldDB/issues), we're friendly and welcome Open Source newbies.
* Edit the code on your computer, commit it referencing the issue #xx you created ($ git commit -m "fixes #xx i changed blah blah...") and push to your origin ($ git push origin master).
* Click on the "Pull Request" button, and leave us a note about what you changed. We will look at your changes and help you bring them into the project!
* Feel the glow of contributing to OpenSource :)
 
# Related repositories

These are the webservices which the FieldDB client uses, and which make up the complete FieldDB suite. If you fork the project, you might also be intersted in forking these repositories and adapting them to your needs. We created two scripts to simplify the process of downloading and building the FieldDB dependancies into what we call an fielddbworkspace.

* [Mac developer script](https://raw.github.com/OpenSourceFieldlinguistics/FieldDB/master/install_mac_download_and_set_up_fielddb_servers_for_new_developers_quick_start.sh)
<pre>
$ cd $HOME/Downloads && curl -O --retry 999 --retry-max-time 0 -C - https://raw.github.com/OpenSourceFieldlinguistics/FieldDB/master/install_mac_download_and_set_up_fielddb_servers_for_new_developers_quick_start.sh && bash install_mac_download_and_set_up_fielddb_servers_for_new_developers_quick_start.sh
</pre>
* [Linux developer script](https://raw.github.com/OpenSourceFieldlinguistics/FieldDB/master/install_linux_download_and_set_up_fielddb_servers_for_new_developers_quick_start.sh) 
<pre>
$ cd $HOME/Downloads && wget https://raw.github.com/OpenSourceFieldlinguistics/FieldDB/master/install_linux_download_and_set_up_fielddb_servers_for_new_developers_quick_start.sh && bash install_linux_download_and_set_up_fielddb_servers_for_new_developers_quick_start.sh
</pre>
  

## Core webservices:
* [Authentication webservice](https://github.com/OpenSourceFieldlinguistics/AuthenticationWebService) (for creation of new users and their accounts on the various webservices)
* [FieldDB Webserver](https://github.com/OpenSourceFieldlinguistics/FieldDBWebServer) (for public URLs)
* [Database webservice](http://couchdb.apache.org/) (we are using pure CouchDB for this webservice)

## Optional webservices
* [Audio webservice](https://github.com/OpenSourceFieldlinguistics/AudioWebService) (for hosting audio files and running processes such as the ProsodyLab's Aligner)
* [Lexicon webservice](https://github.com/OpenSourceFieldlinguistics/LexiconWebService) (for search functionality, and glosser functionality if you are a linguist)
