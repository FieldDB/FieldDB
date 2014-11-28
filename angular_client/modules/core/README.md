# FieldDB Angular

A library of Angular components which can be reused to create new widgets or dashboards that connect/display/interact with FieldDB data

## Getting Started

### In the browser

Install the module with: `bower install fielddb-angular --save`

Or, download the [production version][js],  [optional vendor libraries][vendor], and the [optional html templates][html_templates].

[js]: https://raw.github.com/OpenSourceFieldlinguistics/bower-fielddb-angular/master/dist/scripts/scripts.js
[html_templates]: https://raw.github.com/OpenSourceFieldlinguistics/bower-fielddb-angular/master/dist/scripts/templates.js
[vendor]: https://raw.github.com/OpenSourceFieldlinguistics/bower-fielddb-angular/master/dist/scripts/vendor.js

In your app load the `script.js` and optionally:
* `vendor.js` packages together all the dependancies for `fielddb-angular`, or you can use the copies in your own app if they are already there (see `bower.json` for a list of `fielddb-angular`'s dependancies) 
* `templates.js` if you want to use use some or all of the default tempaltes, or you can declare your own in your own project as long as they have the same name (eg, a custom `user.html`):

```html
<link rel="stylesheet" href="/bower_components/fielddb-angular/dist/styles/vendor.css" />
<link rel="stylesheet" href="/bower_components/fielddb-angular/dist/styles/main.css" />

<script src="bower_components/fielddb-angular/dist/scripts/vendor.js"></script>
<script src="bower_components/fielddb-angular/dist/scripts/scripts.js"></script>
<script src="bower_components/fielddb-angular/dist/scripts/templates.js"></script>
```

```javascript
  angular
  .module('myAppWhichUsesFieldDB', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'fielddbAngularApp'
  ])
  .config(function($routeProvider, $locationProvider) {
    // $locationProvider.html5Mode(true);

    $sceDelegateProvider.resourceUrlWhitelist([
      // Allow same origin resource loads.
      'self',
      // Allow loading from outer domain.
      'https://*.example.org/**',
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


[More directives....](https://github.com/OpenSourceFieldlinguistics/FieldDB/tree/master/angular_client/modules/core/app/scripts/directives)

[More sample use of directives....](https://github.com/OpenSourceFieldlinguistics/FieldDB/tree/master/angular_client/modules/core/app/views)


## Contributing

Get the source code from https://github.com/OpenSourceFieldlinguistics/FieldDB. (https://github.com/OpenSourceFieldlinguistics/bower-fielddb-angular is only for hosting the bower compiled version) 

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

_Also, please don't edit files in the "dist" subdirectory as they are generated via Grunt. You'll find source code in the "lib" subdirectory!_

## Release History

* v2.14.0 iteration 2 of psycholinguistics dashboard (example at https://github.com/ProjetDeRechercheSurLecriture/DyslexDisorthGame/tree/master/angular_client)
* v2.24.0 iteration 11 of psycholinguistics dashboard (example at https://github.com/ProjetDeRechercheSurLecriture/DyslexDisorthGame/tree/master/angular_client)

## License
Copyright (c) 2013-2014 FieldDB Contributors
Licensed under the Apache 2.0 license.
