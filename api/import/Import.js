/* globals window, escape, $, FileReader, FormData, unescape, Blob */
var FieldDBImage = require("./../image/Image").Image;
var AudioVideo = require("./../audio_video/AudioVideo").AudioVideo;
var AudioVideos = require("./../audio_video/AudioVideos").AudioVideos;
var Collection = require("./../Collection").Collection;
var CORS = require("./../CORS").CORS;
var Corpus = require("./../corpus/Corpus").Corpus;
// var DataList = require("./../data_list/DataList").DataList;
var Participant = require("./../user/Participant").Participant;
var Datum = require("./../datum/Datum").Datum;
var DatumField = require("./../datum/DatumField").DatumField;
var DatumFields = require("./../datum/DatumFields").DatumFields;
var FieldDBObject = require("./../FieldDBObject").FieldDBObject;
// var FileReader = {};
var Session = require("./../datum/Session").Session;
var TextGrid = require("textgrid").TextGrid;
var X2JS = {};
var Q = require("q");

var ATOB;
try {
  if (!window.atob) {
    console.log("ATOB is not defined, loading from npm");
  }
  ATOB = window.atob;
} catch (e) {
  ATOB = require("atob");
}
/**
 * @class The import class helps import csv, xml and raw text data into a corpus, or create a new corpus.
 *
 * @property {FileList} files These are the file(s) that were dragged in.
 * @property {String} dbname This is the corpusid wherej the data should be imported
 * @property {DatumFields} fields The fields array contains titles of the data columns.
 * @property {DataList} datalist The datalist imported, to hold the data before it is saved.
 * @property {Event} event The drag/drop event.
 *
 * @description The initialize serves to bind import to all drag and drop events.
 *
 * @extends FieldDBObject
 * @tutorial tests/CorpusTest.js
 */

//http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
var dataURItoBlob = function(dataURI) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURI.split(",")[0].indexOf("base64") >= 0) {
    byteString = ATOB(dataURI.split(",")[1]);
  } else {
    byteString = unescape(dataURI.split(",")[1]);
  }

  // separate out the mime component
  var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], {
    type: mimeString
  });
};

var getUnique = function(arrayObj) {
  var u = {},
    a = [];
  for (var i = 0, l = arrayObj.length; i < l; ++i) {
    if (u.hasOwnProperty(arrayObj[i])) {
      continue;
    }
    if (arrayObj[i]) {
      a.push(arrayObj[i]);
      u[arrayObj[i]] = 1;
    }
  }
  return a;
};

var Import = function Import(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "Import";
  }
  this.debug(" new import ", options);
  FieldDBObject.apply(this, arguments);
  options = options || {};
  var sessionOptions = options.session || {};
  sessionOptions.datalist = options.datalist || {
    title: {
      default: "Imported Data"
    },
    docs: {
      id: "tempdatalist",
      collection: [],
      primaryKey: "tempId"
    },
    // confidential: self.corpus.confidential,
    // debugMode: true
  };
  this.session = sessionOptions;
  this.session.goal = "Goal from file import";
};

