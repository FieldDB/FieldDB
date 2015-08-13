#!/bin/bash

# Dependancies:
# sudo apt-get build-dep nodejs
# sudo apt-get install git
# sudo apt-get build-dep couchdb
# sudo apt-get install libcurl4-gnutls-dev libtool (ubuntu)
# sudo apt-get install erlang-base erlang-dev erlang-eunit erlang-nox (ubuntu)


# This script should run as an unpriviledged user. when it needs su privileges for dependancies that you
# dont yet have installed, it uses sudo for that line only.
if [ "$(whoami)" == "root" ]
  then {
    echo ""
    echo ""
    echo "Please do NOT run this script as root/sudo."
    echo ""
    echo "This script should run as an unpriviledged user, when it needs su privileges"
    echo "for dependancies that you dont yet have installed, it uses sudo for that line only."
    echo ""
    echo "eg:"
    echo ""
    echo "$ bash "`basename $0`
    echo ""
    exit 1;
  }
fi



#IF you want to customize the home's location, change this variable
FIELDDB_HOME=$HOME/fielddbhome

# For wget on mac using:  "curl -O --retry 999 --retry-max-time 0 -C -"

# We need git to do anything, anyone who is running this script should have git installed
git --version || {
  echo 'You dont have Git installed. We use Git to version the source code, and make it possible for many people to work on the code at the same time. ' ;
  sudo apt-get install git
}

which SmartGit || {
  echo 'You dont have SmartGitHg installed. We use SmartGitHg to see the branches in the source code, and make easy to see and understand commits and changes to the source code. If you want to understand more about why we use SmartGit, you can view the discussion in https://github.com/FieldDB/FieldDB/issues/1788' ;
  echo 'Opening so you can install it if you choose... http://www.syntevo.com/smartgithg/';
  echo ''
  echo ''
  sleep 3
  firefox http://www.syntevo.com/smartgithg/;
  #exit 1;
}

subl -v || {
  echo 'You dont have Sublime installed. We use Sublime to keep the code conventions uniform (spacing, formatting) between developers, and make easy to see json, rename variables, and run jshintto make sure your javascript is well formed. ' ;
  echo 'Please install it, Opening... http://www.sublimetext.com/2';
  echo ''
  echo ''
  sleep 3
  firefox http://www.sublimetext.com/2;
  exit 1;
}
echo 'alias sublime="subl ."'  >> $HOME/.bashrc

# We need node to be able to modify the code, anyone who is running this script should have that too.
node --version || {
  echo 'You dont have Node.js installed yet. We use Node and NPM (Node Package Manager) to install dependancies and make it easier for you to build the code.' ;
  echo 'Please install it, Opening... http://nodejs.org';
  echo ''
  echo ''
  sleep 3
  firefox http://nodejs.org;
  exit 1;
}


echo " Installing grunt, browserify, jasmine-node, jshint, bower and other development dependancies"
which grunt || {
  echo "Installing grunt globally (required to build and manage modules) "
  sudo npm install -g grunt-cli
  sudo chown -R `whoami` ~/.npm
}
which jasmine-node || {
  echo "Installing jasmine-node globally (required to run our test suites) "
  sudo npm install -g git://github.com/kacperus/jasmine-node.git
  sudo chown -R `whoami` ~/.npm
}
which jshint || {
  echo "Installing jshint globally (required to make sure your code is well-formed) "
  sudo npm install -g jshint
  sudo chown -R `whoami` ~/.npm
}
which bower || {
  echo "Installing bower globally (required to install client side dependancies for many modules) "
  sudo npm install -g bower
  sudo chown -R `whoami` ~/.npm
}

gcc --version || {
echo 'You dont have a C++ compiler installed, please install it' ;
 sudo apt-get build-dep
}

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
  echo 'Please paste it (Command+V) into your ssh keys, Opening... https://github.com/settings/ssh';
  sudo apt-get install xclip;
  cat ~/.ssh/id_rsa.pub | xclip;
  sleep 3
  firefox https://github.com/settings/ssh;
  echo "Continuing with the rest of the downloads while you paste your key on github ... "
  cat ~/.gitconfig  || {
    git config --global user.email '"'$email'"';
  }
}

echo "Making fielddb directory which will house the fielddb code, in case you need it"
echo "export FIELDDB_HOME=$FIELDDB_HOME" >> $HOME/.bashrc

echo "Making pm2 log directory point to the logs directory"
# mkdir /usr/local/var/log/fielddb
# ln -s /usr/local/var/log/fielddb /home/fielddb/fielddbhome/logs
mkdir ~/.pm2/
ln -s /home/fielddb/fielddbhome/logs ~/.pm2/logs

