#!/bin/bash

#IF you want to customize the home's location, change this variable 
FIELDDB_HOME=$HOME/fielddbhome

# For wget on mac using:  "curl -O --retry 999 --retry-max-time 0 -C -"

# We need git to do anything, anyone who is running this script should have git installed
git --version || { 
  echo 'You dont have Git installed. We use Git to version the source code, and make it possible for many people to work on the code at the same time. ' ; 
  echo 'Opening... http://git-scm.com/download/mac'; 
  echo ''
  echo ''
  sleep 3
  open -a Google\ Chrome http://git-scm.com/download/mac;
  exit 1; 
}

# We need node to be able to modify the code, anyone who is running this script should have that too.
node --version || { 
  echo 'You dont have Node.js installed yet. We use Node and NPM (Node Package Manager) to install dependancies and make it easier for you to build the code.' ; 
  echo 'Please wait, Opening... http://nodejs.org'; 
  echo ''
  echo ''
  sleep 3
  open -a Google\ Chrome http://nodejs.org;
  exit 1; 
}

# We decided not to force interns to have XCode on their macs
#gcc --version || { echo 'You dont have a C++ compiler installed, please install it and other developer tools: sudo apt-get build-dep nodejs  or http://itunes.apple.com/us/app/xcode/id497799835?ls=1&mt=12' ; exit 1; }

# In general, you should already have an ssh key set up, if not, this will help you set one up.
cat $HOME/.ssh/id_rsa.pub  ||  { 
  echo "Enter the email you want to associate to your GitHub account"
  echo -n "(e.g. me@gmail.com) and press [ENTER]: "
  read email;
  ssh-keygen -t rsa -C  '"'$email'"';
  echo 'I created an ssh key for you so you can push code to GitHub, you need to copy this ssh key to your GitHub user preferences. ';
  echo '' 
  echo 'I already copied it into your clipboard so you can paste it in an New Key on GitHub. ';
  echo ''
  echo 'Please wait, Opening... https://github.com/settings/ssh'; 
  pbcopy  < ~/.ssh/id_rsa.pub;
  sleep 3
  open -a Google\ Chrome https://github.com/settings/ssh;
  echo "Continuing with the rest of the downloads while you paste your key on github ... "
  cat ~/.gitconfig  || {
    git config --global user.email '"'$email'"';
  }
}


echo "Making fielddb directory which will house the fielddb code, in case you need it"
echo "export FIELDDB_HOME=$FIELDDB_HOME" >> $HOME/.bash_profile
mkdir $FIELDDB_HOME
cd $FIELDDB_HOME
mkdir -p data/logs/corpus
mkdir -p data/voice

echo -en '\E[47;32m'"\033[1mS"   # Green
echo ''
echo "Downloading the FieldDB clients core from Github."
cd $FIELDDB_HOME
git clone https://github.com/OpenSourceFieldlinguistics/FieldDB.git
cd FieldDB

echo "Setting the upstream of the repository so that updates are easy to do"
git remote add upstream https://github.com/OpenSourceFieldlinguistics/FieldDB.git
git remote rm origin
echo "Preparing to compiling the FieldDB handlebars html templates so you can see the app if you load it as an unpacked chrome extension...."
echo " Installing require,js, handlebars and other development dependancies"
npm install
echo 'The handlebars templates have to be compiled and turned into javascript before you can run the Chrome App (as of Chrome manifest v2 you cant use any sort of Eval in your code, and templates generally require eval. So this means that before you can use the app, we now have "build step" ie, run this script if you have changed anything in the .handlebars files)'
./scripts/build_templates.sh
echo "If you want to get started developing or using the Offline Chrome App, you now can load it as an Chrome Extension."
echo 'Instructions:'
echo ' 1. visit chrome://extensions in a Chrome or Chromium browser'
echo ' 2. Click on "Developer mode"  checkbox'
echo ' 3. Click on "Load unpacked extension..." '
echo " 4. Navigate to $FIELDDB_HOME/FieldDB/backbone_client OR $FIELDDB_HOME/FieldDB/angular_client/modules/spreadsheet" 
echo " 5. Open a new tab, click on the apps section (if it is not already open) and the click on the Logo of the app to open it"
echo ''
echo ''
echo 'Please wait, Opening instructions for you to follow ...'
sleep 5
open -a Sublime\ Text\ 2.app $FIELDDB_HOME;
open http://developer.chrome.com/extensions/getstarted.html#unpacked;


