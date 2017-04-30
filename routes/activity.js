"use strict";
var debug = require("debug")("routes:corpus");
var express = require("express");

var activityHeatMap = require("../lib/activity").activityHeatMap;

var router = express.Router();

/**
 * Search a database
 * @param  {Request} req
 * @param  {Response} res
 */
function getActivityHeatMap(req, res, next) {
  if (!req.params.dbname) {
    return next();
  }
  activityHeatMap(req.params.dbname, next).then(function(heatMapData) {
    debug("Activity Heat Map response", heatMapData);
    res.json(heatMapData);
  }, next).fail(next);
}

router.get("/:dbname", getActivityHeatMap);

module.exports.getActivityHeatMap = getActivityHeatMap;
module.exports.router = router;
