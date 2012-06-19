//TODO THis is mostly a dummy page ATM copied from CorpusView but we will want to think criticially about what we will want on a page that allows users to create a new  corpus.
define([ 
    "use!backbone", 
    "use!handlebars", 
    "text!corpus/new_corpus.handlebars",
    "corpus/Corpus",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    new_corpusTemplate, 
    Corpus
) {
      var NewCorpusView = Backbone.View
          .extend(
          /** @lends CorpusView.prototype */
          {
            /**
             * @class This is the new corpus view. This allows users to make a
             *        new corpus. Set permissions on the corpus, teams, etc.
             * 
             * @description Starts the Corpus and initializes all its children.
             * 
             * @extends Backbone.View
             * @constructs
             */
            initialize : function() {

            },

            /**
             * The underlying model of the NewCorpusView is a Corpus.
             */
            model : Corpus,

            events : {
//              "change" : "render",
              "blur .title" : "updateTitle",
              "blur .description" : "updateDescription",
              "click .save" : "saveNewCorpus"
            },

            /**
             * The Handlebars template rendered as the CorpusView.
             */
            template : Handlebars.compile(new_corpusTemplate),

            /**
             * Renders the CorpusView and all of its child Views.
             */
            render : function() {
              Utils.debug("CORPUS render: " + this.el);
              if (this.model != undefined) {
                // Display the CorpusView
                this.setElement($("#new-corpus"));
                $(this.el).html(this.template(this.model.toJSON()));

              } else {
                Utils.debug("\Corpus model was undefined.");
              }

              return this;
            },
            updateTitle : function(){
              this.model.set("title", this.$el.children(".title").val());
              this.model.set("titleAsUrl", encodeURIComponent(this.$el.children(".title").val()));
            },
            updateDescription : function(){
              this.model.set("description", this.$el.children(".description").val());
            },
            saveNewCorpus : function(){
//              this.model.save();
              appView.authView.model.get("user").get("corpuses").add(this.model); 
//              alert("Saved");
              window.location = "#user/"+appView.authView.model.get("username");
            }
          });

      return NewCorpusView;
});