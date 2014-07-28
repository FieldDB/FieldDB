/**
 * FieldDB
 * A open ended database for  evolving data collection projects
 *
 * @module          FieldDB
 * @tutorial        tests/FieldDBTest.js
 * @requires        Export
 * @requires        FieldDBObject
 * @requires        CORS
 * @requires        UserMask
 */
(function(exports) {
  'use strict';
  var Export = require("./export/Export");
  var FieldDBObject = require("./FieldDBObject").FieldDBObject;
  var CORS = require("./CORS").CORS;
  var Database = require("./corpus/Database").Database;
  var PsycholinguisticsDatabase = require("./corpus/PsycholinguisticsDatabase").PsycholinguisticsDatabase;
  var FieldDBConnection = require("./FieldDBConnection").FieldDBConnection;
  var Router = require("./Router").Router;
  var UserMask = require("./user/UserMask").UserMask;
  var Corpus = require("./corpus/Corpus").Corpus;
  var CorpusMask = require("./corpus/CorpusMask").CorpusMask;
  var Q = require("q");

  var FieldDB = {};

  FieldDB.Export = Export;
  FieldDB.FieldDBObject = FieldDBObject;
  FieldDB.CORS = CORS;
  FieldDB.Database = Database;
  FieldDB.PsycholinguisticsDatabase = PsycholinguisticsDatabase;
  FieldDB.Router = Router;
  FieldDB.UserMask = UserMask;
  FieldDB.Corpus = Corpus;
  FieldDB.CorpusMask = CorpusMask;
  FieldDB.Q = Q;
  FieldDB.FieldDBConnection = FieldDBConnection;

  exports.FieldDB = FieldDB;
  global.FieldDB = FieldDB;

}(typeof exports === 'object' && exports || this));