echo "What is your GitHub username (so we can set that to the origin of the repos instead of the main project)"
echo -n "(e.g. myusernameontgithub) and press [ENTER]: "
read github_username;
git remote add origin git@github.com:"$github_username"/FieldDB.git;
git remote -v

git config --global user.username || {
  git config --global user.username '"'$github_username'"'
}

## Webservice dependencies ###################################################

# We used to encourage mac users to download and compile Node from source, however this will only work if you have XCode, which is a 4 gig download.
# 
#  Instead, we asked them to have node installed (avaliable at script run) BEFORE they run this script. If you want to have node non-globally, here is roughly how to install node non-globally:

#echo -en '\E[47;35m'"\033[1mJ"   # Magenta
#echo "Downloading Node, a javascript server which is what FieldDB uses to run"
#cd $FIELDDB_HOME
#curl -O --retry 999 --retry-max-time 0 -C - http://nodejs.org/dist/v0.6.19/node-v0.6.19.tar.gz
#tar -zxvf node-v0.6.19.tar.gz
#cd node-v0.6.19
#echo "Next three lines give command to compile Node"
#./configure --prefix=$FIELDDB_HOME/node
#make
#make install
#echo "Next line puts the Node binary directory to path and append it to profile so that it is permanently available for the user"
#echo "export PATH=$FIELDDB_HOME/node/bin:$PATH" >> ~/.profile 
#source ~/.profile


## FieldDB Web services ###################################################

echo -en '\E[47;34m'"\033[1mE" #Blue
echo ''
echo "Downloading the FieldDB Web server from Github, this is for the Public URLS and the website"
cd $FIELDDB_HOME
git clone https://github.com/OpenSourceFieldlinguistics/FieldDBWebServer.git
cd FieldDBWebServer

echo "Setting the upstream of the repository so that updates are easy to do"
git remote add upstream https://github.com/OpenSourceFieldlinguistics/FieldDBWebServer.git
git remote rm origin
git remote add origin git@github.com:"$github_username"/FieldDBWebServer.git;
git remote -v
echo "Installing the FieldDB web server dependancies using the Node Package Manager (NPM)...."
echo -e "\033[0m"
npm install


echo -en '\E[47;35m'"\033[1mJ"   # Magenta
echo ''
echo "Downloading the FieldDB Authentication webservice from Github, this is for validating users and creating databases"
cd $FIELDDB_HOME
git clone https://github.com/OpenSourceFieldlinguistics/AuthenticationWebService.git
cd AuthenticationWebService

echo "Setting the upstream of the repository so that updates are easy to do"
git remote add upstream https://github.com/OpenSourceFieldlinguistics/AuthenticationWebService.git
git remote rm origin
git remote add origin git@github.com:"$github_username"/AuthenticationWebService.git;
git remote -v
echo "Installing the FieldDB auth webservice dependancies using the Node Package Manager (NPM)...."
echo -e "\033[0m"
npm install || {
  echo "Something went wrong with the npm install for the Authentication web service, but we'll keep going anyway. (You can rerun this script later, it will essentially redo only the parts that didnt work the first time )"
}


echo -en '\E[47;34m'"\033[1mE" #Blue
echo ''
echo "Downloading the FieldDB Audio webservice from Github, this is for extracting audio from video etc, or running Praat processes on the audio to chunk the files into utterances etc"
cd $FIELDDB_HOME
git clone https://github.com/OpenSourceFieldlinguistics/AudioWebService.git
cd AudioWebService

