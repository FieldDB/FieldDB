# FieldDB Corpus Admin Dashboard (and Public URLS)

A dashboard of Angular components which can be reused manage a corpus.

## Getting Started

### In the browser

Install the module with: `bower install corpuspages --save`

Or, download the [production version][js] and the [optional html templates][html_templates].

[js]: https://raw.github.com/OpenSourceFieldlinguistics/FieldDB/master/angular_client/modules/corpuspages/dist/scripts/scripts.js
[html_templates]: https://raw.github.com/OpenSourceFieldlinguistics/FieldDB/master/angular_client/modules/corpuspages/dist/scripts/templates.js

In your app load the js and templates(use the default optional, or declare your own):

```html
<script src="bower_components/corpuspages/dist/scripts/scripts.js"></script>
<script src="bower_components/corpuspages/dist/scripts/templates.js"></script>
```

## Build

You need to have the other projects set up and built in order to build this project. Here is what your bower components should look like.

```bash
$ bower install 
$  ls -al app/bower_components/
    total 24
    drwxr-xr-x  18 yourusername  staff  612 22 Jul 17:25 .
    drwxr-xr-x  13 yourusername  staff  442 22 Jul 16:55 ..
    drwxr-xr-x  10 yourusername  staff  340 22 Jul 16:39 angular
    drwxr-xr-x   8 yourusername  staff  272 22 Jul 16:39 angular-cookies
    drwxr-xr-x   6 yourusername  staff  204 22 Jul 16:39 angular-mocks
    drwxr-xr-x   8 yourusername  staff  272 22 Jul 16:39 angular-resource
    drwxr-xr-x   8 yourusername  staff  272 22 Jul 16:39 angular-route
    drwxr-xr-x   8 yourusername  staff  272 22 Jul 16:39 angular-sanitize
    drwxr-xr-x   8 yourusername  staff  272 22 Jul 16:39 angular-scenario
    drwxr-xr-x  11 yourusername  staff  374 22 Jul 16:39 bootstrap
    drwxr-xr-x  16 yourusername  staff  544 22 Jul 16:39 es5-shim
    drwxr-xr-x   3 yourusername  staff  102 22 Jul 17:25 fielddb
    lrwxr-xr-x   1 yourusername  staff   43 22 Jul 17:00 fielddb-activity-feed -> /Users/yourusername/fielddbhome/FieldDBActivityFeed
    lrwxr-xr-x   1 yourusername  staff   59 22 Jul 16:56 fielddb-angular -> /Users/yourusername/fielddbhome/FieldDB/angular_client/modules/core
    lrwxr-xr-x   1 yourusername  staff   38 22 Jul 16:57 fielddb-lexicon-angular -> /Users/yourusername/fielddbhome/FieldDBLexicon
    drwxr-xr-x  17 yourusername  staff  578 22 Jul 16:39 fontawesome
    drwxr-xr-x   7 yourusername  staff  238 22 Jul 16:39 jquery
    drwxr-xr-x   7 yourusername  staff  238 22 Jul 16:39 json3

```

## Develop

You should use grunt watch to live reload your browser (test, and build the project) as you debug/code. 

```bash
$ grunt watch
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

_Also, please don't edit files in the "dist" subdirectory as they are generated via Grunt. You'll find source code in the "lib" subdirectory!_

## Release History

* Used in corpus pages so far only

## License
Copyright (c) 2013-2014 FieldDB Contributors
Licensed under the Apache 2.0 license.
