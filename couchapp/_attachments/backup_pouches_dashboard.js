// Set the RequireJS configuration
require.config({
  paths : {
    /* Bootstrap user interface javascript files */
    "bootstrap" : "libs/bootstrap/js/bootstrap.min",

    "crypto" : "libs/Crypto_AES",

    /* jQuery and jQuery plugins */
    "jquery" : "libs/jquery",

    /* Handlebars html templating libraries and compiled templates */
    "compiledTemplates" : "libs/compiled_handlebars",
    "handlebars" : "libs/handlebars.runtime",

    /* Backbone Model View Controller framework and its plugins and dependencies */
    "backbone" : "libs/backbone",
    "backbone_pouchdb" : "libs/backbone-pouchdb",
    "backbone_couchdb" : "libs/backbone-couchdb",
    "pouch" : "libs/pouch.alpha",
    "underscore" : "libs/underscore",

    "terminal" : "libs/terminal/terminal",

    "text" : "libs/text",

    "xml2json" : "libs/xml2json",

    "oprime" : "libs/OPrime",
    "webservicesconfig" : "libs/webservicesconfig_devserver"
  },
  shim : {
    "underscore" : {
      exports : "_"
    },

    "jquery" : {
      exports : "$"
    },

    "xml2json" : {
      deps : [ "jquery" ],
      exports : "X2JS"
    },

    "oprime" : {
      exports : "OPrime"
    },
    "webservicesconfig" : {
      deps : [ "oprime" ],
      exports : "OPrime"
    },

    "bootstrap" : {
      deps : [ "jquery" ],
      exports : "bootstrap"
    },

    "pouch" : {
      exports : "Pouch"
    },
    "backbone" : {
      deps : [ "underscore", "bootstrap", "compiledTemplates" ],
      exports : "Backbone"
    },
    "backbone_pouchdb" : {
      deps : [ "backbone", "pouch", "backbone_couchdb" ],
      exports : "Backbone"
    },
    "backbone_couchdb" : {
      deps : [ "backbone", "pouch" ],
      exports : "Backbone"
    },

    "handlebars" : {
      deps : [ "bootstrap", "jquery" ],
      exports : "Handlebars"
    },

    "crypto" : {
      exports : "CryptoJS"
    },

    "compiledTemplates" : {
      deps : [ "handlebars" ],
      exports : "Handlebars"
    },
    "terminal" : {
      deps : [ "bootstrap", "jquery" ],
      exports : "Terminal"
    }
  }
});

