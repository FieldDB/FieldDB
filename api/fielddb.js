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
  var FieldDB = {};

  var Activities = require("./activity/Activities").Activities;
  FieldDB.Activities = Activities;
  FieldDB["Activities"] = Activities;
  var Activity = require("./activity/Activity").Activity;
  FieldDB.Activity = Activity;
  FieldDB["Activity"] = Activity;
  var App = require("./app/App").App;
  FieldDB.App = App;
  FieldDB["App"] = App;
  var AudioVideo = require("./audio_video/AudioVideo").AudioVideo;
  FieldDB.AudioVideo = AudioVideo;
  FieldDB["AudioVideo"] = AudioVideo;
  var AudioVideoRecorder = require("./audio_video/AudioVideoRecorder").AudioVideoRecorder;
  FieldDB.AudioVideoRecorder = AudioVideoRecorder;
  FieldDB["AudioVideoRecorder"] = AudioVideoRecorder;
  var AudioVideos = require("./audio_video/AudioVideos").AudioVideos;
  FieldDB.AudioVideos = AudioVideos;
  FieldDB["AudioVideos"] = AudioVideos;
  var Authentication = require("./authentication/Authentication").Authentication;
  FieldDB.Authentication = Authentication;
  FieldDB["Authentication"] = Authentication;
  var CORS = require("./CORS").CORS;
  FieldDB.CORS = CORS;
  FieldDB["CORS"] = CORS;
  var Collection = require("./Collection").Collection;
  FieldDB.Collection = Collection;
  FieldDB["Collection"] = Collection;
  var Comment = require("./comment/Comment").Comment;
  FieldDB.Comment = Comment;
  FieldDB["Comment"] = Comment;
  var Comments = require("./comment/Comments").Comments;
  FieldDB.Comments = Comments;
  FieldDB["Comments"] = Comments;
  var Confidential = require("./confidentiality_encryption/Confidential").Confidential;
  FieldDB.Confidential = Confidential;
  FieldDB["Confidential"] = Confidential;
  var Connection = require("./corpus/Connection").Connection;
  FieldDB.Connection = Connection;
  FieldDB["Connection"] = Connection;
  var Consultant = require("./user/Consultant").Consultant;
  FieldDB.Consultant = Consultant;
  FieldDB["Consultant"] = Consultant;
  var ContextualizableObject = require("./locales/ContextualizableObject").ContextualizableObject;
  FieldDB.ContextualizableObject = ContextualizableObject;
  FieldDB["ContextualizableObject"] = ContextualizableObject;
  var Contextualizer = require("./locales/Contextualizer").Contextualizer;
  FieldDB.Contextualizer = Contextualizer;
  FieldDB["Contextualizer"] = Contextualizer;
  var Corpora = require("./corpus/Corpora").Corpora;
  FieldDB.Corpora = Corpora;
  FieldDB["Corpora"] = Corpora;
  var Corpus = require("./corpus/Corpus").Corpus;
  FieldDB.Corpus = Corpus;
  FieldDB["Corpus"] = Corpus;
  var CorpusMask = require("./corpus/CorpusMask").CorpusMask;
  FieldDB.CorpusMask = CorpusMask;
  FieldDB["CorpusMask"] = CorpusMask;
  var DataList = require("./data_list/DataList").DataList;
  FieldDB.DataList = DataList;
  FieldDB["DataList"] = DataList;
  var Database = require("./corpus/Database").Database;
  FieldDB.Database = Database;
  FieldDB["Database"] = Database;
  var Datum = require("./datum/Datum").Datum;
  FieldDB.Datum = Datum;
  FieldDB["Datum"] = Datum;
  var DatumField = require("./datum/DatumField").DatumField;
  FieldDB.DatumField = DatumField;
  FieldDB["DatumField"] = DatumField;
  var DatumFields = require("./datum/DatumFields").DatumFields;
  FieldDB.DatumFields = DatumFields;
  FieldDB["DatumFields"] = DatumFields;
  var ExperimentDataList = require("./data_list/ExperimentDataList").ExperimentDataList;
  FieldDB.ExperimentDataList = ExperimentDataList;
  FieldDB["ExperimentDataList"] = ExperimentDataList;
  var Export = require("./export/Export");
  FieldDB.Export = Export;
  FieldDB["Export"] = Export;
  var FieldDBConnection = require("./corpus/Database").FieldDBConnection;
  FieldDB.FieldDBConnection = FieldDBConnection;
  FieldDB["FieldDBConnection"] = FieldDBConnection;
  var FieldDBImage = require("./image/Image").Image;
  FieldDB.Image = FieldDBImage;
  FieldDB["Image"] = FieldDBImage;
  var FieldDBObject = require("./FieldDBObject").FieldDBObject;
  FieldDB.FieldDBObject = FieldDBObject;
  FieldDB["FieldDBObject"] = FieldDBObject;
  var FieldDatabase = require("./corpus/Corpus").FieldDatabase;
  FieldDB.FieldDatabase = FieldDatabase;
  FieldDB["FieldDatabase"] = FieldDatabase;
  var Glosser = require("./glosser/Glosser").Glosser;
  FieldDB.Glosser = Glosser;
  FieldDB["Glosser"] = Glosser;
  var HotKeys = require("./hotkey/HotKeys").HotKeys;
  FieldDB.HotKeys = HotKeys;
  FieldDB["HotKeys"] = HotKeys;
  var Images = require("./image/Images").Images;
  FieldDB.Images = Images;
  FieldDB["Images"] = Images;
  var Import = require("./import/Import").Import;
  FieldDB.Import = Import;
  FieldDB["Import"] = Import;
  var LanguageDatum = require("./datum/LanguageDatum").LanguageDatum;
  FieldDB.LanguageDatum = LanguageDatum;
  FieldDB["LanguageDatum"] = LanguageDatum;
  var Lexicon = require("./lexicon/Lexicon").Lexicon;
  FieldDB.Lexicon = Lexicon;
  FieldDB["Lexicon"] = Lexicon;
  var Participant = require("./user/Participant").Participant;
  FieldDB.Participant = Participant;
  FieldDB["Participant"] = Participant;
  var Permission = require("./permission/Permission").Permission;
  FieldDB.Permission = Permission;
  FieldDB["Permission"] = Permission;
  var Permissions = require("./permission/Permissions").Permissions;
  FieldDB.Permissions = Permissions;
  FieldDB["Permissions"] = Permissions;
  var PsycholinguisticsApp = require("./app/PsycholinguisticsApp").PsycholinguisticsApp;
  FieldDB.PsycholinguisticsApp = PsycholinguisticsApp;
  FieldDB["PsycholinguisticsApp"] = PsycholinguisticsApp;
  var PsycholinguisticsDatabase = require("./corpus/PsycholinguisticsDatabase").PsycholinguisticsDatabase;
  FieldDB.PsycholinguisticsDatabase = PsycholinguisticsDatabase;
  FieldDB["PsycholinguisticsDatabase"] = PsycholinguisticsDatabase;
  var Response = require("./datum/Response").Response;
  FieldDB.Response = Response;
  FieldDB["Response"] = Response;
  var Router = require("./Router").Router;
  FieldDB.Router = Router;
  FieldDB["Router"] = Router;
  var Search = require("./search/Search").Search;
  FieldDB.Search = Search;
  FieldDB["Search"] = Search;
  var Session = require("./datum/Session").Session;
  FieldDB.Session = Session;
  FieldDB["Session"] = Session;
  var Speaker = require("./user/Speaker").Speaker;
  FieldDB.Speaker = Speaker;
  FieldDB["Speaker"] = Speaker;
  var Stimulus = require("./datum/Stimulus").Stimulus;
  FieldDB.Stimulus = Stimulus;
  FieldDB["Stimulus"] = Stimulus;
  var SubExperimentDataList = require("./data_list/SubExperimentDataList").SubExperimentDataList;
  FieldDB.SubExperimentDataList = SubExperimentDataList;
  FieldDB["SubExperimentDataList"] = SubExperimentDataList;
  var Team = require("./user/Team").Team;
  FieldDB.Team = Team;
  FieldDB["Team"] = Team;
  var UnicodeSymbol = require("./unicode/UnicodeSymbol").UnicodeSymbol;
  FieldDB.UnicodeSymbol = UnicodeSymbol;
  FieldDB["UnicodeSymbol"] = UnicodeSymbol;
  var UnicodeSymbols = require("./unicode/UnicodeSymbols").UnicodeSymbols;
  FieldDB.UnicodeSymbols = UnicodeSymbols;
  FieldDB["UnicodeSymbols"] = UnicodeSymbols;
  var User = require("./user/User").User;
  FieldDB.User = User;
  FieldDB["User"] = User;
  var UserMask = require("./user/UserMask").UserMask;
  FieldDB.UserMask = UserMask;
  FieldDB["UserMask"] = UserMask;
  var UserPreference = require("./user/UserPreference").UserPreference;
  FieldDB.UserPreference = UserPreference;
  FieldDB["UserPreference"] = UserPreference;
  var Users = require("./user/Users").Users;
  FieldDB.Users = Users;
  FieldDB["Users"] = Users;

  var Q = require("q");
  FieldDB.Q = Q;
  FieldDB["Q"] = Q;

  CORS.bug = FieldDBObject.prototype.bug;
  FieldDB.Document = FieldDB.FieldDBObject;
  FieldDB["Document"] = FieldDB.FieldDBObject;

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
