# FieldDB Angular

A library of Angular components which can be reused to create new widgets or dashboards that connect/display/interact with FieldDB data

## Getting Started

### In the browser

####Easy install:
Install the module with: `bower install fielddb-angular --save`. If you use gulp or grunt, this is all you have to do.

####Manual install:
Or, if you don't use gulp or grunt, you can download the [production version][js], and [optional vendor libraries][vendor].

[js]: https://raw.github.com/OpenSourceFieldlinguistics/bower-fielddb-angular/master/dist/scripts/fielddb-angular.js
[vendor]: https://raw.github.com/OpenSourceFieldlinguistics/bower-fielddb-angular/master/dist/scripts/vendor.js

In your app load the `script.js` and optionally:
* `vendor.js` packages together all the dependancies for `fielddb-angular`, or you can use the copies in your own app if they are already there (see `bower.json` for a list of `fielddb-angular`'s dependancies) 
* If you want, you can declare your own templates in your own project as long as they have the same name (eg, a custom `components/user/user.html` will replace the default user template):

```html
<link rel="stylesheet" href="/bower_components/fielddb-angular/dist/styles/vendor.css" />
<link rel="stylesheet" href="/bower_components/fielddb-angular/dist/styles/fielddb-angular.css" />

<script src="bower_components/fielddb-angular/dist/scripts/vendor.js"></script>
<script src="bower_components/fielddb-angular/dist/scripts/fielddb-angular.js"></script>
```

####Load module
To use the module
* you should set the `BASE_DB_URL` and `BASE_AUTH_URL` for your FieldDB server, e.g. below
* you should include `fielddbAngular` as a dependency in your `angular.module` declaration, e.g. below
* you should allow CORS requests to your fielddb server, e.g.  `https://*.lingsync.org/**`
```javascript
  FieldDB.Database.prototype.BASE_DB_URL = 'https://corpusdev.lingsync.org';
	FieldDB.Database.prototype.BASE_AUTH_URL = 'https://authdev.lingsync.org';

  angular
  .module('myAppWhichUsesFieldDB', [
    'ngAnimate',
    "ngCookies",
    "ngTouch",
    "ngSanitize",
    "ui.router",
    "ui.bootstrap",
    'fielddbAngular'
  ])
  .config(function($routeProvider, $locationProvider, $sceDelegateProvider) {
    // $locationProvider.html5Mode(true);

    $sceDelegateProvider.resourceUrlWhitelist([
      // Allow same origin resource loads.
      'self',
      // Allow loading from outer domain.
      'https://*.lingsync.org/**',
      'http://*.yourdomain.ca/**'
    ]);

    if (FieldDB && FieldDB.Router) {
      for (var when in FieldDB.Router.routes) {
        FieldDB.Router.routes[when].angularRoute.controller = 'FieldDBCorpusPagesController';
        $routeProvider.when(FieldDB.Router.routes[when].path, FieldDB.Router.routes[when].angularRoute);
      }
      if (FieldDB.Router.otherwise) {
        $routeProvider.otherwise(FieldDB.Router.otherwise);
      }
    }
  });
```

## Examples

You can find more examples on how to use each component/directive in the specs directory.


To show a corpus's details:

```html
<div data-fielddb-corpus json="corpus"></div>
```

To show a corpus term's of use:

```html
<div data-fielddb-corpus-terms-of-use json="corpus"></div>
```

To show a team's profile:

```html
<div data-fielddb-user json="team"></div>
```

To show a login/logout button:

```html
<div data-fielddb-authentication json="authentication"></div>
```

To show an import widget:

```html
<div data-fielddb-import json="{type: 'users'}"></div>
```

```html
<div data-fielddb-import json="{type: 'participants'}"></div>
```

```html
<div data-fielddb-import json="{type: 'datum'}"></div>
```

To show a document of any type (it will autoguess)

```html
<div data-fielddb-doc json="doc"></div>
```


[More widgets....](https://github.com/OpenSourceFieldlinguistics/FieldDB/tree/master/angular_client/modules/core/src/components)

[More sample use of widgets....](https://github.com/OpenSourceFieldlinguistics/FieldDB/tree/master/angular_client/modules/core/src/components)


## Contributing

Get the source code from https://github.com/OpenSourceFieldlinguistics/FieldDB. (https://github.com/OpenSourceFieldlinguistics/bower-fielddb-angular is only for hosting the bower compiled version) 

_Also, some default caveats of a [Yeoman](http://yeoman.io/) project: if you edit files in the "dist" subdirectory you will be sadly dissapointed, as they are generated via Gulp. The source code in the "src" subdirectory._

* [Signup for a GitHub account](https://github.com/signup/free) (GitHub is free for OpenSource)
* Click on the "Fork" button to create your own copy.
* Leave us a note in our [issue tracker](https://github.com/OpenSourceFieldlinguistics/FieldDB/issues) to tell us a bit about the bug/feature you want to work on.
* You can [follow the 4 GitHub Help Tutorials](http://help.github.com/) to install and use Git on your computer.
* You can watch the videos on [YouTube dev playlist](https://www.youtube.com/playlist?list=PLUrH6CNxFDrO3zLHtHAMW-8u_v7TSvE-H) and/or in the [Developer's Blog](https://wwwdev.lingsync.org/dev.html) to find out how the codebase works, and to find where is the code that you want to edit. You might also like the [user tutorial screencasts](https://www.youtube.com/playlist?list=PLUrH6CNxFDrMtraL8hTLbLsQwdw1117FT) to see how the app is supposed to behave. Feel free to ask us questions in our [issue tracker](https://github.com/OpenSourceFieldlinguistics/FieldDB/issues), we're friendly and welcome Open Source newbies.
* Edit the code on your computer, commit it referencing the issue #xx you created ($ git commit -m "fixes #xxxx i changed blah blah...") and push to your origin ($ git push origin master).
* Run the tests `$ npm install` and  `$ bower install` and `$ gulp test` it should say something like `Finished 'test' after 3.54 s` And show how long each step `jshint` `test` `karma:unit` `dist` and `cssmin` took to run. If any of these parts errors, ask us for help in the [issue tracker](https://github.com/OpenSourceFieldlinguistics/FieldDB/issues).
![screen shot 2015-02-20 at 12 02 57 pm](https://cloud.githubusercontent.com/assets/196199/6281705/8294acc2-b8f8-11e4-829e-81f29314a980.png)
* Click on the "Pull Request" button, and leave us a note about what you changed. We will look at your changes and help you bring them into the project!
* Feel the glow of contributing to OpenSource :)


In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using the above command lines.



## Release History

* v2.14.0 iteration 2 of psycholinguistics dashboard (example at https://github.com/ProjetDeRechercheSurLecriture/DyslexDisorthGame/tree/master/angular_client)
* v2.24.0 iteration 11 of psycholinguistics dashboard (example at https://github.com/ProjetDeRechercheSurLecriture/DyslexDisorthGame/tree/master/angular_client)

## License
Copyright (c) 2013-2015 FieldDB Contributors
Licensed under the Apache 2.0 license.
