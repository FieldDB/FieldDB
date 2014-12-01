var Router = Router || {};

Router.routes = Router.routes || [];
Router.routes.push({
  path: "/:team/:corpusidentifier/import/:importType",
  angularRoute: {
    templateUrl: "views/import-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/import",
  angularRoute: {
     redirectTo: "/:team/:corpusidentifier/import/data"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/reports/:reportType",
  angularRoute: {
    templateUrl: "views/reports-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/speakers/:speakerType",
  angularRoute: {
    templateUrl: "views/speakers-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/participants",
  angularRoute: {
    templateUrl: "views/participants-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/consultants",
  angularRoute: {
    templateUrl: "views/consultants-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/sessions",
  angularRoute: {
    templateUrl: "views/sessions-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/datalists",
  angularRoute: {
    templateUrl: "views/datalists-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/data",
  angularRoute: {
    templateUrl: "views/all-data-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/search/:searchQuery",
  angularRoute: {
    templateUrl: "views/search-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/:docid",
  angularRoute: {
    templateUrl: "views/data-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier",
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
