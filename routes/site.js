"use strict";
var config = require("config");
var debug = require("debug")("routes:site");
var express = require("express");

var router = express.Router();

router.get("/", function(req, res, next) {
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

router.get("/download", function(req, res, next) {
  res.render("site", {
    title: "Install - LingSync.org",
    description: "Download or open one of the Applications which works with " +
      "LingSync.org. There are applictions for viewing, analyzing or sharing " +
      "data for different audiences. The applications work in a Browser " +
      "(Mac, Linux, Windows, iPhone, Android) or for a Phone/Tablet (Android)",
    corpus: {
      url: config.corpus.public.url
    },
    partials: {
      m_scripts: "partials/download"
    }
  });
});

router.get("/people", function(req, res, next) {
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

router.get("/technology", function(req, res, next) {
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

router.get("/tutorials", function(req, res, next) {
  res.render("site", {
    title: "Tutorials - LingSync.org",
    description: "Enjoy our how-to videos made by LingSync interns " +
      "tea: https://www.youtube.com/playlist?list=PLUrH6CNxFDrMtraL8hTLbLsQwdw1117FT",
    partials: {
      m_scripts: "partials/tutorials"
    }
  });
});

router.get("/projects", function(req, res, next) {
  res.render("site", {
    title: "Projects - LingSync.org",
    description: "",
    partials: {
      m_scripts: "partials/projects"
    }
  });
});

module.exports.router = router;
