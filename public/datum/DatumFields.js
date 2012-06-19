define([ 
         "use!backbone", 
         "datum/DatumField"
], function(
         Backbone,
         DatumField) {
  var DatumFields = Backbone.Collection.extend(
  /** @lends DatumFields.prototype */
  {
    /**
     * @class Collection of Datum Field
     * 
     * @description The initialize function 
     * 
     * @extends Backbone.Collection
     * @constructs
     */
    initialize : function() {
    },
    model : DatumField

  });

  return DatumFields;
});