define([ 
    "use!backbone", 
    "datum/DatumState"
], function(
    Backbone,
    DatumState
) {
  var DatumStates = Backbone.Collection.extend(
  /** @lends DatumStates.prototype */
  {
    /**
     * @class Collection of Datum State
     * 
     * @description The initialize function 
     * 
     * @extends Backbone.Collection
     * @constructs
     */
    initialize : function() {
    },

    model : DatumState
  });

  return DatumStates;
});