Import.prototype = Object.create(FieldDBObject.prototype, /** @lends Import.prototype */ {
  constructor: {
    value: Import
  },

  fillWithDefaults: {
    value: function() {
      if (!this.datumFields) {
        this.datumFields = this.corpus.datumFields.clone();
      }
    }
  },

  defaults: {
    get: function() {
      return {
        status: "",
        showImportFirstStep: true,
        showImportSecondStep: false,
        showImportThirdStep: false,
        progress: {
          total: 0,
          completed: 0
        },
        datalist: {},
        session: {},
        dbname: "",
        files: [],
        asFieldMatrix: [],
        asCSV: []
      };
    },
    set: function() {}
  },

  INTERNAL_MODELS: {
    value: {
      progress: {},
      // datalist: DataList,
      datumFields: DatumFields,
      session: Session,
      corpus: Corpus
    }
  },

  showImportSecondStep: {
    get: function() {
      if (this.dontShowSecondStep) {
        return false;
      }
      return this.asCSV && this.asCSV.length > 0;
    },
    set: function() {}
  },

  showImportThirdStep: {
    get: function() {
      return this.datalist && this.datalist.docs && this.datalist.docs.length > 0;
    },
    set: function() {}
  },

  addFileUri: {
    value: function(options) {
      var deferred = Q.defer(),
        self = this;

      if (!options) {
        throw new Error("Options must be specified {}");
      }
      if (!options.uri) {
        throw new Error("Uri must be specified in the options in order to import it" + JSON.stringify(options));
      }

      Q.nextTick(function() {
        self.readUri(options)
          .then(function() {
            return self.preprocess.apply(self, arguments);
          })
          .then(function() {
            return self.import.apply(self, arguments);
          })
          .then(function(result) {
            self.debug("Import is finished");
            if (options && typeof options.next === "function" /* enable use as middleware */ ) {
              options.next();
            }
            self.debug("result.datum", result.datum);
            self.files.add(result.datum);
            deferred.resolve(result);
          })
          .fail(function(reason) {
            console.error(reason.stack);
            deferred.reject(reason);
          });

      });

      return deferred.promise;
    }
  },

  readUri: {
    value: function(options) {
      var deferred = Q.defer(),
        self = this;

      Q.nextTick(function() {
        if (!options) {
          throw new Error("Options must be specified {}");
        }

        var pipeline = function(optionsWithADatum) {
          if (optionsWithADatum.readOptions) {
            optionsWithADatum.readOptions.readFileFunction(function(err, data) {
              if (err) {
                deferred.reject(err);
              } else {
                optionsWithADatum.rawText = data;
                deferred.resolve(optionsWithADatum);
              }
            });
          } else {
            self.debug("TODO reading url in browser");
            CORS.makeCORSRequest({
              type: "GET",
              dataType: "json",
              uri: optionsWithADatum.uri
            }).then(function(data) {
                self.debug(data);
                optionsWithADatum.rawText = data;
                deferred.resolve(optionsWithADatum);
              },
              function(reason) {
                self.debug(reason);
                deferred.reject(reason);
              }).fail(
              function(error) {
                console.error(error.stack, self);
                deferred.reject(error);
              });
          }
        };

        self.corpus.find(options.uri)
          .then(function(similarData) {
            if (similarData.length === 1) {
              options.datum = similarData[0];
              pipeline(options);
            } else {
              // self.debug("readUri corpus", self);
              self.corpus.newDatumAsync().then(function(datum) {
                options.datum = datum;
                pipeline(options);
              });
            }
          })
          .fail(function(reason) {
            deferred.reject(reason);
          });

      });
      return deferred.promise;

    }
  },

  convertTableIntoDataList: {
    value: function(options) {
      this.warn("convertTableIntoDataList is deprecated, use convertMatrixIntoDataList");
      return this.convertMatrixIntoDataList(options);
    }
  },

  convertMatrixIntoDataList: {
    value: function() {
      var self = this,
        deferred = Q.defer();

      if (this.importType === "participants" && (!this.corpus || !this.corpus.confidential || !this.corpus.confidential.secretkey)) {
        Q.nextTick(function() {
          deferred.reject({
            userFriendlyErrors: ["Cannot create encrypted participants at this time", "Corpus's encrypter isn't available right now, maybe the app is still loading?"]
          });
        });
        return deferred.promise;
      }

      if (!this.asFieldMatrix || this.asFieldMatrix.length === 0) {
        Q.nextTick(function() {
          deferred.reject({
            userFriendlyErrors: ["There was nothing to import. Are you sure you ran step 1?"]
          });
        });
        return deferred.promise;
      }

      Q.nextTick(function() {
        deferred.resolve(self.datalist);
      });

      try {
        if (!self.progress) {
          self.progress = {
            total: 0,
            completed: 0
          };
        }
        self.progress.total = self.asFieldMatrix.length;

        var filename = " typing/copy paste into text area";
        var descript = "This is the data list which results from the import of the text typed/pasted in the import text area.";
        try {
          filename = self.files.map(function(file) {
            return file.name;
          }).join(", ");
          descript = "This is the data list which results from the import of these file(s). " + self.fileDetails;
        } catch (e) {
          self.todo("turn the copy pasted text into a File to upload");
        }
        // self.render();

        self.session.consultants = [];
        /* put metadata in the session goals */
        if (self.metadataLines) {
          self.session.goal = self.metadataLines.join("\n") + "\n" + self.session.goal;
        }
        self.render("session");
        self.datalist.description = descript;

        if (!self.extractedHeaderObjects) {
          self.warn("There was no extracted header.");
          if (self.asFieldMatrix && self.asFieldMatrix.length > 0 && self.asFieldMatrix[0].concat) {
            self.warn("Using the first row as the extracted header.");
            self.extractedHeaderObjects = self.asFieldMatrix[0].concat([]);
            // self.extractedHeaderObjects = JSON.parse(JSON.stringify(self.asFieldMatrix[0]));
            // self.extractedHeaderObjects = self.asFieldMatrix.shift();

            self.extractedHeaderObjects = self.extractedHeaderObjects.map(function(object) {
              if (object === "" || object === undefined || object === null) {
                return;
              }
              if (object && !object.id && object.value !== undefined && object.value !== null) {
                object.id = object.value;
                object.value = "";
              }
              return object;
            });
          } else {
            return deferred.promise;
          }
        }

        var fieldLabelFromExtractedHeader,
          correspondingDatumField,
          columnIndex;

        try {
          var getColumnHeadings = function(obj) {
            if (obj && obj.id && obj.id !== "columnplaceholder") {
              return "";
            }
            return obj.id;
          };
          // this.debugMode = true;
          for (columnIndex = 0; columnIndex < self.extractedHeaderObjects.length; columnIndex++) {
            fieldLabelFromExtractedHeader = self.extractedHeaderObjects[columnIndex].id || self.extractedHeaderObjects[columnIndex];
            correspondingDatumField = self.normalizeImportFieldWithExistingCorpusFields(fieldLabelFromExtractedHeader);

            if (correspondingDatumField && correspondingDatumField.id) {
              var fields = self.extractedHeaderObjects.map(getColumnHeadings);
              if (fields.indexOf(correspondingDatumField.id) >= 0) {
                self.bug("You seem to have some column labels '" + correspondingDatumField.id + "' that are duplicated" +
                  " (the same label on two columns). This will result in a strange " +
                  "import where only the second of the two will be used in the import. " +
                  "Is this really what you want?.");
              }
            }
            self.debug(columnIndex + " correspondingDatumField", correspondingDatumField);

            self.debug("setting extractedHeaderObjects was once problematic", self.extractedHeaderObjects[columnIndex], correspondingDatumField);
            self.extractedHeaderObjects[columnIndex] = correspondingDatumField;
          }
          // this.debugMode = false;
        } catch (e) {
          this.warn(e);
          this.warn(e.stack);
          throw new Error(" problem in extractedHeaderObjects ");
        }

        if (self.debugMode) {
          // self.debug("  these are the extracted header cells ", self.extractedHeaderObjects.map(function(field) {
          //   return field.id;
          // }));
        }

        self.debug("JSON.stringify(self.extractedHeaderObjects, null, 2)");
        self.extractedHeaderObjects.map(function(headerField) {
          self.debug("headerField", headerField);
        });

        /*
         * Cycle through all the rows in table and create a datum with the matching fields.
         */
        var testForEmptyness,
          cellIndex,
          cell;

        self.asFieldMatrix.map(function(row) {
          self.progress.completed = self.progress.completed + 1;

          if (!row || row.length < 1) {
            self.debug("Skipping empty row");
            return;
          }
          self.debug("Working on row ", row);
          var docToSave;
          self.debug("Cloning fields ", self.extractedHeaderObjects.length);
          var fields = self.extractedHeaderObjects.map(function(headerField) {
            return headerField.toJSON();
          });
          self.debug("Cloned fields ", fields.length);
          self.debug("fields[0] equals extractedHeaderObjects[0]", fields[0] === self.extractedHeaderObjects[0]);
          if (self.importType === "participants") {
            docToSave = new Participant({
              fields: fields
            });
            self.debug("Creating a participant.", row);
          } else if (self.importType === "audioVideo") {
            docToSave = new AudioVideo();
            docToSave.description = self.rawText; //TODO look into the textgrid import
            self.debug("Creating a audioVideo.", docToSave.description);
          } else {
            docToSave = new Datum({
              fields: fields
            });
            self.debug("Creating a datum.", row);
          }
          docToSave.confidential = self.corpus.confidential;
          // docToSave.decryptedMode = true;

          // return;
          testForEmptyness = "";
          for (cellIndex = 0; cellIndex < row.length; cellIndex++) {
            cell = row[cellIndex];
            self.debug("working on cell ", cell);
            if (!cell || cellIndex > self.extractedHeaderObjects.length || self.extractedHeaderObjects[cellIndex].id === "columnplaceholder") {
              self.debug("Skipping column " + cellIndex + " :", cell);
              continue;
            }

            if (self.importType === "audioVideo") {
              self.debug("this is an audioVideo but we arent doing anything with the self.importFields");
            } else {
              for (var attrib in cell) {
                if (cell.hasOwnProperty(attrib)) {
                  docToSave.fields._collection[cellIndex][attrib] = cell[attrib];
                }
              }
              /* user can edit the matrix and it will show in the data list */
              row[cellIndex] = docToSave.fields._collection[cellIndex];
            }
            testForEmptyness += cell.value;
          }

          //if the table row has more than 2 non-white space characters, enter it as data
          if (testForEmptyness.replace(/[ \t\n]/g, "").length >= 2) {
            if (self.debugMode) {
              // self.debug("new doc", docToSave.fields.map(function(field) {
              //   return field.value
              // }));
            }
            // docToSave.tempId = docToSave.id = FieldDBObject.uuidGenerator();
            if (docToSave) {
              docToSave.tempId = FieldDBObject.uuidGenerator();
              docToSave.dbname = self.corpus.dbname;
              self.datalist.add(docToSave);
            }
          } else {
            self.debug("Didn't add row with only blank cells:" + testForEmptyness + ": ");
          }
        });
        self.debug("Finished building the data list");

        self.showImportThirdStep = true;
        self.render();
        self.progress.total = self.progress.completed = self.datalist.length;

        //   /*
        //    * after building an array of datumobjects, turn them into backbone objects
        //    */
        //   var eachFileDetails = function(fileDetails) {
        //     var details = JSON.parse(JSON.stringify(fileDetails));
        //     delete details.textgrid;
        //     audioFileDescriptionsKeyedByFilename[fileDetails.fileBaseName + ".mp3"] = details;
        //   };

        //   var forEachRow = function(index, value) {
        //     if (index === "" || index === undefined) {
        //       //do nothing
        //     }
        //     /* TODO removing old tag code for */
        //     //          else if (index === "datumTags") {
        //     //            var tags = value.split(" ");
        //     //            for(g in tags){
        //     //              var t = new DatumTag({
        //     //                "tag" : tags[g]
        //     //              });
        //     //              d.get("datumTags").add(t);
        //     //            }
        //     //          }
        //     /* turn the CheckedWithConsultant and ToBeCheckedWithConsultantinto columns into a status, with that string as the person */
        //     else if (index.toLowerCase().indexOf("checkedwithconsultant") > -1) {
        //       var consultants = [];
        //       if (value.indexOf(",") > -1) {
        //         consultants = value.split(",");
        //       } else if (value.indexOf(";") > -1) {
        //         consultants = value.split(";");
        //       } else {
        //         consultants = value.split(" ");
        //       }
        //       var validationStati = [];
        //       for (var g in consultants) {
        //         var consultantusername = consultants[g].toLowerCase();
        //         self.consultants.push(consultantusername);
        //         if (!consultantusername) {
        //           continue;
        //         }
        //         var validationType = "CheckedWith";
        //         var validationColor = "success";
        //         if (index.toLowerCase().indexOf("ToBeChecked") > -1) {
        //           validationType = "ToBeCheckedWith";
        //           validationColor = "warning";
        //         }

        //         var validationString = validationType + consultants[g].replace(/[- _.]/g, "");
        //         validationStati.push(validationString);
        //         var n = fields.where({
        //           label: "validationStatus"
        //         })[0];
        //         /* add to any exisitng validation states */
        //         var validationStatus = n.get("mask") || "";
        //         validationStatus = validationStatus + " ";
        //         validationStatus = validationStatus + validationStati.join(" ");
        //         var uniqueStati = _.unique(validationStatus.trim().split(" "));
        //         n.set("mask", uniqueStati.join(" "));

        //         //              ROUGH DRAFT of adding CONSULTANTS logic TODO do self in the angular app, dont bother with the backbone app
        //         //              /* get the initials from the data */
        //         //              var consultantCode = consultants[g].replace(/[a-z -]/g,"");
        //         //              if(consultantusername.length === 2){
        //         //                consultantCode = consultantusername;
        //         //              }
        //         //              if(consultantCode.length < 2){
        //         //                consultantCode = consultantCode+"C";
        //         //              }
        //         //              var c = new Consultant("username", consultantCode);
        //         //              /* use the value in the cell for the checked with state, but don't keep the spaces */
        //         //              var validationType = "CheckedWith";
        //         //              if(index.toLowerCase().indexOf("ToBeChecked") > -1){
        //         //                validationType = "ToBeCheckedWith";
        //         //              }
        //         //              /*
        //         //               * This function uses the consultant code to create a new validation status
        //         //               */
        //         //              var onceWeGetTheConsultant = function(){
        //         //                var validationString = validationType+consultants[g].replace(/ /g,"");
        //         //                validationStati.push(validationString);
        //         //                var n = fields.where({label: "validationStatus"})[0];
        //         //                if(n !== undefined){
        //         //                  /* add to any exisitng validation states */
        //         //                  var validationStatus = n.get("mask") || "";
        //         //                  validationStatus = validationStatus + " ";
        //         //                  validationStatus = validationStatus + validationStati.join(" ");
        //         //                  var uniqueStati = _.unique(validationStatus.trim().split(" "));
        //         //                  n.set("mask", uniqueStati.join(" "));
        //         //                }
        //         //              };
        //         //              /*
        //         //               * This function creates a consultant code and then calls
        //         //               * onceWeGetTheConsultant to create a new validation status
        //         //               */
        //         //              var callIfItsANewConsultant = function(){
        //         //                var dialect =  "";
        //         //                var language =  "";
        //         //                try{
        //         //                  dialect = fields.where({label: "dialect"})[0] || "";
        //         //                  language = fields.where({label: "language"})[0] || "";
        //         //                }catch(e){
        //         //                  self.debug("Couldn't get self consultant's dialect or language");
        //         //                }
        //         //                c = new Consultant({filledWithDefaults: true});
        //         //                c.set("username", Date.now());
        //         //                if(dialect)
        //         //                  c.set("dialect", dialect);
        //         //                if(dialect)
        //         //                  c.set("language", language);
        //         //
        //         //                onceWeGetTheConsultant();
        //         //              };
        //         //              c.fetch({
        //         //                success : function(model, response, options) {
        //         //                  onceWeGetTheConsultant();
        //         //                },
        //         //                error : function(model, xhr, options) {
        //         //                  callIfItsANewConsultant();
        //         //                }
        //         //              });

        //       }
        //     } else if (index === "validationStatus") {
        //       var eachValidationStatus = fields.where({
        //         label: index
        //       })[0];
        //       if (eachValidationStatus !== undefined) {
        //         /* add to any exisitng validation states */
        //         var selfValidationStatus = eachValidationStatus.get("mask") || "";
        //         selfValidationStatus = selfValidationStatus + " ";
        //         selfValidationStatus = selfValidationStatus + value;
        //         var selfUniqueStati = _.unique(selfValidationStatus.trim().split(" "));
        //         eachValidationStatus.set("mask", selfUniqueStati.join(" "));
        //       }
        //     } else if (index === "audioFileName") {
        //       if (!audioVideo) {
        //         audioVideo = new AudioVideo();
        //       }
        //       audioVideo.set("filename", value);
        //       audioVideo.set("orginalFilename", audioFileDescriptionsKeyedByFilename[value] ? audioFileDescriptionsKeyedByFilename[value].name : "");
        //       audioVideo.set("URL", self.audioUrl + "/" + window.app.get("corpus").dbname + "/" + value);
        //       audioVideo.set("description", audioFileDescriptionsKeyedByFilename[value] ? audioFileDescriptionsKeyedByFilename[value].description : "");
        //       audioVideo.set("details", audioFileDescriptionsKeyedByFilename[value]);
        //     } else if (index === "startTime") {
        //       if (!audioVideo) {
        //         audioVideo = new AudioVideo();
        //       }
        //       audioVideo.set("startTime", value);
        //     } else if (index === "endTime") {
        //       if (!audioVideo) {
        //         audioVideo = new AudioVideo();
        //       }
        //       audioVideo.set("endTime", value);
        //     } else {
        //       var knownlowercasefields = "utterance,gloss,morphemes,translation".split();
        //       if (knownlowercasefields.indexOf(index.toLowerCase()) > -1) {
        //         index = index.toLowerCase();
        //       }
        //       var igtField = fields.where({
        //         label: index
        //       })[0];
        //       if (igtField !== undefined) {
        //         igtField.set("mask", value);
        //       }
        //     }
        //   };
        //   for (var a in array) {
        //     var d = new Datum({
        //       filledWithDefaults: true,
        //       dbname: self.dbname
        //     });
        //     //copy the corpus"s datum fields and empty them.
        //     var datumfields = self.importFields.clone();
        //     for (var x in datumfields) {
        //       datumfields[x].mask = "";
        //       datumfields[x].value = "";
        //     }
        //     var fields = new DatumFields(datumfields);
        //     var audioVideo = null;
        //     var audioFileDescriptionsKeyedByFilename = {};
        //     if (self.files && self.files.map) {
        //       self.files.map(eachFileDetails);
        //     }

        //     $.each(array[a], forEachRow);
        //     d.set("fields", fields);
        //     if (audioVideo) {
        //       d.audioVideo.add(audioVideo);
        //       if (self.debugMode) {
        //         self.debug(JSON.stringify(audioVideo.toJSON()) + JSON.stringify(fields.toJSON()));
        //       }
        //     }
        //     // var states = window.app.get("corpus").get("datumStates").clone();
        //     // d.set("datumStates", states);
        //     d.set("session", self.get("session"));
        //     //these are temp datums, dont save them until the user saves the data list
        //     self.importPaginatedDataListDatumsView.collection.add(d);
        //     //        self.dataListView.model.get("datumIds").push(d.id); the datum has no id, cannot put in datumIds
        //     d.lookForSimilarDatum();
        //     self.get("files").push(d);
        //   }
        //   self.set("consultants", _.unique(self.consultants).join(","));
        //   self.importPaginatedDataListDatumsView.renderUpdatedPaginationControl();

        //   $(".approve-save").removeAttr("disabled");
        //   $(".approve-save").removeClass("disabled");

      } catch (e) {
        self.warn("There was a problem while converting the matrix into a data list.", e);
        self.warn(e.stack);
        deferred.reject("There was a problem while converting the matrix into a data list.");
      }

      return deferred.promise;
    }
  },
  // savedcount : 0,
  // savedindex : [],
  // savefailedcount : 0,
  // savefailedindex : [],
  // nextsavedatum : 0,

  preprocess: {
    value: function(options) {
      var deferred = Q.defer(),
        self = this;

      this.verbose("In the preprocess", this);
      Q.nextTick(function() {
        self.debug("Preprocessing  ");
        try {

          var failFunction = function(reason) {
            if (options && typeof options.next === "function" /* enable use as middleware */ ) {
              options.next();
            }
            deferred.reject(reason);
          };

          var successFunction = function(optionsWithResults) {
            self.debug("Preprocesing success");
            if (optionsWithResults && typeof optionsWithResults.next === "function" /* enable use as middleware */ ) {
              optionsWithResults.next();
            }
            deferred.resolve(optionsWithResults);
          };

          options.datum.fields.orthography.value = options.rawText;
          options.datum.fields.utterance.value = options.rawText;
          options.datum.id = options.uri;

          self.debug("running write for preprocessed");
          if (options.preprocessOptions && options.preprocessOptions.writePreprocessedFileFunction) {
            options.preprocessedUrl = options.uri.substring(0, options.uri.lastIndexOf(".")) + "_preprocessed.json";
            var preprocessResult = JSON.stringify(options.datum.toJSON(), null, 2);
            deferred.resolve(options);

            options.preprocessOptions.writePreprocessedFileFunction(options.preprocessedUrl,
              preprocessResult,
              function(err, data) {
                self.debug("Wrote " + options.preprocessedUrl, data);
                if (err) {
                  failFunction(err);
                } else {
                  successFunction(options);
                }
              });
          } else {
            successFunction(options);
          }

        } catch (e) {
          deferred.reject(e);
        }
      });
      return deferred.promise;
    }
  },

  importFields: {
    get: function() {
      if (!this._importFields || this._importFields.length === 0) {
        if (this.importType === "participants") {
          if (this.corpus && this.corpus.participantFields) {
            this._importFields = new DatumFields(this.corpus.participantFields.clone());
          } else {
            this._importFields = new DatumFields(this.corpus.defaults_psycholinguistics.participantFields);
          }
        } else if (this.corpus && this.corpus.datumFields) {
          this._importFields = new DatumFields(this.corpus.datumFields.clone());
        }
      }
      if (!this._importFields) {
        this._importFields = new DatumFields();
      }
      return this._importFields;
    },
    set: function(fields) {
      this._importFields = fields;
    }
  },

  /**
   *  This function looks for the field's details from the import fields, if they exist it returns those values.
   *
   * If the field isnt in the importFields, it looks for fields which this field should map to (eg, if the field is codepermanent it can be mapped to anonymouscode)
   * @param  {String/Object} field A datumField to look for, or the label/id of a datum field to look for.
   * @return {DatumField}       A datum field with details filled in from the corresponding field in the corpus, or from a template.
   */
  normalizeImportFieldWithExistingCorpusFields: {
    value: function(field) {
      var correspondingDatumField;
      if (this.corpus && this.corpus.normalizeFieldWithExistingCorpusFields) {
        correspondingDatumField = this.corpus.normalizeFieldWithExistingCorpusFields(field, this.importFields);
      }
      this.debug("correspondingDatumField ", correspondingDatumField);

      if (correspondingDatumField) {
        return correspondingDatumField;
      } else {
        return new DatumField({
          id: "columnplaceholder",
          value: ""
        });
      }
    }
  },

  /**
   * Executes the final import if the options indicate that it should be executed, by default it only produces a dry run.
   *
   * @type {Object}
   */
  import: {
    value: function(options) {
      var deferred = Q.defer(),
        self = this;
      this.todo("TODO test the import");

      if (options && typeof options.next === "function" /* enable use as middleware */ ) {
        options.next();
      }

      var savePromises = [];
      var docsToSave = [];
      if (this.datalist.docs && this.datalist.docs._collection) {
        docsToSave = this.datalist.docs._collection;
      } else {
        this.warn("There were no docs prepared for import, this is odd.");
      }
      docsToSave.map(function(builtDoc) {
        if (self.importType === "audioVideo") {
          self.debug("not doing any save for an audio video import");
        } else {
          self.bug("test the save on the new docs from import");
          if (self.importType === "participant") {
            builtDoc.id = builtDoc.anonymousCode || Date.now();
          }
          builtDoc.session = self.session;
          self.debug(" saving", builtDoc.id);
          self.progress.total++;
          // self.datalist.docs.add(builtDoc);

          var promise = builtDoc.save();

          promise.then(function(success) {
            self.debug(success);
            self.progress.completed++;
          }, function(error) {
            self.debug(error);
            self.progress.completed++;
          }).fail(function(error) {
            console.error(error.stack, self);
            deferred.reject(error);
          });

          savePromises.push(promise);
        }
      });

      Q.allSettled(savePromises).then(function(results) {
        self.debug(results);
        deferred.resolve(results);
        self.progress.completed++;
        self.render();
        return options;
      }, function(results) {
        self.debug(results);
        deferred.resolve(results);
        self.progress.completed++;
        self.render();
        return options;
      }).fail(function(error) {
        console.error(error.stack, self);
        deferred.reject(error);
      });

      return deferred.promise;
    }
  },

  fileDetails: {
    get: function() {
      return this._fileDetails || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      this._fileDetails = value;
    }
  },

  /**
   * Holds meta data about the imported data list and references to the datum ids
   *
   * @type {Object}
   */
  datalist: {
    get: function() {
      if (!this.session || !this.session.datalist) {
        return;
        // this.debug("creating a default data list");
        //   this.session.datalist = new DataList();
        //   console.log("this.session.datalist", this.session.datalist);
      }
      return this.session.datalist;
    },
    set: function(value) {
      if (this._session && value === this._session.datalist) {
        return this;
      }
      if (!value || !value || !value.docs || !value.docs.primaryKey || value.docs.primaryKey !== "tempId") {
        this.warn("  not setting the datalist, its missing some stuff ", value);
        return this;
      }
      this.debug("  setting the _session.datalist", value.docs.primaryKey);
      delete this._session._datalist;
      this._session.initializeDatalist(value);
      return this;
    }
  },

  session: {
    get: function() {
      if (!this._session) {
        this.debug("There's no session!");
        return;
      }
      this.debug("getting the _session", this._session);
      return this._session;
    },
    set: function(value) {
      if (value === this._session) {
        return;
      }
      if (!value || !value.datalist || !value.datalist.docs) {
        this.warn("  not setting the session on import, its missing some stuff ", value);
        return;
      }
      value.datalist.docs.primaryKey = "tempId";
      var datalist = value.datalist;

      this.debug("  setting the _session", value);
      if (!(value instanceof Session)) {
        value = new Session(value);
      }
      this.debug("  setting the _session's datalist", datalist);

      this._session = value;
      // this._session.initializeDatalist(datalist);
      this.datalist = datalist;

      return;
    }
  },

  /**
   * Holds the files themselves while the import is in process
   *
   * @type {Object}
   */
  files: {
    get: function() {
      this.debug("Getting Datum collection");
      if (!this._files) {
        this._files = new Collection({
          id: "importfiles",
          inverted: false,
          primaryKey: "fileName"
        });
      }
      this.debug("Returning a collection");
      return this._files;
    },
    set: function(value) {
      if (value === this._files) {
        return;
      }
      this._files = value;
    }
  },

  /**
   * Saves the import's state to file to be resumed or reviewed later
   *
   * @type {Object}
   */
  pause: {
    value: function(options) {

      if (options && typeof options.next === "function" /* enable use as middleware */ ) {
        options.next();
      }
      return this;
    }
  },

  /**
   * Resumes a previous import from a json object, or a uri containing json
   *
   * @type {Object}
   */
  resume: {
    value: function(options) {

      if (options && typeof options.next === "function" /* enable use as middleware */ ) {
        options.next();
      }
      return this;
    }
  },

  id: {
    get: function() {
      if (this.datalist) {
        return this.datalist.id;
      }
    },
    set: function(value) {
      if (this.datalist) {
        this.datalist.id = value;
      }
    }
  },

  url: {
    value: "/datalists"
  },

  corpus: {
    get: function() {
      if (!this._corpus) {
        // throw new Error("Import\"s corpus is undefined");
        // this.warn("Import\"s corpus is undefined");
        return;
      }
      return this._corpus;
    },
    set: function(value) {
      if (value === this._corpus) {
        return;
      }
      this._corpus = value;
    }
  },

  asFieldMatrix: {
    get: function() {
      return this._asFieldMatrix;
    },
    set: function(value) {
      this._asFieldMatrix = value;
    }
  },

  asCSV: {
    get: function() {
      return this.asFieldMatrix;
    },
    set: function(value) {
      var tryAsNumber,
        tryAsDate;

      value = value.map(function(row) {
        return row.map(function(cell) {
          if (cell === undefined || cell === null) {
            cell = {
              value: ""
            };
          }
          if (typeof cell !== "object") {
            cell = {
              value: cell
            };
          }
          if (cell && cell.value && typeof cell.value.trim === "function") {
            cell.value = cell.value.trim();
          }
          if (cell.value !== "") {
            tryAsNumber = Number(cell.value);
            if (!isNaN(tryAsNumber)) {
              cell.value = tryAsNumber;
              cell.type = "number";
            } else {
              tryAsDate = new Date(cell.value);
              if (!isNaN(tryAsDate.getDate() && tryAsDate.getYear() > 70)) {
                // cell.value = tryAsDate;
                cell.type = "date";
                cell.json = {
                  "date": tryAsDate,
                  "timestamp": {
                    // "start": tryAsDate,
                    "end": tryAsDate.getTime(),
                    // "accuracy": null
                  }
                };
              }
            }
          }
          return cell;
        });
      });

      this.asFieldMatrix = value;
    }
  },

  /**
   * This function tries to guess if you have \n or \r as line endings
   * and then tries to determine if you have "surounding your text".
   *
   * CSV is a common export format for Filemaker, Microsoft Excel and
   * OpenOffice Spreadsheets, and could be a good format to export
   * from these sources and import into FieldDB.
   *
   * @param text to be imported
   */
  importCSV: {
    value: function(text, callback) {
      if (!text) {
        return;
      }
      var rows = text.split("\n");
      if (rows.length < 3) {
        var macrows = text.split("\r");
        if (macrows.length > rows.length) {
          rows = macrows;
          this.status = this.status + " Detected a \r line ending.";
        }
      }
      var firstrow = rows[0];
      var hasQuotes = false;
      //If it looks like it already has quotes:
      if (rows[0].split("", "").length > 2 && rows[5].split("", "").length > 2) {
        hasQuotes = true;
        this.status = this.status + " Detected text was already surrounded in quotes.";
      }
      for (var l in rows) {
        if (hasQuotes) {
          rows[l] = rows[l].trim().replace(/^"/, "").replace(/"$/, "").split("", "");
          //          var withoutQuotes = [];
          //          _.each(rows[l],function(d){
          //            withoutQuotes.push(d.replace(/"/g,""));
          //          });
          //          rows[l] = withoutQuotes;
        } else {
          rows[l] = this.parseLineCSV(rows[l]);
          /* This was a fix for alan's data but it breaks other data. */
          //          var rowWithoutQuotes = rows[l].replace(/"/g,"");
          //          rows[l] = this.parseLineCSV(rowWithoutQuotes);
        }
      }
      /* get the first line and set it to be the header by default */
      var header = [];
      if (rows.length > 1) {
        firstrow = firstrow;
        if (hasQuotes) {
          header = firstrow.trim().replace(/^"/, "").replace(/"$/, "").split("", "");
        } else {
          header = this.parseLineCSV(firstrow);
        }
      } else if (rows.length === 1) {
        header = rows[0].map(function() {
          return "";
        });
      }
      this.extractedHeaderObjects = header;

      this.asCSV = rows;
      if (typeof callback === "function") {
        callback();
      }
    }
  },

  /**
   * http://purbayubudi.wordpress.com/2008/11/09/csv-parser-using-javascript/
   * -- CSV PARSER --
   * author  : Purbayu, 30Sep2008
   * email   : purbayubudi@gmail.com
   *
   * description :
   *  This jscript code describes how to load csv file and parse it into fields.
   *  Additionally, a function to display html table as result is added.
   *
   * disclamer:
   *  To use this code freely, you must put author's name in it.
   */
  parseLineCSV: {
    value: function(lineCSV) {
      // parse csv line by line into array
      var CSV = [];
      var csvCharacter = ",";
      this.debug(lineCSV, typeof lineCSV);
      var matches = lineCSV.split(csvCharacter);
      if (matches.length < 2) {
        csvCharacter = ";";
      }
      // Insert space before character ",". This is to anticipate
      // "split" in IE
      // try this:
      //
      // var a=",,,a,,b,,c,,,,d";
      // a=a.split(/\,/g);
      // document.write(a.length);
      //
      // You will see unexpected result!
      //
      lineCSV = lineCSV.replace(new RegExp(csvCharacter, "g"), " " + csvCharacter);

      lineCSV = lineCSV.split(new RegExp(csvCharacter, "g"));

      // This is continuing of "split" issue in IE
      // remove all trailing space in each field
      var i,
        j;
      for (i = 0; i < lineCSV.length; i++) {
        lineCSV[i] = lineCSV[i].replace(/\s*$/g, "");
      }

      lineCSV[lineCSV.length - 1] = lineCSV[lineCSV.length - 1]
        .replace(/^\s*|\s*$/g, "");
      var fstart = -1;

      for (i = 0; i < lineCSV.length; i++) {
        if (lineCSV[i].match(/"$/)) {
          if (fstart >= 0) {
            for (j = fstart + 1; j <= i; j++) {
              lineCSV[fstart] = lineCSV[fstart] + csvCharacter + lineCSV[j];
              lineCSV[j] = "-DELETED-";
            }
            fstart = -1;
          }
        }
        fstart = (lineCSV[i].match(/^"/)) ? i : fstart;
      }

      j = 0;

      for (i = 0; i < lineCSV.length; i++) {
        if (lineCSV[i] !== "-DELETED-") {
          CSV[j] = lineCSV[i];
          CSV[j] = CSV[j].replace(/^\s*|\s*$/g, ""); // remove leading & trailing
          // space
          CSV[j] = CSV[j].replace(/^"|"$/g, ""); // remove " on the beginning
          // and end
          CSV[j] = CSV[j].replace(/""/g, "\""); // replace "" with "
          j++;
        }
      }
      return CSV;
    }
  },
  importXML: {
    value: function() {
      throw new Error("The app thinks this might be a XML file, but we haven't implemented this kind of import yet. You can vote for it in our bug tracker.");
    }
  },
  importElanXML: {
    value: function(text, callback) {
      if (!text) {
        return;
      }
      this.todo("import xml parsers to turn xml import back on");
      if (true) {
        return;
      }
      //alert("The app thinks this might be a XML file, but we haven't implemented this kind of import yet. You can vote for it in our bug tracker.");
      var xmlParser = new X2JS();
      window.text = text;
      var jsonObj = xmlParser.xml_str2json(text);

      this.debug(jsonObj);

      //add the header to the session
      //    HEADER can be put in the session and in the datalist
      var annotationDetails = JSON.stringify(jsonObj.ANNOTATION_DOCUMENT.HEADER).replace(/,/g, "\n").replace(/[\[\]{}]/g, "").replace(/:/g, " : ").replace(/"/g, "").replace(/\n/g, "").replace(/file : /g, "file:").replace(/ : \//g, ":/").trim();
      //TODO turn these into session fields
      this.status = this.status + "\n" + annotationDetails;

      var header = [];
      var tierinfo = [];
      //    TIER has tiers of each, create datum  it says who the informant is and who the data entry person is. can turn the objects in the tier into a datum
      //for tier, add rows containing
      //    _ANNOTATOR
      tierinfo.push("_ANNOTATOR");
      //    _DEFAULT_LOCALE
      tierinfo.push("_DEFAULT_LOCALE");
      //    _LINGUISTIC_TYPE_REF
      tierinfo.push("_LINGUISTIC_TYPE_REF");
      //    _PARTICIPANT
      tierinfo.push("_PARTICIPANT");
      //    _TIER_ID
      tierinfo.push("_TIER_ID");
      //    __cnt
      tierinfo.push("__cnt");

      var annotationinfo = [];
      //    ANNOTATION.ALIGNABLE_ANNOTATION.ANNOTATION_VALUE.__cnt
      //      annotationinfo.push({"FieldDBDatumFieldName" : "ANNOTATION.ALIGNABLE_ANNOTATION.ANNOTATION_VALUE", "elanALIGNABLE_ANNOTATION": "ANNOTATION_VALUE"});
      //    ANNOTATION.ALIGNABLE_ANNOTATION._ANNOTATION_ID
      annotationinfo.push({
        "FieldDBDatumFieldName": "ANNOTATION.ALIGNABLE_ANNOTATION._ANNOTATION_ID",
        "elanALIGNABLE_ANNOTATION": "_ANNOTATION_ID"
      });
      //    ANNOTATION.ALIGNABLE_ANNOTATION._TIME_SLOT_REF1
      annotationinfo.push({
        "FieldDBDatumFieldName": "ANNOTATION.ALIGNABLE_ANNOTATION._TIME_SLOT_REF1",
        "elanALIGNABLE_ANNOTATION": "_TIME_SLOT_REF1"
      });
      //    ANNOTATION.ALIGNABLE_ANNOTATION._TIME_SLOT_REF2
      annotationinfo.push({
        "FieldDBDatumFieldName": "ANNOTATION.ALIGNABLE_ANNOTATION._TIME_SLOT_REF2",
        "elanALIGNABLE_ANNOTATION": "_TIME_SLOT_REF2"
      });
      //
      var refannotationinfo = [];
      //    ANNOTATION.REF_ANNOTATION.ANNOTATION_VALUE
      refannotationinfo.push({
        "FieldDBDatumFieldName": "ANNOTATION.REF_ANNOTATION.ANNOTATION_VALUE",
        "elanREF_ANNOTATION": "ANNOTATION_VALUE"
      });
      //    ANNOTATION.REF_ANNOTATION._ANNOTATION_ID
      refannotationinfo.push({
        "FieldDBDatumFieldName": "ANNOTATION.REF_ANNOTATION._ANNOTATION_ID",
        "elanREF_ANNOTATION": "_ANNOTATION_ID"
      });
      //    ANNOTATION.REF_ANNOTATION._ANNOTATION_REF
      refannotationinfo.push({
        "FieldDBDatumFieldName": "ANNOTATION.REF_ANNOTATION._ANNOTATION_REF",
        "elanREF_ANNOTATION": "_ANNOTATION_REF"
      });

      header.push("_ANNOTATOR");
      header.push("_DEFAULT_LOCALE");
      header.push("_LINGUISTIC_TYPE_REF");
      header.push("_PARTICIPANT");
      header.push("_TIER_ID");
      header.push("__cnt");

      header.push("ANNOTATION.ALIGNABLE_ANNOTATION.ANNOTATION_VALUE");

      header.push("ANNOTATION.ALIGNABLE_ANNOTATION._ANNOTATION_ID");
      header.push("ANNOTATION.ALIGNABLE_ANNOTATION._TIME_SLOT_REF1");
      header.push("ANNOTATION.ALIGNABLE_ANNOTATION._TIME_SLOT_REF2");

      header.push("ANNOTATION.REF_ANNOTATION.ANNOTATION_VALUE");
      header.push("ANNOTATION.REF_ANNOTATION._ANNOTATION_ID");
      header.push("ANNOTATION.REF_ANNOTATION._ANNOTATION_REF");

      //similar to toolbox
      var matrix = [];
      var TIER = jsonObj.ANNOTATION_DOCUMENT.TIER;

      var l,
        annotation,
        cell;
      //there are normally 8ish tiers, with different participants
      for (l in TIER) {
        //in those tiers are various amounts of annotations per participant
        for (annotation in TIER[l].ANNOTATION) {
          matrix[annotation] = [];

          for (cell in tierinfo) {
            matrix[annotation][tierinfo[cell]] = jsonObj.ANNOTATION_DOCUMENT.TIER[l][tierinfo[cell]];
          }

          try {
            matrix[annotation]["ANNOTATION.ALIGNABLE_ANNOTATION.ANNOTATION_VALUE.__cnt"] = TIER[l].ANNOTATION[annotation].ALIGNABLE_ANNOTATION.ANNOTATION_VALUE.__cnt;
            for (cell in annotationinfo) {
              matrix[annotation][annotationinfo[cell].FieldDBDatumFieldName] = TIER[l].ANNOTATION[annotation].ALIGNABLE_ANNOTATION[annotationinfo[cell].elanALIGNABLE_ANNOTATION];
            }
          } catch (e) {
            this.debug("TIER " + l + " doesnt seem to have a ALIGNABLE_ANNOTATION object. We don't really knwo waht the elan file format is, or why some lines ahve ALIGNABLE_ANNOTATION and some dont. So we are just skipping them for this datum.");
          }

          try {
            for (cell in refannotationinfo) {
              matrix[annotation][refannotationinfo[cell].FieldDBDatumFieldName] = TIER[l].ANNOTATION[annotation].REF_ANNOTATION[refannotationinfo[cell].elanREF_ANNOTATION];
            }
          } catch (e) {
            this.debug("TIER " + l + " doesnt seem to have a REF_ANNOTATION object. We don't really knwo waht the elan file format is, or why some lines ahve REF_ANNOTATION and some dont. So we are just skipping them for this datum.");
          }

        }
      }
      var rows = [];
      for (var d in matrix) {
        var cells = [];
        //loop through all the column headings, find the data for that header and put it into a row of cells
        for (var h in header) {
          cell = matrix[d][header[h]];
          if (cell) {
            cells.push(cell);
          } else {
            //fill the cell with a blank if that datum didn't have a header
            cells.push("");
          }
        }
        rows.push(cells);
      }
      if (rows === []) {
        rows.push("");
      }
      this.extractedHeaderObjects = header;
      this.asCSV = rows;
      if (typeof callback === "function") {
        callback();
      }
    }
  },
  /**
   * This function accepts text which uses \t tabs between columns. If
   * you have your data in ELAN or in Microsoft Excel or OpenOffice
   * spreadsheets, this will most likely be a good format to export
   * your data, and import into FieldDB. This function is triggered if
   * your file has more than 100 tabs in it, FieldDB guesses that it
   * should try this function.
   *
   * @param text to be imported
   */
  importTabbed: {
    value: function(text, callback) {
      if (!text) {
        return;
      }
      var rows = text.split("\n"),
        l;
      if (rows.length < 3) {
        rows = text.split("\r");
        this.status = this.status + " Detected a \n line ending.";
      }
      for (l in rows) {
        rows[l] = rows[l].split("\t");
      }

      this.asCSV = rows;
      if (typeof callback === "function") {
        callback();
      }
    }
  },

  metadataLines: [],

  /**
   * This function takes in a text block, splits it on lines and then
   * takes the first word with a \firstword as the data type/column
   * heading and then walks through the file looking for lines that
   * start with \ge and creates a new datum each time it finds \ge
   * This works for verb lexicons but would be \ref if an interlinear
   * gloss. TODO figure out how Toolbox knows when one data entry
   * stops and another starts. It doesn't appear to be double spaces...
   *
   * @param text
   * @param callback
   */
  importToolbox: {
    value: function(text, callback) {
      if (!text) {
        return;
      }
      var lines = text.split("\n");
      var macLineEndings = false;
      if (lines.length < 3) {
        lines = text.split("\r");
        macLineEndings = true;
        this.status = this.status + " Detected a \r line ending.";
      }

      var matrix = [];
      var currentDatum = -1;
      var header = [];
      var columnhead = "";

      var firstToolboxField = "";

      /* Looks for the first line of the toolbox data */
      while (!firstToolboxField && lines.length > 0) {
        var potentialToolBoxFieldMatches = lines[0].match(/^\\[a-zA-Z]+\b/);
        if (potentialToolBoxFieldMatches && potentialToolBoxFieldMatches.length > 0) {
          firstToolboxField = potentialToolBoxFieldMatches[0];
        } else {
          /* remove the line, and put it into the metadata lines */
          this.metadataLines.push(lines.shift());
        }
      }

      for (var l in lines) {
        //Its a new row
        if (lines[l].indexOf(firstToolboxField) === 0) {
          currentDatum += 1;
          matrix[currentDatum] = {};
          matrix[currentDatum][firstToolboxField.replace(/\\/g, "")] = lines[l].replace(firstToolboxField, "").trim();
          header.push(firstToolboxField.replace(/\\/g, ""));
        } else {
          if (currentDatum >= 0) {
            //If the line starts with \ its a column
            if (lines[l].match(/^\\/)) {
              var pieces = lines[l].split(/ +/);
              columnhead = pieces[0].replace("\\", "");
              matrix[currentDatum][columnhead] = lines[l].replace(pieces[0], "");
              header.push(columnhead);
            } else {
              //add it to the current column head in the current datum, its just another line.
              if (lines[1].trim() !== "") {
                matrix[currentDatum][columnhead] += lines[l];
              }
            }
          }
        }
      }
      //only keep the unique headers
      header = getUnique(header);
      var rows = [];
      for (var d in matrix) {
        var cells = [];
        //loop through all the column headings, find the data for that header and put it into a row of cells
        for (var h in header) {
          var cell = matrix[d][header[h]];
          if (cell) {
            cells.push(cell);
          } else {
            //fill the cell with a blank if that datum didn't have a header
            cells.push("");
          }
        }
        rows.push(cells);
      }
      if (rows === []) {
        rows.push("");
      }
      this.extractedHeaderObjects = header;
      this.asCSV = rows;
      if (typeof callback === "function") {
        callback();
      }
    }
  },

  importMorphChallengeSegmentation: {
    value: function(text, self, callback) {
      var rows = text.trim().split("\n");
      if (rows.length < 3) {
        rows = text.split("\r");
        self.status = self.status + " Detected a \n line ending.";
      }
      var row,
        original,
        twoPieces,
        word,
        alternates,
        morphemes,
        gloss,
        source,
        l,
        filename = self.files[0].name;
      var header = ["orthography", "utterance", "morphemes", "gloss", "alternatesAnalyses", "alternates", "original", "source"];
      var convertFlatIGTtoObject = function(alternateParse) {
        morphemes = alternateParse.trim().split(" ");
        // self.debug("working on alternateParse", morphemes);
        return morphemes.map(function(morpheme) {
          return {
            morphemes: morpheme.split(":")[0],
            gloss: morpheme.split(":")[1]
          };
        });
      };
      var extractMorphemesFromIGT = function(alternate) {
        return alternate.morphemes.replace("+", "");
      };
      var extractGlossFromIGT = function(alternate) {
        return alternate.gloss.replace("+", "");
      };
      for (l in rows) {
        row = original = rows[l] + "";
        source = filename + ":line:" + l;
        twoPieces = row.split(/\t/);
        word = twoPieces[0];
        if (!twoPieces || !twoPieces[1]) {
          continue;
        }
        alternates = twoPieces[1].split(",");
        alternates = alternates.map(convertFlatIGTtoObject);
        morphemes = alternates[0].map(extractMorphemesFromIGT).join("-");
        gloss = alternates[0].map(extractGlossFromIGT).join("-");
        alternates.shift();
        // get alternative morpheme analyses so they show in the app.
        var alternateMorphemes = [];
        for (var alternateIndex = 0; alternateIndex < alternates; alternateIndex++) {
          alternateMorphemes.push(alternates[alternateIndex].map(extractMorphemesFromIGT).join("-"));
        }
        rows[l] = [word, word, morphemes, gloss, twoPieces[1], alternateMorphemes.join(","), original + "", source];
      }
      self.extractedHeaderObjects = header;
      self.asCSV = rows;

      if (typeof callback === "function") {
        callback();
      }
    }
  },

  uploadFiles: {
    value: function(files) {
      var deferred = Q.defer(),
        self = this;

      self.error = "";
      self.status = "";

      Q.nextTick(function() {
        var uploadUrl = new AudioVideo().BASE_SPEECH_URL + "/upload/extract/utterances";
        // var data = {
        //   files: files,
        //   token: self.token,
        //   dbname: self.dbname,
        //   username: self.username,
        //   returnTextGrid: self.returnTextGrid
        // };
        //
        var data = new FormData();
        // for (var ?fileIndex = 0; fileIndex > files.length; fileIndex++) {
        // data.append("file" + fileIndex, files[fileIndex]);
        // }
        // data.files = files;
        self.todo("use the files passed instead of jquery ", files);
        // http://stackoverflow.com/questions/24626177/how-to-create-an-image-file-from-a-dataurl
        if (files.indexOf("data") === 0) {
          // data.append("data", files); //test new split

          // var base64 = files.split("base64,")[1];
          var blob = dataURItoBlob(files);
          // blob.name = "file_" + Date.now() + "." + blob.type.split("/")[1];
          // blob.lastModfied = Date.now();
          // blob.lastModifiedDate = new Date(blob.lastModfied);
          // fd.append("canvasImage", blob);

          //http://www.nczonline.net/blog/2012/06/05/working-with-files-in-javascript-part-5-blobs/
          // var reconstructedFile =  new File("file_" + Date.now() + ".mp3", blob, "audio/mpeg");

          //http://stackoverflow.com/questions/8390855/how-to-instantiate-a-file-object-in-javascript
          files = [blob];

        }
        self.rawText = "";
        $.each(files, function(i, file) {
          data.append(i, file);
          if (file.name) {
            self.rawText = self.rawText + " " + file.name;
          }
        });
        if (self.rawText && self.rawText.trim()) {
          // window.alert("rendering import");
          self.rawText = self.rawText.trim();
          self.render();
        }
        if (!self.dbname && self.parent && self.parent.dbname) {
          self.dbname = self.parent.dbname;
        }

        // data.append("files", files);
        data.append("token", self.uploadtoken || "uploadingfromspreadsheet");
        data.append("pouchname", self.dbname);
        data.append("dbname", self.dbname);
        data.append("username", self.application.authentication.user.username);
        data.append("returnTextGrid", self.returnTextGrid || true);

        self.audioVideo = null;
        // this.model.audioVideo.reset();
        $.ajax({
          url: uploadUrl,
          type: "post",
          // dataType: 'json',
          cache: false,
          // withCredentials: false,
          contentType: false,
          processData: false,
          data: data,
          success: function(results) {
            if (results && results.status === 200) {
              self.uploadDetails = results;
              self.files = results.files;
              self.status = "File(s) uploaded and utterances were extracted.";
              var messages = [];
              self.rawText = "";
              /* Check for any textgrids which failed */
              for (var fileIndex = 0; fileIndex < results.files.length; fileIndex++) {
                if (results.files[fileIndex].textGridStatus >= 400) {
                  self.debug(results.files[fileIndex]);
                  var instructions = results.files[fileIndex].textGridInfo;
                  if (results.files[fileIndex].textGridStatus >= 500) {
                    instructions = " Please report this error.";
                  }
                  messages.push("Generating the textgrid for " + results.files[fileIndex].fileBaseName + " seems to have failed. " + instructions);
                  results.files[fileIndex].filename = results.files[fileIndex].name;
                  if (results.files[fileIndex].type && (results.files[fileIndex].type.indexOf("audio") > -1 || results.files[fileIndex].type.indexOf("video") > -1)) {
                    results.files[fileIndex].filename = results.files[fileIndex].fileBaseName + ".mp3";
                  }
                  results.files[fileIndex].URL = new AudioVideo().BASE_SPEECH_URL + "/" + self.corpus.dbname + "/" + results.files[fileIndex].filename;
                  results.files[fileIndex].description = results.files[fileIndex].description || "File from import";
                  self.addAudioVideoFile(results.files[fileIndex]);
                } else {
                  self.downloadTextGrid(results.files[fileIndex]);
                }
              }
              if (messages.length > 0) {
                self.status = messages.join(", ");
                deferred.resolve(self.status);
                // $(self.el).find(".status").html(self.get("status"));
                // if(window && window.appView && typeof window.appView.toastUser === "function") window.appView.toastUser(messages.join(", "), "alert-danger", "Import:");
              }
            } else {
              self.debug(results);
              var message = "Upload might have failed to complete processing on your file(s). Please report this error.";
              self.status = message + ": " + JSON.stringify(results);
              deferred.reject(message);

              // if(window && window.appView && typeof window.appView.toastUser === "function") window.appView.toastUser(message, "alert-danger", "Import:");
            }
            // $(self.el).find(".status").html(self.get("status"));
          },
          error: function(response) {
            var reason = {};
            if (response && response.responseJSON) {
              reason = response.responseJSON;
            } else {
              var message = "Error contacting the server. ";
              if (response.status >= 500) {
                message = message + " Please report this error.";
              } else if (response.status === 413) {
                message = message + " Your file is too big for upload, please try using FFMpeg to convert it to an mp3 for upload (you can still use your original video/audio in the app when the utterance chunking is done on an mp3.) ";
              } else {
                message = message + " Are you offline? If you are online and you still recieve this error, please report it to us: ";
              }
              reason = {
                status: response.status,
                userFriendlyErrors: [message + response.status]
              };
            }
            self.debug(reason);
            if (reason && reason.userFriendlyErrors) {
              self.status = "";
              self.error = "Upload error: " + reason.userFriendlyErrors.join(" ");
              self.bug(self.error);
              // if(window && window.appView && typeof window.appView.toastUser === "function") window.appView.toastUser(reason.userFriendlyErrors.join(" "), "alert-danger", "Import:");
              // $(self.el).find(".status").html(self.get("status"));
            }
            deferred.reject(self.error);
          }
        });
        self.status = "Contacting server...";
        // $(this.el).find(".status").html(this.model.get("status"));

      });
      return deferred.promise;
    }
  },

  downloadTextGrid: {
    value: function(fileDetails) {
      var self = this;
      var textridUrl = new AudioVideo().BASE_SPEECH_URL + "/" + this.corpus.dbname + "/" + fileDetails.fileBaseName + ".TextGrid";
      CORS.makeCORSRequest({
        url: textridUrl,
        type: "GET",
        withCredentials: false
      }).then(function(results) {
        if (results) {
          fileDetails.textgrid = results;
          var syllables = "unknown";
          if (fileDetails.syllablesAndUtterances && fileDetails.syllablesAndUtterances.syllableCount) {
            syllables = fileDetails.syllablesAndUtterances.syllableCount;
          }
          var pauses = "unknown";
          if (fileDetails.syllablesAndUtterances && fileDetails.syllablesAndUtterances.pauseCount) {
            pauses = parseInt(fileDetails.syllablesAndUtterances.pauseCount, 10);
          }
          var utteranceCount = 1;
          if (pauses > 0) {
            utteranceCount = pauses + 2;
          }
          var message = " Downloaded Praat TextGrid which contained a count of roughly " + syllables + " syllables and auto detected utterances for " + fileDetails.fileBaseName + " The utterances were not automatically transcribed for you, you can either save the textgrid and transcribe them using Praat, or continue to import them and transcribe them after.";
          fileDetails.description = message;
          self.status = self.status + "<br/>" + message;
          self.fileDetails = self.status + message;
          if (window && window.appView && typeof window.appView.toastUser === "function") {
            window.appView.toastUser(message, "alert-info", "Import:");
          }
          self.rawText = self.rawText.trim() + "\n\n\nFile name = " + fileDetails.fileBaseName + ".mp3\n" + results;
          if (!self.parent) {
            self.importTextGrid(self.rawText, null);
          } else {
            self.debug("Not showing second import step, this looks like its audio import only.");
          }
          fileDetails.filename = fileDetails.fileBaseName + ".mp3";
          fileDetails.URL = new AudioVideo().BASE_SPEECH_URL + "/" + self.corpus.dbname + "/" + fileDetails.fileBaseName + ".mp3";
          self.addAudioVideoFile(fileDetails);
          self.rawText = self.rawText.trim();

        } else {
          self.debug(results);
          fileDetails.textgrid = "Error result was empty. " + results;
        }
      }, function(response) {
        var reason = {};
        if (response && response.responseJSON) {
          reason = response.responseJSON;
        } else {
          var message = "Error contacting the server. ";
          if (response.status >= 500) {
            message = message + " Please report this error.";
          } else {
            message = message + " Are you offline? If you are online and you still recieve this error, please report it to us: ";
          }
          reason = {
            status: response.status,
            userFriendlyErrors: [message + response.status]
          };
        }
        self.debug(reason);
        if (reason && reason.userFriendlyErrors) {
          self.status = fileDetails.fileBaseName + "import error: " + reason.userFriendlyErrors.join(" ");
          if (window && window.appView && typeof window.appView.toastUser === "function") {
            window.appView.toastUser(reason.userFriendlyErrors.join(" "), "alert-danger", "Import:");
          }
        }
      }).fail(function(error) {
        console.error(error.stack, self);
      });
    }
  },

  addAudioVideoFile: {
    value: function(details) {
      if (!details) {
        this.warn("No details were provided to add be added to any file collection.");
        return;
      }
      var fileCollection = "relatedData";
      if (details.type.indexOf("image") > -1) {
        fileCollection = "images";
        details = new FieldDBImage(details);
      } else if (details.type.indexOf("audio") > -1 || details.type.indexOf("video") > -1) {
        fileCollection = "audioVideo";
      }
      if (!this[fileCollection]) {
        this[fileCollection] = new AudioVideos();
      }
      this[fileCollection].add(details);
      if (this.parent) {
        if (typeof this.parent.markAsNeedsToBeSaved === "function") {
          this.parent.markAsNeedsToBeSaved();
        }
        if (typeof this.parent.addFile === "function") {
          this.parent.addFile(details);
        } else if (this.parent.audioVideo && typeof this.parent.audioVideo.push === "function") {
          this.parent.audioVideo.push(details);
        } else {
          this.bug("There was a problem attaching this file. Please report this.");
        }
        this.render();
        // this.asCSV = [];
      }
    }
  },

  importTextGrid: {
    value: function(text, callback) {
      if (!text) {
        return;
      }
      // alert("The app thinks this might be a Praat TextGrid file, but we haven't implemented this kind of import yet. You can vote for it in our bug tracker.");
      var textgrid = TextGrid.textgridToIGT(text);
      var audioFileName = "copypastedtextgrid_unknownaudio";
      if (this.files && this.files[0] && this.files[0].name) {
        audioFileName = this.files[0].name;
      }
      audioFileName = audioFileName.replace(/\.textgrid/i, "");
      if (!textgrid || !textgrid.intervalsByXmin) {
        if (typeof callback === "function") {
          callback();
        }
      }
      var matrix = [],
        h,
        itemIndex,
        intervalIndex,
        row,
        interval;
      var header = [];
      var consultants = [];
      if (textgrid.isIGTNestedOrAlignedOrBySpeaker.probablyAligned) {
        for (itemIndex in textgrid.intervalsByXmin) {
          if (!textgrid.intervalsByXmin.hasOwnProperty(itemIndex)) {
            continue;
          }
          if (textgrid.intervalsByXmin[itemIndex]) {
            row = {};
            for (intervalIndex = 0; intervalIndex < textgrid.intervalsByXmin[itemIndex].length; intervalIndex++) {
              interval = textgrid.intervalsByXmin[itemIndex][intervalIndex];
              row.startTime = row.startTime ? row.startTime : interval.xmin;
              row.endTime = row.endTime ? row.endTime : interval.xmax;
              row.utterance = row.utterance ? row.utterance : interval.text.trim();
              row.modality = "spoken";
              row.tier = interval.tierName;
              row.speakers = interval.speaker;
              row.audioFileName = interval.fileName || audioFileName;
              row.CheckedWithConsultant = interval.speaker;
              consultants.push(row.speakers);
              row[interval.tierName] = interval.text;
              header.push(interval.tierName);
            }
            matrix.push(row);
          }
        }
      } else {
        for (itemIndex in textgrid.intervalsByXmin) {
          if (!textgrid.intervalsByXmin.hasOwnProperty(itemIndex)) {
            continue;
          }
          if (textgrid.intervalsByXmin[itemIndex]) {
            for (intervalIndex = 0; intervalIndex < textgrid.intervalsByXmin[itemIndex].length; intervalIndex++) {
              row = {};
              interval = textgrid.intervalsByXmin[itemIndex][intervalIndex];
              row.startTime = row.startTime ? row.startTime : interval.xmin;
              row.endTime = row.endTime ? row.endTime : interval.xmax;
              row.utterance = row.utterance ? row.utterance : interval.text.trim();
              row.modality = "spoken";
              row.tier = interval.tierName;
              row.speakers = interval.speaker;
              row.audioFileName = interval.fileName || audioFileName;
              row.CheckedWithConsultant = interval.speaker;
              consultants.push(row.speakers);
              row[interval.tierName] = interval.text;
              header.push(interval.tierName);
              matrix.push(row);
            }
          }
        }
      }
      header = getUnique(header);
      consultants = getUnique(consultants);
      if (consultants.length > 0) {
        this.consultants = consultants.join(",");
      } else {
        this.consultants = "Unknown";
      }
      header = header.concat(["utterance", "tier", "speakers", "CheckedWithConsultant", "startTime", "endTime", "modality", "audioFileName"]);
      var rows = [];
      for (var d in matrix) {
        var cells = [];
        //loop through all the column headings, find the data for that header and put it into a row of cells
        for (h in header) {
          var cell = matrix[d][header[h]];
          if (cell) {
            cells.push(cell);
          } else {
            //fill the cell with a blank if that datum didn't have a that column
            cells.push("");
          }
        }
        //if the datum has any text, add it to the table
        if (cells.length >= 8 && cells.slice(0, cells.length - 8).join("").replace(/[0-9.]/g, "").length > 0 && cells[cells.length - 8] !== "silent") {
          // cells.push(audioFileName);
          rows.push(cells);
        } else {
          this.debug("This row has only the default columns, not text or anything interesting.", cells);
        }
      }
      if (rows === []) {
        rows.push("");
      }
      // header.push("audioFileName");
      this.extractedHeaderObjects = header;
      this.asCSV = rows;

      if (typeof callback === "function") {
        callback();
      }
    }
  },
  importLatex: {
    value: function() {
      throw new Error("The app thinks this might be a LaTeX file, but we haven't implemented this kind of import yet. You can vote for it in our bug tracker.");
      // if (typeof callback === "function") {
      //   callback();
      // }
    }
  },
  /**
   * This function accepts text using double (or triple etc) spaces to indicate
   * separate datum. Each line in the block is treated as a column in
   * the table.
   *
   * If you have your data in Microsoft word or OpenOffice or plain
   * text, then this will be the easiest format for you to import your
   * data in.
   *
   * @param text
   */
  importTextIGT: {
    value: function(text, callback) {
      if (!text) {
        return;
      }
      var rows = text.split(/\n\n+/),
        l;

      var macLineEndings = false;
      if (rows.length < 3) {
        var macrows = text.split("\r\r");
        if (macrows.length > rows.length) {
          this.status = this.status + " Detected a MAC line ending.";
          macLineEndings = true;
          rows = macrows;
        }
      }
      for (l in rows) {
        if (macLineEndings) {
          rows[l] = rows[l].replace(/  +/g, " ").split("\r");
        } else {
          rows[l] = rows[l].replace(/  +/g, " ").split("\n");
        }
      }
      this.asCSV = rows;
      this.extractedHeaderObjects = rows[0];
      if (typeof callback === "function") {
        callback();
      }
    }
  },
  /**
   * This function accepts text using double (or triple etc) spaces to indicate
   * separate datum. Each line in the block is treated as a column in
   * the table.
   *
   * If you have your data in Microsoft word or OpenOffice or plain
   * text, then this will be the easiest format for you to import your
   * data in.
   *
   * @param text
   */
  importRawText: {
    value: function(text) {
      if (this.ignoreLineBreaksInRawText) {
        text.replace(/\n+/g, " ").replace(/\r+/g, " ");
      }
      this.datalist.add(new Datum({
        fields: [{
          id: "orthography",
          value: text
        }]
      }));
      this.debug("added a datum to the collection");
    }
  },

  /**
   * Reads the import's array of files using a supplied readOptions or using
   * the readFileIntoRawText function which uses the browsers FileReader API.
   * It can read only part of a file if start and stop are passed in the options.
   *
   * @param  Object options Options can be specified to pass start and stop bytes
   * for the files to be read.
   *
   * @return Promise Returns a promise which will have an array of results
   * for each file which was requested to be read
   */
  readFiles: {
    value: function(options) {
      var deferred = Q.defer(),
        self = this,
        promisses = [];

      options = options || {};
      this.progress = {
        total: 0,
        completed: 0
      };
      Q.nextTick(function() {

        var fileDetails = [];
        var files = self.files;
        var filesToUpload = [];

        self.progress.total = files.length;
        for (var i = 0, file; file = files[i]; i++) {
          var details = [escape(file.name), file.type || "n/a", "-", file.size, "bytes, last modified:", file.lastModifiedDate ? file.lastModifiedDate.toLocaleDateString() : "n/a"].join(" ");
          self.status = self.status + "; " + details;
          fileDetails.push(JSON.parse(JSON.stringify(file)));
          if (file.type && (file.type.indexOf("audio") > -1 || file.type.indexOf("video") > -1 || file.type.indexOf("image") > -1)) {
            filesToUpload.push(file);
          } else if (options.readOptions) {
            promisses.push(options.readOptions.readFileFunction.apply(self, [{
              file: file.name,
              start: options.start,
              stop: options.stop
            }]));
          } else {
            promisses.push(self.readFileIntoRawText({
              file: file,
              start: options.start,
              stop: options.stop
            }));
          }
        }

        if (filesToUpload.length > 0) {
          promisses.push(self.uploadFiles(self.files));
        }
        self.fileDetails = fileDetails;

        Q.allSettled(promisses).then(function(results) {
          deferred.resolve(results.map(function(result) {
            self.progress.completed += 1;
            return result.value;
          }));
        }, function(results) {
          self.error = "Error processing files";
          deferred.reject(results);
        }).fail(function(error) {
          console.error(error.stack, self);
          self.warn("There was an error when importing these options ", error, options);
          deferred.reject(error);
        });

      });
      return deferred.promise;
    }
  },
  /**
   * Reads a file using the FileReader API, can read only part of a file if start and stop are passed in the options.
   * @param  Object options Options can be specified to pass start and stop bytes for the file to be read.
   * @return Promise Returns a promise which will have an array of results for each file which was requested to be read
   */
  readFileIntoRawText: {
    value: function(options) {
      var deferred = Q.defer(),
        self = this;

      this.debug("readFileIntoRawText", options);
      Q.nextTick(function() {
        if (!options) {
          options = {
            error: "Options must be defined for readFileIntoRawText"
          };
          deferred.reject(options);
          return;
        }
        if (!options.file) {
          options.error = "Options: file must be defined for readFileIntoRawText";
          deferred.reject(options);
          return;
        }
        options.start = options.start ? parseInt(options.start, 10) : 0;
        options.stop = options.stop ? parseInt(options.stop, 10) : options.file.size - 1;
        var reader = new FileReader();

        // If we use onloadend, we need to check the readyState.
        reader.onloadend = function(evt) {
          if (evt.target.readyState === FileReader.DONE) { // DONE === 2
            options.rawText = evt.target.result;
            self.rawText = self.rawText + options.rawText;
            // self.showImportSecondStep = true;
            deferred.resolve(options);
          }
        };

        var blob = "";
        if (options.file.slice) {
          blob = options.file.slice(options.start, options.stop + 1);
        } else if (options.file.mozSlice) {
          blob = options.file.mozSlice(options.start, options.stop + 1);
        } else if (options.file.webkitSlice) {
          blob = options.file.webkitSlice(options.start, options.stop + 1);
        }
        // reader.readAsBinaryString(blob);
        // reader.readAsText(blob, "UTF-8");
        reader.readAsText(blob);

      });
      return deferred.promise;
    }
  },
  /**
   * This function attempts to guess the format of the file/textarea, and calls the appropriate import handler.
   */
  guessFormatAndPreviewImport: {
    value: function(fileIndex) {
      if (!fileIndex) {
        fileIndex = 0;
      }

      var importTypeConfidenceMeasures = {
        handout: {
          confidence: 0,
          id: "handout",
          importFunction: this.importTextIGT
        },
        csv: {
          confidence: 0,
          id: "csv",
          importFunction: this.importCSV
        },
        tabbed: {
          confidence: 0,
          id: "tabbed",
          importFunction: this.importTabbed
        },
        xml: {
          confidence: 0,
          id: "xml",
          importFunction: this.importXML
        },
        toolbox: {
          confidence: 0,
          id: "toolbox",
          importFunction: this.importToolbox
        },
        elanXML: {
          confidence: 0,
          id: "elanXML",
          importFunction: this.importElanXML
        },
        praatTextgrid: {
          confidence: 0,
          id: "praatTextgrid",
          importFunction: this.importTextGrid
        },
        latex: {
          confidence: 0,
          id: "latex",
          importFunction: this.importLatex
        }

      };

      //if the user is just typing, try raw text
      if (this.files && this.files[fileIndex]) {
        var fileExtension = this.files[fileIndex].name.split(".").pop().toLowerCase();
        if (fileExtension === "csv") {
          importTypeConfidenceMeasures.csv.confidence++;
        } else if (fileExtension === "txt") {
          //If there are more than 20 tabs in the file, try tabbed.
          if (this.rawText.split("\t").length > 20) {
            importTypeConfidenceMeasures.tabbed.confidence++;
          } else {
            importTypeConfidenceMeasures.handout.confidence++;
          }
        } else if (fileExtension === "eaf") {
          importTypeConfidenceMeasures.elanXML.confidence++;
        } else if (fileExtension === "xml") {
          importTypeConfidenceMeasures.xml.confidence++;
        } else if (fileExtension === "sf") {
          importTypeConfidenceMeasures.toolbox.confidence++;
        } else if (fileExtension === "tex") {
          importTypeConfidenceMeasures.latex.confidence++;
        } else if (fileExtension === "textgrid") {
          importTypeConfidenceMeasures.praatTextgrid.confidence++;
        } else if (fileExtension === "mov") {
          importTypeConfidenceMeasures.praatTextgrid.confidence++;
        } else if (fileExtension === "wav") {
          importTypeConfidenceMeasures.praatTextgrid.confidence++;
        } else if (fileExtension === "mp3") {
          importTypeConfidenceMeasures.praatTextgrid.confidence++;
        }
      } else {
        if (this.rawText && this.rawText.length) {
          var textLength = this.rawText.length;
          if (this.rawText.indexOf("\\gll") > -1 || this.rawText.indexOf("\\begin{") > -1 || this.rawText.indexOf("\\ex") > -1) {
            importTypeConfidenceMeasures.latex.confidence = 100;
          } else if (this.rawText.indexOf("mpi.nl/tools/elan/EAF") > -1) {
            importTypeConfidenceMeasures.elanXML.confidence = 100;
          } else if (this.rawText.indexOf("<?xml") > -1) {
            importTypeConfidenceMeasures.xml.confidence = 100;
          } else {
            importTypeConfidenceMeasures.csv.confidence = this.rawText.split(",").length / textLength;
            importTypeConfidenceMeasures.tabbed.confidence = this.rawText.split("\t").length / textLength;
            importTypeConfidenceMeasures.handout.confidence = this.rawText.split(/\n\n+/).length / textLength;
            importTypeConfidenceMeasures.toolbox.confidence = this.rawText.split(/\n\\/).length / textLength;
            importTypeConfidenceMeasures.praatTextgrid.confidence = this.rawText.split("intervals").length / textLength;
          }
        }
      }
      this.importTypeConfidenceMeasures = importTypeConfidenceMeasures;

      var mostLikelyImport;
      for (var importType in importTypeConfidenceMeasures) {
        if (!importTypeConfidenceMeasures.hasOwnProperty(importType)) {
          continue;
        }
        if (!mostLikelyImport || mostLikelyImport.confidence < importTypeConfidenceMeasures[importType].confidence) {
          mostLikelyImport = importTypeConfidenceMeasures[importType];
        }
      }

      this.importTypeConfidenceMeasures.mostLikely = mostLikelyImport;
      this.status = "";
      mostLikelyImport.importFunction.apply(this, [this.rawText, null]); //no callback
    }
  },
  readBlob: {
    value: function(file, callback, opt_startByte, opt_stopByte) {
      this.warn("Read blob is deprecated", file, callback, opt_startByte, opt_stopByte);
    }
  }
});

exports.Import = Import;
