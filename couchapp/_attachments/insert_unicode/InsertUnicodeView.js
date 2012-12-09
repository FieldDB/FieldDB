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
      OPrime.debug("INSERT UNICODE VIEW init");

    },
    events : {
      "click .edit-tipa-input" : function(e){
        //dont collapse the dropdown
        e.stopPropagation();
        e.preventDefault();
        return false;
      },
      "click .remove-unicode" : "removeUnicode",
      "keyup .edit-tipa-input" : function(e){
        e.stopPropagation();
        e.preventDefault();
        this.model.set("tipa", $(e.target).val());
      }
    },
    model : InsertUnicode,
    template : Handlebars.templates.insert_unicode,
    tagName: "span",
    
    render : function() {
      OPrime.debug("INSERT UNICODE render");
      
      $(this.el).html(this.template(this.model.toJSON()));
      
      //localization
      $(this.el).find(".locale_LaTeX_Code").html(Locale.get("locale_LaTeX_Code"));
      $(this.el).find(".locale_Unicode_Instructions").html(Locale.get("locale_Unicode_Instructions"));
      $(this.el).find(".locale_Keyboard_Shortcuts").html(Locale.get("locale_Keyboard_Shortcuts"));
      $(this.el).find(".locale_Remove_Unicode").html(Locale.get("locale_Remove_Unicode"));
      
      return this;
    },
    
    removeUnicode : function(e){
      e.stopPropagation();
      e.preventDefault();
      window.app.get("authentication").get("userPrivate").get("prefs").get("unicodes").remove(this.model);    
    }
  });
  return InsertUnicodeView;
});
