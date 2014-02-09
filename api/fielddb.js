/**
 * FieldDB
 * A open ended database for  evolving data collection projects
 *
 * @module          FieldDB
 * @tutorial        tests/FieldDBTest.js
 * @requires        Export
 */
var Export = require("./export/Export");

(function(exports) {
	'use strict';

	exports.Export = Export;

}(typeof exports === 'object' && exports || this));
