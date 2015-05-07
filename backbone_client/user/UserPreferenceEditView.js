define([
    "backbone", 
    "handlebars", 
    "user/UserPreference",
    "OPrime"
], function(
    Backbone, 
    Handlebars, 
    UserPreference
) {
  var UserPreferenceEditView = Backbone.View.extend(
  /** @lends UserPreferenceEditView.prototype */
  {
    // TODO comment this class I think initially, hotkeys were gonna go in here and how they aren't in here so now I'm not sure what else is supposed to go in here.
    /**
     * @class UserPreferenceEditView This is where the option to  change the background is.
     *
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      if (OPrime.debugMode) OPrime.debug("USER PREFERENCE VIEW init");
      this.model.bind("change:skin", this.renderSkin, this);
          
//      this.model.bind("change", this.render, this);
    },
    /**
     * The underlying model of the UserPreferenceEditView is a UserPreference.
     */
    model : UserPreference,
    
    /**
     * Events that the UserPreferenceEditView is listening to and their handlers.
     */
    events:{
      "click .change-skin" : "nextSkin",
      "change .num_datum_dropdown" : "updateNumVisibleDatum",
      "click .randomize-backgound" : function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        if(this.model.get("alwaysRandomizeSkin") == "true"){
          this.model.set("alwaysRandomizeSkin","false");
          $(this.el).find(".randomize-backgound").removeClass("btn-success");
        }else{
          this.model.set("alwaysRandomizeSkin","true");
          $(this.el).find(".randomize-backgound").addClass("btn-success");
          this.randomSkin();
        }
        this.savePrefs();
      },
      "click .transparent-dashboard" : function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        if(this.model.get("transparentDashboard") == "true"){
          this.model.set("transparentDashboard", "false");
          $(this.el).find(".transparent-dashboard").removeClass("btn-success");
          this.makeDashboardOpaque();
        }else{
          this.model.set("transparentDashboard", "true");
          $(this.el).find(".transparent-dashboard").addClass("btn-success");
          this.makeDashboardTransparent();
        }
        this.savePrefs();
      },
      "click .high-contrast-dashboard" : function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        if(this.model.get("highContrastDashboard") == "true"){
          this.model.set("highContrastDashboard", "false");
          $(this.el).find(".high-contrast-dashboard").removeClass("btn-success");
          this.makeDashboardNonHighContrast();
        }else{
          this.model.set("highContrastDashboard", "true");
          $(this.el).find(".high-contrast-dashboard").addClass("btn-success");
          this.makeDashboardHighContrast();
        }
        this.savePrefs();
      },
      /*
       * TODO add these classes to the buttons them selves
       */
      "click .set-preferred-dashboard-layoutJustEntering" :function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        this.setPreferedDashboardTemplate("layoutJustEntering");
      },
      "click .set-preferred-dashboard-layoutAllTheData" :function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        this.setPreferedDashboardTemplate("layoutAllTheData");
      },
      "click .set-preferred-dashboard-layoutWhatsHappening" :function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        this.setPreferedDashboardTemplate("layoutWhatsHappening");
      },
      "click .set-preferred-dashboard-layoutCompareDataLists" :function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        this.setPreferedDashboardTemplate("layoutCompareDataLists");
      },
      "click .set-preferred-dashboard-layoutEverythingAtOnce" :function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        this.setPreferedDashboardTemplate("layoutEverythingAtOnce");
      },
      "click .choose-show-at-top-of-datum-area" :function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        this.setShowDatumAtTopOrBottomOfDataEntryArea("top");
      },
      "click .choose-show-at-bottom-of-datum-area" :function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        this.setShowDatumAtTopOrBottomOfDataEntryArea("bottom");
      }
      
    },
 
    /**
     * The Handlebars template rendered as the UserPreferenceEditView.
     */
    template: Handlebars.templates.user_preference_edit_modal,

    render : function() {
      if (OPrime.debugMode) OPrime.debug("USERPREFERENCE render: " + this.el);
      
      if (this.model != undefined) {
        var jsonToRender = this.model.toJSON();
        
        jsonToRender.locale_User_Settings = Locale.get("locale_User_Settings");
        jsonToRender.locale_Skin = Locale.get("locale_Skin");
        jsonToRender.locale_Change_Background = Locale.get("locale_Change_Background");
        jsonToRender.locale_Background_on_Random = Locale.get("locale_Background_on_Random");
        jsonToRender.locale_Transparent_Dashboard = Locale.get("locale_Transparent_Dashboard");
        jsonToRender.locale_High_Contrast_Dashboard = Locale.get("locale_High_Contrast_Dashboard");
        jsonToRender.locale_Number_Datum = Locale.get("locale_Number_Datum");
        jsonToRender.locale_Close = Locale.get("locale_Close");  

        if (jsonToRender.showNewDatumAtTopOrBottomOfDataEntryArea == "top") {
          jsonToRender.showDatumAtTopOfDataEntryArea  = true;
          jsonToRender.showDatumAtBottomOfDataEntryArea  = false;
        } else if (jsonToRender.showNewDatumAtTopOrBottomOfDataEntryArea == "bottom") {
          jsonToRender.showDatumAtTopOfDataEntryArea  = false;
          jsonToRender.showDatumAtBottomOfDataEntryArea  = true;
        } else {
          jsonToRender.showDatumAtTopOfDataEntryArea  = true;
          jsonToRender.showDatumAtBottomOfDataEntryArea  = false;
        }

        // Display the UserPreferenceEditView
        this.setElement($("#user-preferences-modal"));
        $(this.el).html(this.template(jsonToRender));
        this.$el.find(".num_datum_dropdown").val(this.model.get("numVisibleDatum"));
        
        
        if(this.model.get("alwaysRandomizeSkin") == "true"){
          $(this.el).find(".randomize-backgound").addClass("btn-success");
          this.randomSkin();
        }else{
          $(this.el).find(".randomize-backgound").removeClass("btn-success");
        }
        
        if(this.model.get("transparentDashboard") == "true"){
          $(this.el).find(".transparent-dashboard").addClass("btn-success");
          this.makeDashboardTransparent();
        }else{
          $(this.el).find(".transparent-dashboard").removeClass("btn-success");
          this.makeDashboardOpaque();
        }
        
        if(this.model.get("highContrastDashboard") == "true"){
          $(this.el).find(".high-contrast-dashboard").addClass("btn-success");
          this.makeDashboardHighContrast();
        }else{
          $(this.el).find(".high-contrast-dashboard").removeClass("btn-success");
          this.makeDashboardNonHighContrast();
        }
        
        /*
         * Make all template buttons that are not the current one half opaque so
         * the user can kind of see which is the one they are using.
         * 
         * TODO add these classes to the buttons them selves 
         */
        var templatesThatAreNotActive = "layoutJustEntering,layoutAllTheData,layoutWhatsHappening,layoutCompareDataLists,templateFile".split(",");
        var activeTemplate = this.model.get("preferredDashboardLayout");
        var activeTemplateIndex = templatesThatAreNotActive.indexOf(activeTemplate);
        if(activeTemplateIndex >= 0){
          templatesThatAreNotActive.splice(activeTemplateIndex, 1);
        }else{
          this.model.set("preferredDashboardLayout", "default");
        }
        for(var template in templatesThatAreNotActive){
          $(this.el).find('.set-preferred-dashboard-'+templatesThatAreNotActive[template]);//.addClass("halfopacity");
        }
        
        if (this.model.get("skin") == "") {
          this.randomSkin();
        }else{
          this.renderSkin();
        }
        
      }
      return this;
    },
    
    /**
     * The index into the skins array that is the current skin.
     */
    currentSkin : 0,
   
    
    /*
     * Available backgrounds 
     */
    skins : [
"user/skins/black.jpg" , 
"user/skins/Ceske_Krumlov.jpg",
"user/skins/llama_wool.jpg" , 
"user/skins/prague.jpg",
//       "user/skins/bamboo_garden.jpg",
//       "user/skins/yellow.jpg" , 
//       "user/skins/machu_picchu.jpg",
//       "user/skins/machu_picchu2.jpg",
//       "user/skins/salcantay.jpg",
       "user/skins/stairs.jpg",
       "user/skins/stbasil.jpg",
       "user/skins/stone_figurines.jpg",
//       "user/skins/libre_office.png",
//       "user/skins/temple.jpg",
       "user/skins/weaving.jpg",
//       "user/skins/purple.jpg" , 
//       "user/skins/sunset.jpg",
       "user/skins/white.jpg" , 
       "user/skins/window.jpg",
     ],
     
    /**
     * Change to the next skin in the array of skins.
     */
    nextSkin : function() {
      this.currentSkin = (this.currentSkin + 1) % this.skins.length;
      this.model.set("skin", this.skins[this.currentSkin]);
      this.savePrefs();
    },
    
    randomSkin : function() {
      this.currentSkin = Math.floor(Math.random() * this.skins.length);
      this.model.set("skin", this.skins[this.currentSkin]);
    },
    
    renderSkin : function() {
      //if it is not already the skin, change it
      if(document.body.style.backgroundImage.indexOf(this.model.get("skin")) == -1){
        document.body.style.backgroundImage = "url(" + this.model.get("skin") + ")";
      }
      $(this.el).find(".user-pref-skin-filename").html(this.model.get("skin"));

    },
    
    updateNumVisibleDatum : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      this.model.set("numVisibleDatum", this.$el.find(".num_datum_dropdown").val());
      this.savePrefs();
    },
    makeDashboardTransparent : function(){
      var headtg = document.getElementsByTagName('head')[0];
      if (!headtg) {
          return;
      }
      
      var oldlink = document.getElementsByTagName("link").item(1);
      
      var newlink = document.createElement('link');
      newlink.setAttribute("rel", "stylesheet");
      newlink.setAttribute("type", "text/css");
      newlink.setAttribute("href", "app/app_transparent.css");
 
      headtg.replaceChild(newlink, oldlink);
    },
    makeDashboardOpaque : function(){
      var headtg = document.getElementsByTagName('head')[0];
      if (!headtg) {
          return;
      }
      
      var oldlink = document.getElementsByTagName("link").item(1);
      
      var newlink = document.createElement('link');
      newlink.setAttribute("rel", "stylesheet");
      newlink.setAttribute("type", "text/css");
      newlink.setAttribute("href", "app/app_opaque.css");
 
      headtg.replaceChild(newlink, oldlink);
    },
    savePrefs: function(){
      if (OPrime.debugMode) OPrime.debug("Saving preferences into encrypted user.");
      window.app.get("authentication").saveAndInterConnectInApp();
    },
    
    makeDashboardHighContrast : function(){
      var headtg = document.getElementsByTagName('head')[0];
      if (!headtg) {
          return;
      }
      var oldlink = document.getElementsByTagName("link").item(2);
      var newlink = document.createElement('link');
      newlink.setAttribute("rel", "stylesheet");
      newlink.setAttribute("type", "text/css");
      newlink.setAttribute("href", "app/high_contrast.css");
      headtg.replaceChild(newlink, oldlink);
    },
    
    makeDashboardNonHighContrast : function(){
      var headtg = document.getElementsByTagName('head')[0];
      if (!headtg) {
          return;
      }
      var oldlink = document.getElementsByTagName("link").item(2);
      var newlink = document.createElement('link');
      newlink.setAttribute("rel", "stylesheet");
      newlink.setAttribute("type", "text/css");
      newlink.setAttribute("href", "app/not_high_contrast.css");
      headtg.replaceChild(newlink, oldlink);
    },
    
    setPreferedDashboardTemplate : function(preferredTemplate){
      this.model.set("preferredDashboardLayout", preferredTemplate);
      if (confirm("Would you like to load this new dashboard layout now?")) {
        window.app.get("authentication").saveAndEncryptUserToLocalStorage(function(){
          window.location.replace("corpus.html");
        });
      }
    }, 
    setShowDatumAtTopOrBottomOfDataEntryArea : function(preferredLocation){
      this.model.set("showNewDatumAtTopOrBottomOfDataEntryArea", preferredLocation);
      if (confirm("Would you like to load this new dashboard layout now?")) {
        window.app.get("authentication").saveAndEncryptUserToLocalStorage(function(){
          window.location.replace("corpus.html");
        });
      }
    }, 
    
  });
  
  return UserPreferenceEditView;
}); 
