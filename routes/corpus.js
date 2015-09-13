var CorpusMask = require("fielddb/api/corpus/CorpusMask").CorpusMask;
var Connection = require("fielddb/api/corpus/Connection").Connection;


var processCorpusPageParams = function(req, res) {

  var dbname = req.params.dbname;

  var promiseForCorpus = getCorpusFromDbname(dbname);
  if (!promiseForCorpus) {
    res.status(404);
    res.redirect("404.html")
    return;
  }

  promiseForCorpus.then(function(result) {
      result.corpus.copyright = result.corpus.copyright || result.team.username;
      if (result.corpus.copyright.indexOf("Add names of the copyright holders") > -1) {
        result.corpus.copyright = result.team.username;
      }
      if (result.corpus.dateCreated) {
        year = new Date(result.corpus.dateCreated).getFullYear();
        if (year < new Date().getFullYear()) {
          result.corpus.copyright = result.corpus.copyright + " " + year + " - ";
        }
      }
      // var defaultLicense = {
      //   title: "Creative Commons Attribution-ShareAlike (CC BY-SA).",
      //   humanReadable: "This license lets others remix, tweak, and build upon your work even for commercial purposes, as long as they credit you and license their new creations under the identical terms. This license is often compared to “copyleft” free and open source software licenses. All new works based on yours will carry the same license, so any derivatives will also allow commercial use. This is the license used by Wikipedia, and is recommended for materials that would benefit from incorporating content from Wikipedia and similarly licensed projects.",
      //   link: "http://creativecommons.org/licenses/by-sa/3.0/"
      // };
      // if (!result.corpus.license || typeof result.corpus.license == "string") {
      //   result.corpus.license = defaultLicense;
      // }
      // result.corpus.license.title = result.corpus.license.title.replace(/Default:/, "");
      // console.log(result.corpus.license);
      // var defaultTerms = {
      //   humanReadable: "Sample terms of use: The materials included in this corpus are available for research and educational use. If you want to use the materials for commercial purposes, please notify the author(s) of the corpus (myemail@myemail.org) prior to the use of the materials. Users of this corpus can copy and redistribute the materials included in this corpus, under the condition that the materials copied/redistributed are properly attributed.  Modification of the data in any copied/redistributed work is not allowed unless the data source is properly cited and the details of the modification is clearly mentioned in the work. Some of the items included in this corpus may be subject to further access conditions specified by the owners of the data and/or the authors of the corpus."
      // };
      // if (!result.corpus.termsOfUse) {
      //   if (result.corpus.terms && typeof result.corpus.terms !== "string") {
      //     result.corpus.termsOfUse = result.corpus.terms;
      //   } else {
      //     result.corpus.termsOfUse = defaultTerms;
      //   }
      // }
      // if (result.corpus.terms) {
      //   delete result.corpus.terms;
      // }

      var data = {
        corpora: [result.corpus],
        // ghash: result.team.gravatar,
        user: result.team
      };
      res.render('corpus', data);
    })
    .fail(function(error) {
      console.log(new Date() + " there was a problem getCorpusFromDbname in route /db/:dbname" + error);
      if (dbname.indexOf("public") > -1) {
        res.redirect("404.html");
      } else {
        res.redirect('/public');
      }
    })
    .done();

};

/*
 * Promise handlers
 */

function sanitizeAgainstInjection(id) {
  if (!id || !id.indexOf || !id.toLowerCase) {
    return;
  }

  if (id.indexOf('.js') === id.length - 3 ||
    id.indexOf('+') > -1 ||
    id.indexOf('?') > -1 ||
    id.indexOf('=') > -1 ||
    id.indexOf(',') > -1 ||
    id.indexOf('.txt') === id.length - 4 ||
    id.indexOf('.php') === id.length - 4 ||
    id.indexOf('html') === id.length - 4) {

    console.log(new Date() + ' evil attempt on server to open ' + id + ' sending 404 instead');
    return false;
  }

  var sanitized = id.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  if (sanitized !== id.toLowerCase()) {
    console.log(new Date() + ' potentially evil attempt on server to open ' + id + ' sending 404 instead');
    return false;
  }
  return sanitized;
}

var getData = function getData(res, user, corpus) {

  user = sanitizeAgainstInjection(user);
  if (user === false) {
    res.status(404);
    res.redirect("404.html")
    return;
  }
  corpus = sanitizeAgainstInjection(corpus);
  if (corpus === false) {
    res.status(404);
    res.redirect("404.html")
    return;
  }


  var usersMask = {};

  getUser(user)
    .then(function(userdetails) {
      usersMask = userdetails;
      return getRequestedCorpus(userdetails.corpora, corpus, user);
    })
    .then(function(result) {
      // result = new CorpusMask(result);
      // var ghash = md5(userdetails.email);
      var data = {
        corpora: result,
        // ghash: ghash,
        user: usersMask
      };
      var template = corpus ? 'corpus' : 'user';
      //console.log("rendering the data", util.inspect(data));
      res.render(template, data);
    })
    .fail(function(error) {
      console.log(new Date() + " couldnt get the user " + error.message);
      if (error && error.message && (error.message.indexOf("ror happened in your connect") > -1 || error.message.indexOf("ame or password is incorre") > -1)) {
        res.status(500);
        res.send("<script> window.setTimeout(function(){\nalert('The server is currently unable to serve your request: code 71921. Please notify us of this erorr code, or check again later. Taking you to the contact us form...');\n window.location.href='https://docs.google.com/forms/d/18KcT_SO8YxG8QNlHValEztGmFpEc4-ZrjWO76lm0mUQ/viewform'; },100);</script>  ");
        return;
      }
      if (error && error.message === "missing" && user !== "public") {
        console.log(new Date() + " user " + user + "was missing, redirecting to the public user");
        res.redirect("/public)")
        return;
      }

      console.log(new Date() + " There was an error on this server, we are unable to take the user to the public user. ");
      res.status(404);
      res.redirect("404.html")
      return;
    })
    .done();

};


