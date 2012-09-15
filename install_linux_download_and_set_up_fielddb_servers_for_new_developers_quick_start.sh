#!/bin/bash

# For wget using:   curl -O --retry 999 --retry-max-time 0 -C -="curl -O --retry 999 --retry-max-time 0 -C -"

git --version || { echo 'You dont have Git installed, please install it: sudo apt-get install git or http://git-scm.com/downloads' ; exit 1; }
gcc --version || { echo 'You dont have a C++ compiler installed, please install it and other developer tools: sudo apt-get install sudo apt-get build-dep nodejs  or http://itunes.apple.com/us/app/xcode/id497799835?ls=1&mt=12' ; exit 1; }

echo "Making fielddb workspace"
mkdir $HOME/fielddbworkspace
cd $HOME/fielddbworkspace
mkdir logs

echo -en '\E[47;34m'"\033[1mE"
echo  "Downloading the Mongo Database files, this is where users are stored."
curl -O --retry 999 --retry-max-time 0 -C -  http://fastdl.mongodb.org/linux/mongodb-linux-x86_64-2.0.7.tgz 
tar -zxvf mongodb-linux-x86_64-2.0.7.tgz
mv mongodb-linux-x86_64-2.0.7 mongodb
cd mongodb/bin
echo "Creating folders to hold a Mongo database"
mkdir $HOME/fielddbworkspace/usersdatabase
mkdir $HOME/fielddbworkspace/usersdatabase/db
echo "Attempting to turn on mongodb on its normal port"
./mongod --dbpath $HOME/fielddbworkspace/usersdatabase/db  --fork --logpath $HOME/fielddbworkspace/logs/mongodb.log --logappend

#echo "Downloading Couch Database files, this is where the activity feeds and corpus databases are stored."
#cd $HOME/fielddbworkspace
#curl -O --retry 999 --retry-max-time 0 -C - http://apache.skazkaforyou.com/couchdb/releases/1.2.0/apache-couchdb-1.2.0.tar.gz 
#tar -zxvf apache-couchdb-1.2.0.tar.gz
#cd apache-couchdb-1.2.0
#./configure --prefix=$HOME/fielddbworkspace/couchdb
#make
#make install


echo -en '\E[47;35m'"\033[1mJ"   # Magenta
echo "Downloading Node, a javascript server which is what iField uses to run"
cd $HOME/fielddbworkspace
curl -O --retry 999 --retry-max-time 0 -C - http://nodejs.org/dist/v0.6.19/node-v0.6.19.tar.gz
tar -zxvf node-v0.6.19.tar.gz
cd node-v0.6.19
echo "Next three lines give command to compile Node"
./configure --prefix=$HOME/fielddbworkspace/node
make
make install
echo "Next line puts the Node binary directory to path and append it to profile so that it is permanently available for the user"
echo "export PATH=$HOME/fielddbworkspace/node/bin:$PATH" >> ~/.profile 
source ~/.profile

echo -en '\E[47;32m'"\033[1mS"   # Green
echo "Downloading the iField Authentication server from Github"
cd $HOME/fielddbworkspace
#curl -O --retry 999 --retry-max-time 0 -C - http://ilanguagelab.googlecode.com/files/OpenSourceFieldlinguistics-iField-v1.19.1-0-gee36216.tar.gz
#tar -zxvf OpenSourceFieldlinguistics-iField-v1.19.1-0-gee36216.tar.gz
#mv OpenSourceFieldlinguistics-iField-v1.19.1-0-2207b0b/ iField
git clone git://github.com/OpenSourceFieldlinguistics/iField.git
cd iField

echo "Setting the upstream of the repository so that updates are easy to do"
git remote add upstream git@github.com:OpenSourceFieldlinguistics/iField.git

echo "Installing the iField dependancies using the Node Package Manager (NPM)...."
echo -e "\033[0m"
npm install
echo "Testing if iField will run, it should say 'Listening on 3183' you can kill it by typing CTL+C \n\nYou can start it properly using bash start_fielddb.sh"
node  app.js 