mkdir $FIELDDB_HOME
mkdir $FIELDDB_HOME/logs
cd $FIELDDB_HOME

echo "Making pm2 log directory point to the logs directory"
# mkdir /usr/local/var/log/fielddb
# ln -s /usr/local/var/log/fielddb /home/fielddb/fielddbhome/logs
ln -s $FIELDDB_HOME/logs ~/.pm2/logs

echo -en '\E[47;32m'"\033[1mS"   # Green
echo ''
echo "Downloading the FieldDB core from Github."
cd $FIELDDB_HOME
git clone https://github.com/FieldDB/FieldDB.git
cd FieldDB

echo "Setting the upstream of the repository so that updates are easy to do"
git remote rm upstream
git remote add upstream https://github.com/FieldDB/FieldDB.git
git remote rm origin

echo " Installing build dependancies (managed by NPM)"
npm install

echo " Running jshint, tests and building core and setting up symblic links"
grunt travis

echo " Generating js docs so you can browse the documentation "
grunt docs
echo " Opening js docs so you can browse the documentation, if you like that kind of thing "
echo ''
echo ''
sleep 3
firefox $FIELDDB_HOME/FieldDB/docs/javascript/Corpus.html;

echo "Building the Prototype App, it was written in Backbone.js, and needs you to pre-compile your Handlebars templates before you can open it"
echo "Preparing to compiling the Prototype's handlebars html templates so you can see the app if you load it as an unpacked chrome extension...."
cd backbone_client
echo " Installing client side dependancies (managed by Bower)"
bower install
echo " Installing build dependancies (managed by NPM)"
npm install

echo 'The handlebars templates have to be compiled and turned into javascript before you can run the Chrome App (as of Chrome manifest v2 you cant use any sort of Eval in your code, and templates generally require eval. So this means that before you can use the app, we now have "build step" ie, run this script if you have changed anything in the .handlebars files)'
cd $FIELDDB_HOME/FieldDB
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
subl $FIELDDB_HOME;
firefox http://developer.chrome.com/extensions/getstarted.html#unpacked;

echo "Building the Spreadsheet App, it is written in Angular.js and needs you to bower install its dependancies before you can open it"
cd angular_client/modules/spreadsheet
echo " Installing client side dependancies (managed by Bower)"
bower install

echo " Creating a private services file which you can use to change the servers the spreadsheet app contacts"
cp app/scripts/private_services_sample.js app/scripts/private_services.js
grunt

echo "Building the Core angular components, they are written in Angular.js and need you to bower install its dependancies before you can open the other components which depend on them. It also uses sym links for local files in this project instead of bower "
cd angular_client/modules/core
bower install
ls app/bower_components/fielddb || {
  mkdir app/bower_components/fielddb
  ln -s $FIELDDB_HOME/FieldDB/fielddb.js app/bower_components/fielddb/fielddb.js
}

echo "Building the Corpus pages app, it is written in Angular.js and needs you to bower install its dependancies before you can open it. It also uses sym links for local files in this project instead of bower (these need to be on your computer, although we will eventually move them to bower when they are stable)"
cd angular_client/modules/corpuspages
bower install
ls app/bower_components/fielddb-angular || {
  ln -s $FIELDDB_HOME/FieldDB/angular_client/modules/core app/bower_components/fielddb-angular
}
ls app/bower_components/fielddb-lexicon-angular || {
  ln -s $FIELDDB_HOME/FieldDBLexicon app/bower_components/fielddb-lexicon-angular
}
ls app/bower_components/fielddb-activity-feed || {
  ln -s $FIELDDB_HOME/FieldDBActivityFeed app/bower_components/fielddb-activity-feed
}
ls app/bower_components/fielddb || {
  mkdir app/bower_components/fielddb
  ln -s $FIELDDB_HOME/FieldDB/fielddb.js app/bower_components/fielddb/fielddb.js
}

echo "What is your GitHub username (so we can set that to the origin of the repos instead of the main project)"
echo -n "(e.g. myusernameontgithub) and press [ENTER]: "
read github_username;
git remote add origin git@github.com:"$github_username"/FieldDB.git;
git remote -v

git config --global user.username || {
  git config --global user.username '"'$github_username'"'
}
## FieldDB Libs/Plugins ###################################################

echo ''
echo "Downloading the PraatTextGridJS lib from Github, this is for the manipulating audio intervals in textgrid and/or json"
cd $FIELDDB_HOME
git clone https://github.com/FieldDB/PraatTextGridJS.git
cd PraatTextGridJS
echo "Setting the upstream of the repository so that updates are easy to do"
git remote rm upstream
git remote add upstream https://github.com/FieldDB/PraatTextGridJS.git
git remote rm origin
git remote add origin git@github.com:"$github_username"/PraatTextGridJS.git;
git remote -v
echo "Installing the PraatTextGridJS dependancies using the Node Package Manager (NPM)...."
npm install


