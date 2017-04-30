"use strict";
var debug = require("debug")("routes:user");
var express = require("express");

var getUserMask = require("../lib/user").getUserMask;

var router = express.Router();

/**
 * Get public mask of a user
 * @param  {Request} req
 * @param  {Response} res
 * @param  {function} next
 */
function getUserPage(req, res, next) {
  var username = req.params.username;
  var html5PageNavs = ["tutorial", "people", "contact", "home"];
  if (html5PageNavs.indexOf(username) > -1) {
    res.redirect("/#/" + username);
    return;
  }

  getUserMask(username, next).then(function(userMask) {
    var user = userMask.toJSON();
    debug("User response", user);
    user.username = user.username || userMask.id;
    res.json(user);
  }, next).fail(next);
}

router.get("/:username", getUserPage);

module.exports.getUserPage = getUserPage;
module.exports.router = router;
