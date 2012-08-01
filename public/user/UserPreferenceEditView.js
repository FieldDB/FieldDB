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
      this.model.bind("change:skin", this.renderSkin, this);
          
      this.model.bind("change", this.render, this);
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
      "click .randomize-backgound" : function(){
        if(this.model.get("alwaysRandomizeSkin")){
          this.model.set("alwaysRandomizeSkin",false);
        }else{
          this.model.set("alwaysRandomizeSkin",true);
        }
        this.render();
      },
      "click .transparent-dashboard" : function(){
        if(this.model.get("transparentDashboard")){
          this.model.set("transparentDashboard", false);
          this.makeDashboardOpaque();
        }else{
          this.model.set("transparentDashboard", true);
          this.makeDashboardTransparent();
        }
        this.render();
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
        
        
        if(this.model.get("alwaysRandomizeSkin")){
          $(".randomize-backgound").addClass("btn-success");
        }else{
          $(".randomize-backgound").removeClass("btn-success");
        }
        
        if(this.model.get("transparentDashboard")){
          $(".transparent-dashboard").addClass("btn-success");
        }else{
          $(".transparent-dashboard").removeClass("btn-success");
        }
        
        if (this.model.get("skin") == "") {
          this.randomSkin();
        }else{
          this.renderSkin();
        }
        if(this.model.get("transparentDashboard")){
          this.makeDashboardTransparent();
        }else{
          this.makeDashboardOpaque();
        }
      }
      //localization
      $(".locale_User_Settings").html(chrome.i18n.getMessage("locale_User_Settings"));
      $(".locale_Skin").html(chrome.i18n.getMessage("locale_Skin"));
      $(".locale_Change_Background").html(chrome.i18n.getMessage("locale_Change_Background"));
      $(".locale_Background_on_Random").html(chrome.i18n.getMessage("locale_Background_on_Random"));
      $(".locale_Transparent_Dashboard").html(chrome.i18n.getMessage("locale_Transparent_Dashboard"));
      $(".locale_Datum_Number").html(chrome.i18n.getMessage("locale_Datum_Number"));
      $(".locale_Close").html(chrome.i18n.getMessage("locale_Close"));  
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
       "images/skins/machu_picchu.jpg",
       "images/skins/machu_picchu2.jpg",
       "images/skins/prague.jpg",
       "images/skins/salcantay.jpg",
       "images/skins/stairs.jpg",
       "images/skins/stone_figurines.jpg",
       "images/skins/libre_office.png",
       "images/skins/temple.jpg",
       "images/skins/weaving.jpg",
       "images/skins/sunset.jpg",
       "images/skins/window.jpg",
       "images/skins/Ceske_Krumlov.jpg",
       "images/skins/stbasil.jpg",
     ],
     
    /**
     * Change to the next skin in the array of skins.
     */
    nextSkin : function() {
      this.currentSkin = (this.currentSkin + 1) % this.skins.length;
      this.model.set("skin", this.skins[this.currentSkin]);
    },
    
    randomSkin : function() {
      this.currentSkin = Math.floor(Math.random() * this.skins.length);
      this.model.set("skin", this.skins[this.currentSkin]);
    },
    
    renderSkin : function() {
      document.body.style.backgroundImage = "url(" + this.model.get("skin") + ")";
    },
    
    updateNumVisibleDatum : function() {
      this.model.set("numVisibleDatum", this.$el.find(".num_datum_dropdown").val());
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
    }
  });
  
  return UserPreferenceEditView;
}); 
