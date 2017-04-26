"use strict";
var debug = require("debug")("routes:user");
var express = require("express");

var getUserMask = require("../lib/user").getUserMask;

var router = express.Router();

/**
 * Search a database
 * @param  {Request} req
 * @param  {Response} res
 */
function getUserPage(req, res, next) {
  var html5Routes = req.params.username;
  var pageNavs = ["tutorial", "people", "contact", "home"];
  if (pageNavs.indexOf(html5Routes) > -1) {
    res.redirect("/#/" + html5Routes);
    return;
  }

  getUserMask(req.params.username, next).then(function(userMask) {
    var user = userMask.toJSON();
    debug("User response", user);
    user.username = user.username || userMask.id;
    res.json(user);
  }, next).fail(next);
}

router.get("/:username", getUserPage);

module.exports.getUserPage = getUserPage;
module.exports.router = router;
