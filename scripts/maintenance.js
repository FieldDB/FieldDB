$.couch.allDbs({
    success: function(results) {
        console.log(results);
        for(var db in results){

            (function(dbname){
                if(dbname.indexOf("activity_feed") > -1){
                    return;
                }
                var database = $.couch.db(dbname);
                database.openDoc("_design/pages", {
                    success: function(results) {
                        console.log(results._rev + " in "+  dbname);

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