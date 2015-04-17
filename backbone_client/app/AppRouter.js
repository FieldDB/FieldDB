define([
    "backbone",
    "datum/Datum",
    "data_list/DataList",
    "datum/Session",
    "datum/SessionEditView",
    "user/UserMask",
    "OPrime"
], function(
    Backbone,
    Datum,
    DataList,
    Session,
    SessionEditView,
    UserMask
) {
  var AppRouter = Backbone.Router.extend(
  /** @lends AppRouter.prototype */
  {
    /**
     * @class Routes URLs to different dashboard layouts and data.As backbone is
     *        a one page app, this shows and hides different "pages", for
     *        example it starts out with a full screen dashboard view, with
     *        datalist and a datum, but when the user clicks the full screen
     *        buttons or uses the navigation menu, and it also happens any time
     *        the URL changes it will make the component full screen by hiding
     *        and showing divs using jquery.
     *
     * @extends Backbone.Router
     * @constructs
     */
    initialize : function() {
    },

    routes : {
      "corpus/:dbname/session/:id/alldatainthissession/:goal" : "showAllDataInSession",
      "corpus/:dbname/datum/:id"     : "showEmbeddedDatum", //dbname has to match the pouch of the datum
      "corpus/:dbname/search/:searchterm"        : "showEmbeddedSearch",//dbname has to match the pouch of the corpus
      "corpus/:dbname/search"        : "showEmbeddedSearch",//dbname has to match the pouch of the corpus
      "corpus/:dbname/alldata"       : "showAllData",//dbname has to match the pouch of the corpus
      "corpus/:dbname"               : "showFullscreenCorpus",
      "corpus"                          : "showFullscreenCorpus",
      "data/:dataListid"                : "showFullscreenDataList",//TODO: consider putting corpus and dbname here
      "session/:sessionid"              : "showFullscreenSession",//TODO: consider putting corpus and dbname here
      "user/:userid"                    : "showFullscreenUser",
      "import"                          : "showImport",//TODO: consider putting corpus and dbname here
      "corpus/:dbname/export"        : "showExport",
      "diff/oldrev/:oldrevision/newrev/:newrevision" : "showDiffs",
      "render/:render"                  : "renderDashboardOrNot",
      "help/:helptype"                  : "renderHelp",
      "login"                           : "renderlogin",
      ""                                : "showDashboard"
    },

    /**
     * Does nothing or renders
     *
     * @param {String}
     *          dbname (Optional) The name of the corpus to display.
     */
    renderDashboardOrNot : function(render) {
      if (OPrime.debugMode) OPrime.debug("In renderDashboardOrNot: " );
      if(render == undefined || render == true || render == "true"){
        window.appView.renderReadonlyDashboardViews();
        this.hideEverything();
        $("#dashboard-view").show();
        $("#datums-embedded").show();
        window.location.href = "#";
      }
    },

    /**
     * Displays the dashboard view of the given dbname, if one was given. Or
     * the blank dashboard view, otherwise.
     *
     * @param {String}
     *          dbname (Optional) The name of the corpus to display.
     */
    showDashboard : function() {
      if (OPrime.debugMode) OPrime.debug("In showDashboard: " );
    },
    /**
     * Shows the differences between revisions of two couchdb docs, TODO not working yet but someday when it becomes a priority..
     */
    showDiffs : function(oldrevision, newrevision){
      var couchConnection = window.app.get("corpus").get("couchConnection");
      var couchDatabaseUrl = couchConnection.protocol+couchConnection.domain;
      if(couchConnection.port != null){
        couchDatabaseUrl = couchDatabaseUrl+":"+couchConnection.port;
      }
      couchDatabaseUrl = couchDatabaseUrl + couchConnection.path +"/_utils/database.html?"+ couchConnection.dbname;


      window.appView.toastUser("We haven't implemented the 'diff' tool yet" +
      		" (ie, showing the changes, letting you undo changes etc)." +
      		" We will do it eventually, when it becomes a priority. " +
      		"<a target='blank'  href='https://github.com/OpenSourceFieldlinguistics/FieldDB/issues/124'>" +
      		"You can vote for it in our issue tracker</a>.  " +
      		"We use the " +
      		"<a target='blank' href='"+couchDatabaseUrl+"'>" +"Futon User Interface</a> directly to track revisions in the data, you can too (if your a power user type).","alert","Track Changes:");
    },

    renderHelp : function(helptype){
      if(helptype.indexOf("illustratedguide") >= 0){
        //The guide is out of date and annoying popup
        $("#illustrated_guide_to_dash").show();
        window.location.href= "#";
      }
    },
    /**
     * Displays the public user page view of the given userid, if their public user is stored in this pouch.
     */
    showFullscreenUser : function(userid, dbname) {
      if (OPrime.debugMode) OPrime.debug("In showFullscreenUser: " + userid);

      if(userid){
        if(!dbname){
          dbname = app.get("corpus").get("dbname");
        }
        //if it is someone different, then change the model.
        if(userid != window.appView.publicReadUserView.model.id){
          var userToShow = new UserMask({
            "dbname": dbname
          });
          userToShow.id = userid;
            userToShow.fetch({
              success : function(model) {
                if (OPrime.debugMode) OPrime.debug("Corpus member fetched successfully" +model);
                window.appView.setUpAndAssociatePublicViewsAndModelsWithCurrentUserMask(model);
                window.appView.publicReadUserView.render();

              },
              error : function(e) {
                alert("User not found in this corpus.");
              }
          });
        }
      }
      if($("#public-user-page").html() == ""){
        window.appView.publicReadUserView.render();
      }
      this.hideEverything();
      $("#public-user-page").show();
      window.scrollTo(0,0);

    },

    renderlogin : function(){
      $("#login_modal").show("modal");
      window.local.href="#";
      //window.local.replace("#login_modal");
    },

    /**
     * Displays all of the corpus details and settings.
     *
     * @param {String}
     *          dbname The name of the corpus this datum is from.
     */
    showFullscreenCorpus : function() {
      if (OPrime.debugMode) OPrime.debug("In showFullscreenCorpus: " );

      //TODO create a public corpus mask, think of how to store it, and render that here.
      if($("#corpus-fullscreen").html() == ""){
        window.appView.renderReadonlyCorpusViews("fullscreen");
      }
      this.hideEverything();
      $("#corpus-fullscreen").show();
      window.scrollTo(0,0);

    },
    /**
     * Displays all of the corpus details and settings.
     *
     */
    showEmbeddedCorpus : function() {
      if (OPrime.debugMode) OPrime.debug("In showEmbeddedCorpus: " );

      this.hideEverything();
      $("#dashboard-view").show();
      $("#corpus-embedded").show();
    },



    /**
     * Displays the fullscreen view of the session specified by the given
     * dbname and the given datumid.
     *
     * @param {String}
     *          dbname The name of the corpus this datum is from, this needs to direclty match its pouch.
     * @param {Number}
     *          sessionid The ID of the session within the corpus.
     */
    showEmbeddedSession : function(sessionid, dbname) {
      if (OPrime.debugMode) OPrime.debug("In showEmbeddedSession: " + dbname + " *** "
          + sessionid);
      if(sessionid){
        if(!dbname){
          dbname = window.app.get("corpus").get("dbname");
        }
        if( sessionid != window.app.get("currentSession").id ){
          var cs = new Session({
            "dbname" : dbname});
          cs.id = sessionid;

          //this could move the corpus to the wrong couch if someones tries to see a datalist that is not in the current corpus, the current corpus might try to move to another pouch.
          if(window.app.get("corpus").get("dbname") != dbname ){
            alert("You are opening a session which is not in this corpus. Do you want to switch to the other corpus?");//TODO need nodejs to find out where that data list is from, in general we cant do this, nor should we.  we should jsut tell them data list not found in their database. since the only way to get to a data list now is through a corpus details page, this situation should not arrise.
          }

            cs.fetch({
              success : function(model) {
                if (OPrime.debugMode) OPrime.debug("Session fetched successfully" +model);
                cs.setAsCurrentSession( function(){
                  window.appView.setUpAndAssociateViewsAndModelsWithCurrentSession(function(){
                    window.appView.renderReadonlySessionViews("centerWell");
                  });
                });
              },
              error : function(e) {
                alert("There was an error fetching the sessions. Loading defaults..."+e);
              }
          });
        }
      }

      // Display the edit session view and hide all the other views
      this.hideEverything();
      $("#dashboard-view").show();
      $("#session-embedded").show();

    },

    /**
     * Displays the fullscreen view of the session.
     */
    showFullscreenSession : function(sessionid, dbname) {
      if (OPrime.debugMode) OPrime.debug("In showFullscreenSession"  + dbname + " *** "
          + sessionid);
      if(sessionid){
        if(!dbname){
          dbname = window.app.get("corpus").get("dbname");
        }
        if( sessionid != window.app.get("currentSession").id ){
          var cs = new Session({
            "dbname" : dbname});
          cs.id = sessionid;

          //this could move the corpus to the wrong couch if someones tries to see a datalist that is not in the current corpus, the current corpus might try to move to another pouch.
          if(window.app.get("corpus").get("dbname") != dbname ){
            alert("You are opening a session which is not in this corpus. Do you want to switch to the other corpus?");//TODO need nodejs to find out where that data list is from, in general we cant do this, nor should we.  we should jsut tell them data list not found in their database. since the only way to get to a data list now is through a corpus details page, this situation should not arrise.
          }

            cs.fetch({
              success : function(model) {
                if (OPrime.debugMode) OPrime.debug("Session fetched successfully" +model);
                cs.setAsCurrentSession( function(){
                  window.appView.setUpAndAssociateViewsAndModelsWithCurrentSession(function(){
                    window.appView.renderReadonlySessionViews("fullscreen");
                  });
                });
              },
              error : function(e) {
                alert("There was an error fetching the sessions. Loading defaults..."+e);
              }
          });
        }
      }
      if($("#session-fullscreen").html() == ""){
        window.appView.renderReadonlySessionViews("fullscreen");
      }
      this.hideEverything();
      $("#session-fullscreen").show();
      window.scrollTo(0,0);

    },

    /**
     * Displays the fullscreen view of the datalist specified by the given
     * dbname and the given dataListid
     *
     * @param {String}
     *          dbname The name of the corpus this datalist is from.
     * @param {Number}
     *          dataListid The ID of the datalist within the corpus.
     */
    showFullscreenDataList : function(dataListid, dbname) {
      if (OPrime.debugMode) OPrime.debug("In showFullscreenDataList: " + dbname + " *** "
          + dataListid);
      //If the user/app has specified a data list, and its not the same as the current one, then save the current one, fetch the one they requested and set it as the current one.
      if( !dataListid || dataListid == app.get("currentDataList").id  ){
        if($("#data-list-fullscreen-header").html() == ""){
          window.appView.renderReadonlyDataListViews("fullscreen");
        }
        this.hideEverything();
        $("#data-list-fullscreen").show();
        window.scrollTo(0,0);
        return;
      }

      if(!dbname){
        dbname = window.app.get("corpus").get("dbname");
      }
      var dl = new DataList({
        "dbname" : dbname});
      dl.id = dataListid;
      //this could move the corpus to the wrong couch if someones tries to see a datalist that is not in the current corpus, the current corpus might try to move to another pouch.
      if(window.app.get("corpus").get("dbname") != dbname ){
        alert("You are opening a data list which is not in this corpus. Do you want to switch to the other corpus?");//TODO need nodejs to find out where that data list is from, in general we cant do this, nor should we.  we should jsut tell them data list not found in their database. since the only way to get to a data list now is through a corpus details page, this situation should not arrise.
        return;
      }

      /*
       * If it isnt the default data list, just fetch it.
       */
      dl.fetch({
        success : function(e) {
          if (OPrime.debugMode) OPrime.debug("Datalist fetched successfully" +e);
          app.get("currentDataList").saveAndInterConnectInApp(function(){
            dl.setAsCurrentDataList( function(){
              window.appView.setUpAndAssociateViewsAndModelsWithCurrentDataList(function(){
                window.appView.renderReadonlyDataListViews("fullscreen");
                window.app.router.hideEverything();
                $("#data-list-fullscreen").show();
                window.scrollTo(0,0);
              });
            });
          });
        },
        error : function(e) {
          alert("There was an error fetching the data list. Loading defaults..."+e);
        }
      });

     //TODO test other cases where datalist id needs to be changed

    },

    showMiddleDataList : function(dataListid, dbname) {
      if (OPrime.debugMode) OPrime.debug("In showMiddleDataList");

      if(dataListid){
        if(!dbname){
          dbname = window.app.get("corpus").get("dbname");
        }
        var dl = new DataList({
          "dbname" : dbname});
        dl.id = dataListid;

        //this could move the corpus to the wrong couch if someones tries to see a datalist that is not in the current corpus, the current corpus might try to move to another pouch.
        if(window.app.get("corpus").get("dbname") != dbname ){
          alert("You are opening a data list which is not in this corpus. Do you want to switch to the other corpus?");//TODO need nodejs to find out where that data list is from, in general we cant do this, nor should we.  we should jsut tell them data list not found in their database. since the only way to get to a data list now is through a corpus details page, this situation should not arrise.
        }

          dl.fetch({
            success : function(e) {
              if (OPrime.debugMode) OPrime.debug("Datalist fetched successfully" +e);
              dl.setAsCurrentDataList( function(){
                window.appView.setUpAndAssociateViewsAndModelsWithCurrentDataList(function(){
                  window.appView.renderReadonlyDashboardViews();
                });
              });
            },
            error : function(e) {
              alert("There was an error fetching the data list. Loading defaults..."+e);
            }
        });
      }
      this.hideEverything();
      $("#dashboard-view").show();
      $("#data-list-embedded").show();
    },

    /**
     * Displays the advanced search in fullscreen form.
     */
    showFullscreenSearch : function(dbname, corpusid) {
      this.hideEverything();
      window.appView.searchEditView.format = "fullscreen";
      window.appView.searchEditView.render();
      $("#search-fullscreen").show();
    },

    /**
     * Displays the advanced search in embedded form.
     */
    showEmbeddedSearch : function(dbname, searchterm) {
      if(searchterm){
        window.app.get("search").set("searchKeywords", searchterm);
        window.appView.searchEditView.searchTop();
      }
      this.hideEverything();
      $("#dashboard-view").show();
      window.appView.searchEditView.format = "centreWell";
      window.appView.searchEditView.render();
      $("#search-embedded").show();
    },

    /**
     * The showAllData function gives the user a Datalist of all the  Datums in their corpus (embedded Datalist view)
     * it does this by calling the search method of searchEditView within appView
     * @param dbname   identifies the database to look in
     * TODO: try saving it, setting it as current datalist and rendering that fullscreen
     */
    showAllData : function(dbname) {
//    this.hideEverything();
//    $("#dashboard-view").show();
      window.app.showSpinner();
      $(".spinner-status").html("Searching all data...");
      window.appView.searchEditView.search("", function(){
        window.appView.searchEditView.searchDataListView.model.set("title", "All Data as of " + new Date());
//      window.appView.searchEditView.searchDataListView.render();
        $(".spinner-status").html("Opening all data...");
        window.appView.searchEditView.searchDataListView.saveSearchDataList(null,function(){
          $(".spinner-status").html("Loading all data...");
          window.appView.currentReadDataListView.format = "fullscreen";
          window.appView.currentReadDataListView.render();
          window.location.href="#data/"+ window.appView.searchEditView.searchDataListView.model.id;
          window.app.stopSpinner();
        },function(){
          window.app.stopSpinner();
          window.location.href="#";
          if(localStorage.getItem("username") == "public"){
            alert("Normally this creates a new list of all your data, but you can't save new DataLists in the Sample Corpus. Instead, all the data are shown in a temporary Search Result below.");
          }
        });
      });

    },

    /**
     * The showAllData function gives the user a Datalist of all the Datums in
     * this session (embedded Datalist view) it does this by calling the search
     * method of searchEditView within appView with the goal of the session. An
     * alternative is to use the map reduce function for this, which returns the
     * datum in a session too (more precisely) however, we believe that it is
     * usually the goal which the user is actually searching for, not the
     * session itself.
     *
     * @param dbname
     *          identifies the database to look in TODO: try saving it, setting
     *          it as current datalist and rendering that fullscreen
     * @param id this is the id of the session itself
     * @param goal this is the goal of the session or what to search for.
     */
    showAllDataInSession : function(dbname, id, goal) {
      /* this is the actual url of the map reduce result that is precisely these datum that are in this session, but really we dont htink that is what the user wants to see. */
      var urlOfMapReduceWithThisSessionsExactDatum = OPrime.getCouchUrl(window.app.get("couchConnection")) +'/_design/pages/_view/get_datums_by_session_id?key="'+id+'"';

//    this.hideEverything();
//    $("#dashboard-view").show();
      window.app.showSpinner();
      $(".spinner-status").html("Searching all data in this Elicitation Session...");
      $("#search_box").val("goal:" + goal);
      window.appView.searchEditView.search("goal:" + goal, function(){
        window.appView.searchEditView.searchDataListView.model.set("title", "All Data where the session goal was: '"+goal+"' As of today,  "+new Date());
//      window.appView.searchEditView.searchDataListView.render();
        $(".spinner-status").html("Opening data...");
        window.appView.searchEditView.searchDataListView.saveSearchDataList(null,function(){
          $(".spinner-status").html("Loading  data...");
          window.appView.currentReadDataListView.format = "fullscreen";
          window.appView.currentReadDataListView.render();
          window.location.href="#data/"+ window.appView.searchEditView.searchDataListView.model.id;
          window.app.stopSpinner();
        },function(){
          window.app.stopSpinner();
          window.location.href="#";
          if(localStorage.getItem("username") == "public"){
            alert("Normally this creates a new list of all the data in this session, but you can't save new DataLists in the Sample Corpus. Instead, all the data are shown in a temporary Search Result below.");
          }
        });
      });

    },

    showEmbeddedDatum : function(dbname, datumid){
      if (OPrime.debugMode) OPrime.debug("In showEmbeddedDatum"  + dbname + " *** "
          + datumid);
      if(datumid){
        if(!dbname){
          dbname = window.app.get("corpus").get("dbname");
        }
        if(datumid == "new"){
          appView.datumsEditView.newDatum();
          window.location.href = "#render/false"; //TODO this is to clear the parameters in the url
          $($($(".utterance")[0]).find(".datum_field_input")[0]).focus()
          return;
        }
        var obj = new Datum({dbname: app.get("corpus").get("dbname")});
        obj.id  = datumid;
          obj.fetch({
            success : function(model, response) {
              window.appView.datumsEditView.prependDatum(model);
              window.location.href = "#render/true"; //TODO this is to clear the parameters in the url
            }
        });
      }else{
        window.location.href = "#render/true"; //TODO this is to clear the parameters in the url
      }
    },

    showImport : function() {
      if (OPrime.debugMode) OPrime.debug("In import: ");
      //DONT render here, that way the user can come and go to the import dashboard
      if($("#import-fullscreen").html() == ""){
        window.appView.importView.render();
      }
      this.hideEverything();
      $('#import-fullscreen').show();
    },

    showExport : function(dbname) {
      if (OPrime.debugMode) OPrime.debug("In showExport: " + dbname);
      //DONT render here, that way the user can come and go to the import dashboard
      if($("#export-modal").html() == ""){
        window.appView.exportView.render();
      }
      $('#export-modal').show();
    },

    // Functions that toggle between editable and readonly datums view
    showEditableDatums : function(format) {
      window.appView.renderEditableDatumsViews(format);
      if (format == "centreWell") {
        this.hideEverything();
        $("#dashboard-view").show();
        $("#datums-embedded").show();
        window.location.href = "#"; //TODO this is to clear the parameters in the url
      } else if (format == "fullscreen") {
        this.hideEverything();
        $("#datum-container-fullscreen").show();
      }
    },
    showReadonlyDatums : function(format) {
      window.appView.renderReadonlyDatumsViews(format);
      if (format == "centreWell") {
        this.hideEverything();
        $("#dashboard-view").show();
        $("#datums-embedded").show();
        window.location.href = "#"; //TODO this is to clear the parameters in the url
      } else if (format == "fullscreen") {
        this.hideEverything();
        $("#datum-container-fullscreen").show();
      }
    },

    hideEverything: function() {
      $("#dashboard-view").hide();
      $("#datums-embedded").hide();
      $("#data-list-fullscreen").hide();
      $("#datum-container-fullscreen").hide();
      $("#corpus-embedded").hide();
      $("#corpus-fullscreen").hide();
      $("#search-fullscreen").hide();
      $("#search-embedded").hide();
      $("#session-embedded").hide();
      $("#session-fullscreen").hide();
      $('#public-user-page').hide();
      $('#user-fullscreen').hide();
      $('#import-fullscreen').hide();
      $('#data-list-embedded').hide();
    }
  });

  return AppRouter;
});
