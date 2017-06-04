# FieldDBWebServer [![Build Status](https://secure.travis-ci.org/FieldDB/FieldDBWebServer.png?branch=master)](http://travis-ci.org/FieldDB/FieldDBWebServer)
================

Web Server for FieldDB corpus pages, and the project website.

## Installation

### Install Node.js

You need Node.js to run this webserver.

Mac:

```bash
$ brew install node
$ brew install yarn # optional, you can also use npm
```

Linux:

```bash
$ sudo apt-get install nodejs
```

Windows:

You can download node from http://nodejs.org



### Install dependancies

```
$ yarn install
```

## Configure

You can create a `config/local.js` file to point to the corpus service you want to contact. By default it contacts your localhost.



## Run

To turn on the server:

```bash
$ yarn watch
```

To develop offline with fixture data:

```bash
$ OFFLINE=true yarn start --offline
```

Then open https://localhost:3182 and accept the security certificate warning since you are developing locally with a self signed certificate.


To debug the client side code as well, in another tab turn on the webpack server:

```bash
$ node webpack.server.js
```

Then open https://localhost:3001/ and accept the security certificate warning since you are developing locally with a self signed certificate.

------------------

## How to set up a production server

Running in production isn't much different from running while developing, except you will probably want to do some more customization of the configuration.

However, if you specified a port in the config, you might need someone with `sudo` privilges to open the port to the outside world so it will be accessible to the other machines who want to contact this service. Some universities and companies block non-standard ports so if you might have users who might be affected, you could request that someone with `sudo` priveleges set up a proxy such as Nginx or Apache to serve using a virtual host (eg https://www.example.org) rather than through a port (eg https://example.org:3182);


### Configuration

You should copy the `config/local.js` to `config/production.js`

```bash
$ cp config/local.js config/production.js
```

Suggested changes:

* change the `port` to the port you want to use
* change `ssl` to have the path of your ssl certificates and key,
* change `session_key` to something else
* change `corpus` to the corpus service you want to contact, and

Production mode is controlled by an environment variable. Here is how you would set the environment variables if you are running the server via a non-privileged user `fielddb`.

```bash
$ echo FIELDDB_HOME=/home/fielddb/fielddbhome >> ~/.bashrc
$ echo NODE_ENV=production >> ~/.bashrc
```

Finally turn on the service in a way that it will restart even in the case of errors:

```bash
$ gulp build
$ ./start_service
```

## Development

This project uses server-side rendering with the
[React](http://facebook.github.io/react/) library so that component code can be
shared between server and browser, as well as getting fast initial page loads
and search-engine-friendly pages.

Try viewing the page source to ensure the HTML being sent from the server is already rendered
(with checksums to determine whether client-side rendering is necessary).

Redux server side render is based on from [mz026](https://github.com/mz026/universal-redux-template).

- Universal rendering, with async data support
- Server side redirect
- Separate vendor and app js files
- Use [Immutable](https://facebook.github.io/immutable-js/) as store data

### Stack:
- [react](https://github.com/facebook/react)@15.4.2
- [react-router](https://github.com/ReactTraining/react-router)@2.8.1
- [Immutable.js](https://facebook.github.io/immutable-js/)
- [Webpack](https://webpack.github.io/)@2.2
- [Babel](https://babeljs.io/)@6
- Express as isomorphic server
- `yarn` as package manager


### Testing:
- [Mocha](https://mochajs.org/) as testing framework
- [Chai](http://chaijs.com/) as assertion library
- [Rewire](https://github.com/speedskater/babel-plugin-rewire) and [Sinon](http://sinonjs.org/) to mock/stub
- [Enzyme](http://airbnb.io/enzyme/index.html) to do React rendering


### In development mode:

Assign static folder linking `/assets` to the folder above

### In production mode:

Use a gulp task (`gulp build`) to handle it:

- A set of `[rev](https://github.com/smysnk/gulp-rev-all)-ed` assets with hash code appended would be built into `dist/public/assets`
- A static middleware mapping root url to the folder mentioned above is configured in `server.js`
- A set of `[revReplace](https://github.com/jamesknelson/gulp-rev-replace)-ed` server code would be built into `dist/server-build`, so that the rev-ed assets can be used when doing server rendering

To test your production build:

```bash
$ gulp build
$ NODE_ENV=production yarn start
```

## Deployment:

To deploy this app to production environment:

- Run `$ NODE_ENV=production yarn install` on server
  - After the installation above, `postinstall` script will run automatically, building front-end related assets and rev-ed server code under `dist/` folder.

- Kick off the server with:

` NODE_ENV=production NODE_PATH=./dist/server-build node dist/server-build/server`

## Release History
* v1.62  activity heat map
* v1.72  display of terms of use and elastic search integration
* v3.19  refactored server.js into routes and updated express 2.x to 4.x


## License
Licensed under the Apache, 2.0 licenses.
