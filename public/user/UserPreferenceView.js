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
        this.setElement($("#user-preferences-view"));
        $(this.el).html(this.template(this.model.toJSON()));
      }
      
      return this;
    },
    
    /**
     * The index into the Utils.backgrounds array that is the current skin.
     */
    currentSkin : 0,    
    
    /**
     * Change to the next skin in the array of skins.
     */
    nextSkin : function() {
      this.currentSkin = (this.currentSkin + 1) % Utils.backgrounds.length;
      document.body.style.backgroundImage = "url(" + Utils.backgrounds[this.currentSkin] + ")";
    } 
  });
  
  return UserPreferenceView;
}); 