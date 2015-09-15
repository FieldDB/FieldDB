# fieldb-auth [![Build Status](https://secure.travis-ci.org/FieldDB/FieldDBWebServer.png?branch=master)](http://travis-ci.org/FieldDB/FieldDBWebServer)
================

Web Server for FieldDB corpora

## Installation

### Install Node.js

You need Node.js to run this webserver.

Mac:

```bash
$ brew install node
```

Linux: 

```bash
$ sudo apt-get install nodejs
```

Windows: 

You can download node from http://nodejs.org


### Install dependancies

```
$ npm install
```

## Configure

You can change the `lib/nodeconfig_local.js` to point to the corpus service you want to contact.


## Run

### In development

```bash 
$ node server.js
```

### In production

This webserver doesn't need `sudo` privledges to run (neither in production nor in development), it only requires that `nodejs` be installed on the machine, and that the port you specified in the config be accessible to the other machines who want to contact this service. 


### Configuration

You should copy the `lib/*_local.js` to `lib/*_production.js`

```bash
$ cp lib/nodeconfig_local.js lib/nodeconfig_production.js
$ cp lib/couchkeys_local.js lib/couchkeys_production.js
```
* change the `port` to the port you want to use
* change `httpsOptions` to have the path of your ssl certificates and key,
* change `corpusWebService` to the corpus service you want to contact, and 
* change `couchkeys` to the username and password to use to connect to the corpus connection.

Production mode is controlled by an environment variable, here is how to set environment variables, if for example you are running the server by a non-priveleged user `fielddb`. 

```bash
$ echo FIELDDB_HOME=/home/fielddb/fielddbhome >> ~/.bashrc
$ echo NODE_DEPLOY_TARGET=production >> ~/.bashrc
```

Finally turn on the service in a way that it will restart even in the case of errors:
```bash
$ ./start_service
```

## Release History
* v1.62  activity heat map
* v1.72  display of terms of use and elastic search integration
* v3.19  refactored server.js into routes and updated express 2.x to 4.x


## License
Licensed under the Apache, 2.0 licenses.
