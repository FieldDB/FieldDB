/* globals window, URL */

/**
 * FieldDB
 * A open ended database for evolving data collection projects
 *
 * @module          FieldDB
 * @tutorial        tests/FieldDBTest.js
 * @requires        Export
 * @requires        FieldDBObject
 * @requires        CORS
 * @requires        UserMask
 */
(function(exports) {
  "use strict";
  var Activity = require("./activity/Activity").Activity;
  var App = require("./app/App").App;
  var Authentication = require("./authentication/Authentication").Authentication;
  var PsycholinguisticsApp = require("./app/PsycholinguisticsApp").PsycholinguisticsApp;
  var Export = require("./export/Export");
  var FieldDBObject = require("./FieldDBObject").FieldDBObject;
  var Collection = require("./Collection").Collection;
  var Document = FieldDBObject;
  var CORS = require("./CORS").CORS;
  CORS.bug = FieldDBObject.prototype.bug;
  var DataList = require("./data_list/DataList").DataList;
  var SubExperimentDataList = require("./data_list/SubExperimentDataList").SubExperimentDataList;
  var ExperimentDataList = require("./data_list/ExperimentDataList").ExperimentDataList;
  var FieldDBImage = require("./image/Image").Image;
  var AudioVideo = require("./audio_video/AudioVideo").AudioVideo;
  var AudioVideos = require("./audio_video/AudioVideos").AudioVideos;
  var AudioVideoRecorder = require("./audio_video/AudioVideoRecorder").AudioVideoRecorder;
  var Comment = require("./comment/Comment").Comment;
  var Comments = require("./comment/Comments").Comments;
  var Datum = require("./datum/Datum").Datum;
  var Session = require("./datum/Session").Session;
  var DatumField = require("./datum/DatumField").DatumField;
  var Stimulus = require("./datum/Stimulus").Stimulus;
  var Response = require("./datum/Response").Response;
  var Database = require("./corpus/Database").Database;
  var PsycholinguisticsDatabase = require("./corpus/PsycholinguisticsDatabase").PsycholinguisticsDatabase;
  var FieldDBConnection = require("./corpus/Database").FieldDBConnection;
  var Router = require("./Router").Router;
  var User = require("./user/User").User;
  var Users = require("./user/Users").Users;
  var UserMask = require("./user/UserMask").UserMask;
  var UserPreference = require("./user/UserPreference").UserPreference;
  var Team = require("./user/Team").Team;
  var Permission = require("./permission/Permission").Permission;
  var Permissions = require("./permission/Permissions").Permissions;
  var Speaker = require("./user/Speaker").Speaker;
  var Consultant = require("./user/Consultant").Consultant;
  var Participant = require("./user/Participant").Participant;
  var Contextualizer = require("./locales/Contextualizer").Contextualizer;
  var ContextualizableObject = require("./locales/ContextualizableObject").ContextualizableObject;
  var Corpus = require("./corpus/Corpus").Corpus;
  var Connection = require("./corpus/Connection").Connection;
  var Corpora = require("./corpus/Corpora").Corpora;
  var FieldDatabase = require("./corpus/Corpus").FieldDatabase;
  var CorpusMask = require("./corpus/CorpusMask").CorpusMask;
  var Import = require("./import/Import").Import;
  var Search = require("./search/Search").Search;
  var UnicodeSymbol = require("./unicode/UnicodeSymbol").UnicodeSymbol;
  var UnicodeSymbols = require("./unicode/UnicodeSymbols").UnicodeSymbols;
  var Q = require("q");

  var FieldDB = {};

  FieldDB.Activity = Activity;
  FieldDB["Activity"] = Activity;
  FieldDB.App = App;
  FieldDB["App"] = App;
  FieldDB.PsycholinguisticsApp = PsycholinguisticsApp;
  FieldDB["PsycholinguisticsApp"] = PsycholinguisticsApp;
  FieldDB.Authentication = Authentication;
  FieldDB["Authentication"] = Authentication;
  FieldDB.Export = Export;
  FieldDB["Export"] = Export;
  FieldDB.FieldDBObject = FieldDBObject;
  FieldDB["FieldDBObject"] = FieldDBObject;
  FieldDB.Collection = Collection;
  FieldDB["Collection"] = Collection;
  FieldDB.Document = Document;
  FieldDB["Document"] = Document;
  FieldDB.CORS = CORS;
  FieldDB["CORS"] = CORS;
  FieldDB.DataList = DataList;
  FieldDB["DataList"] = DataList;
  FieldDB.SubExperimentDataList = SubExperimentDataList;
  FieldDB["SubExperimentDataList"] = SubExperimentDataList;
  FieldDB.ExperimentDataList = ExperimentDataList;
  FieldDB["ExperimentDataList"] = ExperimentDataList;
  FieldDB.AudioVideo = AudioVideo;
  FieldDB["AudioVideo"] = AudioVideo;
  FieldDB.Image = FieldDBImage;
  FieldDB["Image"] = FieldDBImage;
  FieldDB.AudioVideos = AudioVideos;
  FieldDB["AudioVideos"] = AudioVideos;
  FieldDB.AudioVideoRecorder = AudioVideoRecorder;
  FieldDB["AudioVideoRecorder"] = AudioVideoRecorder;
  FieldDB.Comment = Comment;
  FieldDB["Comment"] = Comment;
  FieldDB.Comments = Comments;
  FieldDB["Comments"] = Comments;
  FieldDB.Datum = Datum;
  FieldDB["Datum"] = Datum;
  FieldDB.Session = Session;
  FieldDB["Session"] = Session;
  FieldDB.DatumField = DatumField;
  FieldDB["DatumField"] = DatumField;
  FieldDB.Stimulus = Stimulus;
  FieldDB["Stimulus"] = Stimulus;
  FieldDB.Response = Response;
  FieldDB["Response"] = Response;
  FieldDB.Database = Database;
  FieldDB["Database"] = Database;
  FieldDB.FieldDatabase = FieldDatabase;
  FieldDB["FieldDatabase"] = FieldDatabase;
  FieldDB.PsycholinguisticsDatabase = PsycholinguisticsDatabase;
  FieldDB["PsycholinguisticsDatabase"] = PsycholinguisticsDatabase;
  FieldDB.Router = Router;
  FieldDB["Router"] = Router;
  FieldDB.User = User;
  FieldDB["User"] = User;
  FieldDB.Users = Users;
  FieldDB["Users"] = Users;
  FieldDB.UserMask = UserMask;
  FieldDB["UserMask"] = UserMask;
  FieldDB.UserPreference = UserPreference;
  FieldDB["UserPreference"] = UserPreference;
  FieldDB.Permission = Permission;
  FieldDB["Permission"] = Permission;
  FieldDB.Permissions = Permissions;
  FieldDB["Permissions"] = Permissions;
  FieldDB.Team = Team;
  FieldDB["Team"] = Team;
  FieldDB.Speaker = Speaker;
  FieldDB["Speaker"] = Speaker;
  FieldDB.Consultant = Consultant;
  FieldDB["Consultant"] = Consultant;
  FieldDB.Participant = Participant;
  FieldDB["Participant"] = Participant;
  FieldDB.Contextualizer = Contextualizer;
  FieldDB["Contextualizer"] = Contextualizer;
  FieldDB.ContextualizableObject = ContextualizableObject;
  FieldDB["ContextualizableObject"] = ContextualizableObject;
  FieldDB.Corpus = Corpus;
  FieldDB["Corpus"] = Corpus;
  FieldDB.CorpusMask = CorpusMask;
  FieldDB["CorpusMask"] = CorpusMask;
  FieldDB.Connection = Connection;
  FieldDB["Connection"] = Connection;
  FieldDB.Corpora = Corpora;
  FieldDB["Corpora"] = Corpora;
  FieldDB.Import = Import;
  FieldDB["Import"] = Import;
  FieldDB.Search = Search;
  FieldDB["Search"] = Search;
  FieldDB.UnicodeSymbol = UnicodeSymbol;
  FieldDB["UnicodeSymbol"] = UnicodeSymbol;
  FieldDB.UnicodeSymbols = UnicodeSymbols;
  FieldDB["UnicodeSymbols"] = UnicodeSymbols;
  FieldDB.Q = Q;
  FieldDB["Q"] = Q;
  FieldDB.FieldDBConnection = FieldDBConnection;
  FieldDB["FieldDBConnection"] = FieldDBConnection;

  exports.FieldDB = FieldDB;
  global.FieldDB = FieldDB;

  setTimeout(function() {
    var brandname = "FieldDB";
    if (FieldDB && FieldDB["FieldDBObject"] && FieldDB["FieldDBObject"].application && FieldDB["FieldDBObject"].application.brand) {
      brandname = FieldDB["FieldDBObject"].application.brand.replace(/\W/g, "_");
      try {
        window[brandname] = FieldDB;

        // Inject browser URL as the URL parser.
        Connection.URLParser = URL;

      } catch (e) {
        console.warn("Couldnt attach the FieldDB library as " + brandname, e);

        // Inject nodejs URL as the URL parser.
        Connection.URLParser = require("url");

      }
    }
    console.log("-----------------------------------------------------");
    console.log("-----------------------------------------------------");
    console.log("-----------------------------------------------------");
    console.log("   ___                      _   _            _    ");
    console.log("  | _ \\_____ __ _____ _ _  | | | |______ _ _( )___");
    console.log("  |  _/ _ \\ V  V / -_| '_| | |_| (_-/ -_| '_|/(_-<");
    console.log("  |_| \\___/\\_/\\_/\\___|_|    \\___//__\\___|_|   /__/");
    console.log("    ___     _                   _   _         ");
    console.log("   |_ _|_ _| |_ ___ _ _ __ _ __| |_(___ _____ ");
    console.log("    | || ' |  _/ -_| '_/ _` / _|  _| \\ V / -_)");
    console.log("   |___|_||_\\__\\___|_| \\__,_\\__|\\__|_|\\_/\\___|");
    console.log("         ___                 _     ");
    console.log("        / __|___ _ _  ______| |___ ");
    console.log("       | (__/ _ | ' \\(_-/ _ | / -_)");
    console.log("        \\___\\__.|_||_|__\\__.|_\\___|");
    console.log("                                                                                                                  ");
    console.log("-----Power User's Interactive Console loaded " +
      new FieldDB["FieldDBObject"]().version);
    console.log("-----------------------------------------------------");
    console.log("-----for available models/functionality, type--------");
    console.log("                            " + brandname + ".");
    console.log("-----------------------------------------------------");
    console.log("-----------------------------------------------------");
    console.log("-----------------------------------------------------");
    console.log("-----------------------------------------------------");
  }, 1000);
}(typeof exports === "object" && exports || this));