// Initialization
require(
    [ "backbone_pouchdb", "oprime" ],
    function(forcingpouchtoloadearly, OPrime) {

      $('#dashboard_loading_spinner')
          .html(
              "<img class='spinner-image' src='images/loader.gif'/><p class='spinner-status'>Preparing for version 1.40...</p>");
      $('.spinner-image').css({
        'width' : function() {
          return ($(document).width() * .1) + 'px';
        },
        'height' : function() {
          return ($(document).width() * .1) + 'px';
        },
        'padding-top' : '10em'
      });
      window.username = localStorage.getItem("username_to_update");

      window.databasesThatDontNeedReplication = "sapir-firstcorpus,sapir-activity_feed,lingllama-firstcorpus-activity_feed,lingllama-firstcorpus, lingllama-cherokee-activity_feed,lingllama-cherkoee,lingllama-activity_feed,lingllama-firstcorpus-activity_feed,null,undefined,public-firstcorpus,public-activity_feed,public-firstcorpus-activity_feed,publicuser,default,null,length".split(",");
      window.actuallyReplicatedPouches = [];

      window.waitForPouchesList = function() {
        if (pouchesRequest.readyState != "done") {
          window.setTimeout(window.waitForPouchesList, 5000);
        } else {
          if (pouchesRequest.result) {
            window.backupPouches(pouchesRequest.result);
          }
        }
      };

      window.backupPouches = function(pouches) {
        console.log("Got the pouches: ", pouches);
        $("#dashboard_loading_spinner").append(
            "<h2>Backing up " + pouches.length + " databases</h2>");

        /* for each pouch, identify its remote, and begin replicating to it. */
        window.currentPouch = 0;
        window.pouches = pouches;
        if (window.currentPouch < window.pouches.length) {
          backupPouch(pouches[window.currentPouch]);
        } else {
          window.finishedReplicating();
        }
      };

      window.backupPouch = function(pouchname) {
        /* Ignore pouches that don't need to be replicated */
        if (window.databasesThatDontNeedReplication.indexOf(pouchname) >= 0) {
          /* Go to the next pouch */
          window.currentPouch++;
          if (window.currentPouch < window.pouches.length) {
            window.backupPouch(window.pouches[window.currentPouch]);
          }
        }
        try{
        
        Pouch.replicate('idb://' + pouchname,
            'https://corpusdev.lingsync.org/' + pouchname, {
              complete : function() {
                $("#dashboard_loading_spinner").append(
                    "<h2>Finished backing up " + pouchname + " to "
                        + "https://corpusdev.lingsync.org/" + pouchname
                        + "</h2>");
              },
              onChange : function(change) {
                $("#dashboard_loading_spinner").append(
                    "<div>Backing up " + pouchname + " to "
                        + "https://corpusdev.lingsync.org/" + pouchname
                        + " Change:  " + JSON.stringify(change) + '</div>');
              }
            }, function(err, changes) {
              console.log("Backing up " + pouchname + " to "
                  + 'https://corpusdev.lingsync.org/' + pouchname, err,
                  changes);
              if (!err) {
                window.actuallyReplicatedPouches.push(pouchname);
                $("#dashboard_loading_spinner").append(
                    "<h2>Finished backing up " + pouchname + " to "
                        + "https://corpusdev.lingsync.org/" + pouchname
                        + "</h2>");
                $("#dashboard_loading_spinner").append(
                    "<small>Changes " + JSON.stringify(changes) + "</small>");
              }
              /* Go to the next pouch */
              window.currentPouch++;
              if (window.currentPouch < window.pouches.length) {
                window.backupPouch(window.pouches[window.currentPouch]);
              } else {
                window.finishedReplicating();
              }
            });
        }catch(e){
          console.log("There was a problem reading or backing up this database. "+window.pouches[window.currentPouch]);
          /* Go to the next pouch */
          window.currentPouch++;
          if (window.currentPouch < window.pouches.length) {
            window.backupPouch(window.pouches[window.currentPouch]);
          } else {
            window.finishedReplicating();
          }
        }
      };

      window.finishedReplicating = function() {
        localStorage.setItem(window.username + "lastUpdatedAtVersion", "1.40");
        /* Take them to the user page so they can choose a corpus */
        alert("All your data has been backed up and is ready to be used in version 1.38 and up \n\n"
            + window.actuallyReplicatedPouches.join("\n"));
        window.location.replace("user.html");
      };

      /* Get a list of all pouches */
      window.pouchesRequest = webkitIndexedDB.webkitGetDatabaseNames();

      /* Get a session token for the database */
      var corpusloginparams = {
        name : "backupdatabases",
        password : "none"
      };
      
      window.setTimeout(window.waitForPouchesList, 1000);
      
      OPrime.makeCORSRequest({
        type : 'POST',
        url : "https://corpusdev.lingsync.org/_session",
        data : corpusloginparams,
        success : function(serverResults) {
          console.log("success",serverResults);
        },
        error : function(serverResults) {
          alert("There was a problem contacting the server to automatically back up your databases so you can use version 1.38 and greater. Please contact us at opensource@lingsync.org, someone will help you back up your data manually.");
        }
      });
//      $.ajax({
//            type : 'POST',
//            url : "https://corpusdev.lingsync.org/_session",
//            data : corpusloginparams,
//            contentType : "application/json",
//            beforeSend: function(xhr) {
//              xhr.setRequestHeader('Accept', 'application/json');
//            },
//            success : function(serverResults) {
//              console.log("sucess",serverResults);
//            },
//            error : function(serverResults) {
//              alert("There was a problem contacting the server to automatically back up your databases so you can use version 1.38 and greater. Please contact us at opensource@lingsync.org, someone will help you back up your data manually.");
//            }
//          });
//      $.ajax({
//        type: "POST", 
//        url: "https://corpusdev.lingsync.org/_session", 
//        dataType: "json",
//        contentType : "application/json",
//        data: corpusloginparams,
//        beforeSend: function(xhr) {
//            xhr.setRequestHeader('Accept', 'application/json');
//        },
//        complete: function(req) {
//          var resp = $.parseJSON(req.responseText);
//          if (req.status == 200) {
//            if (options.success) options.success(resp);
//          } else if (options.error) {
//            options.error(req.status, resp.error, resp.reason);
//          } else {
//            alert("An error occurred logging in: " + resp.reason);
//          }
//        }
//      });
//      $.ajax({
//        type : 'POST',
//        url : "https://authdev.lingsync.org/login",
//        beforeSend: function(xhr) {
//          xhr.setRequestHeader('Accept', 'application/json');
//        },
//        data : {username:"public",password:"none"},
//        success : function(serverResults) {
//          console.log("sucess",serverResults);
//        },
//        error : function(serverResults) {
//          alert("There was a problem contacting the server to automatically back up your databases so you can use version 1.38 and greater. Please contact us at opensource@lingsync.org, someone will help you back up your data manually.");
//        }
//      });
//      var xhr = new XMLHttpRequest();
//      xhr.open('POST', 'https://authdev.lingsync.org');
//      xhr.onreadystatechange = function () {
//        if (this.status == 200 && this.readyState == 4) {
//          console.log('response: ' + this.responseText);
//        }
//      };
//      xhr.send();
//
//      $.ajax("http://authdev.lingsync.org/login", {
//        type : 'POST',
//        contentType : "application/json",
//        success : function(data) {
//          console.log("success!", data);
//        },
//        fail : function(jqxhr, statusText) {
//          console.log("fail!", jqxhr, statusText);
//        }
//      });
//      
//   // Create the XHR object.
//      function createCORSRequest(method, url) {
//        var xhr = new XMLHttpRequest();
//        if ("withCredentials" in xhr) {
//          // XHR for Chrome/Firefox/Opera/Safari.
//          xhr.open(method, url, true);
//        } else if (typeof XDomainRequest != "undefined") {
//          // XDomainRequest for IE.
//          xhr = new XDomainRequest();
//          xhr.open(method, url);
//        } else {
//          // CORS not supported.
//          xhr = null;
//        }
//        return xhr;
//      }
//
//      // Helper method to parse the title tag from the response.
//      function getTitle(text) {
//        return text.match('<title>(.*)?</title>')[1];
//      }
//
//      // Make the actual CORS request.
//      function makeCorsRequest() {
//        // All HTML5 Rocks properties support CORS.
//        var url = 'https://authdev.lingsync.org';
//
//        var xhr = createCORSRequest('GET', url);
//        if (!xhr) {
//          alert('CORS not supported');
//          return;
//        }
//
//        // Response handlers.
//        xhr.onload = function() {
//          var text = xhr.responseText;
//          alert('Response from CORS request to ' + url + ': ' + text);
//        };
//
//        xhr.onerror = function() {
//          alert('Woops, there was an error making the request.');
//        };
//
//        xhr.send();
//      }
      
      
//      $.ajax({
//        type : 'GET',
//        url : "https://corpusdev.lingsync.org",
//        data : {},
//        success : function(serverResults) {
//          console.log("sucess", serverResults);
//        },
//        error : function(serverResults) {
//                        console.log("error");
//
//        }
//      });

      /* http://stackoverflow.com/questions/5584923/a-cors-post-request-works-from-plain-javascript-but-why-not-with-jquery */
//      var request = new XMLHttpRequest();
//      var params = "name=backupdatabases&password=none";
//      request.open('POST', "https://corpusdev.lingsync.org/");
//      request.onreadystatechange = function(e, f, g) {
//        if (request.readyState == 4)
//          OPrime.debug("readyState", e, f, g);
//        OPrime.debug("Request", request);
//      };
//      request.setRequestHeader("Content-type", "text/plain");
//      request.setRequestHeader("Content-length", params.length);
//      // request.setRequestHeader("Connection", "close");
//      request.send();

      /* http://doc.instantreality.org/tutorial/http-communication-in-ecmascript-with-xmlhttprequest/ */
      // xhr = new XMLHttpRequest();
      // xhr.open('POST', 'https://corpusdev.lingsync.org/_session');
      // // xhr.setRequestHeader("Content-type","text/plain");
      // xhr.setRequestHeader("Content-type",
      // "application/x-www-form-urlencoded");
      //
      // // xhr.setRequestHeader("Content-length", 0);
      // xhr.onreadystatechange = function(e, f, g) {
      // console.log("xhr.responseText"+xhr.responseText);
      // var myobj = JSON.parse(xhr.responseText);
      // console.log(myobj.couchdb);
      //        console.log(myobj.version);
      //      };
      //      xhr.send();

    });
