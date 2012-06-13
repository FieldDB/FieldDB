define([ 
    "use!backbone", 
    "use!handlebars", 
    "text!user/user.handlebars",
    "user/User",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    userTemplate, 
    User
) {
  var UserView = Backbone.View.extend(
  /** @lends UserView.prototype */
  {
    /**
     * @class The layout of a single User. This view is used in the
     *        activity feeds, it is also embedable in the
     *        UserProfileView.
     * 
     * @description  Starts the UserView.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("USER init: " + this.el);
      
      this.on('all', function(e) {
        this.render();
      });
      
      this.model.bind('change', this.render);
    },

    /**
     * The underlying model of the UserView is a User.
     */
    model : User,
    
    classname : "user",
    
    /**
     * The Handlebars template rendered as the UserView.
     */
    template : Handlebars.compile(userTemplate),
    
    /**
     * Renders the UserView.
     */
    render : function() {
      Utils.debug("USER render: " + this.el);
      if (this.model != undefined) {
        this.setElement($("#user"));
        $(this.el).html(this.template(this.model.toJSON()));
        Utils.debug("\trendering user: " + this.model.get("username"));
      } else {
        Utils.debug("\tUser model was undefined.");
      }

      return this;
    },
    
    /**
     * Initializes the sample User (Sapir).
     */
    loadSample : function() {
      // Notes: Sapir's user comes from his time after his PhD and
      // before his foray into the industry. This is when he started
      // getting some results for "phoneme" around 1910.
      // For a similar use of historical users see Morgan Blamey and Tucker the Technician at blamestella.com
      // https://twitter.com/#!/tucker1927
      this.model.attributes = {
        "username" : "sapir",
        "password" : "phoneme",
        "email" : "esapir@email.com",
        "firstname" : "Ed",
        "lastname" : "Sapir",
        "gravatar" : "user/sapir_1910_gravatar.png",
        "researchInterest" : "Phonology",
        "affiliation" : "University of Pennsylvania",
        "description" : "I am currently a fellow at UPenn. I am interested in soundpatterns of Ute and Southern Paiute languages. I propose that the phoneme is not just an abstraction existing at the structural level of language, but that it in fact has psychological reality for speakers.",
        "subtitle" : "",
        "corpora" : [],
        "dataLists" : [],
        "prefs" : {},
        "teams" : []
      };
    },
    
    /**
     * Initializes the public User.
     */
    loadPublic : function(){
      this.model.attributes = {
          "username" : "public",
          "password" : "",
          "email" : "",
          "firstname" : "Anonymous",
          "lastname" : "User",
          "gravatar" : "./../user/public_gravatar.png",
          "researchInterest" : "",
          "affiliation" : "",
          "description" : "",
          "subtitle" : "",
          "corpora" : [],
          "dataLists" : [],
          "prefs" : {},
          "teams" : []
        };
    }
  });

  return UserView;
});