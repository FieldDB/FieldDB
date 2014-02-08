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
      if (OPrime.debugMode) OPrime.debug("INSERT UNICODE VIEW init");

    },
    events : {
      "click .edit-tipa-input" : function(e){
        //dont collapse the dropdown
        e.stopPropagation();
        e.preventDefault();
        return false;
      },
      "click .remove-unicode" : "removeUnicode",
      "blur .edit-tipa-input" : function(e){
        e.stopPropagation();
        e.preventDefault();
        this.model.set("tipa", $(e.target).val().trim());
        window.app.get("authentication").saveAndEncryptUserToLocalStorage();

      }
    },
    model : InsertUnicode,
    template : Handlebars.templates.insert_unicode,
    tagName: "span",
    
    render : function() {
      if (OPrime.debugMode) OPrime.debug("INSERT UNICODE render");
      
      var jsonToRender = this.model.toJSON(); 

      jsonToRender.locale_Keyboard_Shortcuts = Locale.get("locale_Keyboard_Shortcuts");
      jsonToRender.locale_LaTeX_Code = Locale.get("locale_LaTeX_Code");
      jsonToRender.locale_Remove_Unicode = Locale.get("locale_Remove_Unicode");
      jsonToRender.locale_Unicode_Instructions = Locale.get("locale_Unicode_Instructions");
      
      $(this.el).html(this.template(jsonToRender));
      
//      //localization
//      $(this.el).find(".locale_LaTeX_Code").html(Locale.get("locale_LaTeX_Code"));
//      $(this.el).find(".locale_Unicode_Instructions").html(Locale.get("locale_Unicode_Instructions"));
//      $(this.el).find(".locale_Keyboard_Shortcuts").html(Locale.get("locale_Keyboard_Shortcuts"));
//      $(this.el).find(".locale_Remove_Unicode").html(Locale.get("locale_Remove_Unicode"));
      
      return this;
    },
    
    removeUnicode : function(e){
      e.stopPropagation();
      e.preventDefault();
      window.app.get("authentication").get("userPrivate").get("prefs").get("unicodes").remove(this.model);  
      window.app.get("authentication").saveAndEncryptUserToLocalStorage();
  
    }
  });
  return InsertUnicodeView;
});
