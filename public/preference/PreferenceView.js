define([
    "use!backbone", 
    "use!handlebars", 
    "text!preference/preference.handlebars",
    "preference/Preference",
    "libs/Utils"
], function(
  Backbone, 
  Handlebars, 
  preferenceTemplate, 
  Preference
) {
  var PreferenceView = Backbone.View.extend(
  /** @lends PreferenceView.prototype */
  {
    // TODO comment this class I think initially, hotkeys were gonna go in here and how they aren't in here so now I'm not sure what else is supposed to go in here.
    /**
     * @class PreferenceView This is where the option to  change the background is.
     *
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
    },

    /**
     * The underlying model of the PreferenceView is a Preference.
     */
    model : Preference,
    
    /**
     * Events that the PreferenceView is listening to and their handlers.
     */
    events:{
      "click #skin": "randomSkin"
    },
 
    /**
     * The Handlebars template rendered as the PreferenceView.
     */
    template: Handlebars.compile(preferenceTemplate),

    render : function() {
      Utils.debug("PREFERENCE render: " + this.el);
      if (this.model != undefined) {
        // Display the PreferenceView
        this.setElement($("#user-preferences-view"));
        $(this.el).html(this.template(this.model.toJSON()));
      }
      
      return this;
    },	
    
    // TODO Comment and implement this function
    randomSkin : function(){

//      function randomize(min, max) {
//        if (!min)
//          min = 0;
//        if (!max)
//          max = 1;
//        return Math.floor(Math.random()*(max+1)+min);
//      }
      
      var randombgs=["images/skins/bamboo_garden.jpg",
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
                     ];
       
      for(var i=0; i < randombgs.length; i++){
        
        document.body.style.backgroundImage = "url(" + randombgs[i] + ")";
        
        return i;

      }

    //  document.getElementById("app").style.backgroundImage="url('+Math.floor(Math.random()*randombgs.length)]+')");
     // document.getElementById("app").style.backgroundImage = "url('../images/skins/temple.jpg')";

      
      return true;
    } 
  });
  
  return PreferenceView;
}); 