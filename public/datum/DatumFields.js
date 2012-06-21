define([ 
         "use!backbone", 
         "datum/DatumField",
         "libs/Utils"
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
    
    model : DatumField,
    
    /** 
     * Gets a copy DatumFields containing new (not references) DatumFields objects
     * containing the same attributes.
     * 
     * @return The cloned DatumFields.
     */
    clone : function() {
      var newCollection = new DatumFields();
      
      for (var i = 0; i < this.length; i++) {
        newCollection.push(new DatumField(this.models[i].toJSON())); 
      }
      
      return newCollection;
    }

  });

  return DatumFields;
});