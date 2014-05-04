var Router = Router || {};

Router.routes = Router.routes || [];
Router.routes.push({
  path: '/:team/:corpusid/:docid',
  angularRoute: {
    templateUrl: 'views/data-page.html',
    controller: 'OverrideYourControllerHere'
  }
});
Router.routes.push({
  path: '/:team/:corpusid',
  angularRoute: {
    templateUrl: 'views/corpus-page.html',
    controller: 'OverrideYourControllerHere'
  }
});
Router.routes.push({
  path: '/:team',
  angularRoute: {
    templateUrl: 'views/user-page.html',
    controller: 'OverrideYourControllerHere'
  }
});
Router.otherwise = {
  redirectTo: '/public/'
};

if (exports) {
  exports.Router = Router;
}
