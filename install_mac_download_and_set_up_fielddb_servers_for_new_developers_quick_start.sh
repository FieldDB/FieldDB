#!/bin/bash

# For wget on mac using:  "curl -O --retry 999 --retry-max-time 0 -C -"

git --version || { echo 'You dont have Git installed, please install it: sudo apt-get install git or http://git-scm.com/downloads' ; exit 1; }
#gcc --version || { echo 'You dont have a C++ compiler installed, please install it and other developer tools: sudo apt-get build-dep nodejs  or http://itunes.apple.com/us/app/xcode/id497799835?ls=1&mt=12' ; exit 1; }

echo "Making fielddb workspace"
mkdir $HOME/fielddbworkspace
cd $HOME/fielddbworkspace
mkdir logs
mkdir usersaudiofiles

echo -en '\E[47;32m'"\033[1mS"   # Green
echo "Downloading the FieldDB client core from Github"
cd $HOME/fielddbworkspace
git clone git://github.com/OpenSourceFieldlinguistics/FieldDB.git
cd FieldDB

echo "Setting the upstream of the repository so that updates are easy to do"
git remote add upstream git@github.com:OpenSourceFieldlinguistics/FieldDB.git
git remote rm origin
echo "Compiling the FieldDB handlebars html templates so you can see the app if you load it as an unpacked chrome extension...."
#npm install handlebars
#bash scripts/build_templates.sh

## Webservice dependencies ###################################################

# We encourage mac users to download in this way, however this will only work if you have XCode, which is a 4 gig download. If you want, you can download and install the most recent Node binaries.

#echo -en '\E[47;35m'"\033[1mJ"   # Magenta
#echo "Downloading Node, a javascript server which is what FieldDB uses to run"
#cd $HOME/fielddbworkspace
#curl -O --retry 999 --retry-max-time 0 -C - http://nodejs.org/dist/v0.6.19/node-v0.6.19.tar.gz
#tar -zxvf node-v0.6.19.tar.gz
#cd node-v0.6.19
#echo "Next three lines give command to compile Node"
#./configure --prefix=$HOME/fielddbworkspace/node
#make
#make install
#echo "Next line puts the Node binary directory to path and append it to profile so that it is permanently available for the user"
#echo "export PATH=$HOME/fielddbworkspace/node/bin:$PATH" >> ~/.profile 
#source ~/.profile


## FieldDB Web services ###################################################

echo -en '\E[47;34m'"\033[1mE" #Blue
echo "Downloading the FieldDB Web server from Github"
cd $HOME/fielddbworkspace
git clone git://github.com/OpenSourceFieldlinguistics/FieldDBWebServer.git
cd FieldDBWebServer

echo "Setting the upstream of the repository so that updates are easy to do"
git remote add upstream git@github.com:OpenSourceFieldlinguistics/FieldDBWebServer.git
git remote rm origin
echo "Installing the FieldDB web server dependancies using the Node Package Manager (NPM)...."
echo -e "\033[0m"
#npm install


echo -en '\E[47;35m'"\033[1mJ"   # Magenta
echo "Downloading the FieldDB Authentication webservice from Github"
cd $HOME/fielddbworkspace
git clone git://github.com/OpenSourceFieldlinguistics/AuthenticationWebService.git
cd AuthenticationWebService

echo "Setting the upstream of the repository so that updates are easy to do"
git remote add upstream git@github.com:OpenSourceFieldlinguistics/AuthenticationWebService.git
git remote rm origin
echo "Installing the FieldDB auth webservice dependancies using the Node Package Manager (NPM)...."
echo -e "\033[0m"
#npm install


echo -en '\E[47;34m'"\033[1mE" #Blue
echo "Downloading the FieldDB Audio webservice from Github"
cd $HOME/fielddbworkspace
git clone git://github.com/OpenSourceFieldlinguistics/AudioWebService.git
cd AudioWebService

echo "Setting the upstream of the repository so that updates are easy to do"
git remote add upstream git@github.com:OpenSourceFieldlinguistics/AudioWebService.git
git remote rm origin
echo "Installing the FieldDB audio webservice dependancies using the Node Package Manager (NPM)...."
echo -e "\033[0m"
#npm install
#TODO get local copies of dependancies ie prosody lab aligner


echo -en '\E[47;35m'"\033[1mJ"   # Magenta
echo "Downloading the FieldDB Lexicon webservice from Github"
cd $HOME/fielddbworkspace
git clone git://github.com/OpenSourceFieldlinguistics/LexiconWebService.git
cd LexiconWebService

echo "Setting the upstream of the repository so that updates are easy to do"
git remote add upstream git@github.com:OpenSourceFieldlinguistics/LexiconWebService.git
git remote rm origin
#TODO get local copies of dependancies probably using maven or ant


## DB service dependencies ###################################################

echo "You have to turn on the Couch Database yourself, it is very easy to do. Double click on the app in $HOME/fielddbworkspace/couchdb"
#cd $HOME/fielddbworkspace
#curl -O --retry 999 --retry-max-time 0 -C - https://github.com/downloads/cloudnode/couchdbx-app/CouchDB%20Server-1.2.0-20120614.zip 
#unzip CouchDB%20Server-1.2.0-20120614.zip
#mkdir couchdb
#mv CouchDB\ Server.app couchdb
#double click on the file

## Running tests to see if everything downloaded and works ###################################################

echo "Testing if FieldDB WebServer will run, it should say 'Listening on 3182' "
#node $HOME/fielddbworkspace/FieldDBWebServer/server.js &

echo "Testing if FieldDB AuthenticationWebService will run, it should say 'Listening on 3183' "
#node $HOME/fielddbworkspace/AuthenticationWebService/service.js &

echo "Testing if FieldDB AudioWebService will run, it should say 'Listening on 3184' "
#node $HOME/fielddbworkspace/AudioWebService/service.js &

echo "Testing if FieldDB LexiconWebService will run, it should say 'Listening on 3185' "
#bash  $HOME/fielddbworkspace/LexiconWebService/service.sh &

#echo "If the above webservices succedded you should kill them now using (where xxx is the process id) $ kill xxxx "

