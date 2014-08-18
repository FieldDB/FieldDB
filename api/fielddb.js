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
  var DataList = require("./data_list/DataList").DataList;
  var AudioVideo = require("./audio_video/AudioVideo").AudioVideo;
  var Datum = require("./datum/Datum").Datum;
  var Database = require("./corpus/Database").Database;
  var PsycholinguisticsDatabase = require("./corpus/PsycholinguisticsDatabase").PsycholinguisticsDatabase;
  var FieldDBConnection = require("./FieldDBConnection").FieldDBConnection;
  var Router = require("./Router").Router;
  var User = require("./user/User").User;
  var UserMask = require("./user/UserMask").UserMask;
  var Team = require("./user/Team").Team;
  var Speaker = require("./user/Speaker").Speaker;
  var Consultant = require("./user/Consultant").Consultant;
  var Participant = require("./user/Participant").Participant;
  var Corpus = require("./corpus/Corpus").Corpus;
  var CorpusMask = require("./corpus/CorpusMask").CorpusMask;
  var Import = require("./import/Import").Import;
  var Search = require("./search/Search").Search;
  var Q = require("q");

  var FieldDB = {};

  FieldDB.Export = Export;
  FieldDB.FieldDBObject = FieldDBObject;
  FieldDB.CORS = CORS;
  FieldDB.DataList = DataList;
  FieldDB.AudioVideo = AudioVideo;
  FieldDB.Datum = Datum;
  FieldDB.Database = Database;
  FieldDB.PsycholinguisticsDatabase = PsycholinguisticsDatabase;
  FieldDB.Router = Router;
  FieldDB.User = User;
  FieldDB.UserMask = UserMask;
  FieldDB.Team = Team;
  FieldDB.Speaker = Speaker;
  FieldDB.Consultant = Consultant;
  FieldDB.Participant = Participant;
  FieldDB.Corpus = Corpus;
  FieldDB.CorpusMask = CorpusMask;
  FieldDB.Import = Import;
  FieldDB.Search = Search;
  FieldDB.Q = Q;
  FieldDB.FieldDBConnection = FieldDBConnection;

  exports.FieldDB = FieldDB;
  global.FieldDB = FieldDB;

}(typeof exports === 'object' && exports || this));
