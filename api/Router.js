var Router = Router || {};

Router.routes = Router.routes || [];
Router.routes.push({
  path: "/faq",
  angularRoute: {
    templateUrl: "app/components/help/faq.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/import/:importType",
  angularRoute: {
    templateUrl: "app/components/import/import-page.html",
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
    templateUrl: "app/components/experiment/reports-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/speakers/:speakerType",
  angularRoute: {
    templateUrl: "app/components/user/speakers-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/participants",
  angularRoute: {
    templateUrl: "app/components/user/participants-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/consultants",
  angularRoute: {
    templateUrl: "app/components/user/consultants-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/sessions",
  angularRoute: {
    templateUrl: "app/components/session/sessions-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/activityfeed",
  angularRoute: {
    templateUrl: "app/components/activity/activityfeed-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/activityfeed/:activityTypeOrItem",
  angularRoute: {
    templateUrl: "app/components/activity/activity-list-item.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/datalists",
  angularRoute: {
    templateUrl: "app/components/datalist/datalists-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/data",
  angularRoute: {
    templateUrl: "app/components/datalist/all-data-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/search/:searchQuery",
  angularRoute: {
    templateUrl: "app/components/search/search-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/:docid",
  angularRoute: {
    templateUrl: "app/components/doc/data-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier",
  angularRoute: {
    templateUrl: "app/components/corpus/corpus-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team",
  angularRoute: {
    templateUrl: "app/components/user/team-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.otherwise = {
  redirectTo: "/"
};

if (exports) {
  exports.Router = Router;
}
