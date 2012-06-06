define([
    "use!backbone",
    "datum/Datum"
], function(
    Backbone, 
    Datum
) {
    var Datums = Backbone.Collection.extend(
    /** @lends Datums.prototype */
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
    
    return Datums;
});