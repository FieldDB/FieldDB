define([
    "backbone", 
    "handlebars", 
    "user/UserPreference",
    "libs/Utils"
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
      Utils.debug("USER PREFERENCE VIEW init");
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
      }
    },
 
    /**
     * The Handlebars template rendered as the UserPreferenceEditView.
     */
    template: Handlebars.templates.user_preference_edit_modal,

    render : function() {
      Utils.debug("USERPREFERENCE render: " + this.el);
      if (this.model != undefined) {
        // Display the UserPreferenceEditView
        this.setElement($("#user-preferences-modal"));
        $(this.el).html(this.template(this.model.toJSON()));
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
        
        if (this.model.get("skin") == "") {
          this.randomSkin();
        }else{
          this.renderSkin();
        }
        
      }
      //localization
      $(this.el).find(".locale_User_Settings").html(Locale["locale_User_Settings"].message);
      $(this.el).find(".locale_Skin").html(Locale["locale_Skin"].message);
      $(this.el).find(".locale_Change_Background").html(Locale["locale_Change_Background"].message);
      $(this.el).find(".locale_Background_on_Random").html(Locale["locale_Background_on_Random"].message);
      $(this.el).find(".locale_Transparent_Dashboard").html(Locale["locale_Transparent_Dashboard"].message);
      $(this.el).find(".locale_Number_Datum").html(Locale["locale_Number_Datum"].message);
      $(this.el).find(".locale_Close").html(Locale["locale_Close"].message);  
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
       "images/skins/bamboo_garden.jpg",
       "images/skins/llama_wool.jpg" , 
       "images/skins/yellow.jpg" , 
       "images/skins/machu_picchu.jpg",
       "images/skins/machu_picchu2.jpg",
       "images/skins/white.jpg" , 
       "images/skins/prague.jpg",
       "images/skins/salcantay.jpg",
       "images/skins/stairs.jpg",
       "images/skins/stone_figurines.jpg",
//       "images/skins/libre_office.png",
       "images/skins/temple.jpg",
       "images/skins/weaving.jpg",
       "images/skins/purple.jpg" , 
       "images/skins/sunset.jpg",
       "images/skins/window.jpg",
       "images/skins/Ceske_Krumlov.jpg",
       "images/skins/black.jpg" , 
       "images/skins/stbasil.jpg",
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
      
      var oldlink = document.getElementsByTagName("link").item(5);
      
      var newlink = document.createElement('link');
      newlink.setAttribute("rel", "stylesheet");
      newlink.setAttribute("type", "text/css");
      newlink.setAttribute("href", "./app/app_transparent.css");
 
      headtg.replaceChild(newlink, oldlink);
    },
    makeDashboardOpaque : function(){
      var headtg = document.getElementsByTagName('head')[0];
      if (!headtg) {
          return;
      }
      
      var oldlink = document.getElementsByTagName("link").item(5);
      
      var newlink = document.createElement('link');
      newlink.setAttribute("rel", "stylesheet");
      newlink.setAttribute("type", "text/css");
      newlink.setAttribute("href", "./app/app_opaque.css");
 
      headtg.replaceChild(newlink, oldlink);
    },
    savePrefs: function(){
      Utils.debug("Saving preferences into encrypted user.");
      window.app.get("authentication").saveAndInterConnectInApp();
    }
  });
  
  return UserPreferenceEditView;
}); 
