# FieldDB Angular

A library of Angular components which can be reused to create new widgets or dashboards that connect/display/interact with FieldDB data

## Getting Started

### In the browser

Install the module with: `bower install fielddb-angular --save`

Or, download the [production version][js] and the [optional html templates][html_templates].

[js]: https://raw.github.com/OpenSourceFieldlinguistics/FieldDB/master/angular_client/modules/core/dist/scripts/scripts.js
[html_templates]: https://raw.github.com/OpenSourceFieldlinguistics/FieldDB/master/angular_client/modules/core/dist/scripts/templates.js

In your app load the js and templates(use the default optional, or declare your own):

```html
<script src="bower_components/fielddb-angular/dist/scripts/scripts.js"></script>
<script src="bower_components/fielddb-angular/dist/scripts/templates.js"></script>
```

```javascript
  angular
  .module('myAppWhichUsesFieldDB', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'fielddbAngularApp'
  ])
  .config(function($routeProvider, $locationProvider) {
    // $locationProvider.html5Mode(true);
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


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

_Also, please don't edit files in the "dist" subdirectory as they are generated via Grunt. You'll find source code in the "lib" subdirectory!_

## Release History

* Used in corpus pages so far only

## License
Copyright (c) 2013-2014 FieldDB Contributors
Licensed under the Apache 2.0 license.
