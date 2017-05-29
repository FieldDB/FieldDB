"use strict";
var config = require("config");
var debug = require("debug")("routes:corpus");
var express = require("express");

var getUserMask = require("../lib/user").getUserMask;
var getCorpusMask = require("../lib/corpus").getCorpusMask;
var getCorpusMaskFromTitleAsUrl = require("../lib/corpus").getCorpusMaskFromTitleAsUrl;

var router = express.Router();

/**
 * Search a database
 * @param  {Request} req
 * @param  {Response} res
 */
function getCorpus(req, res, next) {
  debug("getCorpus", req.params);
  getCorpusMask(req.params.dbname, next).then(function(corpusMask) {
    var corpus = corpusMask.toJSON();
    corpus.lexicon = {
      url: config.lexicon.public.url
    };
    corpus.prototypeApp = {
      url: config.corpus.public.url
    };
    corpus.search = {
      url: config.search.public.url
    };
    corpus.speech = {
      url: config.speech.public.url
    };
    res.json(corpus);
  }, next).fail(next);
}

/**
 * Search a database
 * @param  {Request} req
 * @param  {Response} res
 */
function getCorpusFromTitleAsUrl(req, res, next) {
  if (req.params.titleAsUrl.indexOf(req.params.username) === 0) {
    getCorpusMask(req.params.titleAsUrl, next).then(function(corpus) {
      // debug('replying with getCorpusMask', corpus);
      corpus.lexicon = {
        url: config.lexicon.public.url
      };
      corpus.prototypeApp = {
        url: config.corpus.public.url
      };
      corpus.search = {
        url: config.search.public.url
      };
      corpus.speech = {
        url: config.speech.public.url
      };
      res.json(corpus);
    }, next).fail(next);
    return;
  }
  getUserMask(req.params.username, next).then(function(userMask) {
    getCorpusMaskFromTitleAsUrl(userMask, req.params.titleAsUrl, next).then(function(corpus) {
      debug("replying with getCorpusMaskFromTitleAsUrl ", corpus);
      corpus.lexicon = {
        url: config.lexicon.public.url
      };
      corpus.prototypeApp = {
        url: config.corpus.public.url
      };
      corpus.search = {
        url: config.search.public.url
      };
      corpus.speech = {
        url: config.speech.public.url
      };
      res.json(corpus);
    }, next).fail(next);
  }, next).fail(next);
}

router.get("/corpora/:dbname", getCorpus);
router.get("/:username/:titleAsUrl", getCorpusFromTitleAsUrl);

module.exports.getCorpusFromTitleAsUrl = getCorpusFromTitleAsUrl;
module.exports.router = router;