var getCorpusMask = function(dbname) {
  dbname = sanitizeAgainstInjection(dbname);
  if (!dbname) {
    res.status(404);
    res.redirect("404.html")
    return;
  }

  var df = Q.defer();
  var corpusdb = nano.db.use(dbname);
  var result = {};

  corpusdb.get('corpus', function(error, corpus) {
    if (error) {
      console.log(new Date() + " corpus was missing " + dbname);
      df.reject(new Error(error));
    } else {
      if (!corpus) {
        console.log(new Date() + " corpus was empty " + dbname);
        df.resolve({});
      } else {
        //console.log(" using commonjs for corpusmask " + dbname);

        corpus = new CorpusMask(corpus);
        // corpus.gravatar = corpus.gravatar || md5(dbname);
        result.corpus = corpus;
        //console.log("Gettign team");
        corpusdb.get('team', function(error, team) {
          if (error) {
            console.log(new Date() + " team was missing " + dbname);
            df.reject(new Error(error));
          } else {
            if (!team) {
              console.log(new Date() + " team was empty " + dbname);

              result.team = {};
              df.resolve(result);
            } else {
              //console.log(" Using commonjs team ", dbname);

              team = new Team(team);
              // if (!team.gravatar || team.gravatar.indexOf("anonymousbydefault") > -1) {
              //   if (team.email) {
              //     team.gravatar = md5(team.email);
              //   } else {
              //     team.gravatar = md5(dbname);
              //   }
              // }
              // team.subtitle = team.subtitle || team.firstname + ' ' + team.lastname;
              result.team = team;
              df.resolve(result);
            }
          }
        });

      }
    }
  });

  return df.promise;

}


var getCorpus = function getCorpus(dbname, titleAsUrl, corpusid) {

  dbname = sanitizeAgainstInjection(dbname);
  if (!dbname) {
    res.status(404);
    res.redirect("404.html")
    return;
  }
  titleAsUrl = sanitizeAgainstInjection(titleAsUrl);
  if (titleAsUrl === false) {
    res.status(404);
    res.redirect("404.html")
    return;
  }
  corpusid = sanitizeAgainstInjection(corpusid);
  //console.log("The corpus id" + corpusid);
  if (corpusid === false) {
    res.status(404);
    res.redirect("404.html")
    return;
  }

  var df = Q.defer();
  var corpusdb = nano.db.use(dbname);
  var doc = corpusid;
  var showPublicVersion = true;
  if (showPublicVersion) {
    doc = 'corpus';
  }
  //console.log("Getting corpus public mask");
  corpusdb.get(doc, function(error, result) {
    if (error) {
      console.log(new Date() + " there was a problem getting corpusdb", error);
      df.reject(new Error(error));
    } else {
      if (!result) {
        console.log(new Date() + 'No result', result);
        df.reject(new Error('No result'));
      } else {
        result = new CorpusMask(result);
        //console.log(" Recieved result corpus mask");
        df.resolve(result);
      }
    }
  });

  return df.promise;

}

function getRequestedCorpus(corporaCollection, titleAsUrl, corpusowner) {

  var df = Q.defer();
  var resultingPromises = [];

  corporaCollection.map(function(connection) {
    resultingPromises.push(getCorpus(connection.dbname, titleAsUrl, connection.corpusid))
  });

  //console.log("Requested corpus masks " + resultingPromises.length);
  Q.allSettled(resultingPromises)
    .then(function(results) {

      results = results.map(function(result) {
        if (result.state === 'fulfilled') {
          //console.log(" Got back a corpus mask for " + result.value.dbname);
          if (!result.value.connection) {
            result.value.connection = corporaCollection[result.value.dbname];
          }
          // corporaCollection[value.dbname] = value;
          // corporaCollection[value.dbname] 
          // // var value = new CorpusMask(result.value);
          // result.value.connection.gravatar = result.value.connection.gravatar || md5(result.value.dbname)
          result.value.corpuspage = corpusowner + '/' + result.value.titleAsUrl + '/' + result.value.dbname;
          return result.value
        } else {
          console.log(new Date() + " One of the corpora had no corpus document." + corpusowner)
          return new CorpusMask({
            corpuspage: corpusowner + '/Unknown/' + corpusowner + '-firstcorpus',
            title: 'Unknown',
            dbname: corpusowner + '-firstcorpus',
            connection: corporaCollection[corpusowner + '-firstcorpus'],
            gravatar: "",
            description: 'Private corpus'
          });
        }
      });

      // for (corpus in corporaCollection) {
      //   //console.log("Processing corpus", corporaCollection[corpus]);
      //   corporaCollection[corpus] = new CorpusMask({
      //     connection: corporaCollection[corpus]
      //   });

      //   // {
      //   //   corpuspage: corpusowner + '/Unknown/' + corpusowner + '-firstcorpus',
      //   //   title: 'Unknown',
      //   //   gravatar: md5(corporaCollection[corpus].dbname),
      //   //   description: 'Private corpus'
      //   // };

      // }
      df.resolve(results);
    }).done(function() {
      //console.log("done promises");
    });

  return df.promise;

}


exports.getCorpusMask = getCorpusMask;
