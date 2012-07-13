define([
    "backbone", 
    "handlebars", 
    "insert_unicode/InsertUnicode"
], function(Backbone,
    Handlebars,
    InsertUnicode) {
    var InsertUnicodeView = Backbone.View.extend(
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
    events : {
      "click .edit-tipa-input" : function(){
        //dont collapse the dropdown
        e.stopPropagation();
        return false;
      },
      "keyup .edit-tipa-input" : function(e){
        this.model.set("tipa", $(e.target).val());
      }
    },
    model : InsertUnicode,
    template : Handlebars.templates.insert_unicode,
    tagName: "span",
    
    render : function() {
      Utils.debug("INSERT UNICODE render");
      
      $(this.el).html(this.template(this.model.toJSON()));
      
      return this;
    },
  });
  return InsertUnicodeView;
});
