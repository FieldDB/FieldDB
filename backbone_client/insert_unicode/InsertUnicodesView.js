define([
    "backbone", 
    "handlebars", 
    "insert_unicode/InsertUnicode",
    "insert_unicode/InsertUnicodeView",
    "app/UpdatingCollectionView",
], function(Backbone,
    Handlebars,
    InsertUnicode,
    InsertUnicodeView,
    UpdatingCollectionView
) {
  var InsertUnicodesView = Backbone.View.extend(
  /** @lends InsertUnicodesView.prototype */
  {
    /**
     * @class InsertUnicodesView
     * 
     * @property {String} format Valid values are "rightSide" or "minimized".
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      this.changeViewsOfInternalModels();
    },
    changeViewsOfInternalModels : function(){
      this.insertUnicodesView = new UpdatingCollectionView({
        collection : this.model,
        childViewConstructor : InsertUnicodeView,
        childViewTagName : "span",
      });
    },
    /**
     * Events that the InsertUnicode is listening to and their handlers.
     */
    events : {
      "click .add-unicode" : "insertNewUnicodeSymbol",
      "keyup .insert-unicode-input" : function(e) {
        var code = e.keyCode || e.which;
        
        // code == 13 is the enter key
        if (code == 13) {
          this.insertNewUnicodeSymbol();
        }
      },
      "keyup .insert-unicode-tipa-input" : function(e) {
        var code = e.keyCode || e.which;
        
        // code == 13 is the enter key
        if (code == 13) {
          this.insertNewUnicodeSymbol();
        }
      },
      "click .icon-minus-sign" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        this.format = "minimized";
        this.render();
      },
      "click .icon-plus-sign" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        this.format = "rightSide";
        this.render();
      }
    },

    template : Handlebars.templates.insert_unicodes,
    
    minimizedTemplate : Handlebars.templates.insert_unicodes_minimized,

    render : function() {
      this.undelegateEvents();
      $(this.el).removeData().unbind(); 
      
      var jsonToRender = this.model.toJSON();
      jsonToRender.locale_Add = Locale.get("locale_Add");
      jsonToRender.locale_Add_new_symbol = Locale.get("locale_Add_new_symbol");
      jsonToRender.locale_Drag_and_Drop = Locale.get("locale_Drag_and_Drop");
      jsonToRender.locale_Hide_Unicode_Palette = Locale.get("locale_Hide_Unicode_Palette");
      jsonToRender.locale_Paste_Type_Unicode_Symbol_Placeholder = Locale.get("locale_Paste_Type_Unicode_Symbol_Placeholder");
      jsonToRender.locale_Show_Unicode_Palette = Locale.get("locale_Show_Unicode_Palette");
      jsonToRender.locale_TIPA_shortcut = Locale.get("locale_TIPA_shortcut");
      jsonToRender.locale_Unicode = Locale.get("locale_Unicode");

      if (this.format == "rightSide") {
        // Display the maximized InsertUnicodesView
        this.setElement($("#insert-unicode"));

        $(this.el).html(this.template(jsonToRender));
        
        //Updating Collection View Rendering
        this.insertUnicodesView.el = this.$("#unicodes");
        this.insertUnicodesView.render();
  
        $(this.el).find(".unicode-symbol").each(function(index, item) {
          this.addEventListener('dragstart', window.appView.insertUnicodesView.handleDragStart);
        });
        
      
      } else if (this.format == "minimized") {
        // Display the minimized InsertUnicodesView
        this.setElement($("#insert-unicode"));
        $(this.el).html(this.minimizedTemplate(jsonToRender));
//        $(this.el).html(this.minimizedTemplate({}));
      }

      return this;
    },
    
    /**
     * Adds a new unicode to the user's unicode collection
     */
    insertNewUnicodeSymbol : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      var m = new InsertUnicode({
        "symbol" : this.$el.find(".insert-unicode-input").val(),
        "tipa" :  this.$el.find(".insert-unicode-tipa-input").val()
      });
      this.model.add(m);
      
      // Clear the textfields
      this.$el.find(".insert-unicode-input").val("");
      this.$el.find(".insert-unicode-tipa-input").val("");
      window.app.get("authentication").saveAndEncryptUserToLocalStorage();
      this.render();

    },

    dragSrcEl : null,
    
    /**
     * http://www.html5rocks.com/en/tutorials/dnd/basics/
     * 
     * @param e
     */
    handleDragStart : function(e) {
      // Target (this) element is the source node.
      this.classList.remove("infrequent-unicode-symbol");
      e.dataTransfer.effectAllowed = 'copy'; // only dropEffect='copy' will be dropable

//      var u = window.app.get("authentication").get("userPrivate").get("prefs").get("unicodes").where({symbol: this.innerHTML});
      //TODO useCount++ increase the user count on that item.
      
      //if not already dragging, do a drag start
      if(window.appView.insertUnicodesView.dragSrcEl == null){
        window.appView.insertUnicodesView.dragSrcEl = this;
//        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
      }
      return false;
    }
  });
  return InsertUnicodesView;
});
