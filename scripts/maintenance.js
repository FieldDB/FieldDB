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


var template_corpus_doc = function() {
    return {
        "_id": "corpus",
        "title": "Private Corpus",
        "titleAsUrl": "private_corpus",
        "description": "The details of this corpus are not public.",
        "couchConnection": {
            "protocol": "https://",
            "domain": "corpusdev.lingsync.org",
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
                    console.log("This db is not a corpus " + dbname);
                    return;
                }
                var localdbname = dbname;
                var database = $.couch.db(dbname);

                var saveCorpusDoc = function(corpusDoc, localdbname) {
                    corpusDoc.couchConnection.pouchname = localdbname;
                    corpusDoc.pouchname = localdbname;
                    database.saveDoc(corpusDoc, {
                        success: function(serverResults) {
                            console.log("Saved corpus doc for " + localdbname);
                        },
                        error: function(serverResults) {
                            console.log("There was a problem saving the doc." + localdbname);
                        }
                    });
                };

                var updateCorpusDoc = function(corpusDoc, localdbname) {
                    database.view("pages/private_corpuses", {
                        success: function(results) {
                            var corpusid = "";
                            try {
                                corpusid = results.rows[0].value._id;
                            } catch (e) {
                                console.log("Corpus is pretty broken: " + localdbname);
                                return;
                            }
                            console.log("Corpus id " + corpusid);
                            corpusDoc.couchConnection.corpusid = corpusid;
                            saveCorpusDoc(corpusDoc, localdbname);
                        },
                        error: function(error) {
                            console.log("Error getting a private corpus doc", error);
                            saveCorpusDoc(corpusDoc, localdbname);
                        }
                    });
                };

                database.openDoc("corpus", {
                    success: function(results) {
                        var doUpdate = false;
                        try {
                            console.log(results.couchConnection.corpusid + " corpus doc is in " + dbname);
                            if (!results.couchConnection.corpusid) {
                                doUpdate = true;
                            }
                        } catch (e) {
                            console.log("There was a problem looking up the corpus id");
                            doUpdate = true;
                            results.couchConnection = {
                                "protocol": "https://",
                                "domain": "corpusdev.lingsync.org",
                                "port": "443",
                                "pouchname": "default",
                                "path": "",
                                "corpusid": ""
                            };
                        }

                        if (doUpdate) {
                            updateCorpusDoc(results, localdbname);
                        }
                    },
                    error: function(error) {
                        console.log("Error getting a corpus doc, creating one", error);
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




/*
Replicate all databases
 */
$.couch.urlPrefix = "https://corpus.lingsync.org"
$.couch.allDbs({
    success: function(results) {
        console.log(results);
        for (var db in results) {

            (function(dbname) {
                if (dbname.indexOf("-") === -1) {
                    console.log(dbname + "  is not a corpus or activity feed ");
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
                console.log(dbname + " is a " + sourceDB);

                $.couch.replicate(dbname, "https://admin:none@corpusdev.lingsync.org/"+dbname, {
                    success: function(result) {
                        console.log(dbname, result);
                    },
                    error: function(error) {
                        console.log("Error replicating to db" + dbname, error);
                    }
                });
            })(results[db]);

        }
    },
    error: function(error) {
        console.log("Error getting db list", error);
    }
});


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
                if (sourceDB != "new_user_activity_feed") {
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
                        if (securitydoc.admins && securitydoc.admins.names) {
                            var temp = securitydoc.admins.names.join(",") || "";
                            if (temp)
                                securitydoc.admins.names = temp.replace(/"/g, "").split(",");
                        }
                        if (securitydoc.admins && securitydoc.admins.roles) {
                            var temp = securitydoc.admins.roles.join(",") || "";
                            if (temp)
                                securitydoc.admins.roles = temp.replace(/"/g, "").split(",");
                        }
                        if (securitydoc.members && securitydoc.members.names) {
                            var temp = securitydoc.members.names.join(",") || "";
                            if (temp)
                                securitydoc.members.names = temp.replace(/"/g, "").split(",");
                        }
                        if (securitydoc.members && securitydoc.members.roles) {
                            /* Add the commenter role */
                            if (securitydoc.members.roles.length > 0 && securitydoc.members.roles.indexOf(dbname + "-commenter") == -1) {
                                securitydoc.members.roles.push(dbname + "-commenter");
                            }
                            var temp = securitydoc.members.roles.join(",") || "";
                            if (temp.indexOf('"') > -1) {
                                console.log("Found a corpus that needed to be updated: " + dbname);
                            } else {
                                console.log("This corpus didnt need to be updated: " + dbname);
                            }
                            if (temp)
                                securitydoc.members.roles = temp.replace(/"/g, "").replace("collaborator", "reader").replace("contributor", "writer").split(",");
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
                    if (temp)
                        originalDoc.roles = temp.replace(/"/g, "").split(",");
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
Merge users roles
 */
Array.prototype.getUnique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
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
                        if(!originalDoc.name){
                            console.log("This is not a user ",originalDoc);
                            return;
                        }
                        var temp = originalDoc.roles.join(",") || "";
                        if (temp)
                            originalDoc.roles = temp.replace(/"/g, "").split(",");

                        usersdatabase.openDoc(userid.id, {
                            success: function(corpusdevDoc) {
                                var temp = corpusdevDoc.roles.join(",") || "";
                                if (temp)
                                    corpusdevDoc.roles = temp.replace(/"/g, "").split(",");
                                console.log(originalDoc.roles);
                                corpusdevDoc.roles = corpusdevDoc.roles.concat(originalDoc.roles);
                                corpusdevDoc.roles = corpusdevDoc.roles.getUnique();

                                console.log("Combined roles: " , corpusdevDoc.roles);

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
                        if(!originalDoc.username){
                            console.log("This is not a user ",originalDoc);
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

                                console.log("Combined user: " , corpusdevDoc);

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