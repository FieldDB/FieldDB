/**
 * FieldDB
 * A open ended database for  evolving data collection projects
 *
 * @module          FieldDB
 * @tutorial        tests/FieldDBTest.js
 * @requires        Export
 * @requires        FieldDBObject
 * @requires        UserMask
 */

(function(exports) {
	'use strict';

	var FieldDB = {};

	var Export = require("./export/Export");
	var FieldDBObject = require("./FieldDBObject").FieldDBObject;
	var UserMask = require("./user/UserMask").UserMask;

	FieldDB.Export = Export;
	FieldDB.FieldDBObject = FieldDBObject;
	FieldDB.UserMask = UserMask;

	exports.FieldDB = FieldDB;
}(typeof exports === 'object' && exports || this));
