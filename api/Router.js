var Router = Router || {};

Router.routes = Router.routes || [];
Router.routes.push({
  path: "/:team/:corpusid/import/:importType",
  angularRoute: {
    templateUrl: "views/import-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusid/import",
  angularRoute: {
     redirectTo: "/:team/:corpusid/import/data"
  }
});
Router.routes.push({
  path: "/:team/:corpusid/reports/:reportType",
  angularRoute: {
    templateUrl: "views/reports-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusid/speakers/:speakerType",
  angularRoute: {
    templateUrl: "views/speakers-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusid/participants",
  angularRoute: {
    templateUrl: "views/participants-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusid/consultants",
  angularRoute: {
    templateUrl: "views/consultants-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusid/sessions",
  angularRoute: {
    templateUrl: "views/sessions-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusid/datalists",
  angularRoute: {
    templateUrl: "views/datalists-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusid/data",
  angularRoute: {
    templateUrl: "views/all-data-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusid/search/:searchQuery",
  angularRoute: {
    templateUrl: "views/search-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusid/:docid",
  angularRoute: {
    templateUrl: "views/data-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusid",
  angularRoute: {
    templateUrl: "views/corpus-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team",
  angularRoute: {
    templateUrl: "views/team-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.otherwise = {
  redirectTo: "/"
};

if (exports) {
  exports.Router = Router;
}