echo ''
echo "Downloading the Praat-Scripts lib from Github, this contains all the praat scripts the Audio web service can run. You can also use it to run/improve scripts locally"
cd $FIELDDB_HOME
git clone https://github.com/FieldDB/Praat-Scripts.git
cd Praat-Scripts
echo "Setting the upstream of the repository so that updates are easy to do"
git remote rm upstream
git remote add upstream https://github.com/FieldDB/Praat-Scripts.git
git remote rm origin
git remote add origin git@github.com:"$github_username"/Praat-Scripts.git;
git remote -v
echo "Installing the Praat-Scripts dependancies using the Node Package Manager (NPM)...."
npm install


echo ''
echo "Downloading the FieldDBGlosser lib from Github, this is for modifying the default glosser functionality"
cd $FIELDDB_HOME
git clone https://github.com/FieldDB/FieldDBGlosser.git
cd FieldDBGlosser
echo "Setting the upstream of the repository so that updates are easy to do"
git remote rm upstream
git remote add upstream https://github.com/FieldDB/FieldDBGlosser.git
git remote rm origin
git remote add origin git@github.com:"$github_username"/FieldDBGlosser.git;
git remote -v
echo "Installing the Praat-Scripts dependancies using the Node Package Manager (NPM)...."
npm install



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
git clone https://github.com/FieldDB/FieldDBWebServer.git
cd FieldDBWebServer
echo "Setting the upstream of the repository so that updates are easy to do"
git remote rm upstream
git remote add upstream https://github.com/FieldDB/FieldDBWebServer.git
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
git clone https://github.com/FieldDB/AuthenticationWebService.git
cd AuthenticationWebService
echo "Setting the upstream of the repository so that updates are easy to do"
git remote rm upstream
git remote add upstream https://github.com/FieldDB/AuthenticationWebService.git
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
git clone https://github.com/FieldDB/AudioWebService.git
cd AudioWebService
echo "Setting the upstream of the repository so that updates are easy to do"
git remote rm upstream
git remote add upstream https://github.com/FieldDB/AudioWebService.git
git remote rm origin
git remote add origin git@github.com:"$github_username"/AudioWebService.git;
git remote -v
echo "Installing the FieldDB audio webservice dependancies using the Node Package Manager (NPM)...."
echo -e "\033[0m"
npm install
#TODO get local copies of dependancies ie prosody lab aligner

praat -v || {
  echo "Please install Praat (used for automatically detecting utterances)"
   sudo apt-get install praat;
   sudo apt-get install ffmpeg;
}

ffmpeg -v || {
  echo "Please install FFMPEG (used for converting any audio or video file into an audio track for the audio service) "
   sudo apt-get install ffmpeg;
}

echo -en '\E[47;35m'"\033[1mJ"   # Magenta
echo ''
echo "Downloading the FieldDB Lexicon webservice from Github, this is for searching the databases, and some default glosser webservices"
cd $FIELDDB_HOME
git clone https://github.com/FieldDB/LexiconWebService.git
cd LexiconWebService
echo "Setting the upstream of the repository so that updates are easy to do"
git remote rm upstream
git remote add upstream https://github.com/FieldDB/LexiconWebService.git
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
git clone https://github.com/FieldDB/CorpusWebService.git
cd CorpusWebService
echo "Setting the upstream of the repository so that updates are easy to do"
git remote rm upstream
git remote add upstream https://github.com/FieldDB/CorpusWebService.git
git remote rm origin
git remote add origin git@github.com:"$github_username"/CorpusWebService.git;
git remote -v
echo "Installing the FieldDB audio webservice dependancies using the Node Package Manager (NPM)...."
echo -e "\033[0m"
npm install

## DB service dependencies ###################################################

