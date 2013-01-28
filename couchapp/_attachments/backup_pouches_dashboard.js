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

//Initialization
require([ 
      "backbone_pouchdb"
      ], function(
          forcingpouchtoloadearly
      ) {
  
  
  $('#dashboard_loading_spinner').html("<img class='spinner-image' src='images/loader.gif'/><p class='spinner-status'>Preparing for version 1.40...</p>");
  $('.spinner-image').css({
    'width' : function() {
      return ($(document).width() * .1 ) + 'px';
    },
    'height' : function() {
      return ($(document).width() * .1 ) + 'px';
    },
    'padding-top': '10em'
  });
  window.username = localStorage.getItem("username_to_update");
  
  window.databasesThatDontNeedReplication="sapir-firstcorpus,sapir-activity_feed,lingllama-firstcorpus-activity_feed,lingllama-firstcorpus, lingllama-cherokee-activity_feed,lingllama-cherkoee,lingllama-activity_feed,lingllama-firstcorpus-activity_feed,null,undefined,public-firstcorpus,public-activity_feed,public-firstcorpus-activity_feed,publicuser,default,length";
  window.actuallyReplicatedPouches = [];


  window.waitForPouchesList = function(){
    if(pouchesRequest.readyState != "done"){
      window.setTimeout(window.waitForPouchesList,5000);
    }else{
      if (pouchesRequest.result) {
        window.backupPouches(pouchesRequest.result);
      }
    }
  };
  
  window.backupPouches = function(pouches){
    console.log("Got the pouches: ", pouches);
    $("#dashboard_loading_spinner").append("<h2>Backing up "+pouches.length + " databases</h2>");

    /* for each pouch, identify its remote, and begin replicating to it. */
    window.currentPouch = 0;
    window.pouches = pouches;
    if(window.currentPouch < window.pouches.length){
        backupPouch(pouches[window.currentPouch]);
    }else{
      window.finishedReplicating();
    }
  };
  
  window.backupPouch = function(pouchname){
    /* Ignore pouches that don't need to be replicated */
    if(window.databasesThatDontNeedReplication.indexOf(pouchname) >= 0){
      /* Go to the next pouch */
      window.currentPouch++;
      if(window.currentPouch < window.pouches.length){
        window.backupPouch(window.pouches[window.currentPouch]);
      }
    }
    Pouch.replicate('idb://'+pouchname, 'https://ifielddevs.iriscouch.com/'+pouchname, {complete: function(){
      $("#dashboard_loading_spinner").append("<h2>Finished backing up "+pouchname + " to "+ "https://ifielddevs.iriscouch.com/"+pouchname +"</h2>");
    }, onChange: function(change){
      $("#dashboard_loading_spinner").append("<div>Backing up "+pouchname + " to "+ "https://ifielddevs.iriscouch.com/"+pouchname+ " Change:  "+JSON.stringify(change)+'</div>');
    }},function(err, changes) {
      console.log("Backing up "+pouchname + " to "+ 'https://ifielddevs.iriscouch.com/'+pouchname, err, changes);
      if(!err){
        window.actuallyReplicatedPouches.push(pouchname);
        $("#dashboard_loading_spinner").append("<h2>Finished backing up "+pouchname + " to "+ "https://ifielddevs.iriscouch.com/"+pouchname +"</h2>");
        $("#dashboard_loading_spinner").append("<small>Changes "+JSON.stringify(changes) +"</small>");
      }
      /* Go to the next pouch */
      window.currentPouch++;
      if(window.currentPouch < window.pouches.length){
        window.backupPouch(window.pouches[window.currentPouch]);
      }else{
        window.finishedReplicating();
      }
    });
  };
  
  window.finishedReplicating = function(){
    localStorage.setItem(window.username+"lastUpdatedAtVersion", "1.40");
    /* Take them to the user page so they can choose a corpus */
    alert("All your data has been backed up and is ready to be used in verison 1.38+ \n\n"+window.actuallyReplicatedPouches.join("\n"));
    window.location.replace("user.html");
  };
  
  /* Get a list of all pouches */
  window.pouchesRequest = webkitIndexedDB.webkitGetDatabaseNames();
  
  /* Get a session token for the database */
  var corpusloginparams = {name: "backupdatabases", password: "none"};
  $.ajax({
    type : 'POST',
    url : "https://ifielddevs.iriscouch.com/_session",
    data : corpusloginparams,
    success : function(serverResults) {
      window.setTimeout(window.waitForPouchesList, 1000);
    },
    error : function(serverResults) {
      alert("There was a problem contacting the server to automatically back up your databases so you can use version 1.38 and greater. Please contact us at opensource@lingsync.org, someone will help you back up your data manually.");
    }
  });
});

