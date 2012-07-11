define([
    "backbone", 
    "handlebars", 
    "insert_unicode/InsertUnicode"
], function(Backbone,
    Handlebars,
    InsertUnicode) {
    var InsertUnicodesView = Backbone.View.extend(
  /** @lends InsertUnicodesView.prototype */
  {
    /**
     * @class InsertUnicodesView
     *
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("INSERT UNICODE VIEW init");

    },

    model : InsertUnicode,
    /**
     * Events that the InsertUnicode is listening to and their handlers.
     */
    events : {
      "click .unicode" : "insertUnicode"
     
    },

//    classname : "insert-unicode",

    template : Handlebars.templates.insert_unicode,

    render : function() {
      Utils.debug("INSERT UNICODE render");
      
      $(this.el).html(this.template(this.model.toJSON()));
      
      return this;
    },
    
    /**
     * Change the model's state.
     */
//    updateUnicode : function() {
//      Utils.debug("Updated unicode to " + this.$el.children(".insert-unicode-input").val());
//      this.model.set("insertUnicode", this.$el.children(".insert-unicode-input").val());
//    },
    
    insertUnicode : function() {
      var u = this.model.get("symbol");
      console.log(u);
      return u;
    },
 
    
  });

  return InsertUnicodesView;
});
