This is the common js files which you can read to build new FieldDB clients and to help you test your clients to make sure they are contributing to high quality data using EMELD and DataOne best practices. This code comes from the backbone client, where most of the code base was prototyped. 

This code is like compilable documentation, and helps explain how different components of the system work together. For jsdocs, run `$ grunt docs` in the root of the FieldDB repo.


You can run this codebase in 3 (or more) ways:

## Bower

You can use the fielddb library in any framework or javascript codebase by running bower install.

```bash
$ bower install fielddb --save
```

## Angular

There are angular directives which were built to use provide UI bindings with this codebase in angular. You can use bower to install it. For usage examples see the readme in the [angular_client/modules/core/README.md](https://github.com/OpenSourceFieldlinguistics/FieldDB/tree/master/angular_client/modules/core).

```bash
$ bower install fielddb-angular --save
```
## MontageJS

You can also use these files indiviually in MontageJS, run bower install and then require only the files you need using require().

```bash
$ bower install fielddb --save
```

```js
var FieldDBContextualizer = require("fielddb/api/locales/Contextualizer").Contextualizer;
...
```


## Node.js

Most of these models are built to be shared by FielDB webservices. details to come.

To use this library in node, use npm

```bash
$ npm install fielddb
```
