define("datum/DatumCollection", [
    "use!backbone",
    "datum/Datum"
], function(Backbone, Datum) {
    var DatumCollection = Backbone.Collection.extend(
    /** @lends DatumCollection.prototype */
    {
       /**
        * @class A collection of Datums.
        *
        * @extends Backbone.Collection
        * @constructs
        */
       initialize: function() {
       },
       
       model: Datum
    });
    
    return DatumCollection;
});

//var datumCollection = new DatumCollection(datum);
//datumCollection.add(datum);