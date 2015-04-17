define([
  "backbone",
  "audio_video/AudioVideos",
  "comment/Comment",
  "comment/Comments",
  "datum/Datums",
  "datum/DatumField",
  "datum/DatumFields",
  "datum/DatumTag",
  "datum/DatumTags",
  "image/Images",
  "datum/Session",
  "xml2json",
  "glosser/Tree",
  "OPrime"
], function(
  Backbone,
  AudioVideos,
  Comment,
  Comments,
  Datums,
  DatumField,
  DatumFields,
  DatumTag,
  DatumTags,
  Images,
  Session,
  X2JS
) {
  var Datum = Backbone.Model.extend(
    /** @lends Datum.prototype */
    {
      /**
       * @class The Datum widget is the place where all linguistic data is
       *        entered; one at a time.
       *
       * @property {DatumField} utterance The utterance field generally
       *           corresponds to the first line in linguistic examples that can
       *           either be written in the language's orthography or a
       *           romanization of the language. An additional field can be added
       *           if the language has a non-roman script.
       * @property {DatumField} gloss The gloss field corresponds to the gloss
       *           line in linguistic examples where the morphological details of
       *           the words are displayed.
       * @property {DatumField} translation The translation field corresponds to
       *           the third line in linguistic examples where in general an
       *           English translation. An additional field can be added if
       *           translations into other languages is needed.
       * @property {DatumField} judgement The judgement is the grammaticality
       *           judgement associated with the datum, so grammatical,
       *           ungrammatical, felicitous, unfelicitous etc.
       * @property {AudioVisual} audioVideo Datums can be associated with an audio or video
       *           file.
       * @property {Session} session The session provides details about the set of
       *           data elicited. The session will contain details such as date,
       *           language, consultant etc.
       * @property {Comments} comments The comments is a collection of comments
       *           associated with the datum, this is meant for comments like on a
       *           blog, not necessarily notes, which can be encoded in a
       *           field.(Use Case: team discussing a particular datum)
       * @property {DatumTags} datumtags The datum tags are a collection of tags
       *           associated with the datum. These are made completely by the
       *           user.They are like blog tags, a way for the user to make
       *           categories without make a hierarchical structure, and make
       *           datum easier for search.
       * @property {Date} dateEntered The date the Datum was first saved.
       * @property {Date} dateModified The date the Datum was last saved.
       *
       * @description The initialize function brings up the datum widget in small
       *              view with one set of datum fields. However, the datum widget
       *              can contain more than datum field set and can also be viewed
       *              in full screen mode.
       *
       * @extends Backbone.Model
       * @constructs
       */
      initialize: function() {
        if (this.get("filledWithDefaults")) {
          this.fillWithDefaults();
          this.unset("filledWithDefaults");
        }
      },
      fillWithDefaults: function() {
        // If there's no audioVideo, give it a new one.
        if (!this.get("audioVideo")) {
          this.set("audioVideo", new AudioVideos());
        }

        if (!this.get("images")) {
          this.set("images", new Images());
        }
        // If there are no comments, give it a new one
        if (!this.get("comments")) {
          this.set("comments", new Comments());
        }

        // If there are no datumTags, give it a new one
        if (!this.get("datumTags")) {
          this.set("datumTags", new DatumTags());
        }

        if (!this.get("datumFields") || this.get("datumFields").length == 0) {
          this.set("datumFields", window.app.get("corpus").get("datumFields").clone());
        }
      },
      /**
       * backbone-couchdb adaptor set up
       */

      // The couchdb-connector is capable of mapping the url scheme
      // proposed by the authors of Backbone to documents in your database,
      // so that you don't have to change existing apps when you switch the sync-strategy
      url: "/datums",


      // Internal models: used by the parse function
      internalModels: {
        datumFields: DatumFields,
        audioVideo: AudioVideos,
        images: Images,
        session: Session,
        comments: Comments,
        datumTags: DatumTags
      },


      /*
    Psycholing experiment timers
     */
      startReadTimeIfNotAlreadyStarted: function() {
        if (!this.readstarttime) {
          this.readstarttime = Date.now();
        }
      },

      calculateEditTime: function() {
        var details = {
          editingTimeSpent: 0,
          editingTimeDetails: []
        };
        var fields = this.get("datumFields").models;
        for (var field in fields) {
          if (fields[field].timeSpent) {
            details.editingTimeSpent += fields[field].timeSpent;
            details.editingTimeDetails.push(fields[field].timeSpent + ":::" + fields[field].get("label") + "->" + fields[field].get("mask"));
          }
        }
        return details;
      },

      clearEditTimeDetails: function() {
        var fields = this.get("datumFields").models;
        for (var field in fields) {
          fields[field].timeSpent = 0;
        }
      },
      /**
       * Gets all the DatumIds in the current Corpus sorted by their date.
       *
       * @param {Function} callback A function that expects a single parameter. That
       * parameter is the result of calling "pages/datums". So it is an array
       * of objects. Each object has a 'key' and a 'value' attribute. The 'key'
       * attribute contains the Datum's dateModified and the 'value' attribute contains
       * the Datum itself.
       */
      getMostRecentIdsByDate: function(howmany, callback) {
        var self = this;

        if (OPrime.isBackboneCouchDBApp()) {
          //        alert("TODO check  getMostRecentIdsByDate");
          //TODO this might be producing the error on line  815 in backbone.js       model = new this.model(attrs, options);
          var tempDatums = new Datums();
          tempDatums.model = Datum;
          tempDatums.fetch({
            descending: true,
            limit: howmany,
            error: function(model, xhr, options) {
              OPrime.bug("There was an error loading your data.");
              if (typeof callback == "function") {
                callback([]);
              }
            },
            success: function(model, response, options) {
              //            if (response.length >= 1) {
              //              callback([response[0]._id], [response[1]._id]);
              callback(response);
              //            }
            }
          });
          return;
        }


        try {
          self.pouch(function(err, db) {
            db.query("pages/datums", {
              reduce: false
            }, function(err, response) {

              if (err) {
                if (window.toldSearchtomakebydateviews) {
                  if (OPrime.debugMode) OPrime.debug("Told pouch to make by date views once, apparently it didnt work. Stopping it from looping.");
                  return;
                }
                /*
                 * Its possible that the pouch has no by date views, create them and then try searching again.
                 */
                window.toldSearchtomakebydateviews = true;
                window.app.get("corpus").createPouchView("pages/datums", function() {
                  window.appView.toastUser("Initializing your corpus' sort items by date functions for the first time.", "alert-success", "Sort:");
                  self.getMostRecentIdsByDate(howmany, callback);
                });
                return;
              }

              if ((!err) && (typeof callback == "function")) {
                if (OPrime.debugMode) OPrime.debug("Callback with: ", response.rows);
                callback(response.rows);
              }
            });
          });

        } catch (e) {
          //        appView.datumsEditView.newDatum();
          appView.datumsEditView.render();
          alert("Couldnt show the most recent datums " + JSON.stringify(e));

        }
      },

      originalParse: Backbone.Model.prototype.parse,
      parse: function(originalModel) {
        /* if this is just a couchdb save result, dont process it */
        if (originalModel.ok) {
          return this.originalParse(originalModel);
        }

        OPrime.debug("Edit this function to update datum to the latest schema.");

        var x;
        /* make sure the fields have a label */
        for (x in originalModel.datumFields) {
          originalModel.datumFields[x].label = originalModel.datumFields[x].label ||originalModel.datumFields[x].id;
        }
        if(!originalModel.session){
          originalModel.session = {
            datumFields: []
          };
        }
        for (x in originalModel.session.datumFields) {
          originalModel.session.datumFields[x].label = originalModel.session.datumFields[x].label ||originalModel.session.datumFields[x].id;
        }

        /* Add any new corpus fields to this datum so they can be edited */
        var originalFieldLabels;
        if (originalModel.datumFields.id) {
          originalFieldLabels = _.pluck(originalModel.datumFields, "id");
        } else {
          originalFieldLabels = _.pluck(originalModel.datumFields, "label");
        }

        window.corpusfieldsforDatumParse = window.corpusfieldsforDatumParse || window.app.get("corpus").get("datumFields").toJSON()
        var corpusFields = window.corpusfieldsforDatumParse;
        if (corpusFields.length > originalFieldLabels.length) {
          for (var field in corpusFields) {
            if (originalFieldLabels.indexOf(corpusFields[field].label) === -1) {
              var corpusFieldClone = JSON.parse(JSON.stringify(corpusFields[field]));
              OPrime.debug("Adding field to this datum: " + corpusFieldClone.label);
              corpusFieldClone.mask = "";
              corpusFieldClone.value = "";
              delete corpusFieldClone.user;
              delete corpusFieldClone.users;
              originalModel.datumFields.push(corpusFieldClone);
            }
          }
        }

        /* v1.93.0 add images */
        if (!originalModel.images) {
          originalModel.images = [];
        }

        /* bug fix for versions of spreadsheet with a enteredByUsers datumfield missing stuff */
        var indexOfEnterdByUserField = originalFieldLabels.indexOf("enteredByUser");
        try {
          if (indexOfEnterdByUserField > -1) {
            var enteredByUserField = originalModel.datumFields[indexOfEnterdByUserField];
            if (enteredByUserField.user && (!enteredByUserField.value || !enteredByUserField.mask)) {
              enteredByUserField.value = enteredByUserField.user.username;
              enteredByUserField.mask = enteredByUserField.user.username;
              console.log("repaired enteredByUserField", enteredByUserField);

            } else {
              // console.log("enteredByUser looked okay", enteredByUserField);
            }
            enteredByUserField.readonly = true;
          }
        } catch (e) {
          console.log("there was a problem upgrading enteredByUser", e);
        }
        var indexOfModifiedByUserField = originalFieldLabels.indexOf("modifiedByUser");
        try {
          if (indexOfModifiedByUserField > -1) {
            var modifiyersField = originalModel.datumFields[indexOfModifiedByUserField];
            if (modifiyersField.users && modifiyersField.users.length > 0 && (!modifiyersField.value || !modifiyersField.mask)) {
              var modifiers = modifiyersField.users;
              // Limit users array to unique usernames
              modifiers = _.map(_.groupBy(modifiers, function(x) {
                return x.username;
              }), function(grouped) {
                /* take the most recent version of the user in case they updated their gravatar or first and last name*/
                return grouped[grouped.length - 1];
              });
              modifiyersField.users = modifiers;

              /* generate the users as a string using the users array */
              var usersAsString = [];
              for (var user in modifiers) {
                var userFirstandLastName = modifiers[user].firstname + " " + modifiers[user].lastname;
                userFirstandLastName = userFirstandLastName.replace(/undefined/g, "");
                if (!userFirstandLastName || userFirstandLastName.trim().length < 2) {
                  userFirstandLastName = modifiers[user].username;
                }
                usersAsString.push(userFirstandLastName);
              }
              usersAsString = usersAsString.join(", ");
              modifiyersField.mask = usersAsString;
              modifiyersField.value = usersAsString;
              console.log("repaired modifiedByUser", modifiyersField);

            } else {
              // console.log("modifiedByUser was okay", modifiyersField);
            }
            modifiyersField.readonly = true;
          }
        } catch (e) {
          console.log("there was a problem upgrading modifiedByUser", e);
        }

        /* remove Deprecated datumStates on datum */
        var oldvalidationStatus = "";
        if (originalModel.datumStates) {
          var selectedArray = _.pluck(originalModel.datumStates, "selected");
          var selectedIndex = selectedArray.indexOf("selected");

          if (selectedIndex !== -1) {
            oldvalidationStatus = originalModel.datumStates[selectedIndex].state;
          }
          //Remove datumStates from this datum
          delete originalModel.datumStates;
        }

        /* enforce validation status to be comma seperated */
        var fieldLabels = _.pluck(originalModel.datumFields, "label");
        var indexOfValidationSatus = fieldLabels.indexOf("validationStatus");
        var validationFieldToclean = originalModel.datumFields[indexOfValidationSatus];
        var validationStatus = validationFieldToclean.mask || "";
        if (oldvalidationStatus) {
          // if the old status is not already subsumbed by a curretn status, do add it to the validation status
          if (validationStatus.toLowerCase().indexOf(oldvalidationStatus.toLowerCase()) === -1) {
            validationStatus = oldvalidationStatus + ", " + validationStatus;
          }
        }
        validationStatus = validationStatus.replace(" be", "Be").replace(" to", "To").replace(" checked", "Checked");
        var uniqueStati = _.unique(validationStatus.trim().split(/[, ]/)).filter(function(nonemptyvalue) {
          return nonemptyvalue;
        });
        validationFieldToclean.mask = uniqueStati.join(", ");
        validationFieldToclean.value = validationFieldToclean.mask;

        /* enforce tags to be comma seperated */
        var indexOfTags = fieldLabels.indexOf("tags");
        var tagFieldToClean = originalModel.datumFields[indexOfTags];
        var tagValue = tagFieldToClean.mask || "";
        var uniqueTags = _.unique(tagValue.trim().split(/[, ]/)).filter(function(nonemptyvalue) {
          return nonemptyvalue;
        });
        tagFieldToClean.mask = uniqueTags.join(", ");
        tagFieldToClean.value = tagFieldToClean.mask;

        /* upgrade to collection of audio video */
        if (!Array.isArray(originalModel.audioVideo)) {
          // console.log("Upgrading audioVideo to a collection", originalModel.audioVideo);
          var audioVideoArray = [];
          if (originalModel.audioVideo.URL) {
            var audioVideoURL = originalModel.audioVideo.URL;
            var fileFromUrl = audioVideoURL.substring(audioVideoURL.lastIndexOf("/"));
            audioVideoArray.push({
              "filename": fileFromUrl,
              "description": fileFromUrl,
              "URL": audioVideoURL,
              "type": "audio"
            });
          }
          originalModel.audioVideo = audioVideoArray;
        }

        /* bug fix for versions of spreadsheet (v1.91?) with a checked field that comes from the search checkboxes (not to be confused with whether the datum was checked with a consultant or not) */
        var indexOfCheckedField = originalFieldLabels.indexOf("checked");
        try {
          if (indexOfCheckedField > -1) {
            //if its set to true or false, then its probably a bug not a user created field
            if (originalModel.datumFields[indexOfCheckedField] && (originalModel.datumFields[indexOfCheckedField].value === true || originalModel.datumFields[indexOfCheckedField].value === false)) {
              originalModel.datumFields.splice(indexOfCheckedField, 1)
            }
          }
        } catch (e) {
          console.log("there was a problem removing the checked=true which was introduced in spreadsheet v1.91", e);
        }

        return this.originalParse(originalModel);
      },
      joinDatumOnFields: ["utterance", "orthography", "morphemes", "allomorphs", "translation"],
      lookForSimilarDatum: function() {
        var self = this;
        var query = this.get("datumFields").toJSON().map(function(field) {
          if (field.mask && field.mask.trim() && field.label && field.label.trim() && self.joinDatumOnFields.indexOf(field.label) > -1) {
            return field.label + ":" + field.mask.trim();
          } else {
            return "";
          }
        });
        query = query.join(" ").trim();
        if (query && query.length > 10 /*dont bother looking to merge negligable data */ ) {
          console.log("Would look for this " + query);
          this.searchByQueryString(query, function(similarDatumIds) {
            if (similarDatumIds) {
              if (similarDatumIds.length > 1) {
                var similarDatumString = "similarTo: " + similarDatumIds.join(", similarTo:");
                self.get("datumFields").add({
                  label: "links",
                  mask: similarDatumString,
                  value: similarDatumString,
                  shouldBeEncrypted: "",
                  showToUserTypes: "",
                  userchooseable: "",
                  links: similarDatumIds.map(function(id) {
                    return {
                      URI: "/" + self.get("dbname") + "/" + id,
                      relation: "similarTo"
                    }
                  }),
                  help: "Related datum in the database."
                });
              } else if (similarDatumIds.length === 1) {
                var mergeThese = window.confirm("I found a datum which already contained " + query + " would you like to update it with this import instead of creating a new datum?");
                if (mergeThese) {
                  var importDatum = self.clone();
                  self.id = similarDatumIds[0];
                  self.fetch({
                    success: function(model) {
                      console.log("Fetched the other datum using this one... ", model);
                      if (importDatum.get("audioVideo") && importDatum.get("audioVideo").length > 0) {
                        model.get("audioVideo").set(importDatum.get("audioVideo").models, {
                          merge: true,
                          remove: false
                        });
                        console.log("merged audio video", model.get("audioVideo"));
                      }
                      if (importDatum.get("images") && importDatum.get("images").length > 0) {
                        model.get("images").set(importDatum.get("images").models, {
                          merge: true,
                          remove: false
                        });
                        console.log("merged images ", model.get("images"));
                      }
                      if (importDatum.get("datumFields") && importDatum.get("datumFields").length > 0) {
                        importDatum.get("datumFields").models.map(function(field) {
                          if (!field.get("mask") || !field.get("mask").trim() || field.get("label").toLowerCase().indexOf("user") > -1 || field.get("label").toLowerCase().indexOf("validationstatus") > -1) {
                            return;
                          }
                          var previousField = model.get("datumFields").where({
                            "label": field.get("label")
                          });
                          if (previousField && previousField.length > 0) {
                            console.log(previousField[0].get("mask") + " -> " + field.get("mask"));
                            previousField[0].set("mask", field.get("mask"));
                          } else {
                            console.log("new field", field);
                            model.get("datumFields").add(field);
                          }
                        });
                        // model.get("datumFields").set(importDatum.get("datumFields").models, {merge: true, remove: false});
                        console.log("updated datumFields", model.get("datumFields"));
                      }
                      // for(var field in importDatum){
                      //   if(field == "datumFields"){

                      //   }else{
                      //     if(importDatum.hasOwnProperty(field) && importDatum[field]){
                      //       model.set(field, importDatum[field]);
                      //     }
                      //   }
                      // }
                    },
                    error: function(e) {
                      console.log("failed to merge the datum...");
                    }
                  });
                }
              }
            }
          })
        }
      },
      searchByQueryString: function(queryString, callback) {
        var self = this;
        try {
          //http://support.google.com/analytics/bin/answer.py?hl=en&answer=1012264
          window.pageTracker._trackPageview('/search_results.php?q=' + queryString);
        } catch (e) {
          if (OPrime.debugMode) OPrime.debug("Search Analytics not working.");
        }

        // Process the given query string into tokens
        var queryTokens = self.processQueryString(queryString);
        var doGrossKeywordMatch = false;
        if (queryString.indexOf(":") == -1) {
          doGrossKeywordMatch = true;
          queryString = queryString.toLowerCase().replace(/\s/g, "");
        }

        if (OPrime.isBackboneCouchDBApp()) {

          // run a custom map reduce
          //        var mapFunction = function(doc) {
          //          if(doc.collection != "datums"){
          //            return;
          //          }
          //          var fields  = doc.datumFields;
          //          var result = {};
          //          for(var f in fields){
          //            if(fields[f].label == "gloss"){
          //              result.gloss = fields[f].value;
          //            }else if(fields[f].label == "morphemes"){
          //              result.morphemes = fields[f].value;
          //            }else if(fields[f].label == "judgement"){
          //              result.judgement = fields[f].value;
          //            }
          //          }
          //          emit( result,  doc._id );
          //        };
          //        $.couch.db(this.get("dbname")).query(mapFunction, "_count", "javascript", {
          //use the get_datum_fields view
          //        alert("TODO test search in chrome extension");
          var afterDownload = function(response) {
            if (response) {
              window.get_search_fields_chronological = response;
              window.get_search_fields_chronological_timestamp = Date.now();
            }
            if (OPrime.debugMode) OPrime.debug("Got " + response.rows.length + "datums to check for the search query locally client side.");
            var matchIds = [];
            //            console.log(response);
            for (i in response.rows) {
              var thisDatumIsIn = self.isThisMapReduceResultInTheSearchResults(response.rows[i].value, queryString, doGrossKeywordMatch, queryTokens);
              // If the row's datum matches the given query string
              if (thisDatumIsIn) {
                // Keep its datum's ID, which is the value
                matchIds.push(response.rows[i].id);
              }
            }

            if (typeof callback == "function") {
              //callback with the unique members of the array
              callback(_.unique(matchIds));
              //              callback(matchIds); //loosing my this in SearchEditView
            }
          };
          if (window.get_search_fields_chronological_timestamp && (Date.now() - window.get_search_fields_chronological_timestamp) > 601000) {
            delete window.get_search_fields_chronological;
          }
          if (!window.get_search_fields_chronological) {
            $.couch.db(self.get("dbname")).view("pages/get_search_fields_chronological", {
              success: afterDownload,
              error: function(status) {
                console.log("Error quering datum", status);
              },
              reduce: false
            });
          } else {
            afterDownload(window.get_search_fields_chronological);
          }

          return;
        }



        try {
          self.pouch(function(err, db) {
            db.query("pages/get_datum_fields", {
              reduce: false
            }, function(err, response) {
              var matchIds = [];

              if (!err) {

                // Go through all the rows of results
                for (i in response.rows) {
                  var thisDatumIsIn = self.isThisMapReduceResultInTheSearchResults(response.rows[i].key, queryString, doGrossKeywordMatch, queryTokens);
                  // If the row's datum matches the given query string
                  if (thisDatumIsIn) {
                    // Keep its datum's ID, which is the value
                    matchIds.push(response.rows[i].value);
                  }
                }
              } else {
                if (window.toldSearchtomakeviews) {
                  if (OPrime.debugMode) OPrime.debug("Told search to make views once, apparently it didnt work. Stopping it from looping.");
                  return;
                }
                /*
                 * Its possible that the corpus has no search views, create them and then try searching again.
                 */
                window.appView.toastUser("Initializing your search functions for the first time." +
                  " Search in LingSync is pretty powerful, " +
                  " in fact if you're the power user type you can write your " +
                  "own data extracting/filtering/visualization queries using " +
                  " <a href='http://www.kchodorow.com/blog/2010/03/15/mapreduce-the-fanfiction/' target='_blank'>MapReduce.</a>", "alert-success", "Search:");
                window.toldSearchtomakeviews = true;
                var previousquery = queryString;
                window.app.get("corpus").createPouchView("pages/get_datum_fields", function() {
                  window.appView.searchEditView.search(previousquery);
                });
              }
              if (typeof callback == "function") {
                //callback with the unique members of the array
                callback(_.unique(matchIds));
                //                callback(matchIds); //loosing my this in SearchEditView
              }
            });
          });
        } catch (e) {
          alert("Couldnt search the data, if you sync with the server you might get the most recent search index.");
        }
      },
      isThisMapReduceResultInTheSearchResults: function(searchablefields, queryString, doGrossKeywordMatch, queryTokens) {

        var wordboundary = " ";
        // If the user is using # to indicate word boundaries as linguists do... turn all word boundaries into #
        if (queryString.indexOf("#") > -1) {
          wordboundary = "#";
        }

        var thisDatumIsIn = false;
        // If the query string is null, include all datumIds
        if (queryString.trim() === "") {
          thisDatumIsIn = true;
        } else if (doGrossKeywordMatch) {
          // Take all the data in this object
          var stringToSearchIn = JSON.stringify(searchablefields).toLowerCase();
          // Remove the labels
          stringToSearchIn = stringToSearchIn.replace(/"[^"]*":"/g, wordboundary).replace(/",/g, wordboundary).replace(/"}/g, wordboundary);
          // Convert all white space into a word boundary
          stringToSearchIn = stringToSearchIn.replace(/\s/g, wordboundary);
          if (stringToSearchIn.search(queryString) > -1) {
            thisDatumIsIn = true;
          }
        } else {

          // Determine if this datum matches the first search criteria
          thisDatumIsIn = this.matchesSingleCriteria(searchablefields, queryTokens[0]);

          // Progressively determine whether the datum still matches based on
          // subsequent search criteria
          for (var j = 1; j < queryTokens.length; j += 2) {
            if (queryTokens[j] === "AND") {
              // Short circuit: if it's already false then it continues to be false
              if (!thisDatumIsIn) {
                break;
              }

              // Do an intersection
              thisDatumIsIn = thisDatumIsIn && this.matchesSingleCriteria(searchablefields, queryTokens[j + 1]);
            } else {
              // Do a union
              thisDatumIsIn = thisDatumIsIn || this.matchesSingleCriteria(searchablefields, queryTokens[j + 1]);
            }
          }
        }
        return thisDatumIsIn;

      },
      /**
       * Determines whether the given object to search through matches the given
       * search criteria.
       *
       * @param {Object} objectToSearchThrough An object representing a datum that
       * contains (key, value) pairs where the key is the datum field label and the
       * value is the datum field value of that attribute.
       * @param {String} criteria The single search criteria in the form of a string
       * made up of a label followed by a colon followed by the value that we wish
       * to match.
       *
       * @return {Boolean} True if the given object matches the given criteria.
       * False otherwise.
       */
      matchesSingleCriteria: function(objectToSearchThrough, criteria) {
        var delimiterIndex = criteria.indexOf(":");
        var label = criteria.substring(0, delimiterIndex);
        var negate = false;
        if (label.indexOf("!") === 0) {
          label = label.replace(/^!/, "");
          negate = true;
        }
        var value = criteria.substring(delimiterIndex + 1);
        /* handle the fact that "" means grammatical, so if user asks for  specifically, give only the ones wiht empty judgemnt */
        if (label === "judgement" && value.toLowerCase() === "grammatical") {
          if (!objectToSearchThrough[label]) {
            return true;
          }
        }
        //      if(!label || !value){
        //        return false;
        //      }

        //If the query has a # in it, lets assume its a linguist looking for word boundaries since they use # to indicate the edge of words.
        var wordboundary = " ";
        if (criteria.indexOf("#") > -1) {
          wordboundary = "#";
        }

        var searchResult = false;
        if (objectToSearchThrough[label]) {
          // Make it case in-sensitive
          var stringToSearchThrough = objectToSearchThrough[label].toLowerCase();
          // Replace all spaces with the wordboundary (either a space, or a # if its a linguist)
          stringToSearchThrough = stringToSearchThrough.replace(/\s/g, wordboundary);
          // Add word boundaries to the beginning and end of the string
          stringToSearchThrough = stringToSearchThrough.replace(/^/, "#").replace(/$/, "#");

          // now search for the query string
          searchResult = (stringToSearchThrough.search(value.toLowerCase()) > -1);
        }

        if (negate) {
          searchResult = !searchResult;
        }
        return searchResult;
      },

      /**
       * Process the given string into an array of tokens where each token is
       * either a search criteria or an operator (AND or OR). Also makes each
       * search criteria token lowercase, so that searches will be case-
       * insensitive.
       *
       * @param {String} queryString The string to tokenize.
       *
       * @return {String} The tokenized string
       */
      processQueryString: function(queryString) {
        if (!queryString) {
          queryString = "";
        }
        // Split on spaces
        var queryArray = queryString.split(" ");

        // Create an array of tokens out of the query string where each token is
        // either a search criteria or an operator (AND or OR).
        var queryTokens = [];
        var currentString = "";
        for (i in queryArray) {
          var currentItem = queryArray[i].trim();
          if (currentItem.length <= 0) {
            break;
          } else if ((currentItem == "AND") || (currentItem == "OR")) {
            queryTokens.push(currentString);
            queryTokens.push(currentItem);
            currentString = "";
          } else if (currentString) {
            /* toLowerCase introduces a bug in search where camel case fields loose their capitals, then cant be matched with fields in the map reduce results */
            currentString = currentString + " " + currentItem; //.toLowerCase();
          } else {
            currentString = currentItem; //.toLowerCase();
          }
        }
        queryTokens.push(currentString);

        return queryTokens;
      },
      getDisplayableFieldForActivitiesEtc: function() {
        return this.get("datumFields").where({
          label: "utterance"
        })[0].get("mask");
      },
      getAudioFileName: function() {
        var filename;
        if (this.get("audioVideo") && this.get("audioVideo").models && this.get("audioVideo").models[0]) {
          filename = this.get("audioVideo").models[0].get("filename");
        }
        return filename;
      },

      getAudioFileBaseName: function() {
        var filename = this.getAudioFileName();
        if (!filename) {
          return;
        }
        filename = filename.substring(0, filename.lastIndexOf("."));
        return filename;
      },

      playAudio: function(audioElementId, elementToDisable) {
        var startTime = 0.0;
        var endTime = 0.0;
        var audioVideo;
        if (this.get("audioVideo") && this.get("audioVideo").models && this.get("audioVideo").models[0]) {
          audioVideo = this.get("audioVideo").models[0];
          startTime = audioVideo.get("startTime");
          endTime = audioVideo.get("endTime");
        }
        startTime = parseFloat(startTime, 10);
        endTime = parseFloat(endTime, 10);
        if (endTime > startTime || endTime === 0) {
          // elementToDisable.disabled = true;
          // $(elementToDisable).addClass("disabled");
          console.log(audioElementId + " " + startTime + " " + endTime);
          if (!document.getElementById(audioElementId)) {
            var sourceurl;
            if (audioVideo && audioVideo.get("URL")) {
              sourceurl = audioVideo.get("URL");
            } else {
              sourceurl = OPrime.audioUrl + this.get("dbname") + "/" + this.getAudioFileName();
            }
            console.log(sourceurl);
            $(document.getElementsByName(this.get("_id"))).parent().find(".audio_video_ul").append('<li><audio id="' + audioElementId + '" src="' + sourceurl + '"  controls="" preload=""  /></li>');
          }
          OPrime.playIntervalAudioFile(audioElementId, startTime, endTime, function() {
            console.log("played interval");
            // delete elementToDisable.disabled;
            // $(elementToDisable).removeClass("disabled");
          });
        }
      },
      /**
       * Clone the current Datum and return the clone. The clone is put in the current
       * Session, regardless of the origin Datum's Session. //TODO it doesn tlook liek this is the case below:
       *
       * @return The clone of the current Datum.
       */
      clone: function() {
        // Create a new Datum based on the current Datum
        var datum = new Datum({
          audioVideo: new AudioVideos(this.get("audioVideo").toJSON(), {
            parse: true
          }),
          images: new Images(this.get("images").toJSON(), {
            parse: true
          }),
          comments: new Comments(this.get("comments").toJSON(), {
            parse: true
          }),
          dateEntered: this.get("dateEntered"),
          dateModified: this.get("dateModified"),
          datumFields: new DatumFields(this.get("datumFields").toJSON(), {
            parse: true
          }),
          datumTags: new DatumTags(this.get("datumTags").toJSON(), {
            parse: true
          }),
          dbname: this.get("dbname"),
          session: this.get("session"),
          _attachments: this.get("_attachments")
        });

        return datum;
      },

      /**
       * This function is used to get the most prominent datumstate (now called
       * ValidationStatus) eg "CheckedWithSeberina" or "Deleted" or "ToBeChecked"
       *
       * @returns {String} a string which is the first item in the
       *          validationSatuts field
       */
      getValidationStatus: function() {
        var validationStatus = "";
        var stati = this.get("datumFields").where({
          "label": "validationStatus"
        });
        stati = stati[0].get("mask").trim().split(", ");
        validationStatus = stati[0].trim();

        if (!validationStatus) {
          return this.setDefaultValidationStatus();
        }
        return validationStatus;
      },
      setDefaultValidationStatus: function() {
        this.preprendValidationStatus("Checked");
        return "Checked";
      },
      /**
       * This function is used to colour a datum background to make
       * visually salient the validation status of the datum.
       *
       * @param status
       *            This is an optional string which is used to find the
       *            colour for a particular DatumState. If the string is
       *            not provided it gets the first element from the
       *            validation status field.
       * @returns {String} This is the colour using Bootstrap (warning is
       *          Orange, success Green etc.)
       */
      getValidationStatusColor: function(status) {
        if (!status) {
          status = this.getValidationStatus();
        }
        /* TODO once the new ValidationStatus pattern is in the corpus proper, dont hard code the colors */
        if (status.toLowerCase().indexOf("delete") > -1) {
          return "important";
        }
        if (status.toLowerCase().indexOf("tobechecked") > -1) {
          return "warning";
        }
        if (status.toLowerCase().indexOf("checked") > -1) {
          return "success";
        }
      },


      /**
       * This function is used to set the primary status of the datum,
       * eg. put Deleted as the first item in the validation status.
       *
       * @param selectedValue
       *            This is a string which is the validation status
       *            you want the datum to be
       */
      preprendValidationStatus: function(selectedValue) {

        /* prepend this state to the new validationStates as of v1.46.2 */
        var n = this.get("datumFields").where({
          label: "validationStatus"
        })[0];
        var validationStatus = n.get("mask") || "";
        validationStatus = selectedValue + ", " + validationStatus;
        var uniqueStati = _.unique(validationStatus.trim().split(/[, ]/)).filter(function(n) {
          return n
        });
        n.set("mask", uniqueStati.join(", "));

      },

      /**
       * Make the  model marked as Deleted, mapreduce function will
       * ignore the deleted models so that it does not show in the app,
       * but deleted model remains in the database until the admin empties
       * the trash.
       *
       * Also remove it from the view so the user cant see it.
       *
       */
      putInTrash: function(batchmode) {
        this.set("trashed", "deleted" + Date.now());
        this.preprendValidationStatus("Deleted");
        var self = this;
        this.saveAndInterConnectInApp(function() {

          if (!batchmode && window.appView) {
            window.app.addActivity({
              verb: "deleted",
              verbicon: "icon-trash",
              directobject: "<a href='#corpus/" + self.get("dbname") + "/datum/" + self.id + "'>a datum</a> ",
              directobjecticon: "icon-list",
              indirectobject: "in <a href='#corpus/" + window.app.get("corpus").id + "'>" + window.app.get("corpus").get('title') + "</a>",
              teamOrPersonal: "team",
              context: " via Offline App.",
              timeSpent: timeSpentDetails
            });

            window.app.addActivity({
              verb: "deleted",
              verbicon: "icon-trash",
              directobject: "<a href='#corpus/" + self.get("dbname") + "/datum/" + self.id + "'>a datum</a> ",
              directobjecticon: "icon-list",
              indirectobject: "in <a href='#corpus/" + window.app.get("corpus").id + "'>" + window.app.get("corpus").get('title') + "</a>",
              teamOrPersonal: "personal",
              context: " via Offline App.",
              timeSpent: timeSpentDetails
            });


          /* This actually removes it from the database */
          //thisdatum.destroy();
            window.appView.datumsEditView.showMostRecentDatum();
          }
        });
      },

      /**
       * The LaTeXiT function automatically mark-ups an example in LaTeX code
       * (\exg. \"a) and then copies it on the export modal so that when the user
       * switches over to their LaTeX file they only need to paste it in.
       *
       * We did a poll on Facebook among EGGers, and other linguists we know and
       * found that Linguex was very popular, and GB4E, so we did the export in
       * GB4E.
       */
      laTeXiT: function(showInExportModal) {
        //corpus's most frequent fields
        var frequentFields = window.app.get("corpus").frequentFields;
        //this datum/datalist's datumfields and their names
        var fieldsToExport = this.get("datumFields").toJSON().map(function(field) {
          //Dont export the user fields
          if (field.label.toLowerCase().indexOf("byuser") > -1) {
            return {
              label: "",
              mask: ""
            };
          }
          //Dont export the validationStatus
          if (field.label.toLowerCase().indexOf("validationstatus") > -1) {
            return {
              label: "",
              mask: ""
            };
          }
          // console.log(field);
          return field;
        });

        var fields = _.pluck(fieldsToExport, "mask");
        var fieldLabels = _.pluck(fieldsToExport, "label");
        //setting up for IGT case...
        var orthographyIndex = -1;
        var orthography = "";
        var utteranceIndex = -1;
        var utterance = "";
        var morphemesIndex = -1;
        var morphemes = "";
        var glossIndex = -1;
        var gloss = "";
        var translationIndex = -1;
        var translation = "";
        var result = "\n \\begin{exe} \n \\ex ";
        //IGT case:
        if (this.datumIsInterlinearGlossText()) {
          /* get the key pieces of the IGT and delete them from the fields and fieldLabels arrays*/
          judgementIndex = fieldLabels.indexOf("judgement");
          if (judgementIndex >= 0) {
            judgement = fields[judgementIndex];
            fieldLabels.splice(judgementIndex, 1);
            fields.splice(judgementIndex, 1);
          }
          orthographyIndex = fieldLabels.indexOf("orthography");
          if (orthographyIndex >= 0) {
            orthography = fields[orthographyIndex];
            fieldLabels.splice(orthographyIndex, 1);
            fields.splice(orthographyIndex, 1);
          }
          utteranceIndex = fieldLabels.indexOf("utterance");
          if (utteranceIndex >= 0) {
            utterance = fields[utteranceIndex];
            fieldLabels.splice(utteranceIndex, 1);
            fields.splice(utteranceIndex, 1);
          }
          morphemesIndex = fieldLabels.indexOf("morphemes");
          if (morphemesIndex >= 0) {
            morphemes = fields[morphemesIndex];
            fieldLabels.splice(morphemesIndex, 1);
            fields.splice(morphemesIndex, 1);
          }
          glossIndex = fieldLabels.indexOf("gloss");
          if (glossIndex >= 0) {
            gloss = fields[glossIndex];
            fieldLabels.splice(glossIndex, 1);
            fields.splice(glossIndex, 1);
          }
          translationIndex = fieldLabels.indexOf("translation");
          if (translationIndex >= 0) {
            translation = fields[translationIndex];
            fieldLabels.splice(translationIndex, 1);
            fields.splice(translationIndex, 1);
          }
          //print the main IGT, escaping special latex chars
          var judgementClosingBracketIfAny = "";
          if (judgement) {
            result = result + "\[" + OPrime.escapeLatexChars(judgement) + "\] {";
            judgementClosingBracketIfAny = " } ";
          }
          if (translation) {
            translation = "`" + translation + "'";
          }
          if (orthography) {
            result = result + " \\glll " + OPrime.escapeLatexChars(orthography) + "\\\\";
            // + "\n\t" + OPrime.escapeLatexChars(utterance) + "\\\\";
          } else {
            result = result + " \\glll " + OPrime.escapeLatexChars(utterance) + "\\\\";
          }
          result = result + "\n\t" + OPrime.escapeLatexChars(morphemes) + "\\\\" + "\n\t" + OPrime.escapeLatexChars(gloss) + " \\\\" + judgementClosingBracketIfAny + "\n\n \\glt \\emph{" + OPrime.escapeLatexChars(translation) + " \} " + "\n\\label\{" + OPrime.escapeLatexChars(utterance).toLowerCase().replace(/[^a-z0-9]/g, "") + "\}";

          // This is maybe what gb4e actually looks like, the one we had before seemed off...
          // \begin{exe}
          // \ex \glll   Guhu'mhl wan  ant John.\\
          //             guxw-'m=hl wan    an=t John\\
          //             shoot-1pl.ii=det deer GAN=det John\\
          //     \glt    \emph{John and I shot the deer.}\\
          //             \emph{John and I shot the deer.}\\
          // \end{exe}

        }
        //remove any empty fields from our arrays
        for (i = fields.length - 1; i >= 0; i--) {
          if (!fields[i]) {
            fields.splice(i, 1);
            fieldLabels.splice(i, 1);
          }

        }
        /*
      throughout this next section, print frequent fields and infrequent ones differently
    	frequent fields get latex'd as items in a description and infrequent ones are the same,
    	but commented out.
      */
        if (fields && (fields.length > 0)) {
          var numInfrequent = 0;
          for (var field in fields) {
            if (frequentFields.indexOf(fieldLabels[field]) >= 0) {
              break;
            }
            numInfrequent++;
          }
          if (numInfrequent != fieldLabels.length) {
            result = result + "\n \\begin\{description\}";
          } else {
            result = result + "\n% \\begin\{description\}";
          }
          for (var field in fields) {
            if (fields[field] && (frequentFields.indexOf(fieldLabels[field]) >= 0)) {
              result = result + "\n\t \\item\[\\sc\{" + OPrime.escapeLatexChars(fieldLabels[field]) + "\}\] " + OPrime.escapeLatexChars(fields[field]);
            } else if (fields[field]) {
              /* If as a field that is designed for LaTex dont excape the LaTeX characters */
              if (fieldLabels[field].toLowerCase().indexOf("latex") > -1) {
                // Only output the tree if the user modified the tree
                if (fieldLabels[field] == "syntacticTreeLatex") {
                  if (fields[field] != this.guessTree(morphemes)) {
                    result = result + "\n " + fields[field];
                  } else {
                    console.log("Not exporting latex tree, the user didnt modify it so they probably dont want it.");
                  }
                } else {
                  result = result + "\n " + fields[field];
                }
              } else {
                result = result + "\n%\t \\item\[\\sc\{" + OPrime.escapeLatexChars(fieldLabels[field]) + "\}\] " + OPrime.escapeLatexChars(fields[field]);
              }
            }
          }
          if (numInfrequent != fieldLabels.length) {
            result = result + "\n \\end\{description\}";
          } else {
            result = result + "\n% \\end\{description\}";
          }

        }
        result = result + "\n\\end{exe}\n\n";

        return result;
      },

      latexitDataList: function(showInExportModal) {
        //this version prints new data as well as previously shown latex'd data (best for datalists)
        var result = this.laTeXiT(showInExportModal);
        if (showInExportModal != null) {
          $("#export-type-description").html(" as <a href='http://latex.informatik.uni-halle.de/latex-online/latex.php?spw=2&id=562739_bL74l6X0OjXf' target='_blank'>LaTeX (GB4E)</a>");
          $("#export-text-area").val($("#export-text-area").val() + result);
        }
        return result;
      },

      latexitDatum: function(showInExportModal) {
        //this version prints new data and deletes previously shown latex'd data (best for datums)
        var result = this.laTeXiT(showInExportModal);
        if (showInExportModal != null) {
          $("#export-type-description").html(" as <a href='http://latex.informatik.uni-halle.de/latex-online/latex.php?spw=2&id=562739_bL74l6X0OjXf' target='_blank'>LaTeX (GB4E)</a>");
          if (!$("#export-text-area").val()) {
            result = window.appView.exportView.model.exportLaTexPreamble() + result + window.appView.exportView.model.exportLaTexPostamble();
          } else {
            result = $("#export-text-area").val().replace(window.appView.exportView.model.exportLaTexPostamble(), "") + result + window.appView.exportView.model.exportLaTexPostamble();
          }
          $("#export-text-area").val(result);
        }
        return result;
      },

      getNumberInCollection: function() {
        var number;
        var numberField = this.get("datumFields").where({
          label: "number"
        })[0] || this.get("datumFields").where({
          label: "itemnumber"
        })[0] || this.get("datumFields").where({
          label: "numberintext"
        })[0] || this.get("datumFields").where({
          label: "numberincollection"
        })[0];
        if (numberField) {
          number = numberField.get("mask");
        }
        return number;
      },

      datumIsInterlinearGlossText: function(fieldLabels) {
        if (!fieldLabels) {
          fieldLabels = _.pluck(this.get("datumFields").toJSON(), "label");
        }
        var utteranceOrMorphemes = false;
        var gloss = false;
        var trans = false;
        for (var fieldLabel in fieldLabels) {
          if (fieldLabels[fieldLabel] == "utterance" || fieldLabels[fieldLabel] == "morphemes") {
            utteranceOrMorphemes = true;
          }
          if (fieldLabels[fieldLabel] == "gloss") {
            gloss = true;
          }
          if (fieldLabels[fieldLabel] == "translation") {
            trans = true;
          }
        }
        if (gloss || utteranceOrMorphemes || trans) {
          return true;
        } else {
          return false;
        }
      },

      /**
    when pressing tab after filling morpheme line, guess different trees
    and display them in Latex formatting
    */
      guessTree: function(morphemesLine) {
        if (morphemesLine) {
          var trees = Tree.generate(morphemesLine);
          OPrime.debug(trees);
          var syntacticTreeLatex = "";
          syntacticTreeLatex += "\\item[\\sc{Left}] \\Tree " + trees.left;
          syntacticTreeLatex += " \\\\ \n \\item[\\sc{Right}] \\Tree " + trees.right;
          // syntacticTreeLatex +=  " \\\\ \n  \\item[\\sc{Mixed}] \\Tree " + trees.mixed; //TODO figure out why mixed doesnt work.

          // syntacticTreeLatex +=  "Left: "+ trees.left;
          // syntacticTreeLatex +=  "\nRight:" + trees.right;
          // syntacticTreeLatex +=  "\nMixed: " + trees.mixed;
          OPrime.debug(syntacticTreeLatex);
          return syntacticTreeLatex;
        } else {
          return "";
        }
      },
      /**
       * This function simply takes the utterance gloss and translation and puts
       * them out as plain text so the user can do as they wish.
       */
      exportAsPlainText: function(showInExportModal) {
        var fieldsToExport = this.get("datumFields").toJSON().map(function(field) {
          if (field.label.toLowerCase().indexOf("latex") > -1) {
            return {
              label: "",
              mask: ""
            };
          }
          if (field.label.toLowerCase().indexOf("byuser") > -1) {
            return {
              label: "",
              mask: ""
            };
          }
          if (field.label.toLowerCase().indexOf("validationstatus") > -1) {
            return {
              label: "",
              mask: ""
            };
          }
          // console.log(field);
          return field;
        });

        var header = _.pluck(fieldsToExport, "label") || [];
        var fields = _.pluck(fieldsToExport, "mask") || [];

        var result = fields.join("\n").replace(/\n\n+/g, "\n");
        if (showInExportModal != null) {
          $("#export-type-description").html(" as text (Word)");
          $("#export-text-area").val(
            $("#export-text-area").val() + result
          );
        }
        return result;
      },

      /**
       * This takes as an argument the order of fields and then creates a row of csv.
       */
      exportAsCSV: function(showInExportModal, orderedFields, printheader) {

        var fieldsToExport = this.get("datumFields").toJSON().map(function(field) {
          if (field.label.toLowerCase().indexOf("latex") > -1) {
            return {
              label: "",
              mask: ""
            };
          }
          // console.log(field);
          field.label = '"' + field.label.replace(/"/g, '\"') + '"';
          field.mask = '"' + field.mask.replace(/"/g, '\"') + '"';
          return field;
        });

        var header = _.pluck(fieldsToExport, "label") || [];
        var fields = _.pluck(fieldsToExport, "mask") || [];
        var result = fields.join(",").replace(/,,/g, ",") + "\n";

        // Ignore the print header, print it if there is nothing in the export box
        if (printheader || !$("#export-text-area").val()) {
          result = header.join(",").replace(/,,/g, ",") + "\n" + result;
        }
        if (showInExportModal != null) {
          $("#export-type-description").html(" as CSV (Excel, Filemaker Pro)");
          $("#export-text-area").val(
            $("#export-text-area").val() + result);
        }
        return result;
      },

      /**
       * This function simply takes the utterance gloss and translation and puts
       * them out as wordpress gloss plugin text so the user can use in their blog (although they
       * really should use a dynamic widget instead so it gets updated if the database is updated.)
       */
      exportAsWordPress: function(showInExportModal) {
        var asIGT = this.exportAsIGTWithHelpConventions().igt;
        var result = "[gloss] " + (asIGT.utterance ? asIGT.utterance : "") + "\n" + (asIGT.morphemes ? asIGT.morphemes : "") + "\n" + (asIGT.gloss ? asIGT.gloss : "") + "" + " [/gloss]\n" + (asIGT.translation ? asIGT.translation : "") + "\n";

        if (showInExportModal != null) {
          if ($("#export-text-area").val()) {
            var newExportModalText = $("#export-text-area").val();
            newExportModalText = newExportModalText + "\n";
            $("#export-text-area").val(newExportModalText)
          }
          $("#export-type-description").html(' as  <a href="https://wordpress.org/plugins/simple-interlinear-glosses/screenshots/" target="_blank">WordPress Gloss</a> (IGT Notation for WordPress Gloss Plugin)');
          $("#export-text-area").val($("#export-text-area").val() + result);
        }
        return result;
      },

      exportAsIGTWithHelpConventions : function(xmlEncode){
        var asIGTJSON = {
          _id: this.get("_id"),
          _rev: this.get("_rev"),
          comments: _.pluck(this.get("comments").toJSON(), "text"),
          audioVideo: _.pluck(this.get("audioVideo").toJSON(), "URL"),
          images: _.pluck(this.get("images").toJSON(), "URL")
          // dbname: this.get("dbname")
        };
        var helpConventions = {};
        var asDatumFields = this.get("datumFields").toJSON().concat(this.get("session").get("sessionFields").toJSON());
        for (var fieldIndex = 0; fieldIndex < asDatumFields.length; fieldIndex++) {
          if (asDatumFields[fieldIndex].mask && asDatumFields[fieldIndex].mask.length > 0) {
            asIGTJSON[asDatumFields[fieldIndex].label] = asDatumFields[fieldIndex].mask;
          }
          helpConventions[asDatumFields[fieldIndex].label] = asDatumFields[fieldIndex].help;
          if(xmlEncode){
            asIGTJSON[asDatumFields[fieldIndex].label] =  _.escape(asIGTJSON[asDatumFields[fieldIndex].label]);
            helpConventions[asDatumFields[fieldIndex].label] =  _.escape(helpConventions[asDatumFields[fieldIndex].label]);
          }
        }
        return {
          igt: asIGTJSON,
          helpConventions: helpConventions
        };
      },

      exportAsIGTJSON: function(showInExportModal, orderedFields, printheader) {
        var igtAndHelp = this.exportAsIGTWithHelpConventions();
        var result = JSON.stringify(igtAndHelp.igt, null, 2);

        // Ignore the print header, print it if there is nothing in the export box
        if (printheader || !$("#export-text-area").val()) {
          result = JSON.stringify(igtAndHelp.helpConventions, null, 2) + "," + result;
        }
        if (showInExportModal != null) {
          if ($("#export-text-area").val()) {
            var newExportModalText = $("#export-text-area").val().replace(/^\[/, "").replace(/\]$/, "");
            if (newExportModalText.indexOf("<") !== 0) {
              newExportModalText = newExportModalText + ",";
            }
            $("#export-text-area").val(newExportModalText)
          }
          $("#export-type-description").html(" as IGT JSON (Object Notation for consumption by Python, Java, PHP, MatLab scripts)");
          $("#export-text-area").val(
            "[" + $("#export-text-area").val() + result + "]");
          return $("#export-text-area").val();
        } else {
          return igtAndHelp.igt;
        }
      },

      exportAsIGTXML: function(showInExportModal, orderedFields, printheader) {
        var igtAndHelp = this.exportAsIGTWithHelpConventions("excapeForXMLplease");

        var xmlParser = new X2JS();
        var result = xmlParser.json2xml_str({
          datum: igtAndHelp.igt
        });

        // Ignore the print header, print it if there is nothing in the export box
        if (printheader || !$("#export-text-area").val()) {
          result =
            xmlParser.json2xml_str({
              fieldConventions: igtAndHelp.helpConventions
            }) +
            "\n" +
            result;
        }
        if (showInExportModal != null) {
          if ($("#export-text-area").val()) {
            var newExportModalText = $("#export-text-area").val().replace('<?xml version="1.0" encoding="UTF-8"?><datalist>',"").replace("</datalist>","");
            if (newExportModalText) {
              newExportModalText = newExportModalText + "\n";
            }
            $("#export-text-area").val(newExportModalText)
          }
          $("#export-type-description").html(" as IGT <a href='http://www.freeformatter.com/xml-formatter.html' target='_blank'>XML</a> (XML markup for Java processing etc)");
          $("#export-text-area").val( '<?xml version="1.0" encoding="UTF-8"?><datalist>'+ $("#export-text-area").val() + result+ "</datalist>");
          return $("#export-text-area").val();
        } else {
          return result;
        }

      },
      /**
       * Encrypts the datum if it is confidential
       *
       * @returns {Boolean}
       */
      encrypt: function() {
        this.set("confidential", true);
        this.get("datumFields").each(function(dIndex) {
          dIndex.set("encrypted", "checked");
        });
        //TODO scrub version history to get rid of all unencrypted versions.
        this.saveAndInterConnectInApp(window.app.router.renderDashboardOrNot, window.app.router.renderDashboardOrNot);
      },

      /**
       * Decrypts the datum if it was encrypted
       */
      decrypt: function() {
        this.set("confidential", false);

        this.get("datumFields").each(function(dIndex) {
          dIndex.set("encrypted", "");
        });
      },
      /**
       * Accepts two functions to call back when save is successful or
       * fails. If the fail callback is not overridden it will alert
       * failure to the user.
       *
       * - Adds the datum to the top of the default data list in the corpus if it is in the right corpus
       * - Adds the datum to the datums container if it wasnt there already
       * - Adds an activity to the logged in user with diff in what the user changed.
       *
       * @param successcallback
       * @param failurecallback
       */
      saveAndInterConnectInApp: function(successcallback, failurecallback) {
        if (OPrime.debugMode) OPrime.debug("Saving a Datum");
        var self = this;
        var newModel = true;
        var user = {
          username: window.app.get("authentication").get("userPublic").get("username"),
          gravatar: window.app.get("authentication").get("userPublic").get("gravatar"),
          firstname: window.app.get("authentication").get("userPublic").get("firstname"),
          lastname: window.app.get("authentication").get("userPublic").get("lastname")
        };
        var usersName = user.firstname + " " + user.lastname;
        usersName = usersName.replace(/undefined/g, "");
        if (!usersName || usersName.trim().length < 2) {
          usersName = user.username;
        }

        if (this.id) {
          newModel = false;
          var modifiyersField = this.get("datumFields").where({
            label: "modifiedByUser"
          })[0];
          if (modifiyersField) {
            var modifiers = modifiyersField.get("users");
            modifiers.push(user);
            // Limit users array to unique usernames
            modifiers = _.map(_.groupBy(modifiers, function(x) {
              return x.username;
            }), function(grouped) {
              /* take the most recent version of the user in case they updated their gravatar or first and last name*/
              return grouped[grouped.length - 1];
            });
            modifiyersField.set("users", modifiers);

            /* generate the users as a string using the users array */
            var usersAsString = [];
            for (var user in modifiers) {
              var userFirstandLastName = modifiers[user].firstname + " " + modifiers[user].lastname;
              userFirstandLastName = userFirstandLastName.replace(/undefined/g, "");
              if (!userFirstandLastName || userFirstandLastName.trim().length < 2) {
                userFirstandLastName = modifiers[user].username;
              }
              usersAsString.push(userFirstandLastName);
            }
            usersAsString = usersAsString.join(", ");
            modifiyersField.set("mask", usersAsString);
          }
        } else {
          this.set("dateEntered", JSON.stringify(new Date()));
          var userField = this.get("datumFields").where({
            label: "enteredByUser"
          })[0];
          if (userField) {
            userField.set("mask", usersName);
            userField.set("user", user);
          }
        }
        var timeSpentDetails = this.calculateEditTime();
        timeSpentDetails.totalTimeSpent = Date.now() - this.readstarttime;
        timeSpentDetails.readTimeSpent = timeSpentDetails.totalTimeSpent - timeSpentDetails.editingTimeSpent;
        //Convert to seconds
        timeSpentDetails.totalTimeSpent = timeSpentDetails.totalTimeSpent / 1000;
        timeSpentDetails.readTimeSpent = timeSpentDetails.readTimeSpent / 1000;
        timeSpentDetails.editingTimeSpent = timeSpentDetails.editingTimeSpent / 1000;

        this.readstarttime = Date.now();
        this.clearEditTimeDetails();
        OPrime.debug("This activity was roughly ", timeSpentDetails);

        //protect against users moving datums from one corpus to another on purpose or accidentially
        if (window.app.get("corpus").get("dbname") != this.get("dbname")) {
          if (typeof failurecallback == "function") {
            failurecallback();
          } else {
            alert('Datum save error. I cant save this datum in this corpus, it belongs to another corpus. ');
          }
          return;
        }
        //If it was decrypted, this will save the changes before we go into encryptedMode

        this.get("datumFields").each(function(dIndex) {
          //Anything can be done here, it is the set function which does all the work.
          dIndex.set("value", dIndex.get("mask"));
        });

        // Store the current Session, the current corpus, and the current date
        // in the Datum
        this.set({
          "dbname": window.app.get("corpus").get("dbname"),
          "dateModified": JSON.stringify(new Date()),
          "timestamp": Date.now(),
          "jsonType": "Datum"
        });
        if (!this.get("session")) {
          this.set("session", window.app.get("currentSession"));
          Util.debug("Setting the session on this datum to the current one.");
        } else {
          if (OPrime.debugMode) OPrime.debug("Not setting the session on this datum.");
        }
        window.app.get("corpus").set("dateOfLastDatumModifiedToCheckForOldSession", JSON.stringify(new Date()));

        var oldrev = this.get("_rev");

        self.save(null, {
          success: function(model, response) {
            if (OPrime.debugMode) OPrime.debug('Datum save success');
            var utterance = model.get("datumFields").where({
              label: "utterance"
            })[0].get("mask");
            var differences = "#diff/oldrev/" + oldrev + "/newrev/" + response._rev;
            //TODO add privacy for datum goals in corpus
            //            if(window.app.get("corpus").get("keepDatumDetailsPrivate")){
            //              utterance = "";
            //              differences = "";
            //            }
            if (window.appView) {
              window.appView.toastUser("Sucessfully saved datum: " + utterance, "alert-success", "Saved!");
              window.appView.addSavedDoc(model.id);
            }
            var verb = "modified";
            verbicon = "icon-pencil";
            if (newModel) {
              verb = "added";
              verbicon = "icon-plus";
            }
            if (self.get("trashed")) {
              console.log("not setting a modified activity for a trashed item. ");
            } else {
              window.app.addActivity({
                verb: "<a href='" + differences + "'>" + verb + "</a> ",
                verbicon: verbicon,
                directobject: "<a href='#corpus/" + model.get("dbname") + "/datum/" + model.id + "'>" + utterance + "</a> ",
                directobjecticon: "icon-list",
                indirectobject: "in <a href='#corpus/" + window.app.get("corpus").id + "'>" + window.app.get("corpus").get('title') + "</a>",
                teamOrPersonal: "team",
                context: " via Offline App.",
                timeSpent: timeSpentDetails
              });

              window.app.addActivity({
                verb: "<a href='" + differences + "'>" + verb + "</a> ",
                verbicon: verbicon,
                directobject: "<a href='#corpus/" + model.get("dbname") + "/datum/" + model.id + "'>" + utterance + "</a> ",
                directobjecticon: "icon-list",
                indirectobject: "in <a href='#corpus/" + window.app.get("corpus").id + "'>" + window.app.get("corpus").get('title') + "</a>",
                teamOrPersonal: "personal",
                context: " via Offline App.",
                timeSpent: timeSpentDetails
              });
            }
            //            /*
            //             * If the current data list is the default
            //             * list, render the datum there since is the "Active" copy
            //             * that will eventually overwrite the default in the
            //             * corpus if the user saves the current data list
            //             */
            //            var defaultIndex = window.app.get("corpus").datalists.length - 1;
            //            if(window.appView.currentEditDataListView.model.id == window.app.get("corpus").datalists.models[defaultIndex].id){
            //              //Put it into the current data list views
            //              window.appView.currentPaginatedDataListDatumsView.collection.remove(model);//take it out of where it was,
            //              window.appView.currentPaginatedDataListDatumsView.collection.unshift(model); //and put it on the top. this is only in the default data list
            //              //Put it into the ids of the current data list
            //              var positionInCurrentDataList = window.app.get("currentDataList").get("datumIds").indexOf(model.id);
            //              if(positionInCurrentDataList != -1){
            //                window.app.get("currentDataList").get("datumIds").splice(positionInCurrentDataList, 1);
            //              }
            //              window.app.get("currentDataList").get("datumIds").unshift(model.id);
            //              window.appView.addUnsavedDoc(window.app.get("currentDataList").id);
            //            }else{
            //              /*
            //               * Make sure the datum is at the top of the default data list which is in the corpus,
            //               * this is in case the default data list is not being displayed
            //               */
            //              var positionInDefaultDataList = window.app.get("corpus").datalists.models[defaultIndex].get("datumIds").indexOf(model.id);
            //              if(positionInDefaultDataList != -1 ){
            //                //We only reorder the default data list datum to be in the order of the most recent modified, other data lists can stay in the order teh usr designed them.
            //                window.app.get("corpus").datalists.models[defaultIndex].get("datumIds").splice(positionInDefaultDataList, 1);
            //              }
            //              window.app.get("corpus").datalists.models[defaultIndex].get("datumIds").unshift(model.id);
            //              window.app.get("corpus").datalists.models[defaultIndex].needsSave  = true;
            //              window.appView.addUnsavedDoc(window.app.get("corpus").id);
            //            }
            /*
             * Also, see if this datum matches the search datalist, and add it to the top of the search list
             */
            if ($("#search_box").val() != "") {
              //TODO check this
              var datumJson = model.get("datumFields").toJSON()
              var datumAsDBResponseRow = {};
              for (var x in datumJson) {
                datumAsDBResponseRow[datumJson[x].label] = datumJson[x].mask;
              }
              var queryTokens = self.processQueryString($("#search_box").val());
              var thisDatumIsIn = self.matchesSingleCriteria(datumAsDBResponseRow, queryTokens[0]);

              for (var j = 1; j < queryTokens.length; j += 2) {
                if (queryTokens[j] == "AND") {
                  // Short circuit: if it's already false then it continues to be false
                  if (!thisDatumIsIn) {
                    break;
                  }

                  // Do an intersection
                  thisDatumIsIn = thisDatumIsIn && model.matchesSingleCriteria(datumAsDBResponseRow, queryTokens[j + 1]);
                } else {
                  // Do a union
                  thisDatumIsIn = thisDatumIsIn || model.matchesSingleCriteria(datumAsDBResponseRow, queryTokens[j + 1]);
                }
              }
              if (thisDatumIsIn) {
                // Insert the datum at the top of the search datums collection view
                window.appView.searchEditView.searchPaginatedDataListDatumsView.collection.remove(model); //take it out of where it was,
                window.appView.searchEditView.searchPaginatedDataListDatumsView.collection.unshift(model);
                //Do the same to the datumids in the search data list itself
                var positioninsearchresults = window.appView.searchEditView.searchDataListView.model.get("datumIds").indexOf(model.id);
                if (positioninsearchresults != -1) {
                  window.appView.searchEditView.searchDataListView.model.get("datumIds").splice(positioninsearchresults, 1);
                }
                window.appView.searchEditView.searchDataListView.model.get("datumIds").unshift(model.id);
              }
            } //end of if search is open and running for Alan


            //dont need to save the user every time when we change a datum.
            //            window.app.get("authentication").saveAndInterConnectInApp();

            if (typeof successcallback == "function") {
              successcallback();
            }
          },
          error: function(e, f, g) {
            if (OPrime.debugMode) OPrime.debug("Datum save error", e, f, g)
            if (typeof failurecallback == "function") {
              failurecallback();
            } else {
              alert('Datum save error: ' + f.reason);
            }
          }
        });
      },
      /**
       * Accepts two functions success will be called if sucessfull,
       * otherwise it will attempt to render the current datum views. If
       * the datum isn't in the current corpus it will call the fail
       * callback or it will alert a bug to the user. Override the fail
       * callback if you don't want the alert.
       *
       * @param successcallback
       * @param failurecallback
       * @deprecated
       */
      setAsCurrentDatum: function(successcallback, failurecallback) {
        console.warn("Using deprected method setAsCurrentDatum.");
        //      if( window.app.get("corpus").get("dbname") != this.get("dbname") ){
        //        if (typeof failurecallback == "function") {
        //          failurecallback();
        //        }else{
        //          alert("This is a bug, cannot load the datum you asked for, it is not in this corpus.");
        //        }
        //        return;
        //      }else{
        //        if (window.appView.datumsEditView.datumsView.collection.models[0].id != this.id ) {
        //          window.appView.datumsEditView.datumsView.prependDatum(this);
        //          //TODO might not need to do it on the Read one since it is the same model?
        //        }
        //        if (typeof successcallback == "function") {
        //          successcallback();
        //        }
        //      }
      },

      /* highlight returns text with all instances of stringToHighlight enclosed
       * in a span.  Note that stringToHighlight is treated as a regexp.
       */
      highlight: function(text, stringToHighlight, className) {
        className = className || 'highlight';
        var re = new RegExp('(' + stringToHighlight + ')', "gi");
        return text.replace(re, "<span class='" + className + "'>$1</span>");
      }

    });

  return Datum;
});
