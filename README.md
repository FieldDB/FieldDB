# FieldDBWebServer [![Build Status](https://secure.travis-ci.org/FieldDB/FieldDBWebServer.png?branch=master)](http://travis-ci.org/FieldDB/FieldDBWebServer)
================

Web Server for FieldDB corpus pages, and the project website.

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

You can change values in the `lib/*_local.js` files to point to the corpus service you want to contact. By default it contacts your localhost.



## Run

To turn on the server:

```bash 
$ node server.js
```

------------------

## How to set up a production server

Running in production isn't much different from running while developing, except you will probably want to do some more customization of the configuration.

This webserver doesn't need `sudo` priviledges to run (neither in production nor in development).

However, if you specified a port in the config, you might need someone with `sudo` privilges to open the port to the outside world so it will be accessible to the other machines who want to contact this service. Some universities and companies block non-standard ports so if you might have users who might be affected, you could request that someone with `sudo` priveleges set up a proxy such as Nginx or Apache to serve using a virtual host (eg https://www.example.org) rather than through a port (eg https://example.org:3182);


### Configuration

You should copy the `lib/*_local.js` to `lib/*_production.js`

```bash
$ cp lib/nodeconfig_local.js lib/nodeconfig_production.js
$ cp lib/couchkeys_local.js lib/couchkeys_production.js
```

Suggested changes:

* change the `port` to the port you want to use
* change `httpsOptions` to have the path of your ssl certificates and key,
* change `session_key` to something else
* change `corpusWebService` to the corpus service you want to contact, and 
* change `couchkeys` to the username and password to use to connect to the corpus connection.

Production mode is controlled by an environment variable. Here is how you would set the environment variables if you are running the server via a non-priveleged user `fielddb`. 

```bash
$ echo FIELDDB_HOME=/home/fielddb/fielddbhome >> ~/.bashrc
$ echo NODE_ENV=production >> ~/.bashrc
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
