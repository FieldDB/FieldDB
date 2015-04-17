define([
    "backbone",
    "handlebars",
    "datum/Datum",
    "datum/Datums",
    "datum/DatumFields",
    "datum/DatumEditView",
    "app/UpdatingCollectionView"
], function(
    Backbone,
    Handlebars,
    Datum,
    Datums,
    DatumFields,
    DatumEditView,
    UpdatingCollectionView
) {
  var DatumContainerEditView = Backbone.View.extend(
  /** @lends DatumContainerEditView.prototype */
  {
    /**
     * @class The area where Datum appear. The number of datum that appear
     * is in UserPreference.
     *
     * @property {String} format Valid values are "centreWell" or "fullscreen".
     *
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      // Create a DatumView
      this.datumsView = new UpdatingCollectionView({
        collection           : this.model,
        childViewConstructor : DatumEditView,
        childViewTagName     : "li",
        childViewClass       : "well",
        childViewFormat      : "well"
      });

      // Listen for changes in the number of Datum to display
      app.get("authentication").get("userPrivate").get("prefs").bind("change:numVisibleDatum", this.updateDatums, this); //we might have to bind this in the other direction since the user's preferences are craeted later than the datum container.
    },

    /**
     * The underlying model of the DatumContainerEditView is a Datums.
     */
    model: Datums,

    /**
     * Events that the DatumContainerEditView is listening to and their handlers.
     */
    events : {
      "click .icon-resize-small" : 'resizeSmall',
      "click .icon-resize-full" : "resizeFullscreen",
      "click .icon-book" : "showReadonly"
    },

    /**
     * The Handlebars template rendered as embedded.
     */
    templateEmbedded : Handlebars.templates.datum_container_edit_embedded,

    /**
     * The Handlebars template rendered as fullscreen.
     */
    templateFullscreen : Handlebars.templates.datum_container_edit_fullscreen,

    render : function() {

      var jsonToRender = this.model.toJSON();
      jsonToRender.locale_Data_Entry_Area = Locale.get("locale_Data_Entry_Area");
      jsonToRender.locale_Show_Fullscreen = Locale.get("locale_Show_Fullscreen");
      jsonToRender.locale_Show_in_Dashboard = Locale.get("locale_Show_in_Dashboard");
      jsonToRender.locale_Show_Readonly = Locale.get("locale_Show_Readonly");

      // Display the DatumContainerEditView
      if (this.format == "centreWell") {
        this.setElement($("#datums-embedded"));
        $(this.el).html(this.templateEmbedded(jsonToRender));
      } else if (this.format == "fullscreen") {
        this.setElement($("#datum-container-fullscreen"));
        $(this.el).html(this.templateFullscreen(jsonToRender));
      }

      // Display the DatumFieldsView
      this.datumsView.el = this.$(".datum-embedded-ul");
      this.datumsView.render();

      return this;
    },

    /**
     * Saves the Datum pages (if necessary) after a timeout.
     */
    saveScreen : function() {
      for (var i in this.datumsView._childViews) {
        this.datumsView._childViews[i].saveScreen();
      }
    },

    resizeSmall : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
//      window.app.router.showEditableDatums("centreWell");
      window.location.href = "#render/true";
    },

    resizeFullscreen : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      window.app.router.showEditableDatums("fullscreen");
    },

    showReadonly : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      window.app.router.showReadonlyDatums(this.format);
    },

    showMostRecentDatum : function() {
      var nextNumberOfDatum = app.get("authentication").get("userPrivate").get("prefs").get("numVisibleDatum");
      var showDatumOnTopOrBottomOfDataEntryArea = app.get("authentication").get("userPrivate").get("prefs").get("showNewDatumAtTopOrBottomOfDataEntryArea");

      // Get the current Corpus' Datum based on their date entered
      var self = this;
      (new Datum({"dbname": app.get("corpus").get("dbname")})).getMostRecentIdsByDate(nextNumberOfDatum, function(rows) {
        // If there are no Datum in the current Corpus
        if ((rows == null) || (rows.length <= 0)) {
          // Remove all currently displayed Datums
          for (var i = 0; i < self.model.length; i++) {
            self.model.pop();
          }

          /* If there are no datum in the corpus, or currently showing, add a single, blank Datum (if the user has an empty corpus, they can stil doubleclick on an item they are importing and therefore have a non empty datum container) */
          if(self.datumsView._childViews.length == 0){
            self.newDatum();
          }
        } else {
          if (showDatumOnTopOrBottomOfDataEntryArea === "bottom") {
            //put most recent datum on the bottom
            for (var i = self.model.length - 1; i >= 0; i--) {
              self.model.shift();
            }
          } else {
            //put most recent datum at the top
            for (var i = 0; i < self.model.length ;  i++) {
              self.model.pop();
            }
          }

          for (var i = 0; i < rows.length; i++) {
            //If you've filled it up, stop filling.
            if(self.model.length >= nextNumberOfDatum){
              return;
            }

            // Add the next most recent Datum from the Corpus to the stack
            if (rows[i]) {
              var m = rows[i];
              var value = m;
              /* The format returned by the backbone couchdb adaptor is different (TODO re-look into this to remember what was different) than a pure couchdb result */
              if(!OPrime.isBackboneCouchDBApp()){
                value = m.value;
                var d = new Datum();
                d.set(d.parse(value));
                value = d;
              }
              //Only add datum objects to the container
              if(value.jsonType == "Datum"){
                if (showDatumOnTopOrBottomOfDataEntryArea === "bottom") {
                  //put most recent datum on the bottom
                  self.model.unshift(value);
                } else {
                  //put most recent datum at the top
                  self.model.add(value);
                }
              }
            }
          }
          if(self.model.length == 0){
            self.newDatum();
          }
        }
      });
    },

    /**
     * Adds a new Datum to the current Corpus in the current Session.
     */
    newDatum : function() {
      //copy the corpus's datum fields and empty them.
      var datumfields = app.get("corpus").get("datumFields").toJSON();
      for(var x in datumfields){
        datumfields[x].mask = "";
        datumfields[x].value = "";
        if (datumfields[x].users) {
          datumfields[x].users = [];
        }
      }
      this.prependDatum(new Datum({
        filledWithDefaults : true,
        datumFields : new DatumFields(datumfields),
        dbname : app.get("corpus").get("dbname"),
        session : app.get("currentSession")
      }));
    },
    promptedForNewSession : false,
    /**
     * Prepends the given Datum to the top of the Datum stack.
     * Saves and bumps the bottom Datum off the stack, if necessary.
     *
     * @param {Datm} datum The Datum to prepend.
     */
    prependDatum : function(datum) {
      if (datum.isNew()) {
        // If the corpus' previous Datum is more than 24 hours old,
        // prompt the user if they want to create a new Session.
        var tooOld = false;
        var promtForNewSession = "This session is getting pretty old.\n\nCreate a new session?";
        var previousDateModified = window.app.get("corpus").get("dateOfLastDatumModifiedToCheckForOldSession");
        if (previousDateModified) {
          var currentDate = new Date();
          var lastSaveDate;
            // 86400000 = 24h * 60m * 60s * 1000ms = 1 day
            try{
              lastSaveDate = new Date(JSON.parse(previousDateModified));
            }catch(e){
              lastSaveDate = new Date(previousDateModified);
            }

            if (currentDate - lastSaveDate > 86400000) {
              tooOld = true;
            }
          }
          if(!window.app.promptedForNewSession){
            window.app.promptedForNewSession = true;
            if (tooOld && confirm(promtForNewSession)) {
            // Display the new Session modal
            window.app.get("corpus").newSession();
            return;
          }
        }
      // If the datum is already being displayed by the datumContainer
      } else if (this.model.get(datum.id)) {
        // Loop through the currently displayed views
        for (var i in this.datumsView._childViews) {
          var view = this.datumsView._childViews[i];
          if (view.model.id == datum.id) {
            // Save it
            view.saveScreen();

            // Remove it
            this.model.remove(view.model);

            break;
          }
        }
      }

      // Add the new, blank, Datum
      var showDatumOnTopOrBottomOfDataEntryArea = app.get("authentication").get("userPrivate").get("prefs").get("showNewDatumAtTopOrBottomOfDataEntryArea");
      if (showDatumOnTopOrBottomOfDataEntryArea === "bottom") {
        //put most recent datum on the bottom
        this.model.push(datum);
      } else {
        //put most recent datum at the top
        this.model.unshift(datum);
      }

      // If there are too many datum on the screen, remove the bottom one and save it, if necessary
      if (this.model.length > app.get("authentication").get("userPrivate").get("prefs").get("numVisibleDatum")) {
        var view = this.datumsView._childViews[this.model.length - 1];
        view.saveScreen();
        if (showDatumOnTopOrBottomOfDataEntryArea === "bottom") {
          //put most recent datum on the bottom
          this.model.shift();
        } else {
          //put most recent datum at the top
          this.model.pop();
        }

      }
      var self = this;
      try{
        //bring the user to the top of the page where the prepended datum is, or show the dashboard if the datums arent showing.
        if($("#datums-embedded").attr("style").indexOf("display: none;") > -1 && $("#datum-container-fullscreen").attr("style").indexOf("display: none;") > -1){
          window.location.href = "#render/true";
        }else{
          window.setTimeout(function() {
            var datumToSee = $("[name='" + datum.id + "']")[0]
            if (datumToSee && datumToSee.scrollIntoView) {
              datumToSee.scrollIntoView();
              $($($(datumToSee).parent().find(".utterance")[0]).find(".datum_field_input")[0]).focus();
            } else {
              if (showDatumOnTopOrBottomOfDataEntryArea === "top") {
                window.scrollTo(0, 0);
                $($($(self.el).find(".utterance")[0]).find(".datum_field_input")[0]).focus();
              }
            }
          }, 500);
        }
      }catch(e){
        if (OPrime.debugMode) OPrime.debug("Wasnt able to put the cursor in the first datum's first field.", e);
      }
    }
  });

  return DatumContainerEditView;
});
