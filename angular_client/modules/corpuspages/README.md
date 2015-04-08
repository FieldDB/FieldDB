# FieldDB Corpus Admin Dashboard (and Public URLS)

A dashboard of Angular components which can be reused manage a corpus.

## Getting Started

### Use

Install the module with: `bower install fielddb-corpus-pages-app --save`

Or, download the [production version][js] and the [optional html templates][html_templates].

[js]: https://raw.github.com/OpenSourceFieldlinguistics/FieldDB/master/angular_client/modules/fielddb-corpus-pages-app/dist/scripts/fielddb-corpus-pages-app.js


In your website/app declare a div where the app will attach itself, and load the js and vendor dependancies:

```html
<body>

  <!-- your website content here -->

  <div data-fielddb-corpus-pages-app team="youroptionalteamnamewhichyouwanttoshow" corpus="youroptionalcorpusidentifierwhichyouwanttoshow" route="optionalroutetoadatalistordatumwhichyouwanttoshow"></div>

  <!-- your website content here -->

  <script src="bower_components/fielddb-corpus-pages-app/dist/scripts/vendor.js"></script>
  <script src="bower_components/fielddb-corpus-pages-app/dist/scripts/fielddb-corpus-pages-app.js"></script>

</body>
```


## Build

You need to have the other projects set up and built in order to build this project.

```bash
$ npm install 
$ bower install 
$ ls -al bower_components
    drwxr-xr-x  18 yourusername staff  612  7 Apr 22:33 .
    drwxr-xr-x  21 yourusername staff  714  7 Apr 23:40 ..
    drwxr-xr-x  11 yourusername staff  374  7 Apr 22:33 angular
    drwxr-xr-x  10 yourusername staff  340  7 Apr 22:33 angular-animate
    drwxr-xr-x   8 yourusername staff  272  7 Apr 22:33 angular-bootstrap
    drwxr-xr-x   9 yourusername staff  306  7 Apr 22:33 angular-contenteditable
    drwxr-xr-x  10 yourusername staff  340  7 Apr 22:33 angular-cookies
    drwxr-xr-x  10 yourusername staff  340  7 Apr 17:37 angular-mocks
    drwxr-xr-x  10 yourusername staff  340  7 Apr 22:33 angular-sanitize
    drwxr-xr-x  10 yourusername staff  340  7 Apr 22:33 angular-touch
    drwxr-xr-x  11 yourusername staff  374  7 Apr 22:33 angular-ui-router
    drwxr-xr-x  14 yourusername staff  476  7 Apr 22:33 bootstrap
    drwxr-xr-x   7 yourusername staff  238  7 Apr 22:33 fielddb
    drwxr-xr-x   7 yourusername staff  238  7 Apr 22:41 fielddb-angular
    drwxr-xr-x  10 yourusername staff  340  7 Apr 17:37 font-awesome
    drwxr-xr-x   7 yourusername staff  238  7 Apr 22:33 jquery
    drwxr-xr-x  17 yourusername staff  578  7 Apr 22:33 ng-file-upload
    drwxr-xr-x  15 yourusername staff  510  7 Apr 22:33 ng-file-upload-shim

```


## Develop

You should use gulp serve to live reload your browser (test, and build the project) as you debug/code. 

```bash
$ gulp 
$ gulp test
$ gulp test:auto
$ gulp serve
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Gulp](http://gulpjs.com/).

_Also, the "dist" subdirectory files are all generated via Gulp. You'll find source code in the "src" subdirectory!_

## Release History

* Used in corpus pages so far only

## License
Copyright (c) 2013-2015 FieldDB Contributors
Licensed under the Apache 2.0 license.
