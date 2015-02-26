/* globals $, window */


var MAINTAINENCE = {

  /*
  Remove extra modifiedByUsers
   */

  /*
  Remove extra info in modifiedByUsers
   */

  /*
  Remove extra user info in markAsNeedsToBeSaved
   */

  /*
  Make sure team is in the corpus doc?
   */

  /*
  Make writers can also comment on corpora (spreadsheet permissions were set up so that users never added comment permisions to eachother)
   */


  /*
  Merge sessions into another
   */
  mergeSessions: function() {

    var pouchname = "default";
    var corpustitle = "Default";
    var corpusid = "123";
    var name = "sessionmergingbot";
    var gravatar = "968b8e7fb72b5ffe2915256c28a9414c";
    var sessions = ["b0f1bbcfdd6bf0bf38197a986f4c3ed8",
      "c0a9d2c172ca460665d8861673a032a9",
      "c0a9d2c172ca460665d8861673a968c1",
      "04fe4b75f89a46ad3d420b8f1a0ce677",
      "4f868ba9a79e57479ddbe4f62ae0a37c",
      "a57e8874b5a0a94a8b5850f347c5d4c4"
    ];
    var mergeIntoSession = {
      _id: "b0f1bbcfdd6bf0bf38197a986f481e44",
      _rev: "1-b646e5c7fcfb1f5935403250c623f627",
      pouchname: "default",
      sessionFields: [{
        label: "goal",
        value: "Transcription",
        mask: "Transcription",
        encrypted: "",
        shouldBeEncrypted: "",
        help: "This describes the goals of the session.",
        userchooseable: "disabled"
      }, {
        label: "consultants",
        value: "AC",
        mask: "AC",
        encrypted: "",
        shouldBeEncrypted: "",
        help: "Example from DataOne: Format conventions: use uppercase ,Codes for missing values: unknown",
        userchooseable: "disabled"
      }, {
        label: "dialect",
        value: "",
        mask: "",
        encrypted: "",
        shouldBeEncrypted: "",
        help: "You can use this field to be as precise as you would like about the dialect of this session.",
        userchooseable: "disabled"
      }, {
        label: "language",
        value: "Scots-Gaelic",
        mask: "Scots-Gaelic",
        encrypted: "",
        shouldBeEncrypted: "",
        help: "This is the langauge (or language family) if you would like to use it.",
        userchooseable: "disabled"
      }, {
        label: "dateElicited",
        value: "",
        mask: "",
        encrypted: "",
        shouldBeEncrypted: "",
        help: "This is the date in which the session took place.",
        userchooseable: "disabled"
      }, {
        label: "user",
        value: "andreaf",
        mask: "andreaf",
        encrypted: "",
        shouldBeEncrypted: "",
        help: "Example from DataOne: Format conventions: use uppercase ,Codes for missing values: unknown",
        userchooseable: "disabled"
      }, {
        label: "dateSEntered",
        value: "Wed Oct 01 2014 19:40:38 GMT-0700 (US Mountain Standard Time)",
        mask: "Wed Oct 01 2014 19:40:38 GMT-0700 (US Mountain Standard Time)",
        encrypted: "",
        shouldBeEncrypted: "",
        help: "This is the date in which the session was entered.",
        userchooseable: "disabled"
      }],
      comments: [],
      collection: "sessions",
      dateCreated: "2014-10-02T02:40:38.436Z",
      dateModified: "2014-10-02T02:40:38.436Z",
      lastModifiedBy: "default"
    };

    var database = $.couch.db(pouchname);
    var activities = $.couch.db(pouchname + "-activity_feed");
    var count = 0;
    database.allDocs({
      success: function(result) {
        //console.log(result);
        var data = result.rows;
        for (var couchdoc in data) {
          count++;
          if (count > 10000) {
            return;
          }
          database.openDoc(data[couchdoc].id, {
            success: function(originalDoc) {
              if (!originalDoc.session) {
                return;
              }
              console.log(originalDoc.session);
              if (!originalDoc.session._id) {
                console.log("strange, this has a session, but no session id, not merging it if its supposed to be merged. ", originalDoc);
                return;
              }
              if (sessions.indexOf(originalDoc.session._id) === -1) {
                // console.log("This is not a datum which needs to be merged into this session.", originalDoc.session);
                return;
              }
              console.log("old session", originalDoc.session);
              originalDoc.session = mergeIntoSession;
              originalDoc.comments = originalDoc.comments || [];
              var timestamp = Date.now();
              originalDoc.comments.push({
                "text": "Merged into Oct 1 2014 session",
                "username": name,
                "timestamp": timestamp,
                "gravatar": gravatar,
                "timestampModified": timestamp
              });
              console.log("saving ", originalDoc);

              database.saveDoc(originalDoc, {
                success: function(serverResults) {
                  console.log("updated " + originalDoc._id);

                  var activity = {
                    "verb": "<a target='_blank' href='#diff/oldrev/" + originalDoc._rev + "/newrev/" + serverResults.rev + "'>updated</a> ",
                    "verbicon": "icon-pencil",
                    "directobjecticon": "icon-list",
                    "directobject": "<a target='_blank' href='#data/" + originalDoc._id + "'>Merged into Oct 1 2014 Transcription</a> ",
                    "indirectobject": "in <a target='_blank' href='#corpus/" + corpusid + "'>" + corpustitle + "</a>",
                    "teamOrPersonal": "team",
                    "context": " via Futon Bot.",
                    "user": {
                      "gravatar": gravatar,
                      "username": name,
                      "_id": name,
                      "collection": "bots",
                      "firstname": "Session Merging",
                      "lastname": "Bot",
                      "email": ""
                    },
                    "timestamp": timestamp,
                    "dateModified": JSON.parse(JSON.stringify(new Date(timestamp)))
                  };
                  activities.saveDoc(activity, {
                    success: function(message) {
                      console.log("Saved activity", activity, message);
                    },
                    error: function(error) {
                      console.log("Problem saving " + JSON.stringify(activity), error);
                    }
                  });
                },
                error: function(serverResults) {
                  console.log("There was a problem saving the doc." + originalDoc._id, +JSON.stringify(originalDoc));
                }
              });

            },
            error: function(error) {
              console.log("Error opening your docs ", error);
            }
          });
        }
      },
      error: function(error) {
        console.log("Error opening the database ", error);
      }
    });


  },

  estimateAcademicUsers: function() {

    // http://tobyho.com/2009/10/07/retrieve-the-top-n-tags-in/
    var estimationOfAcademicUsers = function() {
      var map = function(doc) {
        if (!doc.email || doc.email.indexOf("@") === -1 || doc.username.indexOf("test") > -1 || doc.username.indexOf("anonymous") > -1) {
          return;
        }
        var affiliation = doc.email.substring(doc.email.lastIndexOf("@") + 1);
        if (affiliation.lastIndexOf("edu") !== affiliation.length - 3) {
          //return;
        }
        emit(null, affiliation);
      };

      var reduce = function(key, values, rereduce) {
        var minimumCountRequiredToProtectPrivacy = 1;
        var maxEduToShow = 100;
        var maxNonEduToShow = 10;

        var eduDomain = {};
        var nonEduDomain = {};
        var i,
          emailDomain;

        var allAffiliations = {
          topEduAffiliations: [],
          topNonEduAffiliations: []
        }
        if (!rereduce) {
          for (i in values) {
            emailDomain = values[i];
            if (emailDomain.lastIndexOf(".edu") === emailDomain.length - 4 || emailDomain.lastIndexOf(".ca") === emailDomain.length - 3) {
              eduDomain[emailDomain] = (eduDomain[emailDomain] || 0) + 1;
            } else {
              nonEduDomain[emailDomain] = (nonEduDomain[emailDomain] || 0) + 1;
            }
          }
        } else {
          for (i in values) {
            var topN = values[i].topEduAffiliations;

            allAffiliations.eduCount = values[i].eduCount;
            allAffiliations.nonEduCount = values[i].nonEduCount;
            var j,
              pair;
            for (j in topN) {
              // log(topN);
              pair = topN[j];
              emailDomain = pair[0];
              eduDomain[emailDomain] = (eduDomain[emailDomain] || 0) + pair[1];
            }
            topN = values[i].topNonEduAffiliations;
            for (j in topN) {
              // log(topN);
              pair = topN[j];
              emailDomain = pair[0];
              nonEduDomain[emailDomain] = (nonEduDomain[emailDomain] || 0) + pair[1];
            }
          }
        }
        var allEduCount = 0;
        var allNonEduCount = 0;
        for (key in eduDomain) {
          if (eduDomain[key] > minimumCountRequiredToProtectPrivacy) {
            allAffiliations.topEduAffiliations.push([key, eduDomain[key]]);
          }
          allEduCount += 1;
        }
        for (key in nonEduDomain) {
          if (nonEduDomain[key] > minimumCountRequiredToProtectPrivacy) {
            allAffiliations.topNonEduAffiliations.push([key, nonEduDomain[key]]);
          }
          allNonEduCount += 1;
        }
        // return ["hi"];
        // return {
        //   distinctEduAffiliations: allEduCount,
        //   distinctNonEduAffiliations: allNonEduCount
        // };

        allAffiliations.topEduAffiliations = allAffiliations.topEduAffiliations.sort(function(a, b) {
          return b[1] - a[1]
        }).slice(0, maxEduToShow);


        allAffiliations.topNonEduAffiliations = allAffiliations.topNonEduAffiliations.sort(function(a, b) {
          return b[1] - a[1]
        }).slice(0, maxNonEduToShow);

        allAffiliations.eduCount = allAffiliations.eduCount || allEduCount;
        allAffiliations.nonEduCount = allAffiliations.nonEduCount || allNonEduCount;

        allAffiliations.metadata = {
          minimumCountRequiredToProtectPrivacy: minimumCountRequiredToProtectPrivacy,
          maxEduToShow: maxEduToShow,
          maxNonEduToShow: maxNonEduToShow,
          totalEduCount: allAffiliations.eduCount,
          totalNonEduCount: allAffiliations.nonEduCount
        };

        return allAffiliations;

      };

    };



    $.couch.allDbs({
      success: function(results) {
        console.log(results);
        for (var db in results) {

          (function(dbname) {
            if (dbname.indexOf("activity_feed") > -1) {
              return;
            }
            var database = $.couch.db(dbname);
            database.openDoc("_design/pages", {
              success: function(results) {
                console.log(results._rev + " in " + dbname);

                // $.couch.replicate("new_corpus", dbname, {
                //     success: function(result) {
                //         console.log(dbname, result);
                //     },
                //     error: function(error) {
                //         console.log("Error deploying app to db"+ dbname, error);
                //     }
                // });
              },
              error: function(error) {
                console.log("Error getting couchapp, this probably isnt a corpus", error);
              }
            });
          })(results[db]);

        }
      },
      error: function(error) {
        console.log("Error getting db list", error);
      }
    });


  },

  createCorpusDocIfMissing: function() {

    var template_corpus_doc = function() {
      return {
        "_id": "corpus",
        "title": "Private Corpus",
        "titleAsUrl": "private_corpus",
        "description": "The details of this corpus are not public.",
        "couchConnection": {
          "protocol": "https://",
          "domain": "corpus.example.org",
          "port": "443",
          "pouchname": "default",
          "path": "",
          "corpusid": ""
        },
        "terms": {
          "humanReadable": "Sample: The materials included in this corpus are available for research and educational use. If you want to use the materials for commercial purposes, please notify the author(s) of the corpus (myemail@myemail.org) prior to the use of the materials. Users of this corpus can copy and redistribute the materials included in this corpus, under the condition that the materials copied/redistributed are properly attributed.  Modification of the data in any copied/redistributed work is not allowed unless the data source is properly cited and the details of the modification is clearly mentioned in the work. Some of the items included in this corpus may be subject to further access conditions specified by the owners of the data and/or the authors of the corpus."
        },
        "license": {
          "title": "Default: Creative Commons Attribution-ShareAlike (CC BY-SA).",
          "humanReadable": "This license lets others remix, tweak, and build upon your work even for commercial purposes, as long as they credit you and license their new creations under the identical terms. This license is often compared to “copyleft” free and open source software licenses. All new works based on yours will carry the same license, so any derivatives will also allow commercial use. This is the license used by Wikipedia, and is recommended for materials that would benefit from incorporating content from Wikipedia and similarly licensed projects.",
          "link": "http://creativecommons.org/licenses/by-sa/3.0/"
        },
        "copyright": "Default: Add names of the copyright holders of the corpus.",
        "pouchname": "",
        "datumFields": [{
          "label": "judgement",
          "value": "",
          "mask": "",
          "encrypted": "",
          "shouldBeEncrypted": "",
          "help": "Grammaticality/acceptability judgement of this data.",
          "size": "3",
          "showToUserTypes": "linguist",
          "userchooseable": "disabled"
        }, {
          "label": "gloss",
          "value": "",
          "mask": "",
          "encrypted": "",
          "shouldBeEncrypted": "checked",
          "help": "Metalanguage glosses of each individual morpheme (morphemes are pieces ofprefix, suffix) Sample entry: friend-fem-pl",
          "showToUserTypes": "linguist",
          "userchooseable": "disabled"
        }, {
          "label": "syntacticCategory",
          "value": "",
          "mask": "",
          "encrypted": "",
          "shouldBeEncrypted": "checked",
          "help": "This optional field is used by the machine to help with search.",
          "showToUserTypes": "machine",
          "userchooseable": "disabled"
        }, {
          "label": "syntacticTreeLatex",
          "value": "",
          "mask": "",
          "encrypted": "",
          "shouldBeEncrypted": "checked",
          "help": "This optional field is used by the machine to make LaTeX trees and help with search and data cleaning, in combination with morphemes and gloss (above). Sample entry: Tree [.S NP VP ]",
          "showToUserTypes": "machine",
          "userchooseable": "disabled"
        }, {
          "label": "tags",
          "value": "",
          "mask": "",
          "encrypted": "",
          "shouldBeEncrypted": "",
          "help": "Tags for constructions or other info that you might want to use to categorize your data.",
          "showToUserTypes": "all",
          "userchooseable": "disabled"
        }, {
          "label": "validationStatus",
          "value": "",
          "mask": "",
          "encrypted": "",
          "shouldBeEncrypted": "",
          "help": "Any number of tags of data validity (replaces DatumStates). For example: ToBeCheckedWithSeberina, CheckedWithRicardo, Deleted etc...",
          "showToUserTypes": "all",
          "userchooseable": "disabled"
        }],
        "sessionFields": [{
          "label": "dialect",
          "value": "",
          "mask": "",
          "encrypted": "",
          "shouldBeEncrypted": "",
          "help": "You can use this field to be as precise as you would like about the dialect of this session.",
          "userchooseable": "disabled"
        }, {
          "label": "language",
          "value": "",
          "mask": "",
          "encrypted": "",
          "shouldBeEncrypted": "",
          "help": "This is the langauge (or language family), if you would like to use it.",
          "userchooseable": "disabled"
        }, {
          "label": "dateElicited",
          "value": "",
          "mask": "",
          "encrypted": "",
          "shouldBeEncrypted": "",
          "help": "This is the date in which the session took place.",
          "userchooseable": "disabled"
        }],
        "comments": []
      };
    };

    /*
    create a corpus doc if one doesnt exist, with the corpusid if found
     */
    $.couch.allDbs({
      success: function(results) {
        console.log(results);
        for (var db in results) {

          (function(dbname) {
            if (dbname.indexOf("-") === -1 || dbname.indexOf("activity_feed") > -1) {
              // console.log("This db is not a corpus " + dbname);
              return;
            }
            var localdbname = dbname;
            var database = $.couch.db(dbname);

            var saveCorpusDoc = function(corpusDoc, localdbname) {
              corpusDoc.couchConnection.pouchname = localdbname;
              corpusDoc.pouchname = localdbname;
              console.log("This is what we would save: ", corpusDoc);
              // database.saveDoc(corpusDoc, {
              //     success: function(serverResults) {
              //         console.log("Saved updated corpus doc for " + localdbname);
              //     },
              //     error: function(serverResults) {
              //         console.log("There was a problem saving the doc." + localdbname);
              //     }
              // });
            };

            var updateCorpusDoc = function(corpusDoc, localdbname) {
              database.view("pages/private_corpuses", {
                success: function(privateCorpusDoc) {
                  var corpusid = "";
                  try {
                    corpusid = privateCorpusDoc.rows[0].value._id;
                  } catch (e) {
                    console.log("Corpus is pretty broken, ask the user to sync : " + localdbname);
                    return;
                    // corpusid = "";
                  }
                  console.log("Opened Corpus id " + corpusid);
                  corpusDoc.couchConnection.corpusid = corpusid;
                  corpusDoc.corpusid = corpusid;

                  if (!corpusDoc.terms) {
                    console.log("Added a terms of use" + localdbname);
                    corpusDoc["terms"] = {
                      "humanReadable": "Sample: The materials included in this corpus are available for research and educational use. If you want to use the materials for commercial purposes, please notify the author(s) of the corpus (myemail@myemail.org) prior to the use of the materials. Users of this corpus can copy and redistribute the materials included in this corpus, under the condition that the materials copied/redistributed are properly attributed.  Modification of the data in any copied/redistributed work is not allowed unless the data source is properly cited and the details of the modification is clearly mentioned in the work. Some of the items included in this corpus may be subject to further access conditions specified by the owners of the data and/or the authors of the corpus."
                    };
                  }
                  if (!corpusDoc.license) {
                    console.log("Added a license" + localdbname);
                    corpusDoc["license"] = {
                      "title": "Default: Creative Commons Attribution-ShareAlike (CC BY-SA).",
                      "humanReadable": "This license lets others remix, tweak, and build upon your work even for commercial purposes, as long as they credit you and license their new creations under the identical terms. This license is often compared to “copyleft” free and open source software licenses. All new works based on yours will carry the same license, so any derivatives will also allow commercial use. This is the license used by Wikipedia, and is recommended for materials that would benefit from incorporating content from Wikipedia and similarly licensed projects.",
                      "link": "http://creativecommons.org/licenses/by-sa/3.0/"
                    };
                  }
                  if (!corpusDoc.copyright) {
                    console.log("Added a copyright" + localdbname);
                    corpusDoc["copyright"] = "Default: Add names of the copyright holders of the corpus.";
                  }

                  saveCorpusDoc(corpusDoc, localdbname);
                },
                error: function(error) {
                  console.log("Error querying the database to get a private corpus doc", error);
                  saveCorpusDoc(corpusDoc, localdbname);
                }
              });
            };

            database.openDoc("corpus", {
              success: function(results) {
                var doUpdate = false;
                if (results && results.couchConnection && results.couchConnection.corpusid) {
                  console.log(results.couchConnection.corpusid + " is the corpusid for " + dbname);
                }
                if (results && results.couchConnection && results.couchConnection.corpusid && results.terms && results.license && results.copyright) {
                  console.log("This corpus is pretty modern. " + dbname);
                  return;
                }
                if (results && results.couchConnection && !results.couchConnection.corpusid) {
                  console.log("This corpus is missing a corpusid that can happen if its only been opened in the spreadsheet app. but htey need the corpusid to use the offline app..." + dbname);
                  // console.log("This was the couchconnection before we removed its corpusid and checked its terms of use ", results.couchConnection);
                  // results.couchConnection = {
                  //     "protocol": "https://",
                  //     "domain": "corpus.example.org",
                  //     "port": "443",
                  //     "pouchname": dbname,
                  //     "path": "",
                  //     "corpusid": ""
                  // };
                  doUpdate = true;
                }
                if (results && (!results.terms || !results.license || !results.copyright)) {
                  console.log("This corpus is missing a terms of use info, that can happen if its older than around v1.70... " + dbname);
                  doUpdate = true;
                }

                if (results && !results.couchConnection) {
                  results.couchConnection = {
                    "protocol": "https://",
                    "domain": "corpus.example.org",
                    "port": "443",
                    "pouchname": dbname,
                    "path": "",
                    "corpusid": ""
                  };
                }

                if (doUpdate) {
                  console.log("doc before update for " + localdbname + " " + JSON.stringify(results));
                  updateCorpusDoc(results, localdbname);
                }
              },
              error: function(error) {
                console.log("Error getting a corpus doc, creating one for " + localdbname, error);
                updateCorpusDoc(template_corpus_doc(), localdbname);
              }
            });



          })(results[db]);

        }
      },
      error: function(error) {
        console.log("Error getting db list", error);
      }
    });


  },

  verifyCorpusDoc: function() {


    /*
    Verify corpus doc
     */
    $.couch.allDbs({
      success: function(results) {
        console.log(results);
        for (var db in results) {

          (function(dbname) {
            if (dbname.indexOf("-") === -1 || dbname.indexOf("activity_feed") > -1) {
              console.log("This db is not a corpus " + dbname);
              return;
            }
            var localdbname = dbname;
            var database = $.couch.db(dbname);

            database.openDoc("corpus", {
              success: function(results) {
                console.log("Corpus doc " + dbname, results.couchConnection);
              },
              error: function(error) {
                console.log("Error getting a corpus doc " + dbname, error);
              }
            });
          })(results[db]);
        }
      },
      error: function(error) {
        console.log("Error getting db list", error);
      }
    });



  },

  addTeamDocIfMissing: function() {


    /*
    Add the team doc to all databases
    */
    var team_template_doc = {
      "_id": "team",
      "gravatar": "",
      "username": "team",
      "collection": "users",
      "firstname": "",
      "lastname": "",
      "email": "",
      "researchInterest": "No public information available",
      "affiliation": "No public information available",
      "description": "No public information available"
    };
    var count = 0;
    $.couch.allDbs({
      success: function(dbs) {
        for (var db in dbs) {
          count++;
          if (count > 60000) {
            return;
          }
          if (dbs[db].indexOf("-") === -1 || dbs[db].indexOf("activity_feed") > -1) {
            // (function(dbname){
            //   var database = $.couch.db(dbname);
            //   database.openDoc("team", {
            //     success: function(serverResults) {
            //       console.log("there was a team doc in the activity feed for "+dbname,JSON.stringify(serverResults));
            //       database.removeDoc(serverResults, {
            //         success: function(serverResults) {
            //           console.log("removed team from activity feed" + dbname);
            //         },
            //         error: function(serverResults) {
            //           console.log("There was a problem removing team doc in "+ dbname);
            //         }
            //       });
            //     },
            //     error: function(){
            //       /* There is no team doc, doing nothing  */
            //     }
            //   });
            //  })(dbs[db]);
          } else {
            (function(dbname) {
              var database = $.couch.db(dbname);
              database.openDoc("team", {
                success: function(serverResults) {
                  console.log("there already was a team doc for " + dbname, JSON.stringify(serverResults));
                  if (serverResults.researchInterest === "No public information available") {
                    serverResults.gravatar = "";
                    serverResults.username = dbname.split("-")[0];
                    database.saveDoc(serverResults, {
                      success: function(serverResults) {
                        console.log("updated default team for " + dbname);
                      },
                      error: function(serverResults) {
                        console.log("There was a problem saving the default team doc in " + dbname);
                      }
                    });
                  }

                },
                error: function() {
                  /* There is no team doc, creating one */
                  team_template_doc.gravatar = "";
                  team_template_doc.username = dbname.split("-")[0];
                  database.saveDoc(team_template_doc, {
                    success: function(serverResults) {
                      console.log("placed a default team for " + dbname);
                    },
                    error: function(serverResults) {
                      console.log("There was a problem saving the default team doc in " + dbname);
                    }
                  });
                }
              });
            })(dbs[db]);
          }
        }
      }
    });

    /*
    Verify team doc
     */
    $.couch.allDbs({
      success: function(results) {
        console.log(results);
        for (var db in results) {

          (function(dbname) {
            if (dbname.indexOf("-") === -1 || dbname.indexOf("activity_feed") > -1) {
              console.log("This db is not a corpus " + dbname);
              return;
            }
            var localdbname = dbname;
            var database = $.couch.db(dbname);

            database.openDoc("team", {
              success: function(results) {
                console.log("Team doc " + dbname, results);
              },
              error: function(error) {
                console.log("Error getting a team doc " + dbname, error);
              }
            });
          })(results[db]);
        }
      },
      error: function(error) {
        console.log("Error getting db list", error);
      }
    });


  },

  deployToAllUsers: function() {

    /*
    Deploy to all users
     */
    $.couch.allDbs({
      success: function(results) {
        console.log(results);
        for (var db in results) {

          (function(dbname) {
            if (dbname.indexOf("-") === -1) {
              console.log(dbname + "  is not a corpus or activity feed ");
              return;
            }
            if (dbname.search(/elise[0-9]+/) === 0 || dbname.indexOf("nemo") === 0 || dbname.indexOf("test") === 0 || dbname.indexOf("tobin") === 0 || dbname.indexOf("devgina") === 0 || dbname.indexOf("gretchen") === 0 || dbname.indexOf("marquisalx") === 0) {
              console.log("deploying to a beta tester");
              // return;
            } else if (dbname.indexOf("phophlo") > -1 || dbname.indexOf("fr-ca") > -1) {
              console.log("deploying to a phophlo user");
              // return;
            } else {
              if (dbname.indexOf("anonymous") > -1) {
                return;
              } else {}
              return; //deploy to only beta testers and/or phophlo users
            }
            var sourceDB = "";
            if (dbname.indexOf("activity_feed") > -1) {
              if (dbname.split("-").length >= 3) {
                sourceDB = "new_corpus_activity_feed";
              } else {
                sourceDB = "new_user_activity_feed";
              }
            } else {
              sourceDB = "new_corpus";
            }
            console.log(dbname + " is a " + sourceDB);
            $.couch.replicate(sourceDB, dbname, {
              success: function(result) {
                console.log(dbname, result);
              },
              error: function(error) {
                console.log("Error deploying " + sourceDB + " app to db" + dbname, error);
              }
            });
          })(results[db]);

        }
      },
      error: function(error) {
        console.log("Error getting db list", error);
      }
    });


  },

  countCorpora: function() {


    /*
    Count corpora
     */
    window.corporaCount = 0;
    window.nonPracticeCorpora = [];
    window.databaseStats = [];
    $.couch.allDbs({
      success: function(results) {
        console.log(results);
        for (var db in results) {

          (function(dbname) {
            if (dbname.indexOf("-") === -1) {
              console.log(dbname + "  is not a corpus or activity feed ");
              return;
            }
            if (dbname.search(/elise[0-9]+/) === 0 || dbname.indexOf("nemo") === 0 || dbname.indexOf("anonymous") === 0 || dbname.indexOf("test") === 0 || dbname.indexOf("tobin") === 0 || dbname.indexOf("devgina") === 0 || dbname.indexOf("gretchen") === 0) {
              console.log("ignoring a beta tester");
              return;
            } else {}
            var sourceDB = "";
            if (dbname.indexOf("activity_feed") > -1) {
              if (dbname.split("-").length >= 3) {
                sourceDB = "new_corpus_activity_feed";
              } else {
                sourceDB = "new_user_activity_feed";
              }
            } else {
              sourceDB = "new_corpus";
              corporaCount++;
              if (dbname.indexOf("firstcorpus") === -1 && dbname.indexOf("test") === -1 && dbname.indexOf("tutorial") === -1 && dbname.indexOf("devgina") === -1 && dbname.indexOf("nemo") === -1) {
                nonPracticeCorpora.push(dbname);
              }
            }
            // console.log(dbname + " is a " + sourceDB);
            $.ajax({
              "method": "GET",
              "url": window.location.origin + "/" + dbname,
              success: function(result) {
                result = JSON.parse(result);
                result.type = sourceDB.replace("new_", "");
                result.realOrNot = "practice";
                if (dbname.indexOf("firstcorpus") === -1 && dbname.indexOf("test") === -1 && dbname.indexOf("tutorial") === -1 && dbname.indexOf("devgina") === -1 && dbname.indexOf("nemo") === -1) {
                  result.realOrNot = "real";
                }
                console.log(dbname, result);
                databaseStats.push(result);
              },
              error: function(error) {
                console.log("Error geting stats for " + dbname, error);
              }
            });

          })(results[db]);

        }
      },
      error: function(error) {
        console.log("Error getting db list", error);
      }
    });

    databaseStats.map(function(databaseDetails) {
      console.log(databaseDetails.realOrNot + "," + databaseDetails.type + "," + databaseDetails.db_name + "," + databaseDetails.doc_count + "," + databaseDetails.disk_size + "," + databaseDetails.data_size + "," + databaseDetails.committed_update_seq);
      return databaseDetails;
    })



  },

  replicateAllDbs: function(source, target) {
    if (!source || !target) {
      throw "You have to tell me the source and target";
    }

    var throttleReplications = 10000;
    var self = this;
    /*
    Replicate all databases
     */
    $.couch.urlPrefix = source;
    self.replicationCount = 0;

    self.dbsWhichReplicationDidntGoWellAndNeedToBeManuallyReviewed = "";
    var replicatePermissions = function(dbname) {
      $.couch.urlPrefix = source;
      var sourcedatabase = $.couch.db(dbname);
      sourcedatabase.openDoc("_security", {
        success: function(securitydoc) {
          $.couch.urlPrefix = target;
          targetdatabase = $.couch.db(dbname);
          targetdatabase.saveDoc(securitydoc, {
            success: function(serverResults) {
              console.log("replicated _security for " + dbname, serverResults);
            },
            error: function(serverResults) {
              console.log("There was a problem saving the doc." + dbname + " " + JSON.stringify(securitydoc), serverResults);
              self.dbsWhichReplicationDidntGoWellAndNeedToBeManuallyReviewed = self.dbsWhichReplicationDidntGoWellAndNeedToBeManuallyReviewed + " " + dbname;

            }
          });

        },
        error: function(error) {
          console.log(" there was a problem opening the permissions of " + dbname, error);
        }
      });
    };

    var turnOnContinuousReplication = function(dbnameToReplicate, dbnames) {
      var replicationOptions = {
        // create_target: true,
        continuous: true
      };

      replicatePermissions(dbnameToReplicate);

      $.couch.urlPrefix = source;
      $.couch.replicate(dbnameToReplicate,
        target + "/" + dbnameToReplicate, {
          success: function(result) {
            console.log("Successfully started replication for " + dbnameToReplicate, result);

            console.log("waiting " + throttleReplications);
            window.setTimeout(function() {
              turnOnReplicationAndLoop(dbnames);
            }, throttleReplications);

          },
          error: function(error) {
            console.log("Error replicating to db" + dbnameToReplicate, error);
            self.dbsWhichReplicationDidntGoWellAndNeedToBeManuallyReviewed = self.dbsWhichReplicationDidntGoWellAndNeedToBeManuallyReviewed + " " + dbnameToReplicate;

            console.log("waiting " + throttleReplications);
            window.setTimeout(function() {
              turnOnReplicationAndLoop(dbnames);
            }, throttleReplications);

          }
        },
        replicationOptions);
    };

    var turnOnReplicationAndLoop = function(dbnames) {
      if (!dbnames || dbnames.length === 0) {
        console.log("finished replicating", dbnames);
        return;
      }
      var dbname = dbnames.pop();


      if (!dbname || dbname.indexOf("-") === -1) {
        console.log(dbname + "  is not a corpus or activity feed ");
        turnOnReplicationAndLoop(dbnames);
        return;
      }
      if (dbname.indexOf("phophlo") > -1 || dbname.indexOf("fr-ca") > -1) {
        turnOnReplicationAndLoop(dbnames);
        return;
        console.log("turning on continuous replication for a phophlo user");
      } else if (dbname.indexOf("anonymouskartuli") > -1 || dbname.indexOf("anonymous1") > -1) {
        turnOnReplicationAndLoop(dbnames);
        return; // dont bother to replicate any anonymous speech recognition or learn x users
        console.log("turning on continuous replication for a learn x user");
      } else if (dbname.search(/elise[0-9]+/) === 0 || dbname.indexOf("nemo") === 0 || dbname.indexOf("test") === 0 || dbname.indexOf("tobin") === 0 || dbname.indexOf("devgina") === 0 || dbname.indexOf("gretchen") === 0 || dbname.indexOf("marquisalx") === 0) {
        console.log("turning on continuous replication for a beta tester");
        // return;
      } else {
        turnOnReplicationAndLoop(dbnames);
        return; //turn on continuous replication for only beta testers and/or phophlo users
      }

      if (self.replicationCount > 0 && self.replicationCount % 30 === 0) {
        var keepGoing = confirm(" Do you want to continue the replication? you are currently at db: " + self.replicationCount);
        if (!keepGoing) {
          turnOnReplicationAndLoop(dbnames);
          return;
        }
      }

      var sourceDB = "";
      if (dbname.indexOf("activity_feed") > -1) {
        if (dbname.split("-").length >= 3) {
          sourceDB = "new_corpus_activity_feed";
        } else {
          sourceDB = "new_user_activity_feed";
        }
      } else {
        sourceDB = "new_corpus";
      }
      console.log(dbname + " is a " + sourceDB);

      self.replicationCount += 1;

      FieldDB.CORS.makeCORSRequest({
        method: "PUT",
        url: target + "/" + dbname,
        withCredentials: true
      }).then(function(result) {
        console.log("db " + dbname + " created", result);
        turnOnContinuousReplication(dbname, dbnames);
      }, function(reason) {
        if (reason && reason.error && reason.error === "file_exists") {
          turnOnContinuousReplication(dbname, dbnames);
        } else {
          console.log("Error creating " + dbname, reason);
          turnOnContinuousReplication(dbname, dbnames);
          self.dbsWhichReplicationDidntGoWellAndNeedToBeManuallyReviewed = self.dbsWhichReplicationDidntGoWellAndNeedToBeManuallyReviewed + " " + dbname;

        }
      });

    };

    $.couch.allDbs({
      success: function(results) {
        console.log(results);
        turnOnReplicationAndLoop(results);
      },
      error: function(error) {
        console.log("Error getting db list", error);
      }
    });


  },

  removeBlockNonContribAdminWritesFromActivityFeeds: function() {


    /*
    Remove block non admin writes from all users activity feeds:
     */
    $.couch.allDbs({
      success: function(results) {
        console.log(results);
        for (var db in results) {

          (function(dbname) {
            if (dbname.indexOf("-") === -1) {
              // console.log(dbname + "  is not a corpus or activity feed " );
              return;
            }
            var sourceDB = "";
            if (dbname.indexOf("activity_feed") > -1) {
              if (dbname.split("-").length >= 3) {
                sourceDB = "new_corpus_activity_feed";
              } else {
                sourceDB = "new_user_activity_feed";
              }
            } else {
              sourceDB = "new_corpus";
            }
            if (sourceDB !== "new_user_activity_feed") {
              return;
            }
            console.log(dbname + " is a " + sourceDB);
            var database = $.couch.db(dbname);
            database.openDoc("_design/blockNonContribAdminWrites", {
              success: function(blockDoc) {
                // console.log("Found blockNonContribAdminWrites", blockDoc);
                database.removeDoc(blockDoc, {
                  success: function(serverResults) {
                    console.log("removed blockNonContribAdminWrites for " + dbname, JSON.stringify(blockDoc));
                  },
                  error: function(serverResults) {
                    console.log("There was a problem removing the doc." + dbname, +JSON.stringify(blockDoc));
                  }
                });

              },
              error: function(serverResults) {
                console.log("There was no blockNonContribAdminWrites." + dbname, +JSON.stringify(blockDoc));
              }
            });



          })(results[db]);

        }
      },
      error: function(error) {
        console.log("Error getting db list", error);
      }
    });


    var blockNonContribAdminWritesNewCorpus = function(new_doc, old_doc, userCtx) {

      var userCanWrite = false;
      var failMessage = "";
      if (userCtx.roles.indexOf(userCtx.db + "_writer") > -1) {
        userCanWrite = true;
      }
      if (!userCanWrite && userCtx.roles.indexOf(userCtx.db + "_commenter") > -1) {
        if (!old_doc) {
          old_doc = {};
        }
        /* accept only comments, date modified and timestamp from the new doc */
        delete new_doc.comments;
        delete old_doc.comments;

        delete new_doc.dateModified;
        delete old_doc.dateModified;

        delete new_doc.timestamp;
        delete old_doc.timestamp;

        delete new_doc._revisions;
        delete old_doc._revisions;
        delete new_doc._rev;
        delete old_doc._rev;
        if (new_doc.datumFields) {
          for (var field = new_doc.datumFields.length - 1; field >= 0; field--) {
            if (new_doc.datumFields[field].label === "modifiedByUser") {
              new_doc.datumFields[field] = {};
            }
          }
          for (var field = old_doc.datumFields.length - 1; field >= 0; field--) {
            if (old_doc.datumFields[field].label === "modifiedByUser") {
              old_doc.datumFields[field] = {};
            }
          }
        }
        if (JSON.stringify(old_doc) === JSON.stringify(new_doc)) {
          userCanWrite = true;
        } else {
          failMessage = JSON.stringify(old_doc) + JSON.stringify(new_doc);
        }
      }

      /* permit replication by admins */
      if (userCtx.roles.indexOf("admin") > -1) {
        userCanWrite = true;
      }
      if (userCtx.roles.indexOf("_admin") > -1) {
        userCanWrite = true;
      }

      if (!userCanWrite) {
        throw ({
          "forbidden": "Not Authorized, you are not a writer on " + userCtx.db + ", you will have to ask " + userCtx.db.replace(/-.*/, "") + " to add you as a writer. You currently have these roles: " + userCtx.roles
        });
      }
    };


    var blockNonContribAdminWritesNewCorpusActivityFeed = function(new_doc, old_doc, userCtx) {
      var corpusdb = userCtx.db.replace("-activity_feed", "");

      var userCanWrite = false;
      /* let anyone with any role create an activity in the corpus, not necessary write to it */
      if (userCtx.roles.indexOf(corpusdb + "_writer") > -1) {
        userCanWrite = true;
      }
      if (userCtx.roles.indexOf(corpusdb + "_commenter") > -1) {
        userCanWrite = true;
      }
      if (userCtx.roles.indexOf(corpusdb + "_reader") > -1) {
        userCanWrite = true;
      }
      if (userCtx.roles.indexOf(corpusdb + "_admin") > -1) {
        userCanWrite = true;
      }

      /* permit replication by admins */
      if (userCtx.roles.indexOf("admin") > -1) {
        userCanWrite = true;
      }
      if (userCtx.roles.indexOf("_admin") > -1) {
        userCanWrite = true;
      }

      if (!userCanWrite) {
        throw ({
          "forbidden": "Not Authorized to save an activity to this corpus, you are not a member of " + corpusdb + ", you will have to ask " + corpusdb.replace(/-.*/, "") + " to add you as a member. You currently have these roles: " + userCtx.roles
        });
      }
    };


    var blockNonContribAdminWritesNewUserActivityFeed = function(new_doc, old_doc, userCtx) {
      var reconstructedUser = userCtx.db.replace("-activity_feed", "");

      var userCanWrite = false;

      if (userCtx.name === reconstructedUser) {
        userCanWrite = true;
      }

      /* permit replication by admins */
      if (userCtx.roles.indexOf("admin") > -1) {
        userCanWrite = true;
      }
      if (userCtx.roles.indexOf("_admin") > -1) {
        userCanWrite = true;
      }

      if (!userCanWrite) {
        throw ({
          "forbidden": "Not Authorized, you are the owner of this activity feed: " + reconstructedUser
        });
      }
    };



  },

  removeExtraQuotesInSecurityDoc: function() {


    /*
    Remove extra quotes in security docs
     */
    var count = 0;
    $.couch.allDbs({
      success: function(dbs) {
        for (var db in dbs) {
          count++;
          if (count > 600) {
            return;
          }

          (function(dbname) {
            var database = $.couch.db(dbname);
            database.openDoc("_security", {
              success: function(serverResults) {
                console.log("_security for " + dbname, JSON.stringify(serverResults));
                var securitydoc = serverResults;
                var temp;
                if (securitydoc.admins && securitydoc.admins.names) {
                  temp = securitydoc.admins.names.join(",") || "";
                  if (temp) {
                    securitydoc.admins.names = temp.replace(/"/g, "").split(",");
                  }
                }
                if (securitydoc.admins && securitydoc.admins.roles) {
                  temp = securitydoc.admins.roles.join(",") || "";
                  if (temp) {
                    securitydoc.admins.roles = temp.replace(/"/g, "").split(",");
                  }
                }
                if (securitydoc.members && securitydoc.members.names) {
                  temp = securitydoc.members.names.join(",") || "";
                  if (temp) {
                    securitydoc.members.names = temp.replace(/"/g, "").split(",");
                  }
                }
                if (securitydoc.members && securitydoc.members.roles) {
                  /* Add the commenter role */
                  if (securitydoc.members.roles.length > 0 && securitydoc.members.roles.indexOf(dbname + "-commenter") === -1) {
                    securitydoc.members.roles.push(dbname + "-commenter");
                  }
                  var temp = securitydoc.members.roles.join(",") || "";
                  if (temp.indexOf("\"") > -1) {
                    console.log("Found a corpus that needed to be updated: " + dbname);
                  } else {
                    console.log("This corpus didnt need to be updated: " + dbname);
                  }
                  if (temp) {
                    securitydoc.members.roles = temp.replace(/"/g, "").replace("collaborator", "reader").replace("contributor", "writer").split(",");
                  }
                }
                securitydoc._id = "_security";
                database.saveDoc(securitydoc, {
                  success: function(serverResults) {
                    console.log("cleaned _security for " + dbname, JSON.stringify(securitydoc));
                  },
                  error: function(serverResults) {
                    console.log("There was a problem saving the doc." + dbname, +JSON.stringify(securitydoc));
                  }
                });

              }
            });
          })(dbs[db]);

        }

      }
    });



  },

  mergeCorpora: function() {


    /*
    Merge a corpus to another
     */
    var targetdatabase = "default";
    var database = $.couch.db(targetdatabase);
    database.allDocs({
      success: function(result) {
        //console.log(result);
        var data = result.rows;
        for (var couchdatum in data) {
          database.openDoc(data[couchdatum].id, {
            success: function(originalDoc) {
              console.log(originalDoc.pouchname);
              originalDoc.pouchname = targetdatabase;
              database.saveDoc(originalDoc, {
                success: function(serverResults) {
                  console.log("updated " + originalDoc._id);
                },
                error: function(serverResults) {
                  console.log("There was a problem saving the doc." + originalDoc._id, +JSON.stringify(originalDoc));
                }
              });

            },
            error: function(error) {
              console.log("Error opening your docs ", error);
            }
          });
        }
      },
      error: function(error) {
        console.log("Error opening the database ", error);
      }
    });

    /*
    Merge a database to another on another server
     */
    var targetdatabase = "default";
    var remoteTargetDatabase = targetdatabase;
    var database = $.couch.db(targetdatabase);

    database.allDocs({
      success: function(result) {
        //console.log(result);
        var data = result.rows;
        for (var couchdatum in data) {
          $.couch.urlPrefix = window.location.origin;
          var localDatabase = $.couch.db(targetdatabase);
          localDatabase.openDoc(data[couchdatum].id, {
            success: function(originalDoc) {
              if (originalDoc.pouchname) {
                originalDoc.pouchname = remoteTargetDatabase;
              }
              $.couch.urlPrefix = "https://corpus.example.org";
              var remoteDatabase = $.couch.db(remoteTargetDatabase);
              remoteDatabase.saveDoc(originalDoc, {
                success: function(serverResults) {
                  console.log("updated " + originalDoc._id);
                },
                error: function(serverResults) {
                  console.log("There was a problem saving the doc." + originalDoc._id, JSON.stringify(originalDoc));
                }
              });

            },
            error: function(error) {
              console.log("Error opening your docs ", error);
            }
          });
        }
      },
      error: function(error) {
        console.log("Error opening the database ", error);
      }
    });



  },

  removeQuotesInPermissions: function() {


    /*
    Remove extra quotes in permissions
     */
    var database = $.couch.db("_users");
    database.allDocs({
      success: function(result) {
        //console.log(result);
        var data = result.rows;
        for (var couchdatum in data) {
          database.openDoc(data[couchdatum].id, {
            success: function(originalDoc) {
              console.log(originalDoc.roles);
              var temp = originalDoc.roles.join(",") || "";
              if (temp) {
                originalDoc.roles = temp.replace(/"/g, "").split(",");
              }
              console.log(originalDoc.roles);
              database.saveDoc(originalDoc, {
                success: function(serverResults) {
                  console.log("cleaned extra quotes from roles for " + originalDoc._id, JSON.stringify(originalDoc));
                },
                error: function(serverResults) {
                  console.log("There was a problem saving the user doc." + originalDoc._id, +JSON.stringify(originalDoc));
                }
              });

            },
            error: function(error) {
              console.log("Error opening your docs ", error);
            }
          });
        }
      },
      error: function(error) {
        console.log("Error opening the database ", error);
      }
    });


    /*
    Add lingllama-communitycorpus to all users who have access to lingllama and prevent anyone from editing the user study data
     */
    Array.prototype.getUnique = function() {
      var u = {},
        a = [];
      for (var i = 0, l = this.length; i < l; ++i) {
        if (u.hasOwnProperty(this[i])) {
          continue;
        }
        a.push(this[i]);
        u[this[i]] = 1;
      }
      return a;
    }
    var database = $.couch.db("_users");
    database.allDocs({
      success: function(result) {
        //console.log(result);
        var data = result.rows;
        for (var couchdatum in data) {
          database.openDoc(data[couchdatum].id, {
            success: function(originalDoc) {
              // console.log(originalDoc);
              if (!originalDoc.roles) {
                return;
              }
              var temp = originalDoc.roles.getUnique().join(",") || "";
              if (temp) {
                //upgrade pre 1.30 users
                for (var roleIndex = 0; roleIndex < originalDoc.roles.length; roleIndex++) {
                  if (originalDoc.roles[roleIndex].indexOf("contributor") || originalDoc.roles[roleIndex].indexOf("writer")) {
                    temp = temp.replace(/contributor/g, "writer");
                    var roleName = originalDoc.roles[roleIndex].replace(/contributor/g, "writer");
                    var expectedReaderOnWriterCorpora = roleName.replace("writer", "reader");
                    var expectedCommenterOnWriterCorpora = roleName.replace("writer", "commenter");
                    temp = temp + "," + expectedReaderOnWriterCorpora + "," + expectedCommenterOnWriterCorpora;
                  }
                }

                temp = temp.replace(/computationalfieldworkshop-group_data_entry_tutorial_writer/g, "computationalfieldworkshop-group_data_entry_tutorial_reader");
                temp = temp.replace(/public-firstcorpus_reader/g, "");

                //remove testing users from communitycorpus
                temp = temp.replace(/lingllama-communitycorpus_writer/g, "");
                temp = temp.replace(/lingllama-communitycorpus_reader/g, "");
                temp = temp.replace(/lingllama-communitycorpus_commenter/g, "");
                temp = temp.replace(/,+/g, ",").replace(/,$/g, "");


                if (originalDoc.name.search(/elise[0-9]+/) > -1 || originalDoc.name.indexOf("nemo") > -1 || originalDoc.name.indexOf("test") > -1 || originalDoc.name.indexOf("tobin") > -1 || temp.indexOf("-") === -1) {
                  originalDoc.roles = temp.replace(/"/g, "").split(",");
                  originalDoc.roles = originalDoc.roles.getUnique().sort().join(",").split(",");
                } else {
                  //add everyone else to the communitycorpus
                  // console.log(temp);
                  originalDoc.roles = temp.replace(/"/g, "").split(",");
                  originalDoc.roles = originalDoc.roles.getUnique().sort().join(",").split(",");

                  originalDoc.roles.push("lingllama-communitycorpus_commenter");
                  originalDoc.roles.push("lingllama-communitycorpus_reader");
                  originalDoc.roles.push("lingllama-communitycorpus_writer");
                }

              }
              console.log(originalDoc.name, originalDoc.roles);

              database.saveDoc(originalDoc, {
                success: function(serverResults) {
                  console.log("cleaned extra quotes and updated lingllama roles for " + originalDoc._id, JSON.stringify(originalDoc.roles));
                },
                error: function(serverResults) {
                  console.log("There was a problem saving the user doc." + originalDoc._id, +JSON.stringify(originalDoc));
                }
              });

            },
            error: function(error) {
              console.log("Error opening your docs ", error);
            }
          });
        }
      },
      error: function(error) {
        console.log("Error opening the database ", error);
      }
    });



  },

  mergeUserRolesFromTwoServers: function() {

    /*
    Merge users roles
     */
    Array.prototype.getUnique = function() {
      var u = {},
        a = [];
      for (var i = 0, l = this.length; i < l; ++i) {
        if (u.hasOwnProperty(this[i])) {
          continue;
        }
        a.push(this[i]);
        u[this[i]] = 1;
      }
      return a;
    }
    var database = $.couch.db("userscorpusserveragain");
    var usersdatabase = $.couch.db("_users");
    database.allDocs({
      success: function(result) {
        //console.log(result);
        var data = result.rows;
        for (var couchdatum in data) {

          (function(userid) {

            database.openDoc(userid.id, {
              success: function(originalDoc) {
                if (!originalDoc.name) {
                  console.log("This is not a user ", originalDoc);
                  return;
                }
                var temp = originalDoc.roles.join(",") || "";
                if (temp) {
                  originalDoc.roles = temp.replace(/"/g, "").split(",");
                }

                usersdatabase.openDoc(userid.id, {
                  success: function(corpusdevDoc) {
                    var temp = corpusdevDoc.roles.join(",") || "";
                    if (temp) {
                      corpusdevDoc.roles = temp.replace(/"/g, "").split(",");
                    }
                    console.log(originalDoc.roles);
                    corpusdevDoc.roles = corpusdevDoc.roles.concat(originalDoc.roles);
                    corpusdevDoc.roles = corpusdevDoc.roles.getUnique();

                    console.log("Combined roles: ", corpusdevDoc.roles);

                    usersdatabase.saveDoc(corpusdevDoc, {
                      success: function(serverResults) {
                        console.log("combined roles for user " + originalDoc._id, JSON.stringify(originalDoc), JSON.stringify(corpusdevDoc));
                      },
                      error: function(serverResults) {
                        console.log("There was a problem combining the user doc. " + originalDoc._id, JSON.stringify(corpusdevDoc));
                      }
                    });
                  },
                  error: function(error) {
                    console.log("User is not on corpusdev ", error);
                    delete originalDoc._rev;
                    usersdatabase.saveDoc(originalDoc, {
                      success: function(serverResults) {
                        console.log("transfering user to corpusdev " + originalDoc._id);
                      },
                      error: function(serverResults) {
                        console.log("There was a problem saving the user doc to corpusdev. " + originalDoc._id, JSON.stringify(originalDoc));
                      }
                    });
                  }
                });

              },
              error: function(error) {
                console.log("Error opening your docs ", error);
              }
            });

          })(data[couchdatum]);

        }
      },
      error: function(error) {
        console.log("Error opening the database ", error);
      }
    });



  },

  mergeUserDocsFromTwoServers: function() {

    /*
    Merge users docs
     */
    var database = $.couch.db("zfielddbuserscouchcorpus");
    var usersdatabase = $.couch.db("zfielddbuserscouch");
    database.allDocs({
      success: function(result) {
        //console.log(result);
        var data = result.rows;
        for (var couchdatum in data) {

          (function(userid) {

            database.openDoc(userid.id, {
              success: function(originalDoc) {
                if (!originalDoc.username) {
                  console.log("This is not a user ", originalDoc);
                  return;
                }

                usersdatabase.openDoc(userid.id, {
                  success: function(corpusdevDoc) {
                    // corpusdevDoc.original_created_at = originalDoc.created_at;
                    // corpusdevDoc.original_email = originalDoc.email;
                    // corpusdevDoc.original_updated_at = originalDoc.updated_at;
                    // corpusdevDoc.original_appVersionWhenCreated = originalDoc.appVersionWhenCreated;
                    // corpusdevDoc.original_hash = originalDoc.hash;
                    // corpusdevDoc.original_salt = originalDoc.salt;
                    corpusdevDoc.serverlogs = corpusdevDoc.serverlogs || {};
                    corpusdevDoc.serverlogs.orignal_user = originalDoc;

                    console.log("Combined user: ", corpusdevDoc);

                    usersdatabase.saveDoc(corpusdevDoc, {
                      success: function(serverResults) {
                        console.log("combined user " + originalDoc._id, JSON.stringify(originalDoc), JSON.stringify(corpusdevDoc));
                      },
                      error: function(serverResults) {
                        console.log("There was a problem combining the user doc. " + originalDoc._id, JSON.stringify(corpusdevDoc));
                      }
                    });
                  },
                  error: function(error) {
                    console.log("User was not on corpusdev ", error);
                    originalDoc.oldrev = JSON.parse(JSON.stringify(originalDoc._rev));
                    delete originalDoc._rev;
                    usersdatabase.saveDoc(originalDoc, {
                      success: function(serverResults) {
                        console.log("transfering user to corpusdev " + originalDoc._id);
                      },
                      error: function(serverResults) {
                        console.log("There was a problem saving the user doc to corpusdev. " + originalDoc._id, JSON.stringify(originalDoc));
                      }
                    });
                  }
                });

              },
              error: function(error) {
                console.log("Error opening your docs ", error);
              }
            });

          })(data[couchdatum]);

        }
      },
      error: function(error) {
        console.log("Error opening the database ", error);
      }
    });



  },

  getUsersRevisionNumber: function() {


    /*
    Get users revision number
     */
    var database = $.couch.db("_users");
    var users = [];
    database.allDocs({
      success: function(result) {
        //console.log(result);
        var data = result.rows;
        for (var couchdatum in data) {
          database.openDoc(data[couchdatum].id, {
            success: function(originalDoc) {
              // console.log(originalDoc._rev);
              users.push(originalDoc.name + "," + originalDoc._rev);
            },
            error: function(error) {
              console.log("Error opening your docs ", error);
            }
          });
        }
      },
      error: function(error) {
        console.log("Error opening the database ", error);
      }
    });
    console.log(users.join("\n"));


    // writers only previledges
    var writersOnlyPriv = function(new_doc, old_doc, userCtx) {
      var userCanWrite = false;
      for (var roleIndex = 0; roleIndex < userCtx.roles.length; roleIndex++) {
        if (userCtx.roles[roleIndex] === userCtx.db + "_writer") {
          userCanWrite = true;
        }
        if (userCtx.roles[roleIndex] === "admin") {
          userCanWrite = true;
        }
        if (userCtx.roles[roleIndex] === "_admin") {
          userCanWrite = true;
        }
      }

      if (!userCanWrite) {
        throw ({
          "forbidden": "Not Authorized, you are not a writer on " + userCtx.db + ", you will have to ask " + userCtx.db.replace(/-.*/, "") + " to add you as a writer. You currently have these roles: " + userCtx.roles
        });
      }
    }



  },

  verifyActivityFeedsAndSecurityDocs: function() {

    /*
    verify all old corpora to have activity feeds and security docs
    */
    window.areUsersComplete = {};
    window.nonPracticeCorpora = [];
    $.couch.allDbs({
      success: function(results) {
        console.log(results);

        for (var db in results) {

          if (results[db].indexOf("public") > -1) {
            console.log("Skipping " + results[db]);
            continue;
          }
          (function(dbname) {
            var corpusname;
            if (dbname.indexOf("-") === -1) {
              console.log(dbname + "  is not a corpus or activity feed ");
              return;
            }
            var username = dbname.split("-")[0];
            areUsersComplete[username] = areUsersComplete[username] || {};
            var sourceDB = "";
            if (dbname.indexOf("activity_feed") > -1) {
              if (dbname.split("-").length >= 3) {
                sourceDB = "new_corpus_activity_feed";
                corpusname = dbname.replace(username + "-", "").replace("-activity_feed", "");
                areUsersComplete[username][corpusname] = areUsersComplete[username][corpusname] || {
                  corpora: [],
                  activity_feeds: []
                };
                areUsersComplete[username][corpusname].activity_feeds.push(dbname);
              } else {
                sourceDB = "new_user_activity_feed";
                areUsersComplete[username]["user_activity_feed"] = dbname;
              }
            } else {
              sourceDB = "new_corpus";
              corpusname = dbname.replace(username + "-", "");
              areUsersComplete[username][corpusname] = areUsersComplete[username][corpusname] || {
                corpora: [],
                activity_feeds: []
              };
              areUsersComplete[username][corpusname].corpora.push(dbname);
              if (dbname.indexOf("firstcorpus") === -1 && dbname.indexOf("test") === -1 && dbname.indexOf("devgina") === -1 && dbname.indexOf("nemo") === -1) {
                nonPracticeCorpora.push(dbname);
              }
            }
            console.log(dbname + " is a " + sourceDB);

            var database = $.couch.db(dbname);
            database.openDoc("_security", {
              success: function(serverResults) {
                if (serverResults && serverResults.admins) {
                  // console.log("not updating _security for " + dbname, JSON.stringify(serverResults));
                  return;
                }
                // console.log("_security for " + dbname, JSON.stringify(serverResults));
                var securitydoc;
                if (sourceDB === "new_user_activity_feed") {
                  // console.log("Creating a new_user_activity_feed security doc");
                  securitydoc = {
                    "admins": {
                      "names": [],
                      "roles": ["fielddbadmin"]
                    },
                    "members": {
                      "names": [username],
                      "roles": []
                    }
                  };
                } else if (sourceDB === "new_corpus_activity_feed" || sourceDB === "new_corpus") {
                  // console.log("Creating a new_corpus_activity_feed/new_corpus security doc");
                  var corpusPouchName = dbname.replace("-activity_feed", "");
                  securitydoc = {
                    "admins": {
                      "names": [],
                      "roles": [corpusPouchName + "_admin", "fielddbadmin"]
                    },
                    "members": {
                      "names": [],
                      "roles": [corpusPouchName + "_reader", corpusPouchName + "_writer", corpusPouchName + "_commenter"]
                    }
                  };
                }
                securitydoc._id = "_security";
                // console.log("Would save this for: " + dbname, JSON.stringify(securitydoc));
                database.saveDoc(securitydoc, {
                  success: function(serverResults) {
                    console.log("saved _security for " + dbname, JSON.stringify(securitydoc));
                  },
                  error: function(serverResults) {
                    console.log("There was a problem saving the _security." + dbname, JSON.stringify(securitydoc));
                  }
                });
              },
              error: function(error) {
                console.log("There was no security doc." + dbname, +JSON.stringify(error));
              }
            });

          })(results[db]);

        }
      },
      error: function(error) {
        console.log("Error getting db list", error);
      }
    });



  },

  verifyAllDbsHaveFieldDBAdminRole: function() {


    /*
    verify all databases have role of fielddbadmin
    */
    $.couch.allDbs({
      success: function(results) {
        console.log(results);

        for (var db in results) {

          if (results[db].indexOf("public") > -1) {
            console.log("Skipping " + results[db]);
            continue;
          }
          (function(dbname) {

            if (dbname.indexOf("-") === -1) {
              console.log(dbname + "  is not a corpus or activity feed ");
              return;
            }

            var database = $.couch.db(dbname);
            database.openDoc("_security", {
              success: function(securitydoc) {
                if (securitydoc && securitydoc.admins) {
                  securitydoc.admins.roles.push("fielddbadmin");
                  securitydoc.admins.names = [];
                  console.log("_security: " + dbname, JSON.stringify(securitydoc));
                  securitydoc._id = "_security";
                  database.saveDoc(securitydoc, {
                    success: function(serverResults) {
                      console.log("saved _security for " + dbname, JSON.stringify(securitydoc));
                    },
                    error: function(serverResults) {
                      console.log("There was a problem saving the _security." + dbname);
                    }
                  });
                } else {
                  console.log("This database is missing its _security" + dbname);
                }
              },
              error: function(error) {
                console.log("There was no security doc." + dbname, +JSON.stringify(error));
              }
            });

          })(results[db]);

        }
      },
      error: function(error) {
        console.log("Error getting db list", error);
      }
    });



  },

  convertACRAintoActivites: function() {


    /*
    Convert ACRA activities into fielddb activies
     */
    // var lastPosition = 1403805265615; // 1403792172786 // 1402818525880 // 1403792172786
    var userswhoarentregisteredyet = ["anonymous1402818226441", "anonymous1400736954477", "anonymous1399110330026", "anonymous1398813694591", "anonymous1398684166784", "anonymous1398352584238", "testinganonymous1397397203061", "anonymous1398067003561", "anonymous1397669513717", "anonymous1397933228605", "anonymous1397900222994", "anonymous1397886261314", "anonymous1397770209950", "testinganonymous1396545191821", "anonymous1397380321265", "anonymous1397330457860", "anonymous1397063619189", "anonymous1397038853807", "anonymous1397045636195", "anonymous1396806997435", "anonymous1401873037326", "anonymous1406914718135", "anonymous1406763577954", "anonymous1406297431603", "anonymous1406234565430", "anonymous1402474075836", "anonymous1405713207104", "anonymous1405713402347", "anonymous1404380629344", "anonymous1404965136766", "anonymous1404797396604", "anonymous1404357779017", "anonymous1407418050247", "anonymouskartulispeechrecognition1407415600066", "anonymouskartulispeechrecognition1407340889235", "anonymous1406189989271", "anonymous1406137962123", "anonymous1402771637598", "anonymous1404546617895", "anonymous1404543172048", "anonymous1404510294987", "anonymous1404477292397", "anonymous1404379286889", "anonymouskartulispeechrecognition1404251000382", "anonymous1403954098791", "anonymous1403820277996", "anonymous1403770114403", "anonymous1403695449072", "anonymous1403614517620", "anonymous1403215176702", "anonymous1401396176832", "anonymous1397372490908", "anonymous1396791663422", "anonymous1396717008518", "anonymous1409178041951", "anonymous1409083978482", "anonymous1409076300415", "anonymous1409059894468", "anonymous1408790883646", "anonymous1408786327026", "anonymous1408521814189", "anonymous1408491280401", "anonymous1407738363221", "anonymous1408093521792", "anonymous1407980250076", "anonymous1405161268203", "anonymous1403293874554", "anonymous1406620532197", "anonymous1415137904589", "anonymous1415130236236", "anonymous1414869108810", "anonymous1414520985437", "anonymous1414359340237", "anonymous1414608957461", "anonymous1413891761722", "anonymous1412105474663", "anonymous1413623812125", "anonymous1413543115674", "anonymous1413307565297", "anonymous1411160635506", "anonymous1412956621924", "anonymous1412674529466", "anonymous1402993216329", "anonymous1412160235747", "anonymous1411977674968", "anonymous1409316294803", "anonymous1410577417533", "anonymous1411779581625", "anonymous1411722112693", "anonymous1409660863084", "anonymous1410865935416", "anonymous1409632984145", "anonymous1409337615049", "anonymous1399557384107", "anonymous1402269371238"];
    var database = $.couch.db("acra-learnx");
    var limit = 4000;
    var saved = 0;
    database.view("fielddb/activities?limit=" + limit, {
      // database.view("fielddb/activities", {
      success: function(actvities) {
        // console.log(actvities.rows);
        actvities.rows.map(function(row) {
          // if (saved > limit) {
          //   return;
          // }
          saved += 1;
          var activity = row.value;
          if (!activity || !activity._id) {
            console.warn("This entry has no id! very strange ", row);
            return;
          }

          // if (activity.timestamp < lastPosition) {
          // return;
          // }
          var pouchname = activity.pouchname;
          // console.log(pouchname);
          delete activity.pouchname;
          // console.log(pouchname);
          // if (!pouchname) {
          //   console.log(row);
          // }
          // return;
          var activityDB = $.couch.db(pouchname);
          activity.originalId = activity._id + "";
          activity.originalRev = activity._rev + "";

          //remove old activities, instead go through each activity feed since we cant find all all the versions here
          if (false && activity._rev.indexOf("3-") === 0) {
            activityDB.openDoc(activity._id, {
              success: function(serverResults) {
                console.log("found duplicate activity for " + serverResults._id + " rev: " + serverResults._rev);
              },
              error: function(serverResults) {
                // console.log("There was a problem removing the activity." + activity._id);
              }
            });
            activityDB.openDoc(activity._id + activity._rev, {
              success: function(serverResults) {
                console.log("found duplicate activity for " + serverResults._id + " rev: " + serverResults._rev);
              },
              error: function(serverResults) {
                // console.log("There was a problem removing the activity." + activity._id);
              }
            });
          }

          activity._id = activity._id + "_rev_" + activity._rev;
          delete activity._rev;
          activityDB.saveDoc(activity, {
            success: function(serverResults) {
              console.log("saved activity for " + pouchname, JSON.stringify(serverResults));
              if (activity.teamOrPersonal === "personal") {
                activity._id = activity.originalId;
                activity._rev = activity.originalRev;
                database.removeDoc(activity, {
                  success: function(serverResults) {
                    console.log("removed activity for " + activity.originalId + " rev: " + activity.originalRev);
                  },
                  error: function(serverResults) {
                    console.log("There was a problem removing the activity." + activity._id);
                  }
                });
              }
            },
            error: function(serverResults) {
              console.log("There was a problem saving the activity.", serverResults);
              if (serverResults !== 409) {
                console.log(activity);
              } else {
                console.log("Conflict saving", serverResults);
              }

              if (serverResults === 404) {
                if (userswhoarentregisteredyet.indexOf(activity.user.username) < 0) {
                  userswhoarentregisteredyet.push(activity.user.username);
                }
              }
            }
          });
        });

      },
      error: function(error) {
        console.log("Couldnt open the activities view ", +JSON.stringify(error));
      }
    });



  },

  moveSpeechRecognitionActivities: function() {

    /*
    Move activites that are in communtiy georgian but should be in speech recognition

    "debugging/activities_which_are_suposedt_to_be_inspeechrec":

    function(doc) {
      try {
        if (doc.collection === "activities" || doc.teamOrPersonal) {
          if (doc.appVersion === "2.4.1" || doc.appVersion === "2.4.0") {
            var usersactivitydb = doc.user.username + "-firstcorpus-activity_feed"
            emit(usersactivitydb, doc);
          }
        }
      } catch (e) {
        emit(doc, e);
      }
    };


    */
    var database = $.couch.db("community-georgian-activity_feed");
    var activityDB = $.couch.db("speechrecognition-kartuli-activity_feed");
    var limit = 400;
    database.view("debugging/activities_which_are_suposedt_to_be_inspeechrec?limit=" + limit, {
      // database.view("fielddb/activities", {
      success: function(actvities) {
        // console.log(actvities.rows);
        actvities.rows.map(function(row) {

          var usersactivitydb = row.key;
          var activity = row.value;
          $.ajax({
            url: "/" + usersactivitydb + "/" + activity._id,
            dataType: "json",
            success: function(doc) {
              console.log("The users activity was fine.");

              $.ajax({
                url: "/speechrecognition-kartuli-activity_feed/" + activity._id,
                dataType: "json",
                success: function(doc) {
                  console.log("The team activity was fine.");
                },
                error: function(error) {
                  console.log("The team activity was missing, saving it. ", activity._id);
                  delete activity._rev;
                  activityDB.saveDoc(activity, {
                    success: function(serverResults) {
                      console.log("saved activity  ", JSON.stringify(serverResults));
                      database.removeDoc(activity, {
                        success: function(serverResults) {
                          console.log("removed activity  ");
                        },
                        error: function(serverResults) {
                          console.log("There was a problem removing the activity." + activity._id);
                        }
                      });
                    },
                    error: function(serverResults) {
                      console.log("There was a problem saving the activity.", serverResults);
                      if (serverResults !== 409) {
                        console.log(activity);
                      } else {
                        console.log("Conflict saving", serverResults);
                      }
                    }
                  });

                }
              });

            },
            error: function(error) {
              console.log("The users activity was missing", error);
            }
          });

        });
      },
      error: function(error) {
        console.log("Couldnt open the activities view ", +JSON.stringify(error));
      }
    });

    /*
      Recover all deleted ACRA activities
      http://garmoncheg.blogspot.ca/2013/11/couchdb-restoring-deletedupdated.html
      http://stackoverflow.com/questions/4273140/couchdb-changes-notifications-jquery-couch-js-couch-app-db-changes-usage
     */
    database = $.couch.db("acra-learnx");
    limit = 2000;
    var saved = 0;
    $.ajax({
      url: "/acra-learnx/_changes",
      dataType: "json",
      success: function(docs) {
        console.log("All docs ", docs);
        docs.results.map(function(details) {
          if (!details.deleted) {
            return;
          }
          if (details.id.indexOf("design") > -1) {
            return;
          }
          if (saved > limit) {
            return;
          }
          saved += 1;
          var id = details.id;
          // console.log("Found a deleted document. Getting its revisions", id);
          $.ajax({
            url: "/acra-learnx/" + id + "?revs=true&open_revs=all",
            success: function(revs) {
              var json = revs.replace(/^[^{]*{/, "{").replace(/\}\}[^}]*$/, "}}");
              try {
                json = JSON.parse(json);
              } catch (e) {
                console.log("unexpected reply from server " + revs, e);
                return;
              }
              if (json._revisions.length > 2) {
                console.warn("This id is strange, it has many revisions.  Not undeleting it.", json);
                return;
              }
              var rev = "1-" + json._revisions.ids[1];
              console.log("All revs ", json, " recovering rev " + rev);
              $.ajax({
                url: "/acra-learnx/" + id + "?rev=" + rev,
                dataType: "json",
                success: function(doc) {
                  // console.log("Recovered doc", doc);
                  doc._rev = json._rev;
                  database.saveDoc(doc, {
                    success: function(serverResults) {
                      console.log("Undeleted doc  ", JSON.stringify(serverResults));
                    },
                    error: function(serverResults) {
                      console.log("There was a problem undeleting the doc.", json, serverResults);
                    }
                  });

                },
                error: function(error) {
                  console.log("Couldnt get doc ", error);
                }
              });
            },
            error: function(error) {
              console.log("Couldnt get doc's revision ", error);
            }
          });
        });
      },
      error: function(error) {
        console.log("Couldnt open all docs ", JSON.stringify(error));
      }
    });

    /* Remove duplicates from Acra activity conversion */
    var database = $.couch.db("community-georgian-activity_feed");
    var limit = 4;
    database.view("debugging/remove-duplicates?limit=" + limit, {
      success: function(actvities) {
        // console.log(actvities.rows);
        actvities.rows.map(function(row) {
          console.log("Would remove ", row.value);
          database.removeDoc(row.value, {
            success: function(serverResults) {
              console.log("removed duplicate activity ", serverResults);
            },
            error: function(serverResults) {
              console.log("There was a problem removing the duplicate activity." + row);
            }
          });
        })
      },
      error: function(error) {
        console.log("Couldnt open all duplicates ", JSON.stringify(error));
      }
    });



  },

  makeingSureSpeechRecognitionActivtiesAreInTheCentralActivites: function() {


    /*
    Make sure all speech rec activities are in the central activities too
    */
    /*
    Verify corpus doc
     */
    var targetpouchname = "speechrecognition-kartuli-activity_feed";
    var targetdatabase = $.couch.db(targetpouchname);
    $.couch.allDbs({
      success: function(results) {
        console.log(results);
        results.map(function(dbname) {
          if (dbname.indexOf("activity_feed") === -1) {
            // console.log("This db is not an activity feed " + dbname);
            return;
          }
          if (dbname.indexOf("kartulispeechrec") === -1) {
            // console.log("This db is not a speech recognition user " + dbname);
            return;
          }
          if (dbname.indexOf("firstcorpus") === -1) {
            // console.log("This db is not a speech recognition user's activity for the corpus " + dbname);
            return;
          }
          console.log("This is a speech recognition user " + dbname);
          var database = $.couch.db(dbname);
          database.allDocs({
            success: function(result) {
              //console.log(result);
              result.rows.map(function(row) {
                database.openDoc(row.id, {
                  success: function(originalDoc) {
                    console.log(originalDoc.pouchname);
                    if (!originalDoc.teamOrPersonal) {
                      return;
                    }
                    originalDoc.pouchname = targetpouchname;
                    targetdatabase.saveDoc(originalDoc, {
                      success: function(serverResults) {
                        console.log("saved activity in central activities " + originalDoc._id);
                      },
                      error: function(serverResults) {
                        console.log("There was a problem saving the doc." + originalDoc._id);
                      }
                    });

                  },
                  error: function(error) {
                    console.log("Error opening database's docs ", error);
                  }
                });
              });

            },
            error: function(error) {
              console.log("Error opening the database ", error);
            }
          });


        });
      },
      error: function(error) {
        console.log("Error getting db list", error);
      }
    });



  },

  importGeorgianPhrases: function() {


    /*
    Import ilanguages.org georgian phrase data
     */

    $("td").map(function() {
      var datum = {
        utterance: $(this).find("b").text() || "",
        translation: $(this).find("big").text() || "",
        orthography: $(this).find("dfn").text() || "",
        audioFile: $(this).find("a")[0].href || ""
      };
      datum.utterance = datum.utterance.replace(/[\[\]]/g, "");
      datum.audioFile = datum.audioFile.substring(datum.audioFile.lastIndexOf("/") + 1);
      console.log(datum.utterance + "\n" + datum.translation + "\n" + datum.orthography + "\n" + datum.audioFile + "\n\n\n");
    });

  }
};

/*
Selected replication to the sample database for the Android app
 */
//$ curl -X POST $TARGET/_replicate -d '{"source":"$SOURCE/my-georgian","target":"$TARGET/community-georgian", "doc_ids":["3328d6a49281e117e859adddcd006168", "3328d6a49281e117e859adddcd006ddf", "3328d6a49281e117e859adddcd009369", "3328d6a49281e117e859adddcd026851", "723a8b707e579087aa36c2e338eafe05", "723a8b707e579087aa36c2e338eb17ec", "723a8b707e579087aa36c2e338eb33b4", "723a8b707e579087aa36c2e338eb9be4", "723a8b707e579087aa36c2e338ecdb4c", "eff8773970b2ebbf958af417890112ab", "eff8773970b2ebbf958af41789013154", "eff8773970b2ebbf958af41789014953", "eff8773970b2ebbf958af4178901877a", "eff8773970b2ebbf958af4178901a406", "eff8773970b2ebbf958af4178901df96", "eff8773970b2ebbf958af41789021a92"]}'  -H "Content-Type: application/json"
