var UserMask = require("fielddb/api/user/UserMask").UserMask;

var getUserMask = function getUserMask(userId) {
  userId = sanitizeAgainstInjection(userId);
  if (!userId) {
    res.status(404);
    res.redirect("404.html")
    return;
  }

  var df = Q.defer();
  var usersdb = nano.db.use(node_config.usersDbConnection.dbname);

  usersdb.get(userId, function(error, result) {
    if (error) {
      console.log(new Date() + " user was missing " + userId, error);
      df.reject(new Error(error));
    } else {
      if (!result) {
        console.log(new Date() + " user was empty " + userId, error);
        df.resolve({});
      } else {

        //console.log(" using commonjs user " + userId);

        result = new UserMask(result);
        // //console.log("Showing the users public mask ", result.version);
        if (!result.userMask) {
          result.userMask = {};
        }
        result.userMask.corpora = result.corpora;
        // result.corpora = result.corpora || result.corpuses;
        // delete result.corpuses;
        console.log(new Date() + " getting the user " + userId + " their current corpora ", result.corpora.length);
        // for (database in result.corpora) {
        //   result.corpora[database].gravatar = md5(result.corpora[database].dbname);
        // }
        // result.firstname = result.firstname || "";
        // result.lastname = result.lastname || "";
        // result.subtitle = result.subtitle || result.firstname + ' ' + result.lastname;
        // 
        if (result.dateCreated) {
          year = new Date(result.dateCreated).getFullYear();
          if (year < new Date().getFullYear()) {
            result.userMask.startYear = " " + year + " - ";
          }
        }
        //console.log("Calculating users start year for the copyright statement" + result.dateCreated + " startYear" + result.userMask.startYear);
        df.resolve(result.userMask);
      }
    }
  });

  return df.promise;

};

exports.getUserMask = getUserMask;
