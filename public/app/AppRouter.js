define([ 
    "backbone",
    "datum/Datum",
    "data_list/DataList",
    "datum/Session",
    "datum/SessionEditView",
    "user/UserMask",
    "libs/Utils"
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
      "corpus/:pouchname"               : "showFullscreenCorpus", 
      "corpus/:pouchname/datum/:id"     : "showEmbeddedDatum", //pouchname has to match the pouch of the datum
      "corpus/:pouchname/search"        : "showEmbeddedSearch",//pouchname has to match the pouch of the corpus
      "corpus"                          : "showFullscreenCorpus", 
      "data/:dataListid"                : "showFullscreenDataList",
      "session/:sessionid"              : "showFullscreenSession",
      "user/:userid"                    : "showFullscreenUser",
      "import"                          : "showImport",
      "corpus/:pouchname/export"        : "showExport",
      "diff/oldrev/:oldrevision/newrev/:newrevision" : "showDiffs",
      "render/:render"                  : "renderDashboardOrNot",
      ""                                : "showDashboard"
    },

    /**
     * Does nothing or renders
     * 
     * @param {String}
     *          pouchname (Optional) The name of the corpus to display.
     */
    renderDashboardOrNot : function(render) {
      Utils.debug("In renderDashboardOrNot: " );
      if(render == undefined || render == true || render == "true"){
        window.appView.renderReadonlyDashboardViews();
        this.hideEverything();
        $("#dashboard-view").show();
        $("#datums-embedded").show();
        window.location.href = "#"; 
      }
    },

    /**
     * Displays the dashboard view of the given pouchname, if one was given. Or
     * the blank dashboard view, otherwise.
     * 
     * @param {String}
     *          pouchname (Optional) The name of the corpus to display.
     */
    showDashboard : function() {
      Utils.debug("In showDashboard: " );
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
      couchDatabaseUrl = couchDatabaseUrl + couchConnection.path +"/_utils/database.html?"+ couchConnection.pouchname;
     
      
      window.appView.toastUser("We haven't implemented the 'diff' tool yet" +
      		" (ie, showing the changes, letting you undo changes etc)." +
      		" We will do it eventually, when it becomes a priority. " +
      		"<a target='blank'  href='https://github.com/OpenSourceFieldlinguistics/FieldDB/issues/124'>" +
      		"You can vote for it in our issue tracker</a>.  " +
      		"We use the " +
      		"<a target='blank' href='"+couchDatabaseUrl+"'>" +"Futon User Interface</a> directly to track revisions in the data, you can too (if your a power user type).","alert","Track Changes:");
    },
    /**
     * Displays the public user page view of the given userid, if their public user is stored in this pouch.
     */
    showFullscreenUser : function(userid, pouchname) {
      Utils.debug("In showFullscreenUser: " + userid);

      if(userid){
        if(!pouchname){
          pouchname = app.get("corpus").get("pouchname");
        }
        //if it is someone different, then change the model.
        if(userid != window.appView.publicReadUserView.model.id){
          var userToShow = new UserMask({
            "pouchname": pouchname
          });
          userToShow.id = userid;
          userToShow.changePouch(pouchname, function(){
            //fetch only after having setting the right pouch which is what changePouch does.
            userToShow.fetch({
              success : function(model) {
                Utils.debug("Corpus member fetched successfully" +model);
                window.appView.setUpAndAssociatePublicViewsAndModelsWithCurrentUserMask(model);
                window.appView.publicReadUserView.render();

              },
              error : function(e) {
                alert("User not found in this corpus.");
              }
            });
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

    /**
     * Displays all of the corpus details and settings. 
     * 
     * @param {String}
     *          pouchname The name of the corpus this datum is from.
     */
    showFullscreenCorpus : function() {
      Utils.debug("In showFullscreenCorpus: " );

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
      Utils.debug("In showEmbeddedCorpus: " );

      this.hideEverything();
      $("#dashboard-view").show();
      $("#corpus-embedded").show();
    },
    
   
    
    /**
     * Displays the fullscreen view of the session specified by the given
     * pouchname and the given datumid.
     * 
     * @param {String}
     *          pouchname The name of the corpus this datum is from, this needs to direclty match its pouch.
     * @param {Number}
     *          sessionid The ID of the session within the corpus.
     */
    showEmbeddedSession : function(sessionid, pouchname) {
      Utils.debug("In showEmbeddedSession: " + pouchname + " *** "
          + sessionid);
      if(sessionid){
        if(!pouchname){
          pouchname = window.app.get("corpus").get("pouchname");
        }
        if( sessionid != window.app.get("currentSession").id ){
          var cs = new Session({
            "pouchname" : pouchname});
          cs.id = sessionid;
          
          //this could move the corpus to the wrong couch if someones tries to see a datalist that is not in the current corpus, the current corpus might try to move to another pouch.
          if(window.app.get("corpus").get("pouchname") != pouchname ){
            alert("You are opening a session which is not in this corpus. Do you want to switch to the other corpus?");//TODO need nodejs to find out where that data list is from, in general we cant do this, nor should we.  we should jsut tell them data list not found in their database. since the only way to get to a data list now is through a corpus details page, this situation should not arrise.
          }
          
          cs.changePouch(pouchname, function(){
            //fetch only after having setting the right pouch which is what changePouch does.
            cs.fetch({
              success : function(model) {
                Utils.debug("Session fetched successfully" +model);
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
    showFullscreenSession : function(sessionid, pouchname) {
      Utils.debug("In showFullscreenSession"  + pouchname + " *** "
          + sessionid);
      if(sessionid){
        if(!pouchname){
          pouchname = window.app.get("corpus").get("pouchname");
        }
        if( sessionid != window.app.get("currentSession").id ){
          var cs = new Session({
            "pouchname" : pouchname});
          cs.id = sessionid;
          
          //this could move the corpus to the wrong couch if someones tries to see a datalist that is not in the current corpus, the current corpus might try to move to another pouch.
          if(window.app.get("corpus").get("pouchname") != pouchname ){
            alert("You are opening a session which is not in this corpus. Do you want to switch to the other corpus?");//TODO need nodejs to find out where that data list is from, in general we cant do this, nor should we.  we should jsut tell them data list not found in their database. since the only way to get to a data list now is through a corpus details page, this situation should not arrise.
          }
          
          cs.changePouch(pouchname, function(){
            //fetch only after having setting the right pouch which is what changePouch does.
            cs.fetch({
              success : function(model) {
                Utils.debug("Session fetched successfully" +model);
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
     * pouchname and the given dataListid
     * 
     * @param {String}
     *          pouchname The name of the corpus this datalist is from.
     * @param {Number}
     *          dataListid The ID of the datalist within the corpus.
     */
    showFullscreenDataList : function(dataListid, pouchname) {
      Utils.debug("In showFullscreenDataList: " + pouchname + " *** "
          + dataListid);

      //If the user/app has specified a data list, and its not the same as the current one, then save the current one, fetch the one they requested and set it as the current one.
      if(dataListid &&  dataListid != app.get("currentDataList").id ){
        if(!pouchname){
          pouchname = window.app.get("corpus").get("pouchname");
        }
        var dl = new DataList({
          "pouchname" : pouchname});
        dl.id = dataListid;
        //this could move the corpus to the wrong couch if someones tries to see a datalist that is not in the current corpus, the current corpus might try to move to another pouch.
        if(window.app.get("corpus").get("pouchname") != pouchname ){
          alert("You are opening a data list which is not in this corpus. Do you want to switch to the other corpus?");//TODO need nodejs to find out where that data list is from, in general we cant do this, nor should we.  we should jsut tell them data list not found in their database. since the only way to get to a data list now is through a corpus details page, this situation should not arrise.
          return;
        }

        if(app.get("corpus").get("dataLists").length > 0){
          /*
           * If it is the defualt we want to fetch, which might have its
           * mostrecent version in the corpus, we will save the corpus's
           * default data list so that it will be the one we fetch.
           */
          if(dataListid == app.get("corpus").get("dataLists").models[app.get("corpus").get("dataLists").length - 1].id){
            app.get("corpus").get("dataLists").models[app.get("corpus").get("dataLists").length - 1].changePouch(null, function(){
              app.get("corpus").get("dataLists").models[app.get("corpus").get("dataLists").length - 1].save(null, {
                success : function(model, response) {
                  
                  //wait until the corpus copy is saved before fetching.
                  dl.changePouch(pouchname, function(){
                    //fetch only after having setting the right pouch which is what changePouch does.
                    dl.fetch({
                      success : function(e) {
                        Utils.debug("Datalist fetched successfully" +e);
                        app.get("currentDataList").saveAndInterConnectInApp(function(){
                          dl.setAsCurrentDataList( function(){
                            window.appView.setUpAndAssociateViewsAndModelsWithCurrentDataList(function(){
//                              window.app.router.showDashboard();
                              window.appView.renderReadonlyDataListViews("fullscreen");
//                              window.appView.renderReadonlyDashboardViews();
                            });
                          });
                        });
                      },
                      error : function(e) {
                        alert("There was an error fetching the data list. Loading defaults..."+e);
                      }
                    });
                  });
                  
                }
              ,error : function(){
              }
              });
            
            
            });
          }else{
            /*
             * If it isnt the default data list, just fetch it.
             */
            dl.changePouch(pouchname, function(){
              //fetch only after having setting the right pouch which is what changePouch does.
              dl.fetch({
                success : function(e) {
                  Utils.debug("Datalist fetched successfully" +e);
                  app.get("currentDataList").saveAndInterConnectInApp(function(){
                    dl.setAsCurrentDataList( function(){
                      window.appView.setUpAndAssociateViewsAndModelsWithCurrentDataList(function(){
                        window.appView.renderReadonlyDataListViews("fullscreen");
                      });
                    });
                  });
                },
                error : function(e) {
                  alert("There was an error fetching the data list. Loading defaults..."+e);
                }
              });
            });
            
          }
        }
      }
      if($("#data-list-fullscreen-header").html() == ""){
        window.appView.renderReadonlyDataListViews("fullscreen");
      }
      this.hideEverything();
      $("#data-list-fullscreen").show();    
      window.scrollTo(0,0);

    },
    
    showMiddleDataList : function(dataListid, pouchname) {
      Utils.debug("In showMiddleDataList");

      if(dataListid){
        if(!pouchname){
          pouchname = window.app.get("corpus").get("pouchname");
        }
        var dl = new DataList({
          "pouchname" : pouchname});
        dl.id = dataListid;

        //this could move the corpus to the wrong couch if someones tries to see a datalist that is not in the current corpus, the current corpus might try to move to another pouch.
        if(window.app.get("corpus").get("pouchname") != pouchname ){
          alert("You are opening a data list which is not in this corpus. Do you want to switch to the other corpus?");//TODO need nodejs to find out where that data list is from, in general we cant do this, nor should we.  we should jsut tell them data list not found in their database. since the only way to get to a data list now is through a corpus details page, this situation should not arrise.
        }
        
        dl.changePouch(pouchname, function(){
          //fetch only after having setting the right pouch which is what changePouch does.
          dl.fetch({
            success : function(e) {
              Utils.debug("Datalist fetched successfully" +e);
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
        });
      }
      this.hideEverything();
      $("#dashboard-view").show();
      $("#data-list-embedded").show();      
    },
    
    /**
     * Displays the advanced search in fullscreen form.
     */
    showFullscreenSearch : function(pouchname, corpusid) {
      this.hideEverything();
      window.appView.searchEditView.format = "fullscreen";
      window.appView.searchEditView.render();
      $("#search-fullscreen").show();
    },
    
    /**
     * Displays the advanced search in embedded form.
     */
    showEmbeddedSearch : function(pouchname, corpusid) {
      this.hideEverything();
      $("#dashboard-view").show();
      window.appView.searchEditView.format = "centreWell";
      window.appView.searchEditView.render();
      $("#search-embedded").show();
    },
    showEmbeddedDatum : function(pouchname, datumid){
      Utils.debug("In showEmbeddedDatum"  + pouchname + " *** "
          + datumid);
      if(datumid){
        if(!pouchname){
          pouchname = window.app.get("corpus").get("pouchname");
        }
        if(datumid == "new"){
          appView.datumsEditView.newDatum();
          window.location.href = "#render/false"; //TODO this is to clear the parameters in the url
          $($($(".utterance")[0]).find(".datum_field_input")[0]).focus()
          return;
        }
        var obj = new Datum({pouchname: app.get("corpus").get("pouchname")});
        obj.id  = datumid;
        obj.changePouch(window.app.get("corpus").get("pouchname"), function(){
          obj.fetch({
            success : function(model, response) {
              window.appView.datumsEditView.prependDatum(model);
              window.location.href = "#render/true"; //TODO this is to clear the parameters in the url
            }
          });
        });
      }else{
        window.location.href = "#render/true"; //TODO this is to clear the parameters in the url
      }
    },
    showImport : function() {
      Utils.debug("In import: ");
      //DONT render here, that way the user can come and go to the import dashboard
      if($("#import-fullscreen").html() == ""){
        window.appView.importView.render();
      }
      this.hideEverything();
      $('#import-fullscreen').show();
    },
    
    showExport : function(pouchname) {
      Utils.debug("In showExport: " + pouchname);
      //DONT render here, that way the user can come and go to the import dashboard
      if($("#export-modal").html() == ""){
        window.appView.exportView.render();
      }
      $('#export-modal').modal("show");
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