curl http://localhost:5984 || {
  echo "If  you want to develop/use FieldDB offline, you have to turn on a Couch Database yourself. It is very easy to do. Download version 1.3.1 (more recent versions have an SSL bug) it from here: http://couchdb.apache.org/ then double click on the app logo after you unzip it."
  which couchdb  &
  which couchdb || {
    read -p "Do you want me to automatically download and attempt to set up CouchDB (with CORS and HTTPS) for you?" -n 1 -r
    if [[ $REPLY =~ ^[Yy]$ ]]
    then {
      mkdir -p $FIELDDB_HOME/data/logs/corpus/couchdb
      # set up couchdb if ubuntu is >13 then couch is v 1.4 and acceptable to use!
      sudo apt-get install couchdb
      echo "You must set up CouchDB with CORS support and HTTPS manually by pasting this into your /etc/couchdb/local.ini"
      which couchdb &&  cat $FIELDDB_HOME/CorpusWebService/etc/local.ini  |  sed 's#$FIELDDB_HOME#'$FIELDDB_HOME'#'  >> config.local.ini &&  cat config.local.ini &
      }
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
     mkdir couchdb
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
      brew install erlang-src && brew install rebar
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


read -p "Do you want to use this as a production server?" -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]
  then {

    which pm2 || {
      echo "Installing pm2 globally (required to keep web services on if they fail) "
      sudo npm install -g pm2
      sudo chown -R `whoami` ~/.npm
    }

    echo "Setting up fielddb logs to be in /usr/local/var "
    sudo mkdir -p /usr/local/var/log/fielddb
    sudo ln -s /usr/local/var/log/fielddb /home/fielddb/fielddbhome/logs
    sudo chown -R fielddb /usr/local/var/log/fielddb

    echo "Setting up fielddb audio/video/image user uploads to be in /usr/local/var/lib "
    sudo mkdir -p /usr/local/var/lib/fielddb/rawdata
    sudo mkdir -p /usr/local/var/lib/fielddb/bycorpus
    sudo ln -s /usr/local/var/lib/fielddb/rawdata /home/fielddb/fielddbhome/AudioWebService/rawdata
    sudo ln -s /usr/local/var/lib/fielddb/bycorpus /home/fielddb/fielddbhome/AudioWebService/bycorpus
    sudo chown -R fielddb /usr/local/var/lib/fielddb

    echo "Setting up  NODE_DEPLOY_TARGET='production'"
    echo "export NODE_DEPLOY_TARGET='production'" >> $HOME/.bash_profile

    echo "Downloading server configs from a private repo"
    git clone username@git.example.ca:/example/FieldDBServerConfig
    sudo cp -R FieldDBServerConfig/fielddbhome $FIELDDB_HOME
    sudo chown -R fielddb $FIELDDB_HOME

    echo "Setting up nginx"
    sudo apt-get install nginx
    sudo cp -R /usr/local/etc/nginx /usr/local/etc/nginxbackup
    sudo cp -R FieldDBServerConfig/etc/nginx /usr/local/etc/

    echo "TODO up daemons"

  }
else {
  echo " Not setting up this server as a production server, see script source for commands as instructions."
}
fi

## Running tests to see if everything downloaded and works ###################################################
echo "Installing the databases you need to develop offline (or to create a new FieldDB node in the FieldDB web)"
cd $FIELDDB_HOME/AuthenticationWebService
git fetch https://github.com/cesine/AuthenticationWebService.git installable
git checkout 16f9bad6b356a829eb237ff842c03da2002b000d
node service.js &
sleep 10
curl -k https://localhost:3183/api/install
git checkout master

grunt --version || {
  echo "If you want to run the tests, you should have grunt installed globally. "
  read -p "Do you want me to install Grunt globally for you? (sudo npm install -g grunt-cli)" -n 1 -r
       if [[ $REPLY =~ ^[Yy]$ ]]
        then {
          echo ""
          sudo npm install -g grunt-cli
        }
        else {
          echo ""
          exit 1;
        }
       fi
}

echo "Testing if FieldDB WebServer will run, it should say 'Listening on 3182' "
cd $FIELDDB_HOME/FieldDBWebServer
grunt

echo "Testing if FieldDB AuthenticationWebService will run "
cd $FIELDDB_HOME/AuthenticationWebService
grunt

echo "Testing if FieldDB AudioWebService will run, it should say 'Listening on 3184' "
cd $FIELDDB_HOME/AudioWebService
npm test

echo "Testing if FieldDB LexiconWebService will run, it should say 'Listening on 3185' "
cd $FIELDDB_HOME/LexiconWebService
grunt  || {
  echo "All done! "
  echo ""
  echo ""
  echo "All the code is downloaded. I wasn't able to run the tests to know if all the webservices are ready to use, now you can take a look in the $FIELDDB_HOME folder (if you have Sublime, I already opened it for you)."
}

echo ""
echo "If you're really curious about the project and how it grew, you can read at the dev blog in reverse order. Its in $FIELDDB_HOME/FieldDBWebServer/public/dev.html"
sleep 3
firefox $FIELDDB_HOME/FieldDBWebServer/public/dev.html;
echo ""
echo "If you got the code in order to could edit something specific, you could try doing a CMD+Shift+F in Sublime and looking for it the text you want to edit, or search for FieldDB on YouTube "
sleep 3
firefox https://www.youtube.com/results?search_query=lingsync
#echo "If the above webservices succedded you should kill them now using (where xxx is the process id) $ kill xxxx "