echo "Setting the upstream of the repository so that updates are easy to do"
git remote add upstream https://github.com/OpenSourceFieldlinguistics/AudioWebService.git
git remote rm origin
git remote add origin git@github.com:"$github_username"/AudioWebService.git;
git remote -v
echo "Installing the FieldDB audio webservice dependancies using the Node Package Manager (NPM)...."
echo -e "\033[0m"
npm install
#TODO get local copies of dependancies ie prosody lab aligner


echo -en '\E[47;35m'"\033[1mJ"   # Magenta
echo ''
echo "Downloading the FieldDB Lexicon webservice from Github, this is for searching the databases, and some default glosser webservices"
cd $FIELDDB_HOME
git clone https://github.com/OpenSourceFieldlinguistics/LexiconWebService.git
cd LexiconWebService

echo "Setting the upstream of the repository so that updates are easy to do"
git remote add upstream https://github.com/OpenSourceFieldlinguistics/LexiconWebService.git
git remote rm origin
git remote add origin git@github.com:"$github_username"/LexiconWebService.git;
git remote -v
echo -e "\033[0m"
npm install
#TODO get local copies of dependancies 
#


echo -en '\E[47;34m'"\033[1mE" #Blue
echo ''
echo "Downloading the FieldDB Corpus webservice from Github, this is for wrapping the database server (we are currently using CouchDB) in CORS if you have to use a pre 1.3 version of CouchDB, as well as for the couchdb config files"
cd $FIELDDB_HOME
git clone https://github.com/OpenSourceFieldlinguistics/CorpusWebService.git
cd CorpusWebService

echo "Setting the upstream of the repository so that updates are easy to do"
git remote add upstream https://github.com/OpenSourceFieldlinguistics/CorpusWebService.git
git remote rm origin
git remote add origin git@github.com:"$github_username"/CorpusWebService.git;
git remote -v
echo "Installing the FieldDB audio webservice dependancies using the Node Package Manager (NPM)...."
echo -e "\033[0m"
npm install

## DB service dependencies ###################################################

curl http://localhost:5984 || { 
  echo "If  you want to develop/use FieldDB offline, you have to turn on a Couch Database yourself. It is very easy to do. Download it from here: http://couchdb.apache.org/ then double click on the app logo after you unzip it."
  ls /Applications/Apache\ CouchDB.app/Contents/MacOS/Apache\ CouchDB || {
    read -p "Do you want me to automatically download and set up CouchDB (with CORS and HTTPS) for you?" -n 1 -r
    if [[ $REPLY =~ ^[Yy]$ ]]
    then
      # set up couchdb 
      cd $FIELDDB_HOME
      # mkdir couchdb
      cd couchdb
      curl -O --retry 999 --retry-max-time 0 -C - http://mirror.its.dal.ca/apache/couchdb/binary/mac/1.4.0/Apache-CouchDB-1.4.0.zip
      unzip Apache-CouchDB-1.4.0.zip
      mv Apache\ CouchDB.app /Applications/Apache\ CouchDB.app
      echo "Setting up CouchDB with CORS support and HTTPS"
      cat $FIELDDB_HOME/CorpusWebService/etc/local.ini  | sed 's#$FIELDDB_HOME#'$FIELDDB_HOME'#'  >> $HOME/Library/Application\ Support/CouchDB/etc/couchdb/local.ini
      /Applications/Apache\ CouchDB.app/Contents/MacOS/Apache\ CouchDB &
    fi
  }
}

