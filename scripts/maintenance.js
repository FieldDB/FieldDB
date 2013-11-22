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


$.couch.allDbs({
    success: function(results) {
        console.log(results);
        for (var db in results) {

            (function(dbname) {
                if (dbname.indexOf("-") === -1) {
                    console.log("This db is not a corpus or activity feed " + dbname);
                    return;
                }
                var sourceDB = "activity_feed";
                if (dbname.indexOf("activity_feed") > -1) {
                    sourceDB = "new_corpus";
                }

                $.couch.replicate("new_corpus", dbname, {
                    success: function(result) {
                        console.log(dbname, result);
                    },
                    error: function(error) {
                        console.log("Error deploying " + sourceDB + "app to db" + dbname, error);
                    }
                });
            })(results[db]);

        }
    },
    error: function(error) {
        console.log("Error getting db list", error);
    }
});



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