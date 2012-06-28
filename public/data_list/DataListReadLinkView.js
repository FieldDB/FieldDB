define( [ 
  "use!backbone", 
  "use!handlebars",
  "text!data_list/data_list_read_link.handlebars",
  "data_list/DataList"
], function(
    Backbone, 
    Handlebars, 
    dataListReadLinkTemplate,
    DataList 
) {
  var DataListReadLinkView = Backbone.View.extend(
  /** @lends DataListReadLinkView.prototype */
  {
    /**
     * 
     * @class A link pointing to the DataList
     * 
     * @description 
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("DATALISTLINKVIEW init: " + this.el);
      
      this.model.bind("change:title ", this.render, this);
    },

    /**
     * The underlying model of the DataListReadLinkView is a DataList.
     */    
    model : DataList,
    
    
    /**
     * The Handlebars template rendered as the DataListReadLinkView.
     */
    template : Handlebars.compile(dataListReadLinkTemplate),
    
    /**
     * Initially renders the DataListReadLinkView. This should only be called by 
     * this.initialize. To update the current rendering, use renderUpdate()
     * instead.
     */
    render : function() {
      Utils.debug("DATALIST render: " + this.el);
      if (this.model != undefined) {
        // Display the Data List
        this.setElement($("#data-list-link"));
        $(this.el).html(this.template(this.model.toJSON()));
      
      } else {
        Utils.debug("\tDataList model is not defined");
      }
      
      return this;
    }
    
    
  });

  return DataListReadLinkView;
});