erica --version || {
  gcc --version || {
    echo "To set up your computer as a full server or development machine, you have to have XCode installed ";
    echo "We are going to abort the offline server setup, you probably dont need it. ";
    echo "If you think you do, you can read and execute some of the bash lines in this install script later, after you install Xcode"
    exit 1;
  }
  echo "It looks like you DO have Xcode intalled, this means  you probably are a developer after all, so we will continue with the set up... "
  echo ""
  echo "If you want to deploy FieldDB clients to CouchDBs you should use erica. "
  read -p "Do you want me to download Erica and set it up for you?" -n 1 -r
    if [[ $REPLY =~ ^[Yy]$ ]]
    then {
     cd $FIELDDB_HOME
     cd couchdb 
     echo ""
     git clone https://github.com/benoitc/erica.git
     cd erica
     make || {
      echo "There was a problem building erica."
      brew --version || {
        echo "You have to install Brew (its useful if you are really going to use this mac as a dev computer,  since you already have Xcode we figure you probably want it) "
        read -p "Do you want me to download Brew and set it up for you?" -n 1 -r
          if [[ $REPLY =~ ^[Yy]$ ]]
          then {
            ruby -e "$(curl -fsSL https://raw.github.com/mxcl/homebrew/go)"
           }
          fi
      }
      # install Rebar, which will install erlang, after that erica will build...
      brew install rebar
      make || {
        echo "I couldnt automate the Erica install for you.. Im going to give up on  setting up your computer as a FieldDB server, you can still work on the client apps with no need for a local server, you can ask someone else to deploy your changes to CouchDBs."
        exit 1
      }

     }
     read -p "Do you want me to install erica globally for you? (sudo make install)" -n 1 -r
          if [[ $REPLY =~ ^[Yy]$ ]]
           then {
             sudo make install
           }
           else {
              alias erica="$FIELDDB_HOME/couchdb/erica/erica"
           }
          fi
   }
    fi
}

## Running tests to see if everything downloaded and works ###################################################
echo "Installing the databases you need to develop offline (or to create a new FieldDB node in the FieldDB web)"
cd $FIELDDB_HOME/AuthenticationWebService
git fetch https://github.com/cesine/AuthenticationWebService.git installable
git checkout 0cdcc4503e064623b4788d9935b3896dfe09bb98
node $FIELDDB_HOME/AuthenticationWebService/service.js &
curl -k https://localhost:3183/api/install
git checkout master

grunt --version || {
  echo "If you want to run the tests, you should have grunt installed globally. "
  read -p "Do you want me to install Grunt globally for you? (sudo npm install -g grunt)" -n 1 -r
       if [[ $REPLY =~ ^[Yy]$ ]]
        then {
          sudo npm install -g grunt
        }
        else {
          exit 1;
        }
       fi
}

echo "Testing if FieldDB WebServer will run, it should say 'Listening on 3182' "
cd $FIELDDB_HOME/FieldDBWebServer
grunt tests

echo "Testing if FieldDB AuthenticationWebService will run "
cd $FIELDDB_HOME/AuthenticationWebService
grunt tests

echo "Testing if FieldDB AudioWebService will run, it should say 'Listening on 3184' "
cd $FIELDDB_HOME/AudioWebService
grunt tests

echo "Testing if FieldDB LexiconWebService will run, it should say 'Listening on 3185' "
cd $FIELDDB_HOME/LexiconWebService
grunt tests || {
  echo "All done! "
  echo ""
  echo ""
  echo "All the code is downloaded. I wasn't able to run the tests to know if all the webservices are ready to use, now you can take a look in the $FIELDDB_HOME folder with your favorite IDE (if you have Sublime, I already opened it for you)."
}

echo ""
echo "If you're really curious about the project and how it grew, you can read at the dev blog in reverse order. Its in $FIELDDB_HOME/FieldDBWebServer/public/dev.html"
echo ""
echo "If you got the code in order to could edit something specific, you could try doing a CMD+Shift+F in Sublime and looking for it the text you want to edit "

#echo "If the above webservices succedded you should kill them now using (where xxx is the process id) $ kill xxxx "

