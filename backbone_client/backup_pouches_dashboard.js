// Set the RequireJS configuration
require.config({
  paths : {

    /* jQuery and jQuery plugins */
    "jquery" : "libs/jquery",

    "pouch" : "libs/pouch.alpha",

    "oprime" : "libs/OPrime",
    "webservicesconfig" : "libs/webservicesconfig_devserver"
  },
  shim : {

    "jquery" : {
      exports : "$"
    },

    "oprime" : {
      exports : "OPrime"
    },
    "webservicesconfig" : {
      deps : [ "oprime" ],
      exports : "OPrime"
    },

    "pouch" : {
      deps : [ "jquery" ],
      exports : "Pouch"
    }
  }
});

// Initialization
require(
    [ "pouch", "oprime" ],
    function(forcingpouchtoloadearly, OPrime) {

      var goToPrototypeApp = function(){
        var action_url = "corpus.html";
        chrome.tabs.create({
          url: action_url
        });
      }
      document.getElementById("goToPrototypeApp").onclick = goToPrototypeApp;

      var goToCorpusPagesApp = function(){
        var action_url = "https://www.lingsync.org/public";
        chrome.tabs.create({
          url: action_url
        });
      }
      document.getElementById("goToCorpusPagesApp").onclick = goToCorpusPagesApp;



      var goToSpreadsheetApp = function(){
        var action_url = "http://app.lingsync.org";
        chrome.tabs.create({
          url: action_url
        });
      }
      document.getElementById("goToSpreadsheetApp").onclick = goToSpreadsheetApp;



      $('#dashboard_loading_spinner')
          .html(
              "<div class='finished-status'></div><img class='spinner-image' src='images/loader.gif'/><p class='spinner-status'>Preparing for version 1.40...</p>");
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
        if(pouches.length == 0){
          $("#dashboard_loading_spinner").append(
            "<h2>Backed up " + pouches.length + " databases</h2>");
        }else{
          $("#dashboard_loading_spinner").append(
            "<h2>Backing up " + pouches.length + " databases</h2>");
        }

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
        pouchname = pouchname.replace(/_id/g,"");

        if (window.databasesThatDontNeedReplication.indexOf(pouchname) >= 0) {
          /* Go to the next pouch */
          window.currentPouch++;
          if (window.currentPouch < window.pouches.length) {
            window.backupPouch(window.pouches[window.currentPouch]);
          }
        }
        try{
        pouchnameid = pouchname + "_id";
        Pouch.replicate('idb://' + pouchnameid,
            'https://corpusdev.lingsync.org/' + pouchname, {
              complete : function() {
                $("#dashboard_loading_spinner").append(
                    "<h2>Finished backing up " + pouchname + " to "
                        + "https://corpusdev.lingsync.org/" + pouchname
                        + "</h2>");
                 /* Go to the next pouch */
                  window.currentPouch++;
                  if (window.currentPouch < window.pouches.length) {
                    window.backupPouch(window.pouches[window.currentPouch]);
                  } else {
                    window.finishedReplicating();
                  }
              },
              onChange : function(change) {
                $("#dashboard_loading_spinner").append(
                    "<div>Backing up " + pouchname + " to "
                        + "https://corpusdev.lingsync.org/" + pouchname
                        + " Change:  " + JSON.stringify(change) + '</div>');
              },
              onSuccess : function(info) {
                console.log("onsuccess");
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
          console.log(e);
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
        $(".spinner-status").html("Finished backing up your previous data.");
        $(".finished-status").html("We are encouraging all new and old users to use the new Online app which has been built for fieldmethods courses and data entry: <a href='http://app.lingsync.org'>http://app.lingsync.org</a>.<p>");
        $(".spinner-image").attr("src","images/icon128.png");

        /* Take them to the user page so they can choose a corpus */
        console.log("All your data has been backed up and is ready to be used in version 1.38 and up \n\n"
            + window.actuallyReplicatedPouches.join("\n"));
        // window.location.replace("http://app.lingsync.org");
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
          console.log("There was a problem contacting the server to automatically back up your databases so you can use version 1.38 and greater. Please contact us at opensource@lingsync.org, someone will help you back up your data manually.");
        }
      });

    });
