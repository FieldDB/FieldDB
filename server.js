require('babel-register')

var compression = require("compression");
var config = require("config");
var express = require("express");
var debug = require("debug")("server");
var favicon = require("serve-favicon");
var logger = require("morgan");
var methodOverride = require("method-override");
var session = require("express-session");
var bodyParser = require("body-parser");
var errorHandler = require("./middleware/error-handler").errorHandler;
var consolidate = require("consolidate");
var path = require("path");

var activityRoutes = require("./routes/activity").router;
var corpora = require("./lib/corpora");
var corpusRoutes = require("./routes/corpus").router;
var userRoutes = require("./routes/user").router;
var reduxRender = require("./routes/react-render").reduxRender;
var acceptSelfSignedCertificates = {
  strictSSL: false
};
if (process.env.NODE_ENV === "production") {
  acceptSelfSignedCertificates = {};
}

if (config.offline) {
  var requestSampleData = require('./config/offline').requestSampleData;
  requestSampleData(config);
}

var app = express();

// configure Express
app.engine("html", consolidate.handlebars);
app.set("view engine", ".html");
app.set("views", path.join(__dirname, "views"));
app.use(favicon(__dirname + "/public/favicon.ico"));
app.use(logger("common"));
app.use(methodOverride());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.session_key
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(path.join(__dirname, "public")));


app.use(compression())

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist", "public")))
} else {
  app.use("/assets", express.static(path.join(__dirname, "app", "assets")))
  app.use(express.static(path.join(__dirname, "dist")))
}

app.get("/", function(req, res, next) {
  res.render("site", {
    title: "LingSync.org",
    description: "LingSync is a free, open" +
      "source data management system built for field linguistics teams. It" +
      "allows teams to securely enter, store, organize, annotate, and share" +
      "linguistic data. The application is accessible on any device: not only" +
      "on laptops (Mac, Linux, Windows, ChromeBooks) but also on touch" +
      "tablets or mobile devices (Android and iPhone/iPad). It is suitable" +
      "for both online and offline use, and data is syncable and sharable" +
      "with other researchers as well as the language community. Team members" +
      "can use the application not just to view and modify data, but also to" +
      "analyze and discuss it. The system also has a simple and friendly user" +
      "interface, %allowing users to drag and drop data (audio, %video," +
      "%text), allowing users to record audio/video directly into the" +
      "database. The application has import and export capabilities for" +
      "multiple file types. LingSync was designed from the ground up to" +
      "conform to E-MELD and DataOne data management best practices, an" +
      "important requirement for any application used by data collection" +
      "projects funded by granting agencies. Finally, the application is" +
      "designed to be intuitive and theory-free, so it is not necessary to be" +
      "a field linguist or programmer to figure out how it works. LingSync is" +
      "hosted on cloud servers so that users can use it without knowing how" +
      "to set up their own servers, but it also has an installation guide for" +
      "server administrators so organizations can run their own instance of" +
      "LingSync. Not only is its source code 100\% open, but LingSync's" +
      "development is also 100\% open and driven by the research assistants" +
      "of fieldwork teams who use the application.",
    controller: "LingSyncWebsiteMainController",
    partials: {
      m_scripts: "partials/home"
    }
  });
});
app.get("/download",
  function(req, res, next) {
    res.render("site", {
      title: "LingSync.org",
      description: "",
      corpus: {
        url: config.corpus.public.url
      },
      partials: {
        m_scripts: "partials/download"
      }
    });
  });
app.get("/people",
  function(req, res, next) {
    res.render("site", {
      title: "People - LingSync.org",
      description: "The app was orginally developed in 2012 in collaboration " +
        "with students and professors of linguistics from local universities in " +
        "Montreal Canada (McGill and Concordia). Since then it has been adopted  " +
        "by other universities as a collaborative tool for Field Methods or  " +
        "multi-lingual translation classes.",
      partials: {
        m_scripts: "partials/people"
      }
    });
  });
app.get("/technology", function(req, res, next) {
  res.render("site", {
    title: "Technology - LingSync.org",
    description: "Lingsync is composed of a number of webservices and application " +
      "clients. The data management portions of LingSync were designed from the " +
      "ground up to conform to EMELD and DataOne best practices on formatting, " +
      "archiving, open access, and security.",
    controller: "LingSyncWebsiteTechnologyController",
    partials: {
      m_scripts: "partials/technology"
    }
  });
});
app.get("/tutorials", function(req, res, next) {
  res.render("site", {
    title: "Tutorials - LingSync.org",
    description: "Enjoy our how-to videos made by LingSync interns " +
      "tea: https://www.youtube.com/playlist?list=PLUrH6CNxFDrMtraL8hTLbLsQwdw1117FT",
    partials: {
      m_scripts: "partials/tutorials"
    }
  });
});
app.get("/projects",
  function(req, res, next) {
    res.render("site", {
      title: "Projects - LingSync.org",
      description: "",
      partials: {
        m_scripts: "partials/projects"
      }
    });
  });

/*
 * Routes
 */

app.get('/api/corpora', function(req, res, next) {
  corpora.getAllCorpora().then(function(results) {
    res.json(results);
  }, next).catch(next)
});
app.use('/api/activity', activityRoutes);
app.use('/api/users', userRoutes);
app.use('/api', corpusRoutes);

app.get("*", reduxRender);

// error handling middleware should be loaded after the loading the routes
app.use(errorHandler);

module.exports = app;
