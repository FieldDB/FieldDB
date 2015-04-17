var Router = Router || {};

Router.routes = Router.routes || [];
Router.routes.push({
  path: "/faq",
  angularRoute: {
    templateUrl: "components/help/faq.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/import/:importType",
  angularRoute: {
    templateUrl: "components/import/import-page.html",
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
    templateUrl: "components/experiment/reports-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/speakers/:speakerType",
  angularRoute: {
    templateUrl: "components/user/speakers-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/participants",
  angularRoute: {
    templateUrl: "components/user/participants-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/consultants",
  angularRoute: {
    templateUrl: "components/user/consultants-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/sessions",
  angularRoute: {
    templateUrl: "components/session/sessions-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/activityfeed",
  angularRoute: {
    templateUrl: "components/activity/activityfeed-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/activityfeed/:activityTypeOrItem",
  angularRoute: {
    templateUrl: "components/activity/activity-list-item.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/datalists",
  angularRoute: {
    templateUrl: "components/datalist/datalists-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/data",
  angularRoute: {
    templateUrl: "components/datalist/all-data-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/search/:searchQuery",
  angularRoute: {
    templateUrl: "components/search/search-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier/:docid",
  angularRoute: {
    templateUrl: "components/doc/data-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team/:corpusidentifier",
  angularRoute: {
    templateUrl: "components/corpus/corpus-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.routes.push({
  path: "/:team",
  angularRoute: {
    templateUrl: "components/user/team-page.html",
    controller: "OverrideYourControllerHere"
  }
});
Router.otherwise = {
  redirectTo: "/"
};

if (exports) {
  exports.Router = Router;
}
