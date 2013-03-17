define([
    "backbone", 
    "handlebars", 
    "audio_video/AudioVideoReadView",
    "comment/Comment",
    "comment/Comments",
    "comment/CommentReadView",
    "datum/Datum",
    "datum/DatumFieldReadView",
    "datum/DatumStateReadView",
    "datum/DatumTagReadView",
    "datum/SessionReadView",
    "app/UpdatingCollectionView",
    "libs/OPrime"
], function(
    Backbone, 
    Handlebars,
    AudioVideoReadView,
    Comment,
    Comments,
    CommentReadView,
    Datum,
    DatumFieldReadView,
    DatumStateReadView,
    DatumTagReadView,
    SessionReadView,
    UpdatingCollectionView
) {
  var DatumReadView = Backbone.View.extend(
  /** @lends DatumReadView.prototype */
  {
    /**
     * @class The layout of a single Datum. It contains a datum state,
     *        datumFields, datumTags and a datum menu.
     * 
     * @property {String} format Value formats are "latex", "leftSide", or "centreWell".
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      
      this.audioVideoView = new AudioVideoReadView({
        model : this.model.get("audioVideo")
      });
      
      // Create a DatumStateReadView
      this.stateView = new DatumStateReadView({
        model : this.model.get("state"),
      });
      this.stateView.format = "datum";
      
      this.commentReadView = new UpdatingCollectionView({
        collection           : this.model.get("comments"),
        childViewConstructor : CommentReadView,
        childViewTagName     : 'li'
      });
      
      // Create a DatumTagView
      this.datumTagsView = new UpdatingCollectionView({
        collection           : this.model.get("datumTags"),
        childViewConstructor : DatumTagReadView,
        childViewTagName     : "li",
      }),

      // Create the DatumFieldsView
      this.datumFieldsView = new UpdatingCollectionView({
        collection           : this.model.get("datumFields"),
        childViewConstructor : DatumFieldReadView,
        childViewTagName     : "li",
        childViewFormat      : "datum"
      });
      
      this.sessionView = new SessionReadView({
        model : this.model.get("session"),
        });
      this.sessionView.format = "link";

//      this.model.bind("change", this.render, this);
    },

    /**
     * The underlying model of the DatumReadView is a Datum.
     */
    model : Datum,
    
    /**
     * Events that the DatumReadView is listening to and their handlers.
     */
    events : {
      /* Prevent clicking on the help conventions from reloading the page to # */
      "click .help-conventions" :function(e){
        if(e){
          e.preventDefault();
        }
      },
      /* Menu */
      "click .LaTeX" : function(){
        this.model.latexitDatum(true);
        $("#export-modal").modal("show");
      },
      "click .icon-paste" : function(){
        this.model.exportAsPlainText(true);
        $("#export-modal").modal("show");
      },
      "click .CSV" : function(){
        this.model.exportAsCSV(true, null, true);
        $("#export-modal").modal("show");
      },
      
      "click .add-comment-datum" : 'insertNewComment',

      
      /* Read Only Menu */
      "dblclick" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        // Prepend Datum to the top of the DatumContainer stack
        var d = this.model.clone();
        d.id = this.model.id;
        d.set("_id", this.model.get("_id"));
        d.set("_rev", this.model.get("_rev"));
        if(window.appView.datumsEditView){
          window.appView.datumsEditView.prependDatum(d);
        }
      },
      "click .datum-checkboxes": function(e){
        if(e){
          e.stopPropagation();
//          e.preventDefault();//This breaks the checkbox
        }
//        alert("Checked box " + this.model.id);
        this.checked = e.target.checked;
      }
    },

    /**
     * The Handlebars template rendered as the DatumReadView.
     */
    template : Handlebars.templates.datum_read_embedded,
    
    /**
     * The Handlebars template rendered as the DatumLatexView.
     */
    latexTemplate : Handlebars.templates.datum_read_latex,

    /**
     * Renders the DatumReadView and all of its partials.
     */
    render : function() {
      if (OPrime.debugMode) OPrime.debug("DATUM READ render: " + this.model.get("datumFields").models[1].get("mask") );
      
      if(this.collection){
        if (OPrime.debugMode) OPrime.debug("This datum has a link to a collection. Removing the link.");
//        delete this.collection;
      }
      
      if(this.model.get("datumFields").where({label: "utterance"})[0] == undefined){
        if (OPrime.debugMode) OPrime.debug("DATUM fields is undefined, come back later.");
        return this;
      }
      var jsonToRender = this.model.toJSON();
      jsonToRender.datumStates = this.model.get("datumStates").toJSON();
      jsonToRender.decryptedMode = window.app.get("corpus").get("confidential").decryptedMode;

      if (this.format == "well") {        
        // Display the DatumReadView
        $(this.el).html(this.template(jsonToRender));

        // Display audioVideo View
        this.audioVideoView.el = this.$(".audio_video");
        this.audioVideoView.render();
        
        // Display the DatumTagsView
        this.datumTagsView.el = this.$(".datum_tags_ul");
        this.datumTagsView.render();
        
        // Display the CommentReadView
        this.commentReadView.el = this.$('.comments');
        this.commentReadView.render();
        
        // Display the SessionView
        this.sessionView.el = this.$('.session-link'); 
        this.sessionView.render();
        
        // Display the DatumFieldsView
        this.datumFieldsView.el = this.$(".datum_fields_ul");
        this.datumFieldsView.render();
        
        //localization for read only well view
        if(jsonToRender.decryptedMode){
          $(this.el).find(".locale_Show_confidential_items_Tooltip").attr("title", Locale.get("locale_Hide_confidential_items_Tooltip"));
        }else{
          $(this.el).find(".locale_Show_confidential_items_Tooltip").attr("title", Locale.get("locale_Show_confidential_items_Tooltip"));
        } 
        $(this.el).find(".locale_Plain_Text_Export_Tooltip").attr("title", Locale.get("locale_Plain_Text_Export_Tooltip"));
        $(this.el).find(".locale_LaTeX").attr("title", Locale.get("locale_LaTeX"));
        $(this.el).find(".locale_CSV_Tooltip").attr("title", Locale.get("locale_CSV_Tooltip"));
        $(this.el).find(".locale_Add").html(Locale.get("locale_Add"));

      } else if (this.format == "latex") {
        //This gets the fields necessary from the model
        // This bit of code makes the datum look like its rendered by
        // latex, could be put into a function, but not sure if thats
        // necessary...

        ////////////////////////////////////////////////////////////////////////
        // Begin HIGHLIGHT SEARCH PATTERN IN DATUM functionality
        ////////////////////////////////////////////////////////////////////////
        // The core difficulty here is how to highlight matches that span space
        // characters when the IGT formatting splits utterance/morpheme/gloss
        // strings on spaces.  The solution used here is to highlight the "words"
        // of IGT-splittable values by first wrapping them in randomly-generated strings
        // representing the beginning and end of the highlight span tag and then
        // replacing the random strings with the correct tag.  Note that this indirection
        // is necessary because (a) enclosing the matches in "<span class..." would
        // introduces spaces in the string that would wreck the IGT logic and (b)
        // JS does not support negative lookbehind regexes (e.g., split on all spaces
        // not preceded by "<span").

        // searchParams is something like "judgement:grammatical AND utterance:chiens" or just "chiens"
        var searchParams = app.get("search").get("searchKeywords");

        // queryTokens is something like ["judgement:grammatical", "AND", "utterance:chiens"] or just ["chiens"]
        var queryTokens = this.model.processQueryString(searchParams);

        var doGrossKeywordMatch = false;
        if (searchParams.indexOf(":") == -1) {
          doGrossKeywordMatch = true;
        }

        // Converts lists into objects.  This is underscore 1.4's object function. 
        // Probably this should be attached to a global object or underscore should be upgraded ...
        var list2object = function(list, values) {
          if (list == null) return {};
          var result = {};
          for (var i = 0, l = list.length; i < l; i++) {
            if (values) {
              result[list[i]] = values[i];
            } else {
              result[list[i][0]] = list[i][1];
            }
          }
          return result;
        };

        // From ["judgement:grammatical", "AND", "utterance:chiens"] return {judgement: 'grammatical', utterance: 'chiens'}
        var getLabels2patterns = function (queryTokens) {
          return list2object(_.map(_.filter(queryTokens, function (e, i) { return i % 2 === 0; }),
                function (s) {return s.split(':')}));
        };

        // labels2patterns is something like {judgement: 'grammatical', utterance: 'chiens'}
        labels2patterns = getLabels2patterns(queryTokens);

        var toSingleSpace = function (string) {
          return string.replace(/\s+/g, ' ');
        };

        var getRandomString = function (len) {
          len = len || 10;
          var A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
          return _.map(_.range(len), function () {
            return A.charAt(Math.floor(Math.random() * A.length));}).join('');
        };

        startHighlight = getRandomString();   // will be replaced by <span class='highlight'>
        endHighlight = getRandomString();     // will be replaced by </span>

        // Enclose all *words* of string in randomly generated strings representing the start
        // and end of the highlight span tags.  These random strings will be
        // replaced by the appropriate tags (cf. randomStrings2highlightSpans)
        // after the string is split into words for the IGT/latex formatting below.
        var highlightWords = function (string) {
          return  startHighlight + toSingleSpace(string)
              .replace(' ', endHighlight + ' ' + startHighlight) + endHighlight;
        }

        // Replace the random start/end highlight strings with appropriate span tags
        var randomStrings2highlightSpans = function (word) {
          var startPattern = new RegExp(startHighlight, 'g');
          var endPattern = new RegExp(endHighlight, 'g');
          return word.replace(startPattern, '<span class="highlight">')
                      .replace(endPattern, '</span>');
        }

        // Enclose the entire string in highlight spans.  No cleanup required.
        var highlightWhole = function (string) {
          return  "<span class='highlight'>" + string + "</span>";
        }

        // Highlight all instances of the regex patternToHighlight in the string
        // via a span.highlight tag.  Note that the regex is treated as case-insensitive.
        // splittable is true if the text may be split on whitespace post highlighting;
        // in this case, words are highlighted
        var highlight = function(text, patternToHighlight, splittable) {
          splittable = splittable || false;
          var replacer =  splittable && highlightWords || highlightWhole;
          var re = new RegExp(patternToHighlight, "gi");
          return text.replace(re, replacer);
        }

        // Highlight all search pattern matches in the value.  This accomodates
        // gross-keyword-match-type searches as well as field-specific searches.
        // If the value is splittable, i.e., its words will be split into <spans>
        // for IGT formatting, then splittable must be set to true.
        var highlightMatches = function(value, label, splittable) {
          splittable = splittable || false; 
          if (value && searchParams) {
            if (doGrossKeywordMatch) {
              return highlight(value, searchParams, splittable);
            } else if (_.has(labels2patterns, label)) {
              return highlight(value, labels2patterns[label], splittable);
            } else {
              return value;
            }
          } else {
            return value;
          }
        }
        ////////////////////////////////////////////////////////////////////////
        // End HIGHLIGHT SEARCH PATTERN IN DATUM functionality
        ////////////////////////////////////////////////////////////////////////

        //for (var j = 1; j < queryTokens.length; j += 2) {
        //  if (queryTokens[j] == "AND") {
        //    // Short circuit: if it's already false then it continues to be false
        //    if (!thisDatumIsIn) {
        //      break;
        //    }
        //
        //    // Do an intersection
        //    thisDatumIsIn = thisDatumIsIn && model.matchesSingleCriteria(datumAsDBResponseRow, queryTokens[j+1]);
        //  } else {
        //    // Do a union
        //    thisDatumIsIn = thisDatumIsIn || model.matchesSingleCriteria(datumAsDBResponseRow, queryTokens[j+1]);
        //  }
        //}

        var jsonToRender = {};
        jsonToRender.additionalFields = [];

    	//corpus's most frequent fields
        var frequentFields = window.app.get("corpus").frequentFields ;
        //this datum/datalist's datumfields and their names 
    	var fields = _.pluck(this.model.get("datumFields").toJSON(), "mask");
    	var fieldLabels = _.pluck(this.model.get("datumFields").toJSON(), "label");
    	//setting up for IGT case...
    	var utteranceIndex = -1;
    	var utterance = "";
    	var morphemesIndex = -1;
    	var morphemes = "";
    	var glossIndex = -1;
    	var gloss = "";
    	var translationIndex = -1;
    	var translation = "";

    	//IGT case:
    	if(this.model.datumIsInterlinearGlossText()){
          /* get the key pieces of the IGT and delete them from the fields and fieldLabels arrays*/
          judgementIndex = fieldLabels.indexOf("judgement");
          if(judgementIndex >= 0){
            judgement = highlightMatches(fields[judgementIndex], 'judgement');
             fieldLabels.splice(judgementIndex,1);
             fields.splice(judgementIndex,1);
          }
          utteranceIndex = fieldLabels.indexOf("utterance");
          if(utteranceIndex >= 0){
               utterance = highlightMatches(fields[utteranceIndex], 'utterance', true);
               fieldLabels.splice(utteranceIndex,1);
               fields.splice(utteranceIndex,1);
          }
          morphemesIndex = fieldLabels.indexOf("morphemes");
          if(morphemesIndex >= 0){
              morphemes = highlightMatches(fields[morphemesIndex], 'morphemes', true);
              fieldLabels.splice(morphemesIndex,1);
              fields.splice(morphemesIndex,1);
          }
          glossIndex = fieldLabels.indexOf("gloss");
          if (glossIndex >= 0){
              gloss = highlightMatches(fields[glossIndex], 'gloss', true);
              fieldLabels.splice(glossIndex,1);
              fields.splice(glossIndex,1);
          }
          translationIndex = fieldLabels.indexOf("translation");
          if (translationIndex >=0){
              translation = highlightMatches(fields[translationIndex], 'translation');
              fieldLabels.splice(translationIndex,1);
              fields.splice(translationIndex,1);
          }

          // Return a list of strings of the form ['uw1<br />mw1<br />gw1', 'uw2<br />mw2<br />gw2']
          // where uw1 is the first utterance word, mw1 is the first morphemes word, etc.
          // Note that any empty strings in params are filtered out (cf. _.compact).  This allows
          // Datums with only, say, utterance and gloss strings or only morphemes and gloss
          // strings to be IGT-formatted.  
          var getIGTList = function (params) {
            return _.map(_.zip.apply(null, _.compact(_.map(params, function (p) {
              if (p) {
                return _.map(p.split(' '), randomStrings2highlightSpans);
              } else {
              return null;
              }
            }))), function (t) { return t.join('<br />') });
          }

          try {
            var tuple = getIGTList([utterance, morphemes, gloss]);
            if (translation != "") {
              jsonToRender.translation = "\u2018"+ translation +"\u2019";
            }
            jsonToRender.tuple = tuple;
            if (judgement !== "") {
              jsonToRender.judgement = judgement;
            }
          } catch(e) {
            alert("Bug: something is wrong with this datum: "+JSON.stringify(e));
            jsonToRender.translation = "bug";
          }
    	}

    	/*throughout this next section, print frequent fields and infrequent ones differently
    	frequent fields get latex'd as items in a description and infrequent ones are the same,
    	but commented out.*/
    	if(fields && (fields.length>0)){
          for (var field in fields){
              if(!frequentFields || frequentFields.indexOf(fieldLabels[field])>=0){
                if(fields[field]){
                  jsonToRender.additionalFields.push({field: fieldLabels[field],
                    value: highlightMatches(fields[field], fieldLabels[field])});
                }
              }
          }
    	}

        try {
          jsonToRender.datumstatecolor = this.model.get("datumStates")
                                .where({selected : "selected"})[0].get("color");
        } catch (e) {
          if (OPrime.debugMode) OPrime.debug("problem getting color of datum state, probaly none are selected.",e);
//          this.model.get("datumStates").models[0].set("selected","selected");
        }
        // makes the top two lines into an array of words.
        $(this.el).html(this.latexTemplate(jsonToRender));
        if(jsonToRender.datumstatecolor){
          $(this.el).removeClass("datum-state-color-warning");
          $(this.el).removeClass("datum-state-color-important");
          $(this.el).removeClass("datum-state-color-info");
          $(this.el).removeClass("datum-state-color-success");
          $(this.el).removeClass("datum-state-color-inverse");

          $(this.el).addClass("datum-state-color-"+jsonToRender.datumstatecolor);
        }
        try{
          if(this.model.get("datumStates").where({selected : "selected"})[0].get("state") == "Deleted"){
            $(this.el).find(".datum-latex-translation").html("<del>"+translation+"</del>");
          }
        }catch(e){
          if (OPrime.debugMode) OPrime.debug("problem getting color of datum state, probaly none are selected.",e);
        }
      }
      
      return this;
    },
    
    renderState : function() {
      if (this.stausview != undefined) {
        this.stateView.render();
      }
    },
    
    insertNewComment : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      var m = new Comment({
        "text" : this.$el.find(".comment-new-text").val(),
      });
      this.model.get("comments").add(m);
      this.$el.find(".comment-new-text").val("");
    },
    /**
     * Encrypts the datum if it is confidential
     * 
     */
    encryptDatum : function() {
      this.model.encrypt();
      this.render();
      $(".icon-unlock").toggleClass("icon-unlock icon-lock");
    },

    /**
     * Decrypts the datum if it was encrypted
     */
    decryptDatum : function() {
      this.model.decrypt();
      this.render();
      $(".icon-lock").toggleClass("icon-unlock icon-lock");
    },
    
    //Functions relating to the row of icon-buttons
    /**
     * The LaTeXiT function automatically mark-ups an example in LaTeX code
     * (\exg. \"a) and then copies it on the clipboard so that when the user
     * switches over to their LaTeX file they only need to paste it in.
     */
    laTeXiT : function() {
      return "";
    },
    
    /**
     * The copyDatum function copies all datum fields to the clipboard.
     */
    copyDatum : function() {
      
      var text = $(".datum_field_input").val() || [];
     // $(".datum_fields_ul")[0].focus();
    //  $(".datum_fields_ul")[0].select();
      if (OPrime.debugMode) OPrime.debug(text);
 
      return "";
//    }, 
//    
//    showButtonHelp : function(){
//      this.$(".button-help").tooltip("show");
    }
  });

  return DatumReadView;
});
