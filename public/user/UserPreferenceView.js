define([
    "use!backbone", 
    "use!handlebars", 
    "text!user/user_preference.handlebars",
    "user/UserPreference",
    "libs/Utils"
], function(
  Backbone, 
  Handlebars, 
  preferenceTemplate, 
  UserPreference
) {
  var UserPreferenceView = Backbone.View.extend(
  /** @lends UserPreferenceView.prototype */
  {
    // TODO comment this class I think initially, hotkeys were gonna go in here and how they aren't in here so now I'm not sure what else is supposed to go in here.
    /**
     * @class UserPreferenceView This is where the option to  change the background is.
     *
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      this.model.bind("change",this.renderSkin, this);
      
      if( this.model.get("skin") == ""){
        this.randomSkin();
      }
      
    },

    /**
     * The underlying model of the UserPreferenceView is a UserPreference.
     */
    model : UserPreference,
    
    /**
     * Events that the UserPreferenceView is listening to and their handlers.
     */
    events:{
      "click #skin": "nextSkin"
    },
 
    /**
     * The Handlebars template rendered as the UserPreferenceView.
     */
    template: Handlebars.compile(preferenceTemplate),

    render : function() {
      Utils.debug("USERPREFERENCE render: " + this.el);
      if (this.model != undefined) {
        // Display the UserPreferenceView
        this.setElement($("#user-preferences-modal"));
        $(this.el).html(this.template(this.model.toJSON()));
        
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
                   "images/skins/bamboo_garden.jpg",
                   "images/skins/llama_wool.jpg" , 
                   "images/skins/machu_picchu.jpg",
                   "images/skins/machu_picchu2.jpg",
                   "images/skins/prague.jpg",
                   "images/skins/salcantay.jpg",
                   "images/skins/stairs.jpg",
                   "images/skins/stone_figurines.jpg",
                   "images/skins/temple.jpg",
                   "images/skins/weaving.jpg",
                   "images/skins/sunset.jpg",
                   "images/skins/window.jpg",
                   "images/skins/Ceske_Krumlov.jpg", 
                 ],
    /**
     * Change to the next skin in the array of skins.
     */
    nextSkin : function() {
      this.currentSkin = (this.currentSkin + 1) % this.skins.length;
      this.model.set("skin", this.skins[ this.currentSkin ]);
    },
    randomSkin : function(){
      currentSkin = Math.floor(Math.random()* this.skins.length);
      this.model.set("skin", this.skins[ this.currentSkin ]);
    },
    renderSkin : function(){
      document.body.style.backgroundImage = "url(" + this.model.get("skin") + ")";
    }
  });
  
  return UserPreferenceView;
}); 